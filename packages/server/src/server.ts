import { serve } from "@hono/node-server";
import app from "./index.js";

// Cloud Run 本番用サーバー
// Cloud Run は PORT 環境変数でリッスンポートを指定する
const port = Number(process.env.PORT) || 8080;

serve({ fetch: app.fetch, port }, () => {
  console.log(`MCP server running on port ${port}`);
});
