# 🧠 AI 工具箱

一个网页，六个 AI 工具。学生党和职场新人的生产力瑞士军刀。

🔗 **工具列表**：简历优化 | PPT大纲生成 | 论文润色降重 | 演讲稿生成 | 模拟面试 | 辩论立论生成

---

## 🚀 一键部署（免费）

### 1. 准备工作
- 注册 [Anthropic Console](https://console.anthropic.com/) 获取 API Key（新用户有免费额度）
- 注册 [Vercel](https://vercel.com/)（免费托管）

### 2. 部署
```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 在项目目录下部署
cd ai-tools-platform
vercel --prod
```

### 3. 设置环境变量
在 Vercel 后台 → Settings → Environment Variables 添加：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `ANTHROPIC_API_KEY` | `sk-ant-xxxxx` | 你的 API Key |
| `UNLOCK_SECRET` | `debate2024secret` | 解锁码密钥（自己设） |
| `ALL_ACCESS_CODES` | `VIP888,DEBATE666` | 全站通码 |

### 4. 生成解锁码
```bash
node generate-codes.js "你的密钥"
```
会输出 6 个工具各自的解锁码。

---

## 💰 怎么赚钱

1. 用户打开网页，每个工具免费试用 1 次
2. 用完弹出解锁窗口，显示价格（单工具 9.9 / 全站 29.9）
3. 用户微信红包付款 → 你发给ta对应的解锁码
4. 用户输入解锁码 → 无限使用

**推广渠道**：
- 闲鱼搜"简历优化""PPT代做"，挂你工具箱的链接
- 小红书发笔记（用工具箱生成的内容当素材）+ 评论区引流
- 朋友圈转一次："朋友做的AI工具箱，挺好用"

---

## 🛠 项目结构
```
ai-tools-platform/
├── index.html          # 前端（单页应用）
├── api/analyze.js      # 后端 API（Vercel Serverless）
├── generate-codes.js   # 解锁码生成器
├── package.json
├── vercel.json
└── .env.example
```

## 📝 技术栈
- 前端：原生 HTML/CSS/JS + marked.js（Markdown渲染）
- 后端：Vercel Serverless Function
- AI：Claude Haiku 4.5（成本极低，约 0.01 元/次）

---

## ⚠️ 注意事项
- 不要在代码里硬编码 API Key，用 Vercel 环境变量
- 免费额度用完前记得给 API 账户充值
- 解锁码告诉客户后无法撤回，建议定期换密钥重新生成
