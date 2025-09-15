# Використовуємо офіційний Node.js образ як базовий
FROM node:18-alpine AS base

# Встановлюємо залежності тільки коли потрібно
FROM base AS deps
# Перевіряємо https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine щоб зрозуміти чому libc6-compat потрібен тут.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Копіюємо файли залежностей
COPY package.json package-lock.json* ./
RUN npm ci

# Перебудуємо вихідний код коли потрібно
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Наступна команда розкриває Next.js коли змінна середовища встановлена
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Виробничий образ, скопіюйте все і запустіть next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# https://nextjs.org/telemetry
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Встановлюємо правильні права для nextjs користувача
# Додатково, якщо ви використовуєте App Router, скопіюйте .next/standalone
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
# set hostname to localhost
ENV HOSTNAME=0.0.0.0

# server.js створюється автоматично next build
CMD ["node", "server.js"] 