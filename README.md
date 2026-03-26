# MCP Apps × Hono × React × Cloud Run

MCP Apps（インラインUI）を Hono + React + Google Cloud Run で構築するサンプルプロジェクト。

[AWS Lambda版](https://github.com/ShuntaToda/mcp-apps-react-hono-lambda) のGoogle Cloud移植版。

## 技術スタック

| 技術 | 用途 |
|------|------|
| Hono | HTTP フレームワーク + MCP Transport |
| React 19 | MCP Apps UI |
| Vite + vite-plugin-singlefile | 単一HTML生成 |
| Tailwind CSS v4 | スタイリング |
| Terraform | GCPインフラ管理 |
| Cloud Run | サーバーホスティング |
| Artifact Registry | Dockerイメージ保存 |

## プロジェクト構成

```
├── packages/
│   ├── app/           # React UI（Viteで単一HTMLにビルド）
│   ├── server/        # Hono MCP + REST APIサーバー
│   └── infra/         # Terraform（Cloud Run + Artifact Registry）
├── Dockerfile
└── package.json
```

## セットアップ

```bash
pnpm install
```

## ローカル開発

```bash
# .env にローカルURLを設定
echo "SERVICE_URL=http://localhost:3000" > .env

# React UIビルド → サーバー起動
pnpm --filter @shop-mcp/app build
pnpm -w run dev
```

## デプロイ

### 1. Terraform でインフラ作成

```bash
cd packages/infra
cp terraform.tfvars.example terraform.tfvars
# terraform.tfvars を編集して project_id を設定

terraform init
terraform apply
```

### 2. 初回イメージ push & デプロイ

```bash
# Artifact Registry への認証設定
gcloud auth configure-docker asia-northeast1-docker.pkg.dev

# イメージをビルド & push（初回は SERVICE_URL 空でOK）
docker build -t asia-northeast1-docker.pkg.dev/<PROJECT_ID>/shop-mcp/shop-mcp:latest .
docker push asia-northeast1-docker.pkg.dev/<PROJECT_ID>/shop-mcp/shop-mcp:latest

# Cloud Run にデプロイ
cd packages/infra
terraform apply
```

### 3. SERVICE_URL を設定して再デプロイ

Cloud Run のURLが確定したら:

```bash
# ルートの .env に Cloud Run URL を設定
echo "SERVICE_URL=https://shop-mcp-xxxxx-an.a.run.app" > .env

# 再ビルド & push
docker build -t asia-northeast1-docker.pkg.dev/<PROJECT_ID>/shop-mcp/shop-mcp:latest .
docker push asia-northeast1-docker.pkg.dev/<PROJECT_ID>/shop-mcp/shop-mcp:latest

# Cloud Run の環境変数も更新
# terraform.tfvars の service_url を更新して terraform apply
```

## Claude Desktop での接続

`claude_desktop_config.json` に追加:

```json
{
  "mcpServers": {
    "shop-mcp": {
      "command": "npx",
      "args": ["mcp-remote", "https://shop-mcp-xxxxx-an.a.run.app/mcp"]
    }
  }
}
```

## Lambda版との違い

| 項目 | Lambda版 | Cloud Run版 |
|------|----------|-------------|
| ランタイム | AWS Lambda (Function URL) | Cloud Run (Docker) |
| ストリーミング | Lambda Response Streaming | Node.js HTTP |
| IaC | AWS CDK | Terraform |
| ビルド | CDK esbuild | esbuild (build.mjs) |
| エントリポイント | `streamHandle(app)` | `@hono/node-server` |
