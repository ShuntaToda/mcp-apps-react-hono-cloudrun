FROM node:22-slim AS base
RUN corepack enable pnpm

# --- build stage ---
FROM base AS build
WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/app/package.json packages/app/
COPY packages/server/package.json packages/server/
RUN pnpm install --frozen-lockfile

COPY tsconfig.base.json ./
COPY packages/app/ packages/app/
COPY packages/server/ packages/server/

# React UIをビルド → サーバーをビルド（HTMLをバンドルに埋め込み）
RUN pnpm --filter @shop-mcp/app build
RUN pnpm --filter @shop-mcp/server build

# --- production stage ---
FROM node:22-slim AS production
WORKDIR /app

COPY --from=build /app/packages/server/dist/server.mjs ./server.mjs

ENV PORT=8080
EXPOSE 8080

CMD ["node", "server.mjs"]
