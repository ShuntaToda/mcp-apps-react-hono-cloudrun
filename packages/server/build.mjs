import { build } from "esbuild";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");

// .env から SERVICE_URL を読み込み
let serviceUrl = "";
const envPath = path.join(repoRoot, ".env");
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, "utf-8");
  serviceUrl = envFile.match(/SERVICE_URL=(.+)/)?.[1]?.trim() ?? "";
}

// ビルド済みHTMLを読み込み、define で文字列として埋め込む
const htmlPath = path.join(repoRoot, "packages/app/dist/mcp-app.html");
const mcpAppHtml = fs.readFileSync(htmlPath, "utf-8");

await build({
  entryPoints: [path.join(__dirname, "src/server.ts")],
  bundle: true,
  outfile: path.join(__dirname, "dist/server.mjs"),
  format: "esm",
  platform: "node",
  target: "node22",
  mainFields: ["module", "main"],
  conditions: ["module"],
  define: {
    "process.env.SERVICE_URL": JSON.stringify(serviceUrl),
    BUNDLED_HTML: JSON.stringify(mcpAppHtml),
  },
  banner: {
    js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);",
  },
});

console.log("Server built successfully: dist/server.mjs");
