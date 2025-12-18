# 🏗️ System Architecture

**Last Updated:** 2024-12-19  
**Project:** Finanse SaaS

## 📋 Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Monorepo Structure](#monorepo-structure)
- [Application Flow](#application-flow)
- [Data Flow](#data-flow)
- [Security Architecture](#security-architecture)
- [Deployment Architecture](#deployment-architecture)

---

## Overview

Finanse SaaS is a comprehensive personal and business finance management platform built as a modern monorepo application. The system provides subscription management, payment processing, insurance tracking, and loan management capabilities.

### Key Characteristics

- **Monorepo**: Single repository managing multiple packages and applications
- **Type-Safe**: Full TypeScript implementation across frontend and backend
- **Modern Stack**: React 18, Vite, Redux Toolkit, Clerk Authentication
- **API-First**: RESTful API architecture with clear separation of concerns
- **Scalable**: Modular architecture supporting feature growth

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  React Web App (Vite)                                │   │
│  │  - Clerk Authentication                              │   │
│  │  - Redux State Management                            │   │
│  │  - Ant Design UI Components                          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS / REST API
                            │
┌─────────────────────────────────────────────────────────────┐
│                      Application Layer                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Express.js API Server                              │   │
│  │  - RESTful Endpoints                                │   │
│  │  - Clerk Authentication Middleware                   │   │
│  │  - Business Logic                                   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │
┌─────────────────────────────────────────────────────────────┐
│                       Data Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Database    │  │  File Storage│  │  External    │     │
│  │  (MySQL/     │  │  (Cloud)     │  │  Services    │     │
│  │   Firestore) │  │              │  │  (Stripe,    │     │
│  │              │  │              │  │   etc.)      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Component Architecture

```
apps/web-app (Frontend)
├── Entry Point (index.tsx)
│   ├── ClerkProvider (Authentication)
│   ├── ErrorBoundary (Error Handling)
│   └── ConfigProvider (Ant Design)
│
├── App Component
│   ├── Redux Provider
│   ├── React Router
│   └── AuthChecker
│
├── Pages
│   ├── Auth (Login/Register)
│   ├── Dashboard
│   ├── Subscriptions
│   ├── Insurances
│   ├── Loans
│   └── Settings
│
├── Components
│   ├── ProtectedRoute
│   ├── AuthChecker
│   └── [UI Components]
│
└── Services
    ├── apiClient (REST API Client)
    └── WebAnalyticsService

apps/functions (Backend)
├── API Routes
│   ├── /auth/*
│   ├── /users/*
│   ├── /subscriptions/*
│   ├── /insurances/*
│   └── /loans/*
│
├── Middleware
│   ├── Authentication (Clerk)
│   ├── Error Handling
│   └── Validation
│
└── Business Logic
    ├── User Management
    ├── Subscription Management
    └── Payment Processing

packages/shared
├── Models (TypeScript Types)
├── Redux Store & Actions
├── Constants
└── Utilities
```

---

## Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.2.0 | UI Framework |
| **TypeScript** | 5.5.4 | Type Safety |
| **Vite** | 5.4.2 | Build Tool & Dev Server |
| **Redux Toolkit** | 1.9.7 | State Management |
| **React Router** | 5.2.0 | Routing |
| **Ant Design** | 5.24.2 | UI Component Library |
| **Clerk** | 5.0.0 | Authentication |
| **i18next** | 19.8.4 | Internationalization |
| **SCSS** | - | Styling |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 22 | Runtime |
| **Express** | 4.17.1 | Web Framework |
| **TypeScript** | 5.5.4 | Type Safety |
| **Clerk SDK** | 5.0.0 | Authentication |
| **MySQL** | 3.11.5 | Database |
| **Stripe** | 17.6.0 | Payment Processing |

### Development Tools

| Tool | Purpose |
|------|---------|
| **pnpm** | Package Manager |
| **Lerna** | Monorepo Management |
| **Turbo** | Build System |
| **ESLint** | Code Linting |
| **Prettier** | Code Formatting |
| **Vitest** | Testing Framework |

---

## Monorepo Structure

```
finanse-saas/
├── apps/
│   ├── web-app/          # React Frontend Application
│   │   ├── src/
│   │   │   ├── components/    # Reusable UI components
│   │   │   ├── pages/         # Route pages
│   │   │   ├── hooks/         # Custom React hooks
│   │   │   ├── services/      # API clients & services
│   │   │   ├── store/         # Redux store (deprecated, using shared)
│   │   │   └── theme/         # Styling & themes
│   │   ├── public/            # Static assets
│   │   └── package.json
│   │
│   └── functions/        # Express.js Backend API
│       ├── src/
│       │   ├── routes/        # API route handlers
│       │   ├── middleware/    # Express middleware
│       │   ├── services/      # Business logic
│       │   └── utils/         # Utility functions
│       └── package.json
│
├── packages/
│   └── shared/           # Shared TypeScript Package
│       ├── src/
│       │   ├── models/        # TypeScript types & interfaces
│       │   ├── store/         # Redux store configuration
│       │   ├── constants/     # Shared constants
│       │   ├── helpers/       # Utility functions
│       │   └── translations/  # i18n translations
│       └── package.json
│
├── docs/                 # Project Documentation
├── scripts/              # Build & utility scripts
├── package.json          # Root package.json
├── pnpm-workspace.yaml   # pnpm workspace config
├── lerna.json           # Lerna monorepo config
└── turbo.json           # Turbo build config
```

### Package Dependencies

```
apps/web-app
  └── depends on: @akademiasaas/shared

apps/functions
  └── depends on: @akademiasaas/shared

packages/shared
  └── no internal dependencies (standalone)
```

---

## Application Flow

### Authentication Flow

```
1. User visits application
   ↓
2. ClerkProvider initializes (index.tsx)
   ↓
3. AuthChecker component checks authentication status
   ↓
4. If not authenticated → Redirect to /auth/login
   ↓
5. User signs in via Clerk SignIn component
   ↓
6. Clerk returns JWT token
   ↓
7. AuthChecker syncs user data with Redux store
   ↓
8. API Client sets token for subsequent requests
   ↓
9. User redirected to Dashboard
```

### Data Fetching Flow

```
1. Component dispatches Redux action
   ↓
2. Redux action calls API Client method
   ↓
3. API Client adds Clerk JWT token to request
   ↓
4. Express.js middleware validates token
   ↓
5. Business logic processes request
   ↓
6. Response returned to API Client
   ↓
7. Redux action updates store
   ↓
8. Component re-renders with new data
```

### Protected Route Flow

```
1. User navigates to protected route
   ↓
2. ProtectedRoute component checks authentication
   ↓
3. If not authenticated → Redirect to /auth/login?continue=/path
   ↓
4. After authentication → Redirect to original path
   ↓
5. Component renders if authenticated
```

---

## Data Flow

### State Management

```
┌─────────────────┐
│  React Component│
└────────┬────────┘
         │ dispatch(action)
         ↓
┌─────────────────┐
│  Redux Store    │
│  (packages/     │
│   shared)       │
└────────┬────────┘
         │
         ├──→ User State
         ├──→ Subscription State
         ├──→ Notification State
         └──→ UI State
```

### API Communication

```
┌─────────────────┐
│  Component      │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  apiClient      │
│  (services/     │
│   apiClient.ts) │
└────────┬────────┘
         │ HTTP Request
         │ + Clerk JWT Token
         ↓
┌─────────────────┐
│  Express API    │
│  (apps/         │
│   functions)    │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Database /     │
│  External APIs  │
└─────────────────┘
```

---

## Security Architecture

### Authentication

- **Provider**: Clerk (SaaS authentication service)
- **Token Type**: JWT (JSON Web Tokens)
- **Token Storage**: Managed by Clerk SDK (secure, httpOnly cookies)
- **Token Validation**: Server-side validation via Clerk SDK

### Authorization

- **Route Protection**: `ProtectedRoute` component
- **API Protection**: Clerk middleware on Express routes
- **Role-Based Access**: Implemented via Clerk user metadata

### Data Security

- **Environment Variables**: Stored in `.env.local` (gitignored)
- **API Keys**: Never exposed to client-side code
- **HTTPS**: Enforced in production
- **CORS**: Configured for allowed origins

---

## Deployment Architecture

### Frontend Deployment

```
Source Code
    ↓
Vite Build
    ↓
Static Files (dist/)
    ↓
Firebase Hosting / CDN
```

### Backend Deployment

```
Source Code
    ↓
TypeScript Compilation
    ↓
Webpack Bundle
    ↓
Node.js Server (Express)
    ↓
Cloud Platform (GCP / AWS)
```

### Environment Configuration

- **Development**: Local development with emulators
- **Staging**: Shared development environment
- **Production**: Live production environment

Each environment has separate:
- Environment variables
- Database instances
- API keys and secrets
- Clerk application instances

---

## Key Design Decisions

### 1. Monorepo Structure
**Decision**: Use Lerna + pnpm for monorepo management  
**Rationale**: 
- Shared code between frontend and backend
- Single source of truth for types
- Simplified dependency management

### 2. Clerk for Authentication
**Decision**: Use Clerk instead of Firebase Auth  
**Rationale**:
- Better developer experience
- Built-in user management UI
- Modern authentication patterns
- Easier integration

### 3. REST API Architecture
**Decision**: RESTful API instead of GraphQL  
**Rationale**:
- Simpler to implement and maintain
- Better caching support
- Easier debugging
- Standard HTTP patterns

### 4. Redux Toolkit
**Decision**: Use Redux Toolkit for state management  
**Rationale**:
- Predictable state management
- Time-travel debugging
- Middleware support
- Shared store between components

### 5. TypeScript Everywhere
**Decision**: Full TypeScript implementation  
**Rationale**:
- Type safety across stack
- Better IDE support
- Reduced runtime errors
- Self-documenting code

---

## Future Considerations

### Potential Improvements

1. **GraphQL API**: Consider GraphQL for more flexible data fetching
2. **Microservices**: Split backend into smaller services as it grows
3. **Caching Layer**: Add Redis for API response caching
4. **Real-time Updates**: WebSocket support for live data updates
5. **Service Workers**: PWA capabilities for offline support

---

## Related Documentation

- [Project Structure](./PROJECT_STRUCTURE.md) - Detailed file structure
- [Authentication](./AUTHENTICATION.md) - Authentication implementation
- [API Client](./API_CLIENT.md) - API client documentation
- [State Management](./STATE_MANAGEMENT.md) - Redux patterns
- [Configuration](./CONFIGURATION.md) - Configuration guide

---

**Last Updated:** 2024-12-19
