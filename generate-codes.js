// 解锁码生成器
// 用法：node generate-codes.js <你的密钥>
// 生成每个工具的单工具解锁码 + 全站通码

const secret = process.argv[2] || "debate2024secret";

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, "0").toUpperCase();
}

const tools = [
  { key: "resume", name: "📝 简历优化" },
  { key: "ppt", name: "📊 PPT大纲生成" },
  { key: "paper", name: "✍️ 论文润色降重" },
  { key: "speech", name: "🎤 演讲稿生成" },
  { key: "interview", name: "💬 模拟面试" },
  { key: "debate", name: "🗣️ 辩论立论生成" },
];

console.log("=".repeat(50));
console.log("  AI 工具箱 - 解锁码生成器");
console.log("=".repeat(50));
console.log(`  密钥: ${secret}`);
console.log("");

console.log("【单工具解锁码】(9.9元/个)：");
console.log("-".repeat(40));
for (const tool of tools) {
  const code = simpleHash(secret + tool.key).slice(0, 8).toUpperCase();
  console.log(`  ${tool.name}:  ${code}`);
}

console.log("");
console.log("【全站通码】(29.9元/月)：");
console.log("-".repeat(40));
console.log("  默认通码: VIP888, DEBATE666");
console.log("  (可在 Vercel 环境变量 ALL_ACCESS_CODES 中修改)");

console.log("");
console.log("【自定义码】：");
console.log("-".repeat(40));
console.log("  在 Vercel 环境变量 CUSTOM_CODES 中设置");
console.log("  多个码用逗号分隔，如: MYCODE1,MYCODE2");

console.log("");
console.log("💡 部署后在 Vercel 设置以下环境变量：");
console.log("  ANTHROPIC_API_KEY  - 你的 Anthropic API Key");
console.log("  UNLOCK_SECRET      - 就用上面的密钥");
console.log("  ALL_ACCESS_CODES   - 全站通码（逗号分隔）");
console.log("  CUSTOM_CODES       - 额外自定义码（可选）");
