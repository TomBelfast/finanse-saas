# 📁 Project Structure Documentation

**Last Updated:** 2024-12-19

## 📋 Table of Contents

- [Overview](#overview)
- [Root Structure](#root-structure)
- [Frontend Application](#frontend-application)
- [Backend Application](#backend-application)
- [Shared Package](#shared-package)
- [Documentation](#documentation)
- [Configuration Files](#configuration-files)

---

## Overview

Finanse SaaS is organized as a **monorepo** using Lerna and pnpm workspaces. The project structure separates frontend, backend, and shared code into distinct packages.

---

## Root Structure

```
finanse-saas/
├── apps/                    # Applications
│   ├── web-app/            # React frontend
│   └── functions/          # Express.js backend
├── packages/                # Shared packages
│   └── shared/             # Shared TypeScript code
├── docs/                   # Documentation
├── scripts/                # Build and utility scripts
├── .env.local             # Root environment variables
├── package.json            # Root package.json
├── pnpm-workspace.yaml     # pnpm workspace config
├── lerna.json             # Lerna monorepo config
├── turbo.json             # Turbo build config
└── README.md              # Project overview
```

---

## Frontend Application

**Location:** `apps/web-app/`

### Directory Structure

```
apps/web-app/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── AuthChecker/    # Authentication checker
│   │   ├── ProtectedRoute/ # Route protection
│   │   ├── ErrorBoundary/  # Error handling
│   │   ├── UploadField/    # File upload
│   │   ├── Editor/         # Rich text editor
│   │   └── [Other components]/
│   │
│   ├── pages/              # Route pages
│   │   ├── Auth/          # Authentication pages
│   │   ├── Dashboard/     # Dashboard page
│   │   ├── Subscriptions/ # Subscription management
│   │   ├── Insurances/    # Insurance management
│   │   ├── Loans/         # Loan management
│   │   └── Settings/      # Settings page
│   │
│   ├── hooks/             # Custom React hooks
│   │   ├── useUserDetails.ts
│   │   ├── useQuery.ts
│   │   └── [Other hooks]/
│   │
│   ├── services/          # API clients and services
│   │   ├── apiClient.ts   # REST API client
│   │   └── WebAnalyticsService.ts
│   │
│   ├── theme/             # Styling and themes
│   │   ├── appTheme.ts    # Ant Design theme
│   │   └── variables.scss # SCSS variables
│   │
│   ├── locales/           # i18n translations
│   │   ├── en/            # English
│   │   └── pl/            # Polish
│   │
│   ├── config/            # Configuration files
│   ├── lib/               # Utility functions
│   ├── modules/           # Feature modules
│   ├── App.tsx            # Main app component
│   ├── index.tsx          # Entry point
│   └── initializeStore.ts # Redux store setup
│
├── public/                # Static assets
│   ├── favicon.ico
│   └── manifest.json
│
├── scripts/               # Build scripts
├── .env.local            # Environment variables
├── vite.config.ts        # Vite configuration
├── tsconfig.json         # TypeScript config
└── package.json          # Dependencies
```

### Key Files

#### Entry Point
- **`src/index.tsx`** - Application entry, ClerkProvider setup

#### Main App
- **`src/App.tsx`** - Root component, routing setup

#### Store Initialization
- **`src/initializeStore.ts`** - Redux store configuration

#### API Client
- **`src/services/apiClient.ts`** - REST API client

---

## Backend Application

**Location:** `apps/functions/`

### Directory Structure

```
apps/functions/
├── src/
│   ├── routes/           # API route handlers
│   │   ├── auth.ts       # Authentication routes
│   │   ├── users.ts      # User routes
│   │   ├── subscriptions.ts
│   │   └── [Other routes]/
│   │
│   ├── middleware/       # Express middleware
│   │   ├── auth.ts       # Authentication middleware
│   │   └── errorHandler.ts
│   │
│   ├── services/         # Business logic
│   │   ├── userService.ts
│   │   └── [Other services]/
│   │
│   ├── utils/            # Utility functions
│   ├── server.ts         # Express server setup
│   └── index.ts          # Entry point
│
├── scripts/              # Build scripts
├── .env.local           # Environment variables
├── webpack.config.js    # Webpack configuration
├── tsconfig.json        # TypeScript config
└── package.json         # Dependencies
```

---

## Shared Package

**Location:** `packages/shared/`

### Directory Structure

```
packages/shared/
├── src/
│   ├── models/           # TypeScript types and interfaces
│   │   ├── documents/   # Firestore document types
│   │   └── domains/     # Domain models
│   │
│   ├── store/           # Redux store
│   │   ├── store.ts     # Store configuration
│   │   └── reducers/    # Redux reducers
│   │       ├── user/
│   │       ├── subscription/
│   │       └── notifications/
│   │
│   ├── constants/        # Shared constants
│   │   ├── urls.ts
│   │   ├── userFeatures.ts
│   │   └── [Other constants]/
│   │
│   ├── helpers/         # Utility functions
│   │   ├── currencyFormatter.ts
│   │   └── [Other helpers]/
│   │
│   ├── translations/    # i18n translations
│   │   ├── en/
│   │   └── pl/
│   │
│   └── index.ts         # Package exports
│
├── tsconfig.json        # TypeScript config
└── package.json         # Dependencies
```

### Key Exports

The shared package exports:
- TypeScript types and interfaces
- Redux store and actions
- Constants and utilities
- Translation files

**Import Pattern:**
```typescript
import { User, Subscription } from '@akademiasaas/shared';
import { userActions } from '@akademiasaas/shared';
```

---

## Documentation

**Location:** `docs/`

### Structure

```
docs/
├── PROJECT_INDEX.md          # Documentation index
├── ARCHITECTURE.md           # System architecture
├── AUTHENTICATION.md         # Authentication guide
├── API_CLIENT.md             # API client docs
├── COMPONENTS.md             # Component library
├── STATE_MANAGEMENT.md       # Redux patterns
├── CONFIGURATION.md          # Configuration guide
├── CODE_QUALITY.md          # Code quality analysis
├── PROJECT_STRUCTURE.md     # This file
├── 00-quick-start.md        # Quick start guide
├── 01-system-requirements.md
├── 02-dev-environment-setup.md
├── 03-firebase-configuration.md
├── 04-monorepo-setup.md
├── 05-running-and-testing.md
├── 06-environment-variables.md
├── 07-deployment-process.md
├── 08-user-management.md
└── 09-payment-integration.md
```

---

## Configuration Files

### Root Level

- **`package.json`** - Root dependencies and scripts
- **`pnpm-workspace.yaml`** - pnpm workspace configuration
- **`lerna.json`** - Lerna monorepo configuration
- **`turbo.json`** - Turbo build configuration
- **`.env.local`** - Root environment variables

### Frontend

- **`apps/web-app/vite.config.ts`** - Vite build configuration
- **`apps/web-app/tsconfig.json`** - TypeScript configuration
- **`apps/web-app/.env.local`** - Frontend environment variables

### Backend

- **`apps/functions/webpack.config.js`** - Webpack configuration
- **`apps/functions/tsconfig.json`** - TypeScript configuration
- **`apps/functions/.env.local`** - Backend environment variables

### Shared

- **`packages/shared/tsconfig.json`** - TypeScript configuration

---

## File Naming Conventions

### Components

- **PascalCase** for component files: `ComponentName.tsx`
- **kebab-case** for directories: `component-name/`
- **SCSS Modules:** `ComponentName.module.scss`

### Utilities

- **camelCase** for utility files: `utilityFunction.ts`
- **PascalCase** for types: `TypeName.ts`

### Constants

- **camelCase** for constant files: `constantName.ts`
- **UPPER_SNAKE_CASE** for exported constants

---

## Import Paths

### Aliases

**Frontend (`apps/web-app`):**
- `~/*` → `src/*`
- `@akademiasaas/shared` → `../../packages/shared/lib`

**Usage:**
```typescript
import { Component } from '~/components/Component';
import { User } from '@akademiasaas/shared';
```

### Absolute vs Relative

**Prefer absolute imports:**
```typescript
// ✅ Good
import { apiClient } from '~/services/apiClient';

// ❌ Avoid
import { apiClient } from '../../services/apiClient';
```

---

## Related Documentation

- [Architecture Documentation](./ARCHITECTURE.md) - System architecture
- [Configuration Guide](./CONFIGURATION.md) - Configuration details
- [Project Index](./PROJECT_INDEX.md) - Documentation index

---

**Last Updated:** 2024-12-19
