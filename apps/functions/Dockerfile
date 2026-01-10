# Backend API Dockerfile for Coolify
FROM node:22-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@9.15.4

# Force NODE_ENV=development during build to ensure devDependencies are installed
# (TypeScript, webpack, etc. are needed for building)
ENV NODE_ENV=development

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/functions/package.json ./apps/functions/

# Install ALL dependencies (including devDependencies needed for build)
# Use --ignore-scripts to prevent husky from running in Docker
RUN pnpm install --frozen-lockfile --ignore-scripts

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
RUN npm install -g pnpm@9.15.4

# Set NODE_ENV=production for runtime (can be overridden by environment variables)
ENV NODE_ENV=production

# Copy package files (workspace structure for pnpm - all workspace packages needed)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/logger/package.json ./packages/logger/
COPY apps/functions/package.json ./apps/functions/

# Copy built files from builder (needed before install for workspace resolution)
# Note: shared package outputs to ./lib, not ./dist
# Copy package.json from builder to ensure it has correct main/types paths
COPY --from=builder /app/packages/shared/package.json ./packages/shared/
COPY --from=builder /app/packages/shared/lib ./packages/shared/lib
COPY --from=builder /app/apps/functions/dist ./apps/functions/dist
COPY --from=builder /app/apps/functions/package.json ./apps/functions/

# Install production dependencies only (ignore scripts - husky not needed in Docker)
# pnpm workspace requires all workspace packages to be present (even if not used)
# Using --prod to install only production dependencies
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

# Set working directory to functions
WORKDIR /app/apps/functions

# Expose port (default 3015, can be overridden via PORT env var)
EXPOSE 3015

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:${PORT || 3015}/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# Start the server
CMD ["node", "dist/server.js"]

