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

await build({
  entryPoints: [path.join(__dirname, "src/server.ts")],
  bundle: true,
  outfile: path.join(__dirname, "dist/server.mjs"),
  format: "esm",
  platform: "node",
  target: "node22",
  mainFields: ["module", "main"],
  conditions: ["module"],
  loader: { ".html": "text" },
  define: { "process.env.SERVICE_URL": JSON.stringify(serviceUrl) },
  banner: {
    js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);",
  },
});

console.log("Server built successfully: dist/server.mjs");
