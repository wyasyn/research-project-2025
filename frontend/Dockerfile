# syntax=docker.io/docker/dockerfile:1

FROM node:22-alpine AS base

# Base dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy npm dependency files only
COPY package.json package-lock.json* .npmrc* ./

# Install dependencies using npm with legacy peer deps
RUN npm ci --legacy-peer-deps

# Build the application
FROM base AS builder
WORKDIR /app

# Copy source files including .env.production
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set NODE_ENV and ensure Next.js picks up .env.production
ENV NODE_ENV=production

# Build the Next.js app with env
RUN npm run build

# Final production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
