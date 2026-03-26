import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { viteSingleFile } from "vite-plugin-singlefile";

// MCP Apps 向けビルド設定
// viteSingleFile で全JS/CSSを単一HTMLにインライン化する
export default defineConfig(({ mode }) => {
  // ルートの .env から SERVICE_URL を読み込む
  const env = loadEnv(mode, "../..", "SERVICE_URL");
  return {
    plugins: [tailwindcss(), react(), viteSingleFile()],
    // ビルド時に API_BASE_URL を埋め込む
    define: { API_BASE_URL: JSON.stringify(env.SERVICE_URL) },
    build: {
      rollupOptions: {
        input: "mcp-app.html",
      },
      outDir: "dist",
      emptyOutDir: true,
    },
  };
});
