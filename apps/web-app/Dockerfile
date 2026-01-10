# Frontend Dockerfile for Coolify (Production Build)
FROM node:22-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@9.15.4

# Accept NODE_ENV as build argument (Coolify passes it as production)
# But we need development during build, so we'll override it inline when needed
ARG NODE_ENV=development
# Set ENV after ARG to ensure development is used during build
ENV NODE_ENV=development

# Copy package files (pnpm workspace requires ALL workspace packages)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/logger/package.json ./packages/logger/
COPY apps/web-app/package.json ./apps/web-app/

# Install ALL dependencies (including devDependencies needed for build)
# Force NODE_ENV=development inline to override any build argument
RUN NODE_ENV=development pnpm install --frozen-lockfile --ignore-scripts

# Copy shared package source
COPY packages/shared ./packages/shared

# Build shared package first (ensure NODE_ENV=development)
RUN cd packages/shared && NODE_ENV=development pnpm build

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

# Build frontend (NODE_ENV doesn't matter for vite build, but set it anyway)
RUN cd apps/web-app && NODE_ENV=development pnpm build

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

