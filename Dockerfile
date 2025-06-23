# Multi-stage Dockerfile for Next.js with Bun

# Base stage with Bun
FROM oven/bun:1-alpine AS base
WORKDIR /app

# Install dependencies stage
FROM base AS deps
# Copy package files
COPY package.json bun.lockb* ./
# Install dependencies
RUN bun install --frozen-lockfile

# Development stage
FROM base AS development
# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
# Copy source code
COPY . .
# Expose port
EXPOSE 3000
# Set environment to development
ENV NODE_ENV=development
# Start development server
CMD ["bun", "run", "dev"]

# Build stage
FROM base AS builder
# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
# Copy source code
COPY . .
# Set environment to production for build
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Build the application
RUN bun run build

# Production stage
FROM base AS production
# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init
# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
# Switch to non-root user
USER nextjs
# Expose port
EXPOSE 3000
# Set environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
# Start the application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
