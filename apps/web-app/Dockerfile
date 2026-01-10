# Frontend Dockerfile for Coolify (Production Build)
FROM node:22-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@9.15.4

# Force NODE_ENV=development during build to ensure devDependencies are installed
# (TypeScript, Vite, etc. are needed for building)
ENV NODE_ENV=development

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/web-app/package.json ./apps/web-app/

# Install ALL dependencies (including devDependencies needed for build)
RUN pnpm install --frozen-lockfile

# Copy shared package source
COPY packages/shared ./packages/shared

# Build shared package first
RUN cd packages/shared && pnpm build

# Copy frontend source
COPY apps/web-app ./apps/web-app

# Build arguments for environment variables
ARG VITE_CLERK_PUBLISHABLE_KEY
ARG VITE_API_URL
ARG VITE_DEBUG=false

# Set environment variables for build
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_DEBUG=$VITE_DEBUG

# Build frontend
RUN cd apps/web-app && pnpm build

# Production stage with nginx
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/apps/web-app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY apps/web-app/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

