# 📚 Project Documentation Index

**Last Updated:** 2024-12-19  
**Project:** Finanse SaaS - Personal & Business Finance Management Platform  
**Version:** 1.201.0

## 🗂️ Documentation Structure

This index provides a comprehensive overview of all project documentation, organized by category for easy navigation.

## ⚡ Quick Reference

### Development Servers

| Service | Port | Command | Status |
|---------|------|---------|--------|
| **Frontend (Vite)** | `3005` | `pnpm dev` (from root) | ✅ Running |
| **Backend API (Express)** | `3001` | `pnpm dev` (from root) | ⚠️ Check status |
| **Health Check** | `3001` | `GET /health` | - |

### API Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/health` | GET | Health check | ❌ |
| `/api/auth/me` | GET, PUT | Current user authentication | ✅ |
| `/api/users/me` | GET, PUT | Current user profile | ✅ |
| `/api/users/:userId` | GET | Get user by ID (admin/self) | ✅ |
| `/api/subscriptions` | GET, POST | List/Create subscriptions | ✅ |
| `/api/subscriptions/:id` | PUT, DELETE | Update/Delete subscription | ✅ |
| `/api/insurances` | GET, POST | List/Create insurances | ✅ |
| `/api/insurances/:id` | PUT, DELETE | Update/Delete insurance | ✅ |
| `/api/loans` | GET, POST | List/Create loans | ✅ |
| `/api/loans/:id` | PUT, DELETE | Update/Delete loan | ✅ |

**📖 Full API Documentation:** [API_ENDPOINTS.md](./API_ENDPOINTS.md)

### Common Commands

```bash
# Install dependencies
pnpm install

# Start development (all services)
pnpm dev

# Start frontend only
cd apps/web-app && pnpm dev

# Start backend only
cd apps/functions && pnpm dev

# Build all packages
pnpm build

# Run tests
pnpm test

# Type checking
pnpm check-types

# Linting
pnpm lint
```

---

## 📖 Quick Start & Setup

| Document | Description | Status |
|----------|-------------|--------|
| [README.md](../README.md) | Main project overview and quick reference | ✅ Complete |
| [QUICK_START.md](../QUICK_START.md) | Step-by-step setup instructions | ✅ Complete |
| [docs/00-quick-start.md](./00-quick-start.md) | Quick start guide | ✅ Complete |
| [docs/01-system-requirements.md](./01-system-requirements.md) | System requirements | ✅ Complete |
| [docs/02-dev-environment-setup.md](./02-dev-environment-setup.md) | Development environment setup | ✅ Complete |

---

## 🏗️ Architecture & Structure

| Document | Description | Status |
|----------|-------------|--------|
| [docs/04-monorepo-setup.md](./04-monorepo-setup.md) | Monorepo structure and organization | ✅ Complete |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | **NEW** - Comprehensive architecture overview | 📝 Generated |
| [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) | **NEW** - Detailed project structure | 📝 Generated |

---

## 🔐 Authentication & Security

| Document | Description | Status |
|----------|-------------|--------|
| [CLERK_SETUP.md](../CLERK_SETUP.md) | Clerk authentication setup | ✅ Complete |
| [CLERK_INTEGRATION_COMPLETE.md](../CLERK_INTEGRATION_COMPLETE.md) | Clerk integration completion notes | ✅ Complete |
| [AUTHENTICATION.md](./AUTHENTICATION.md) | **NEW** - Authentication flow documentation | 📝 Generated |
| [CLERK_INTEGRATION_VERIFICATION.md](./CLERK_INTEGRATION_VERIFICATION.md) | **NEW** - Clerk integration verification and compliance | ✅ Complete |

---

## 🔧 Configuration

| Document | Description | Status |
|----------|-------------|--------|
| [docs/03-firebase-configuration.md](./03-firebase-configuration.md) | Firebase configuration | ✅ Complete |
| [docs/06-environment-variables.md](./06-environment-variables.md) | Environment variables reference | ✅ Complete |
| [CONFIGURATION.md](./CONFIGURATION.md) | **NEW** - Comprehensive configuration guide | 📝 Generated |

---

## 💻 Development

| Document | Description | Status |
|----------|-------------|--------|
| [docs/05-running-and-testing.md](./05-running-and-testing.md) | Running and testing guide | ✅ Complete |
| [API_CLIENT.md](./API_CLIENT.md) | **NEW** - API Client documentation | 📝 Generated |
| [API_ENDPOINTS.md](./API_ENDPOINTS.md) | **NEW** - Complete API endpoints reference | 📝 Generated |
| [BACKEND_MODULES.md](./BACKEND_MODULES.md) | **NEW** - Backend modules and use cases | 📝 Generated |
| [ROUTING.md](./ROUTING.md) | **NEW** - Frontend routing documentation | 📝 Generated |
| [COMPONENTS.md](./COMPONENTS.md) | **NEW** - Component library reference | 📝 Generated |
| [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md) | **NEW** - Redux state management guide | 📝 Generated |
| [DATABASE_CRUD_STATUS.md](./DATABASE_CRUD_STATUS.md) | **NEW** - Database CRUD operations status and verification | ✅ Complete |

### Backend API Structure

**Location:** `apps/functions/src/`

**Modules:**
- `modules/auth/` - Authentication endpoints
- `modules/users/` - User management (5 use cases)
- `modules/subscriptions/` - Subscription management (10 use cases)
- `modules/userFinances/` - Financial data (insurances, loans)
- `modules/invoices/` - Invoice generation (1 use case)
- `modules/admin/` - Admin operations (1 use case)
- `modules/system/` - System endpoints (1 use case)
- `modules/api/` - API token management

**Architecture:** Clean Architecture with Use Cases pattern
- `useCases/` - Business logic (18+ use cases total)
- `infra/` - Infrastructure (routes, repositories)
- `domain/` - Domain models

**📖 Full Backend Documentation:** [BACKEND_MODULES.md](./BACKEND_MODULES.md)

---

## 🚀 Deployment

| Document | Description | Status |
|----------|-------------|--------|
| [docs/07-deployment-process.md](./07-deployment-process.md) | Deployment process | ✅ Complete |

---

## 📦 Features & Modules

| Document | Description | Status |
|----------|-------------|--------|
| [docs/08-user-management.md](./08-user-management.md) | User management | ✅ Complete |
| [docs/09-payment-integration.md](./09-payment-integration.md) | Payment integration | ✅ Complete |
| [FIREBASE_REMOVAL_COMPLETE.md](../FIREBASE_REMOVAL_COMPLETE.md) | Firebase removal migration notes | ✅ Complete |

---

## 🔍 Code Analysis & Quality

| Document | Description | Status |
|----------|-------------|--------|
| [CODE_QUALITY.md](./CODE_QUALITY.md) | **NEW** - Code quality analysis and recommendations | 📝 Generated |

## 🛠️ Development Tools & Troubleshooting

| Document | Description | Status |
|----------|-------------|--------|
| [CURSOR_ENV_BLOCKING.md](./CURSOR_ENV_BLOCKING.md) | **NEW** - Cursor IDE environment file blocking guide | ✅ Complete |
| [FIREBASE_REMAINING_ISSUES.md](./FIREBASE_REMAINING_ISSUES.md) | **NEW** - Firebase pozostałości w pakiecie shared i plan naprawy | ✅ Complete |
| [FIREBASE_REMOVAL_COMPLETE_FINAL.md](./FIREBASE_REMOVAL_COMPLETE_FINAL.md) | **NEW** - Całkowite usunięcie Firebase z aplikacji - dokumentacja | ✅ Complete |
| [CLERK_BACKEND_SETUP.md](./CLERK_BACKEND_SETUP.md) | **NEW** - Konfiguracja Clerk Secret Key na backendzie | ✅ Complete |
| [DEBUG_MODE_SETUP.md](./DEBUG_MODE_SETUP.md) | **NEW** - System automatycznego przechwytywania logów z konsoli | ✅ Complete |

---

## 📋 Navigation Guide

### For New Developers
1. Start with [README.md](../README.md) for project overview
2. Follow [QUICK_START.md](../QUICK_START.md) for setup
3. Read [ARCHITECTURE.md](./ARCHITECTURE.md) for system understanding
4. Review [AUTHENTICATION.md](./AUTHENTICATION.md) for auth flow
5. Explore [COMPONENTS.md](./COMPONENTS.md) for UI components

### For Backend Developers
1. [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
2. [BACKEND_MODULES.md](./BACKEND_MODULES.md) - **NEW** - Complete backend modules documentation
3. [API_ENDPOINTS.md](./API_ENDPOINTS.md) - **NEW** - Complete API endpoints reference
4. [API_CLIENT.md](./API_CLIENT.md) - API client structure (frontend perspective)
5. [docs/03-firebase-configuration.md](./03-firebase-configuration.md) - Backend config
6. `apps/functions/src/server.ts` - Express server setup
7. `apps/functions/src/modules/` - Backend module structure
8. **API Routes:** See `apps/functions/src/modules/*/infra/restRoutes.ts`

### For Frontend Developers
1. [COMPONENTS.md](./COMPONENTS.md) - Component library
2. [ROUTING.md](./ROUTING.md) - **NEW** - Frontend routing guide
3. [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md) - Redux patterns
4. [AUTHENTICATION.md](./AUTHENTICATION.md) - Auth implementation
5. [API_CLIENT.md](./API_CLIENT.md) - API client usage
6. [CONFIGURATION.md](./CONFIGURATION.md) - Frontend config

### For DevOps
1. [docs/07-deployment-process.md](./07-deployment-process.md) - Deployment
2. [docs/06-environment-variables.md](./06-environment-variables.md) - Environment setup
3. [docs/04-monorepo-setup.md](./04-monorepo-setup.md) - Monorepo management

---

## 🔄 Documentation Status

- ✅ **Complete** - Fully documented and up-to-date
- 📝 **Generated** - Auto-generated from codebase analysis
- 🚧 **In Progress** - Currently being written
- ❌ **Missing** - Needs to be created

---

## 📝 Contributing to Documentation

When adding new features or making significant changes:

1. Update relevant documentation files
2. Add cross-references in this index
3. Update the "Last Updated" date
4. Ensure code examples are tested and working

---

## 🔧 Troubleshooting

### Frontend Issues

**Blank Page at `http://192.168.0.14:3005/`**
- Check if Vite dev server is running: `pnpm dev`
- Check browser console for errors
- Verify `.env.local` has `VITE_CLERK_PUBLISHABLE_KEY`
- Check network tab for failed API requests

**Port Already in Use**
- Frontend default: `3005` (configurable in `apps/web-app/vite.config.ts`)
- Backend default: `3001` (configurable via `PORT` env variable)
- Vite automatically tries next available port (3006, 3007, etc.) if default is in use
- Kill process: `netstat -ano | findstr :PORT` then `taskkill /PID <PID> /F`

**Build Errors**
- Clear cache: `rm -rf node_modules .turbo` then `pnpm install`
- Rebuild shared package: `cd packages/shared && pnpm build`

### Backend Issues

**API Not Responding**
- Check if Express server is running on port 3001
- Verify database connection in `apps/functions/src/shared/infra/database.ts`
- Check environment variables in `.env.local`

**Authentication Errors**
- Verify Clerk keys in environment variables
- Check Clerk dashboard for application status
- Review `apps/functions/src/modules/auth/infra/restRoutes.ts`

## 🔗 External Resources

### Core Technologies
- [Clerk Documentation](https://clerk.com/docs) - Authentication service
- [React Router v5 Docs](https://v5.reactrouter.com/) - Routing library
- [Redux Toolkit Docs](https://redux-toolkit.js.org/) - State management
- [Ant Design Docs](https://ant.design/) - UI component library
- [Vite Docs](https://vitejs.dev/) - Build tool
- [Express.js Docs](https://expressjs.com/) - Backend framework
- [TypeScript Docs](https://www.typescriptlang.org/docs/) - Type system

### Monorepo Tools
- [pnpm Workspace](https://pnpm.io/workspaces) - Package manager
- [Turbo](https://turbo.build/repo/docs) - Build system
- [Lerna](https://lerna.js.org/) - Monorepo management

## 📊 Project Statistics

### Codebase Metrics

- **Frontend Components:** 30+ reusable components
- **Frontend Pages:** 12+ route pages (Auth, Dashboard, Subscriptions, Insurances, Loans, Reports, Settings, Admin, Users)
- **Backend Modules:** 8 feature modules
- **Backend Use Cases:** 18+ use cases implementing business logic
- **API Endpoints:** 20+ REST endpoints
- **Redux Slices:** 5 state slices (user, subscription, notifications, statistics, integrationApiTokens)
- **Shared Package:** Types, utilities, Redux store, translations (PL/EN)

### Architecture

- **Frontend Framework:** React 18.2.0 + TypeScript 5.5.4
- **Backend Framework:** Express.js + Node.js 22
- **Build Tool:** Vite 5.4.2
- **State Management:** Redux Toolkit 1.9.7
- **UI Library:** Ant Design 5.24.2
- **Authentication:** Clerk 5.0.0
- **Database:** MariaDB/MySQL
- **Monorepo:** Lerna + pnpm + Turbo

---

## 📝 Recent Updates

### 2024-12-19
- ✅ Generated comprehensive project documentation index (`/sc/index`)
- ✅ Created API_ENDPOINTS.md - Complete API endpoints reference
- ✅ Created BACKEND_MODULES.md - Backend modules and use cases documentation
- ✅ Created ROUTING.md - Frontend routing documentation
- ✅ Created DATABASE_CRUD_STATUS.md - Database CRUD operations verification and status
- ✅ Added Clerk integration verification documentation
- ✅ Added Cursor IDE environment file blocking guide
- ✅ Updated authentication flow with Clerk redirect fixes
- ✅ Fixed deprecated Clerk props (`afterSignInUrl` → `fallbackRedirectUrl`/`forceRedirectUrl`)
- ✅ Improved ProtectedRoute authentication check logic
- ✅ Updated project statistics with detailed metrics

---

**Note:** This index is automatically maintained. For questions or updates, please refer to the project maintainers.

**Last Updated:** 2024-12-19
