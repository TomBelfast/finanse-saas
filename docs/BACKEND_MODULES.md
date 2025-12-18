# 🔧 Backend Modules Documentation

**Last Updated:** 2024-12-19

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture Pattern](#architecture-pattern)
- [Module Structure](#module-structure)
- [Available Modules](#available-modules)
- [Use Cases](#use-cases)
- [Shared Infrastructure](#shared-infrastructure)

---

## Overview

The backend follows **Clean Architecture** principles with a modular structure. Each module contains domain-specific use cases, infrastructure, and business logic.

**Location:** `apps/functions/src/modules/`

---

## Architecture Pattern

### Clean Architecture Layers

```
Module Structure:
├── useCases/              # Business Logic Layer
│   └── useCaseName/
│       ├── UseCaseNameController.ts    # HTTP controller
│       ├── UseCaseNameDTO.ts           # Data Transfer Object
│       ├── UseCaseNameDTOValidator.ts  # Validation schema
│       ├── UseCaseNameErrors.ts        # Domain errors
│       └── UseCaseNameUseCase.ts       # Business logic
│
└── infra/                 # Infrastructure Layer
    ├── restRoutes.ts      # REST API routes
    └── routes.ts          # Alternative route definitions
```

### Shared Infrastructure

**Location:** `apps/functions/src/shared/`

- **core/** - Core domain concepts (UseCase, Result, AppError)
- **domain/** - Domain models and repositories
- **infra/** - Infrastructure implementations (database, repositories, middleware)
- **services/** - External service integrations
- **helpers/** - Utility functions
- **validation/** - Validation schemas

---

## Module Structure

### Standard Module Layout

```
modules/
└── moduleName/
    ├── useCases/
    │   └── useCaseName/
    │       ├── UseCaseNameController.ts
    │       ├── UseCaseNameDTO.ts
    │       ├── UseCaseNameDTOValidator.ts
    │       ├── UseCaseNameErrors.ts
    │       └── UseCaseNameUseCase.ts
    └── infra/
        └── restRoutes.ts (or routes.ts)
```

---

## Available Modules

### 1. Authentication Module (`auth`)

**Location:** `apps/functions/src/modules/auth/`

**Purpose:** User authentication and session management

**Routes:** `/api/auth/*`

**Use Cases:**
- User authentication via Clerk
- Token verification middleware
- User profile retrieval

**Key Files:**
- `infra/restRoutes.ts` - Authentication routes

---

### 2. Users Module (`users`)

**Location:** `apps/functions/src/modules/users/`

**Purpose:** User management and profile operations

**Routes:** `/api/users/*`

**Use Cases:**

#### Create API Token
- **Controller:** `CreateApiTokenController.ts`
- **Purpose:** Generate API tokens for external integrations
- **Endpoint:** `POST /api/users/api-tokens`

#### Delete API Token
- **Controller:** `DeleteApiTokenController.ts`
- **Purpose:** Revoke API tokens
- **Endpoint:** `DELETE /api/users/api-tokens/:tokenId`

#### Get User Metadata
- **Controller:** `GetUserMetadataController.ts`
- **Purpose:** Retrieve user metadata and settings
- **Endpoint:** `GET /api/users/metadata`

#### Send Login Link
- **Controller:** `SendLinkToLoginController.ts`
- **Purpose:** Send magic link for passwordless login
- **Endpoint:** `POST /api/users/send-login-link`

#### Send Reset Password Email
- **Controller:** `SendResetPasswordEmailController.ts`
- **Purpose:** Send password reset email
- **Endpoint:** `POST /api/users/reset-password`

**Key Files:**
- `infra/restRoutes.ts` - User management routes
- `infra/routes.ts` - Additional routes

---

### 3. Subscriptions Module (`subscriptions`)

**Location:** `apps/functions/src/modules/subscriptions/`

**Purpose:** Subscription lifecycle management and billing

**Routes:** `/api/subscriptions/*`

**Use Cases:**

#### Create Subscription for User
- **Controller:** `CreateSubscriptionForUserController.ts`
- **Purpose:** Create a new subscription for a user
- **Business Logic:** Handles Stripe customer creation, subscription setup

#### Change Subscription Plan
- **Controller:** `ChangeSubscriptionPlanController.ts`
- **Purpose:** Upgrade or downgrade subscription plan
- **Business Logic:** Updates Stripe subscription, handles prorating

#### Handle Subscription Cycle
- **Controller:** `HandleSubscriptionCycleController.ts`
- **Purpose:** Process recurring billing cycles
- **Business Logic:** Charges customer, creates invoices, handles renewals

#### Handle Failed Payment
- **Controller:** `HandleFailedPaymentController.ts`
- **Purpose:** Process failed payment attempts
- **Business Logic:** Retry logic, notification system, subscription status updates

#### Handle Subscription Status Update
- **Controllers:**
  - `HandleCancelOfSubscriptionUseCase.ts` - Cancel subscription
  - `HandleEndOfSubscriptionUseCase.ts` - End subscription
  - `HandlePauseOfCollectionUseCase.ts` - Pause billing
  - `HandleResumeOfSubscriptionUseCase.ts` - Resume billing
- **Purpose:** Manage subscription lifecycle states

#### Create Billing Customer Portal
- **Controller:** `CreateBillingCustomerPortalController.ts`
- **Purpose:** Generate Stripe billing portal session
- **Endpoint:** `POST /api/subscriptions/billing-portal`

#### Check Subscription Invoice
- **Controller:** `CheckSubscriptionInvoiceController.ts`
- **Purpose:** Verify invoice status and payment

#### Handle Added Subscription
- **Controller:** `HandleAddedSubscriptionController.ts`
- **Purpose:** Process new subscription webhook events

#### Handle Customer Update
- **Controller:** `HandleCustomerUpdateController.ts`
- **Purpose:** Process customer data updates from Stripe

#### Update Customer Data
- **Controller:** `UpdateCustomerDataController.ts`
- **Purpose:** Update customer information in Stripe

**Key Files:**
- `infra/routes.ts` - Subscription routes
- `shared/CreateUserSubscription.ts` - Shared subscription creation logic

---

### 4. User Finances Module (`userFinances`)

**Location:** `apps/functions/src/modules/userFinances/`

**Purpose:** Financial data management (subscriptions, insurances, loans)

**Routes:** 
- `/api/subscriptions/*` (shared with subscriptions module)
- `/api/insurances/*`
- `/api/loans/*`

**Use Cases:**

#### Manage User Subscription
- **Controller:** `ManageUserSubscriptionController.ts`
- **Purpose:** CRUD operations for user subscriptions

**Key Files:**
- `infra/restRoutes.ts` - Financial data routes
- `infra/routes.ts` - Alternative route definitions

---

### 5. Invoices Module (`invoices`)

**Location:** `apps/functions/src/modules/invoices/`

**Purpose:** Invoice generation and management

**Use Cases:**

#### Issue Invoice to New Payment
- **Controller:** `IssueInvoiceToNewPaymentController.ts`
- **Purpose:** Generate invoices for payments
- **Integration:** Fakturownia API

**Key Files:**
- `infra/routes.ts` - Invoice routes

---

### 6. Admin Module (`admin`)

**Location:** `apps/functions/src/modules/admin/`

**Purpose:** Administrative operations

**Use Cases:**

#### Broadcast Message
- **Controller:** `BroadcastMessageController.ts`
- **Purpose:** Send system-wide notifications to all users
- **Authorization:** Admin only

**Key Files:**
- `infra/routes.ts` - Admin routes

---

### 7. System Module (`system`)

**Location:** `apps/functions/src/modules/system/`

**Purpose:** System-level operations

**Use Cases:**

#### Admin Handler
- **Controller:** `AdminHandlerController.ts`
- **Purpose:** General admin operations handler

**Key Files:**
- `infra/routes.ts` - System routes

---

### 8. API Module (`api`)

**Location:** `apps/functions/src/modules/api/`

**Purpose:** API token management and documentation

**Features:**
- OpenAPI documentation
- API token validation
- Rate limiting

**Key Files:**
- `infra/routes/index.ts` - API routes
- `docs/OpenApi.ts` - OpenAPI specification

---

## Use Cases Pattern

### Standard Use Case Structure

Each use case follows this pattern:

1. **DTO (Data Transfer Object)** - Request/response data structure
2. **DTO Validator** - Validation schema (Zod)
3. **Errors** - Domain-specific error types
4. **Use Case** - Business logic implementation
5. **Controller** - HTTP request handler

### Example Use Case Flow

```
HTTP Request
    ↓
Controller (validates DTO)
    ↓
Use Case (business logic)
    ↓
Repository (data access)
    ↓
Service (external integrations)
    ↓
Response
```

---

## Shared Infrastructure

### Core Domain Concepts

**Location:** `apps/functions/src/shared/core/`

- **UseCase.ts** - Base use case class
- **Result.ts** - Result pattern implementation
- **AppError.ts** - Application error base class
- **ApiResponse.ts** - Standardized API response format

### Repositories

**Location:** `apps/functions/src/shared/infra/repositories/`

- **BaseRepository.ts** - Base repository interface
- **FirebaseUsersRepository.ts** - Firebase user repository
- **MariaDBUsersRepository.ts** - MariaDB user repository
- **MariaDBUserSubscriptionRepository.ts** - Subscription repository
- **repositoryFactory.ts** - Repository factory pattern

### Middleware

**Location:** `apps/functions/src/shared/infra/middleware/`

- **auth.ts** - Clerk authentication middleware
- **apiAuthorizer.ts** - API token authorization
- **rateLimiter.ts** - Rate limiting middleware
- **accessLogger.ts** - Request logging

### Services

**Location:** `apps/functions/src/shared/services/`

- **AuthService.ts** - Authentication service
- **EmailService.ts** - Email sending (Postmark)
- **InvoiceService.ts** - Invoice generation (Fakturownia)
- **BroadcastService.ts** - System notifications
- **ConversionTrackingService.ts** - Analytics tracking

---

## Database Access

### MariaDB Connection

**Location:** `apps/functions/src/shared/infra/database.ts`

```typescript
import { getDatabasePool } from './shared/infra/database';

const pool = getDatabasePool();
const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);
```

### Repository Pattern

Repositories abstract database access:

```typescript
const usersRepository = createUsersRepository(db);
const user = await usersRepository.findUserById(userId);
```

---

## Error Handling

### Error Types

1. **Domain Errors** - Business logic errors (in UseCaseErrors.ts)
2. **Validation Errors** - DTO validation failures
3. **Infrastructure Errors** - Database, network errors

### Error Response Format

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": { ... }
}
```

---

## Related Documentation

- [API Endpoints Documentation](./API_ENDPOINTS.md) - Complete API reference
- [Architecture Documentation](./ARCHITECTURE.md) - System architecture
- [Configuration Guide](./CONFIGURATION.md) - Backend configuration

---

**Last Updated:** 2024-12-19
