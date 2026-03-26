import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

/**
 * MCP Apps の HTML を読み込む
 * - dev時（tsx）: fsでファイルを直接読み込み
 * - build時（esbuild）: BUNDLED_HTML がdefineで埋め込まれるのでそれを使用
 */

declare const BUNDLED_HTML: string | undefined;

export function loadMcpAppHtml(): string {
  // esbuild ビルド時は define で埋め込まれた文字列を使用
  if (typeof BUNDLED_HTML !== "undefined") {
    return BUNDLED_HTML;
  }

  // dev時は fs で直接読み込み
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const htmlPath = resolve(__dirname, "../../app/dist/mcp-app.html");
  return readFileSync(htmlPath, "utf-8");
}
