// 本地开发服务器 — 让你在本地就能跑起来看效果
// 用法: node dev-server.js
// 然后浏览器打开 http://localhost:3456

import { createServer } from "http";
import { readFileSync, existsSync } from "fs";
import { join, extname } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const PORT = 3456;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

// 加载 API handler
let analyzeHandler;
try {
  const mod = await import("./api/analyze.js");
  analyzeHandler = mod.default;
  console.log("✅ API handler 已加载");
} catch (e) {
  console.log("⚠️  API handler 加载失败:", e.message);
}

const server = createServer(async (req, res) => {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    return res.end();
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);

  // API 路由
  if (url.pathname === "/api/analyze" && analyzeHandler) {
    if (req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", async () => {
        try {
          req.body = JSON.parse(body);
        } catch {
          req.body = {};
        }
        // 模拟 Vercel 的 req/res
        const mockRes = {
          status(code) {
            res.writeHead(code, { "Content-Type": "application/json" });
            return { json: (data) => res.end(JSON.stringify(data)) };
          },
          setHeader() {},
        };
        await analyzeHandler(req, mockRes);
      });
      return;
    }
    res.writeHead(405);
    return res.end(JSON.stringify({ error: "POST only" }));
  }

  // 静态文件
  let filePath = url.pathname === "/" ? "/index.html" : url.pathname;
  filePath = join(__dirname, filePath);

  // 安全检查
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }

  if (!existsSync(filePath)) {
    // SPA fallback
    filePath = join(__dirname, "index.html");
  }

  try {
    const content = readFileSync(filePath);
    const ext = extname(filePath);
    res.writeHead(200, { "Content-Type": MIME[ext] || "text/plain" });
    res.end(content);
  } catch {
    res.writeHead(404);
    res.end("Not Found");
  }
});

server.listen(PORT, () => {
  console.log("");
  console.log("🧠 AI 工具箱 — 本地开发模式");
  console.log("   http://localhost:" + PORT);
  console.log("");
  console.log("⚠️  需要设置 AI API Key（二选一）：");
  console.log("   推荐 DeepSeek: export DEEPSEEK_API_KEY=sk-xxxxx");
  console.log("   或者 Claude:   export ANTHROPIC_API_KEY=sk-ant-xxxxx");
  console.log("   DeepSeek 注册: https://platform.deepseek.com/");
  console.log("");
});
