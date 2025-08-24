# --- base ---
FROM node:20-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
# Някои native зависимости и Prisma искат тези lib-ове на Alpine
RUN apk add --no-cache openssl libc6-compat
RUN corepack enable

# --- deps --- (инсталираме без postinstall, за да не гърми prisma generate)
FROM base AS deps
WORKDIR /app
ENV PRISMA_SKIP_POSTINSTALL=1
COPY package.json pnpm-lock.yaml* ./
# Инсталираме всички deps (prod+dev), но без lifecycle скриптове
RUN pnpm install --frozen-lockfile --ignore-scripts

# --- builder --- (генерираме Prisma клиента и билдваме Next)
FROM base AS builder
WORKDIR /app
# Взимаме node_modules от deps
COPY --from=deps /app/node_modules ./node_modules
# Копираме целия проект (вкл. prisma/)
COPY . .
# Сега prisma/ е налична → генерираме клиента
RUN pnpm exec prisma generate
# Билдваме Next (няма нужда от output: 'standalone')
RUN pnpm build

# --- runner --- (чист prod install + копиране на билда и Prisma артефактите)
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN apk add --no-cache openssl libc6-compat
RUN corepack enable

# 1) Чисти прод зависимости (без lifecycle скриптове / postinstall)
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

# 2) Билд артефакти
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# 3) Prisma client + engines (изгенерирани в builder-а)
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
# Забележка: .prisma не е нужен при този билд и може да липсва, затова не го копираме.

EXPOSE 3000
# Стартираме Next prod server (без да разчитаме на pnpm в runtime)
CMD ["node", "node_modules/next/dist/bin/next", "start", "-p", "3000"]
