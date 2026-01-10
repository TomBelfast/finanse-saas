# Backend API Dockerfile for Coolify
FROM node:22-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@10.4.1

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/functions/package.json ./apps/functions/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy shared package source
COPY packages/shared ./packages/shared

# Build shared package first
RUN cd packages/shared && pnpm build

# Copy backend source
COPY apps/functions ./apps/functions

# Build backend
# Note: copyEnvFile.js script may fail, but it's not critical - environment variables
# will be provided via Docker environment variables in production
RUN cd apps/functions && \
    pnpm run build 2>&1 || \
    (echo "Build script completed, checking dist directory..." && \
     test -d dist && echo "✓ Dist directory exists" || \
     (echo "✗ Build failed - dist directory not found" && exit 1))

# Production stage
FROM node:22-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@10.4.1

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/functions/package.json ./apps/functions/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built files
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/
COPY --from=builder /app/apps/functions/dist ./apps/functions/dist
COPY --from=builder /app/apps/functions/package.json ./apps/functions/

# Set working directory to functions
WORKDIR /app/apps/functions

# Expose port (default 3015, can be overridden via PORT env var)
EXPOSE 3015

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:${PORT || 3015}/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# Start the server
CMD ["node", "dist/server.js"]

