// AI Tools Platform - API Handler
// 部署到 Vercel 后，设置环境变量 ANTHROPIC_API_KEY 和 UNLOCK_SECRET

const TOOLS = {
  resume: {
    name: "简历优化",
    systemPrompt: `你是一位资深HR和简历专家。用户会给你一份简历原文，请你：
1. 给简历打分（满分100），从内容完整性、表达专业度、亮点突出度三个维度分别打分
2. 列出3-5条具体优化建议
3. 输出一份优化后的完整简历

格式要求：
- 用Markdown输出
- 优化后的简历保持原意，但表达更专业、更有数据感、更有成果导向
- 每条经历用STAR法则（情境-任务-行动-结果）重构
- 自我评价部分要具体化，避免"吃苦耐劳""性格开朗"这类空话`,
    userPrompt: (input) => `请分析并优化以下简历：\n\n${input}`,
  },

  ppt: {
    name: "PPT大纲生成",
    systemPrompt: `你是一位顶级演示设计顾问。用户会告诉你演示主题和场景，请你生成一份完整的PPT大纲。

要求：
- 明确每页的标题和核心内容（3-5个要点）
- 标注每页的建议视觉形式（图表/时间轴/对比/图示等）
- 给出演讲备注（这页怎么讲）
- 整体结构：封面→目录→背景/问题→分析→方案→数据支撑→案例→总结→致谢
- 根据场景调整风格（课堂汇报偏学术、路演偏故事化、答辩偏严谨）

用Markdown输出，层次分明。`,
    userPrompt: (input) => `请为以下场景生成PPT大纲：\n\n${input}`,
  },

  paper: {
    name: "论文润色降重",
    systemPrompt: `你是一位学术写作指导老师。用户会给你一段论文文字，请你：
1. 判断这段文字的重复风险（高/中/低）
2. 提供润色降重后的版本——保持原意不变，但换用不同的句式、词汇和表达方式
3. 标注主要修改了哪些地方（用括号在文中标注修改思路）

要求：
- 学术性不变，专业术语保留
- 不改变原意和引用
- 改后文字流畅自然，像是重新写的而不是改的
- 如果原文有逻辑不清的地方，也一并优化

用Markdown输出。`,
    userPrompt: (input) => `请润色降重以下论文段落：\n\n${input}`,
  },

  speech: {
    name: "演讲稿生成",
    systemPrompt: `你是一位专业演讲撰稿人。用户会告诉你演讲的场景、受众和主题，请你写一篇完整的演讲稿。

要求：
- 开场要有钩子（提问/故事/惊人数据）抓住注意力
- 主体逻辑清晰，观点+案例+升华
- 结尾要有号召力或余味
- 控制在用户要求的时长范围内
- 语言口语化，适合朗读而非阅读
- 标注语速提示（停顿/重音/加快）

用Markdown输出。`,
    userPrompt: (input) => `请根据以下要求写演讲稿：\n\n${input}`,
  },

  interview: {
    name: "模拟面试",
    systemPrompt: `你是一位资深面试官，曾在多家大厂负责招聘。用户会告诉你应聘的岗位，请你：
1. 列出这个岗位最可能被问到的5-8个面试题（包含行为面和技术/专业面）
2. 每题给出参考答案框架（不是逐字稿，是要点）
3. 每题标注面试官在考察什么（底层能力）
4. 给出这个岗位的面试通关Tips（着装/反问环节/薪资谈判等）

题目类型要全面：自我介绍类、经历深挖类、情景模拟类、专业能力类、压力测试类。

用Markdown输出，清晰易读。`,
    userPrompt: (input) => `请为以下岗位生成模拟面试题和答案：\n\n${input}`,
  },

  debate: {
    name: "辩论立论生成",
    systemPrompt: `你是一位资深辩论教练。用户会给你一个辩题，请你：
1. 为正方和反方各生成一套立论框架
2. 每套框架包含：
   - 核心立场（一句话定义）
   - 判断标准（用什么标准衡量胜负）
   - 3个核心论点，每个论点配：
     - 逻辑推导链
     - 事实/数据支撑思路（提示去哪找证据）
     - 对方可能的反驳及预回应
   - 价值升华方向

用Markdown输出，正反方分开，结构清晰。`,
    userPrompt: (input) => `请为以下辩题生成正反方立论框架：\n\n${input}`,
  },
};

// 简单的解锁码验证
function validateCode(code, tool) {
  // 免费试用（客户端已做次数限制）
  if (code === "FREE_TIER") return { valid: true, type: "free" };

  const secret = process.env.UNLOCK_SECRET || "debate2024secret";
  // 全站通码
  const allAccessCodes = (process.env.ALL_ACCESS_CODES || "VIP888,DEBATE666").split(",");
  if (allAccessCodes.includes(code.trim())) return { valid: true, type: "all" };

  // 单工具码：SHA256(secret + tool)前8位
  const expected = simpleHash(secret + tool).slice(0, 8).toUpperCase();
  if (code.trim().toUpperCase() === expected) return { valid: true, type: "single", tool };

  // 也支持环境变量里直接配的码
  const customCodes = (process.env.CUSTOM_CODES || "").split(",");
  if (customCodes.includes(code.trim())) return { valid: true, type: "single" };

  return { valid: false };
}

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // Convert to hex string
  return Math.abs(hash).toString(16).padStart(8, "0").toUpperCase();
}

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "只支持POST请求" });
  }

  try {
    const { tool, input, unlockCode, validateOnly } = req.body;

    // 仅验证解锁码模式（不消耗AI）
    if (validateOnly) {
      if (!tool || !unlockCode) {
        return res.status(400).json({ error: "validateOnly 模式下 tool 和 unlockCode 为必填" });
      }
      const v = validateCode(unlockCode, tool);
      return res.status(200).json({
        valid: v.valid,
        type: v.valid ? v.type : null,
        tool: v.valid && v.tool ? v.tool : null,
      });
    }

    if (!tool || !input) {
      return res.status(400).json({ error: "缺少参数：tool 和 input 为必填" });
    }

    const toolConfig = TOOLS[tool];
    if (!toolConfig) {
      return res.status(400).json({ error: `未知工具：${tool}。支持：${Object.keys(TOOLS).join(", ")}` });
    }

    // 验证解锁码
    if (!unlockCode) {
      return res.status(403).json({
        error: "FREE_TIER_EXHAUSTED",
        message: "免费次数已用完，请获取解锁码继续使用。",
        tool: tool,
      });
    }

    const validation = validateCode(unlockCode, tool);
    if (!validation.valid) {
      return res.status(403).json({
        error: "INVALID_CODE",
        message: "解锁码无效，请检查后重试。",
      });
    }

    // 调用 AI — 优先用 DeepSeek（国内方便便宜），其次 Claude
    let result, usage;

    const deepseekKey = process.env.DEEPSEEK_API_KEY;
    const claudeKey = process.env.ANTHROPIC_API_KEY;

    if (!deepseekKey && !claudeKey) {
      return res.status(500).json({ error: "服务器未配置AI接口，请设置 DEEPSEEK_API_KEY 或 ANTHROPIC_API_KEY" });
    }

    // 优先 DeepSeek（国内无需翻墙，便宜，中文好）
    if (deepseekKey) {
      const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${deepseekKey}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          max_tokens: 4096,
          temperature: 0.7,
          messages: [
            { role: "system", content: toolConfig.systemPrompt },
            { role: "user", content: toolConfig.userPrompt(input) },
          ],
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("DeepSeek API error:", response.status, errText);
        return res.status(502).json({ error: "AI服务暂时不可用，请稍后重试。" });
      }

      const data = await response.json();
      result = data.choices?.[0]?.message?.content || "（AI未返回内容，请重试）";
      usage = data.usage;
    } else {
      // Fallback to Claude
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": claudeKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 4096,
          system: toolConfig.systemPrompt,
          messages: [{ role: "user", content: toolConfig.userPrompt(input) }],
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("Claude API error:", response.status, errText);
        return res.status(502).json({ error: "AI服务暂时不可用，请稍后重试。" });
      }

      const data = await response.json();
      result = data.content?.[0]?.text || "（AI未返回内容，请重试）";
      usage = data.usage;
    }

    return res.status(200).json({
      success: true,
      tool: tool,
      toolName: toolConfig.name,
      result: result,
      usage: usage,
    });
  } catch (error) {
    console.error("Handler error:", error);
    return res.status(500).json({ error: "服务器内部错误，请稍后重试。" });
  }
}
