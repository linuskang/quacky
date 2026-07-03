# Dependencies
FROM node:26-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

FROM node:26-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

ENV DATABASE_URL="postgresql://localhost:5432/db"
ENV ORG_NAME="dummy-org"
ENV VERSION="dummy-version"
ENV GITHUB_CLIENT_ID="dummy-client-id"
ENV GITHUB_CLIENT_SECRET="dummy-client-secret"
ENV UPSTREAM_API_KEY="dummy-upstream-api-key"
ENV RESEND_API_KEY="dummy-api-key"
ENV EMAIL_FROM="dummy@example.com"
ENV BETTER_AUTH_URL="http://localhost:3000"
ENV RUSTFS_ENDPOINT="https://nuhuh.com"
ENV AI_URL="https://nolooking.com"
ENV DESCRIPTION="no"
ENV RUSTFS_ACCESS_KEY_ID="dummy-access-key"
ENV RUSTFS_SECRET_ACCESS_KEY="dummy-secret-access-key"

RUN npx prisma generate
RUN npm run build

FROM node:26-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_OPTIONS="--network-family-autoselection-attempt-timeout=500"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

RUN chown -R nextjs:nodejs /app

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/generated ./generated
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

USER nextjs

EXPOSE 3000

ENV PORT 3000

ENTRYPOINT ["./entrypoint.sh"]