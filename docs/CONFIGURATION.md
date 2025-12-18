# ⚙️ Configuration Guide

**Last Updated:** 2024-12-19

## 📋 Table of Contents

- [Overview](#overview)
- [Environment Variables](#environment-variables)
- [Frontend Configuration](#frontend-configuration)
- [Backend Configuration](#backend-configuration)
- [Build Configuration](#build-configuration)
- [Development Configuration](#development-configuration)
- [Production Configuration](#production-configuration)

---

## Overview

This guide covers all configuration aspects of the Finanse SaaS application, including environment variables, build settings, and runtime configuration.

---

## Environment Variables

### Frontend Environment Variables

**Location:** `.env.local` (root directory)

**Prefix:** All frontend variables must start with `VITE_` for Vite to expose them.

#### Required Variables

```bash
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...

# API Configuration
VITE_API_URL=http://localhost:3001/api

# Environment Name
VITE_ENV_NAME=local
```

#### Optional Variables

```bash
# Debug Mode
VITE_DEBUG=true

# Sentry Error Tracking
VITE_SENTRY_KEY=...

# Performance Monitoring
VITE_USE_PERFORMANCE_MONITORING=false

# Firebase (Legacy - may be removed)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
VITE_FIREBASE_EMULATOR=false
```

### Backend Environment Variables

**Location:** `apps/functions/.env.local`

**Note:** Backend variables do NOT use the `VITE_` prefix.

#### Required Variables

```bash
# Clerk Authentication
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Environment
ENVIRONMENT_NAME=local
DOMAIN=http://localhost:3001

# Database
DATABASE_URL=mysql://user:password@localhost:3306/database
```

#### Optional Variables

```bash
# Stripe
STRIPE_API_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (Postmark)
POSTMARK_API_KEY=...
POSTMARK_FROM=noreply@example.com

# Other Services
SLACK_URL=...
FAKTUROWNIA_API_KEY=...
```

---

## Frontend Configuration

### Vite Configuration

**File:** `apps/web-app/vite.config.ts`

```typescript
export default defineConfig({
  build: {
    sourcemap: true,
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src'),
      '@akademiasaas/shared': path.resolve(__dirname, '../../packages/shared/lib'),
    },
  },
});
```

### TypeScript Configuration

**File:** `apps/web-app/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "es5",
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "~/*": ["./src/*"]
    }
  }
}
```

### Ant Design Theme

**File:** `apps/web-app/src/theme/appTheme.ts`

```typescript
export const appTheme = {
  token: {
    colorPrimary: '#1890ff',
    borderRadius: 4,
    // ... other theme tokens
  },
};
```

---

## Backend Configuration

### Express Server Configuration

**File:** `apps/functions/src/server.ts`

```typescript
const app = express();

// CORS Configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
}));

// Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
```

### Clerk Middleware

```typescript
import { clerkMiddleware } from '@clerk/clerk-sdk-node';

app.use(clerkMiddleware({
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
  secretKey: process.env.CLERK_SECRET_KEY,
}));
```

---

## Build Configuration

### Frontend Build

**Script:** `apps/web-app/package.json`

```json
{
  "scripts": {
    "build": "node ./scripts/build-webapp.js",
    "dev": "vite"
  }
}
```

### Backend Build

**Script:** `apps/functions/package.json`

```json
{
  "scripts": {
    "build": "webpack && node ./scripts/copyEnvFile.js",
    "start": "node dist/server.js"
  }
}
```

### Turbo Build Configuration

**File:** `turbo.json`

```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    }
  }
}
```

---

## Development Configuration

### Development Server

**Frontend:**
```bash
cd apps/web-app
pnpm dev
# Runs on http://localhost:3000
```

**Backend:**
```bash
cd apps/functions
pnpm dev
# Runs on http://localhost:3001
```

### Hot Module Replacement

Vite provides HMR out of the box. Changes to React components are reflected immediately without full page reload.

### Debug Mode

Enable debug logging:

```bash
# .env.local
VITE_DEBUG=true
```

This enables console logging in:
- `AuthChecker`
- `ProtectedRoute`
- Other components with debug support

---

## Production Configuration

### Environment Variables

**Production `.env.production`:**

```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...
VITE_API_URL=https://api.example.com/api
VITE_ENV_NAME=production
VITE_DEBUG=false
```

### Build Optimization

**Vite automatically:**
- Minifies code
- Tree-shakes unused code
- Code splitting
- Asset optimization

### Source Maps

Source maps are generated for production builds (for error tracking):

```typescript
// vite.config.ts
build: {
  sourcemap: true,
}
```

---

## Monorepo Configuration

### pnpm Workspace

**File:** `pnpm-workspace.yaml`

```yaml
packages:
  - apps/*
  - packages/*
```

### Lerna Configuration

**File:** `lerna.json`

```json
{
  "packages": ["apps/*", "packages/*"],
  "version": "independent",
  "npmClient": "pnpm"
}
```

---

## Security Configuration

### Environment Variable Security

1. **Never commit `.env.local`** - Already in `.gitignore`
2. **Use different keys for dev/prod**
3. **Rotate keys regularly**
4. **Use secret management in production** (e.g., Google Secret Manager)

### CORS Configuration

**Backend:**
```typescript
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || [],
  credentials: true,
}));
```

### HTTPS Enforcement

In production, enforce HTTPS:
- Frontend: Configured at hosting level (Firebase Hosting)
- Backend: Use reverse proxy (nginx, Cloud Load Balancer)

---

## Configuration Validation

### Frontend Validation

**File:** `apps/web-app/src/index.tsx`

```typescript
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Clerk Publishable Key');
}
```

### Backend Validation

Validate required environment variables on server startup:

```typescript
const requiredVars = ['CLERK_PUBLISHABLE_KEY', 'CLERK_SECRET_KEY', 'DATABASE_URL'];
for (const varName of requiredVars) {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
}
```

---

## Configuration by Environment

### Local Development

```bash
# .env.local
VITE_ENV_NAME=local
VITE_API_URL=http://localhost:3001/api
VITE_DEBUG=true
VITE_FIREBASE_EMULATOR=true
```

### Staging

```bash
# .env.develop
VITE_ENV_NAME=develop
VITE_API_URL=https://api-dev.example.com/api
VITE_DEBUG=false
```

### Production

```bash
# .env.production
VITE_ENV_NAME=production
VITE_API_URL=https://api.example.com/api
VITE_DEBUG=false
```

---

## Troubleshooting

### Variables Not Loading

**Problem:** Environment variables not available in code

**Solutions:**
1. Ensure variable starts with `VITE_` (frontend)
2. Restart dev server after adding variables
3. Check `.env.local` is in correct location
4. Verify file is not in `.gitignore` (should be ignored, but file should exist)

### Build Errors

**Problem:** Build fails with missing variables

**Solutions:**
1. Check all required variables are set
2. Verify variable names (case-sensitive)
3. Check for typos in variable names
4. Ensure `.env.production` exists for production builds

---

## Related Documentation

- [Environment Variables Guide](./06-environment-variables.md) - Detailed env var reference
- [Architecture Documentation](./ARCHITECTURE.md) - System architecture
- [Deployment Guide](./07-deployment-process.md) - Deployment configuration

---

**Last Updated:** 2024-12-19
