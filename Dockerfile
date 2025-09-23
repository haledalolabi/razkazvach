# --- base ---
FROM node:20-alpine AS base
WORKDIR /app

# Telemetry off
ENV NEXT_TELEMETRY_DISABLED=1

# Необходими за Prisma и някои native зависимости на Alpine
RUN apk add --no-cache openssl libc6-compat

# PNPM през Corepack
RUN corepack enable
# (по желание) заключи версията:
# RUN corepack prepare pnpm@10.17.1 --activate

# Разрешаваме нужните build scripts за pnpm v10 (за да минава postinstall -> prisma generate)
# Ако искаш да си по-строг, махни ненужните
ENV PNPM_ALLOW_SCRIPTS="@prisma/client @prisma/engines prisma esbuild unrs-resolver"


# --- deps ---
FROM base AS deps
# ВАЖНО: копираме lockfile + package.json
COPY package.json pnpm-lock.yaml* ./
# ВАЖНО: копираме prisma/ преди install, защото postinstall ще търси schema.prisma
COPY prisma ./prisma

# Кеширане на pnpm store за по-бърз билд
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile


# --- builder ---
FROM base AS builder
ENV NEXT_TELEMETRY_DISABLED=1

# Взимаме node_modules от deps слоя
COPY --from=deps /app/node_modules ./node_modules

# Копираме целия код
COPY . .

# Билдваме Next (next.config.mjs вече е с output: 'standalone')
RUN pnpm build


# --- runner ---
FROM node:20-alpine AS runner
WORKDIR /app

# Prisma runtime зависимости (ако ползваш Prisma в runtime)
RUN apk add --no-cache openssl libc6-compat

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HUSKY=0
ENV CI=1

# Копираме минималните артефакти за standalone run:
# .next/standalone съдържа server.js и нужните node_modules
COPY --from=builder /app/.next/standalone ./
# Статичните файлове на Next (в .next/static)
COPY --from=builder /app/.next/static ./.next/static
# Публични ресурси
COPY --from=builder /app/public ./public
# (По желание) Копие на prisma директорията — полезно за скриптове/инспекции
COPY --from=builder /app/prisma ./prisma
# package.json за мета информация (не е задължителен, но полезен)
COPY --from=builder /app/package.json ./package.json

# Ако ползваш локален файлов сторидж, монтирай uploads като volume при run:
# VOLUME ["/app/uploads"]

EXPOSE 3000
# При standalone layout server.js е в /app/server.js
CMD ["node", "server.js"]