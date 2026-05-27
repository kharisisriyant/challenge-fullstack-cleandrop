FROM oven/bun:1.3 AS builder
WORKDIR /app
COPY package.json bun.lock ./
COPY tsconfig.base.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
RUN bun install --frozen-lockfile
COPY apps/api ./apps/api
WORKDIR /app/apps/api
RUN bun run build

FROM oven/bun:1.3-slim
WORKDIR /app/apps/api
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/apps/api/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/drizzle ./drizzle
COPY --from=builder /app/apps/api/package.json ./
COPY --from=builder /app/package.json /app/

ENV NODE_ENV=production

CMD ["sh", "-c", "bun run migrate && bun run seed && bun dist/src/main.js"]
