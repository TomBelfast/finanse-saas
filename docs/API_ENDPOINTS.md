# 🌐 API Endpoints Documentation

**Last Updated:** 2024-12-19  
**Base URL:** `http://localhost:3001/api` (development)  
**Authentication:** Clerk JWT Token (Bearer token)

## 📋 Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
- [Request/Response Formats](#requestresponse-formats)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

---

## Overview

The API follows RESTful principles and uses Express.js with Clean Architecture pattern. All endpoints require authentication except health check.

### Base URL

- **Development:** `http://localhost:3001/api`
- **Production:** `https://api.example.com/api` (configured via environment)

### Content Type

All requests and responses use `application/json`.

---

## Authentication

### Clerk JWT Token

All protected endpoints require a Clerk JWT token in the Authorization header:

```http
Authorization: Bearer <clerk_jwt_token>
```

### Getting Token

The token is automatically obtained from Clerk SDK in the frontend:

```typescript
import { useAuth } from '@clerk/clerk-react';

const { getToken } = useAuth();
const token = await getToken();
```

### Token Validation

The API validates tokens using `ClerkExpressRequireAuth()` middleware from `@clerk/clerk-sdk-node`.

---

## API Endpoints

### Health Check

#### `GET /health`

Check API server status.

**Authentication:** Not required

**Response:**
```json
{
  "status": "ok",
  "database": "connected"
}
```

---

### Authentication Endpoints

#### `GET /api/auth/me`

Get current authenticated user's data.

**Authentication:** Required

**Response:**
```json
{
  "uid": "user_123",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "avatarUrl": "https://...",
  "lang": "pl",
  "timezone": "Europe/Warsaw"
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `404` - User not found (will create user automatically)

#### `PUT /api/auth/me`

Update current user's data.

**Authentication:** Required

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "contactEmail": "contact@example.com",
  "lang": "pl",
  "timezone": "Europe/Warsaw"
}
```

**Response:** Updated user object

**Status Codes:**
- `200` - Success
- `400` - Validation error
- `401` - Unauthorized

---

### User Management Endpoints

#### `GET /api/users/me`

Get current user's full profile.

**Authentication:** Required

**Response:**
```json
{
  "uid": "user_123",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "contactEmail": "contact@example.com",
  "avatarUrl": "https://...",
  "lang": "pl",
  "timezone": "Europe/Warsaw",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

#### `PUT /api/users/me`

Update current user's profile.

**Authentication:** Required

**Request Body:** Same as `/api/auth/me`

#### `GET /api/users/:userId`

Get user by ID (admin or self only).

**Authentication:** Required

**Authorization:** Must be admin or the user themselves

**Response:** User object

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `403` - Forbidden (not admin or not self)
- `404` - User not found

---

### Subscription Management Endpoints

#### `GET /api/subscriptions`

Get all user's subscriptions.

**Authentication:** Required

**Response:**
```json
[
  {
    "id": "sub_123",
    "userId": "user_123",
    "name": "Netflix",
    "amount": 49.99,
    "currency": "PLN",
    "billingCycle": "monthly",
    "status": "active",
    "nextBillingDate": "2024-01-15",
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

#### `POST /api/subscriptions`

Create a new subscription.

**Authentication:** Required

**Request Body:**
```json
{
  "name": "Netflix",
  "amount": 49.99,
  "currency": "PLN",
  "billingCycle": "monthly",
  "status": "active",
  "nextBillingDate": "2024-01-15"
}
```

**Response:** Created subscription object

**Status Codes:**
- `201` - Created
- `400` - Validation error
- `401` - Unauthorized

#### `PUT /api/subscriptions/:id`

Update a subscription.

**Authentication:** Required

**Authorization:** Must own the subscription

**Request Body:** Partial subscription object

**Response:** Updated subscription object

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `403` - Forbidden (not owner)
- `404` - Subscription not found

#### `DELETE /api/subscriptions/:id`

Delete a subscription.

**Authentication:** Required

**Authorization:** Must own the subscription

**Response:**
```json
{
  "success": true
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `403` - Forbidden (not owner)
- `404` - Subscription not found

---

### Insurance Management Endpoints

#### `GET /api/insurances`

Get all user's insurances.

**Authentication:** Required

**Response:**
```json
[
  {
    "id": "insurance_123",
    "user_id": "user_123",
    "name": "Car Insurance",
    "amount": 1200.00,
    "currency": "PLN",
    "period_start": "2024-01-01",
    "period_end": "2024-12-31",
    "renewal_date": "2024-12-15",
    "insurance_company": "ABC Insurance",
    "insurance_type": "vehicle",
    "status": "active",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

#### `POST /api/insurances`

Create a new insurance.

**Authentication:** Required

**Request Body:**
```json
{
  "name": "Car Insurance",
  "amount": 1200.00,
  "currency": "PLN",
  "period_start": "2024-01-01",
  "period_end": "2024-12-31",
  "renewal_date": "2024-12-15",
  "insurance_company": "ABC Insurance",
  "insurance_type": "vehicle",
  "status": "active"
}
```

**Response:** Created insurance object

#### `PUT /api/insurances/:id`

Update an insurance.

**Authentication:** Required

**Authorization:** Must own the insurance

**Request Body:** Partial insurance object

**Response:** Updated insurance object

#### `DELETE /api/insurances/:id`

Delete an insurance.

**Authentication:** Required

**Authorization:** Must own the insurance

**Response:**
```json
{
  "success": true
}
```

---

### Loan Management Endpoints

#### `GET /api/loans`

Get all user's loans.

**Authentication:** Required

**Response:**
```json
[
  {
    "id": "loan_123",
    "user_id": "user_123",
    "name": "Mortgage",
    "total_amount": 500000.00,
    "remaining_amount": 450000.00,
    "interest_rate": 3.5,
    "currency": "PLN",
    "start_date": "2020-01-01",
    "end_date": "2040-01-01",
    "next_payment_date": "2024-01-15",
    "next_payment_amount": 2500.00,
    "lender": "Bank XYZ",
    "loan_type": "mortgage",
    "status": "active",
    "payment_frequency": "monthly",
    "duration_in_months": 240,
    "created_at": "2020-01-01T00:00:00Z"
  }
]
```

#### `POST /api/loans`

Create a new loan.

**Authentication:** Required

**Request Body:**
```json
{
  "name": "Mortgage",
  "total_amount": 500000.00,
  "remaining_amount": 450000.00,
  "interest_rate": 3.5,
  "currency": "PLN",
  "start_date": "2020-01-01",
  "end_date": "2040-01-01",
  "next_payment_date": "2024-01-15",
  "next_payment_amount": 2500.00,
  "lender": "Bank XYZ",
  "loan_type": "mortgage",
  "status": "active",
  "payment_frequency": "monthly",
  "duration_in_months": 240
}
```

**Response:** Created loan object

#### `PUT /api/loans/:id`

Update a loan.

**Authentication:** Required

**Authorization:** Must own the loan

**Request Body:** Partial loan object

**Response:** Updated loan object

#### `DELETE /api/loans/:id`

Delete a loan.

**Authentication:** Required

**Authorization:** Must own the loan

**Response:**
```json
{
  "success": true
}
```

---

## Request/Response Formats

### Request Headers

```http
Content-Type: application/json
Authorization: Bearer <clerk_jwt_token>
```

### Response Format

All successful responses return JSON:

```json
{
  "data": { ... }
}
```

Or for arrays:

```json
[
  { ... },
  { ... }
]
```

### Error Response Format

```json
{
  "error": "Error message description"
}
```

---

## Error Handling

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| `200` | OK | Request successful |
| `201` | Created | Resource created successfully |
| `400` | Bad Request | Invalid request data |
| `401` | Unauthorized | Missing or invalid authentication |
| `403` | Forbidden | Insufficient permissions |
| `404` | Not Found | Resource not found |
| `500` | Internal Server Error | Server error |

### Error Examples

**401 Unauthorized:**
```json
{
  "error": "Unauthorized"
}
```

**403 Forbidden:**
```json
{
  "error": "Forbidden"
}
```

**404 Not Found:**
```json
{
  "error": "User not found"
}
```

**400 Validation Error:**
```json
{
  "error": "Validation failed",
  "details": {
    "field": "email",
    "message": "Invalid email format"
  }
}
```

---

## Rate Limiting

Currently, rate limiting is configured but may vary by endpoint. Check server logs for rate limit information.

---

## Backend Module Structure

### Module Organization

Each module follows Clean Architecture pattern:

```
modules/
├── moduleName/
│   ├── useCases/
│   │   └── useCaseName/
│   │       ├── UseCaseNameController.ts
│   │       ├── UseCaseNameDTO.ts
│   │       ├── UseCaseNameDTOValidator.ts
│   │       ├── UseCaseNameErrors.ts
│   │       └── UseCaseNameUseCase.ts
│   └── infra/
│       └── restRoutes.ts (or routes.ts)
```

### Available Modules

1. **auth** - Authentication endpoints (`/api/auth`)
2. **users** - User management (`/api/users`)
3. **subscriptions** - Subscription management (`/api/subscriptions`)
4. **userFinances** - Financial data (`/api/subscriptions`, `/api/insurances`, `/api/loans`)
5. **invoices** - Invoice generation
6. **admin** - Admin operations
7. **system** - System endpoints
8. **api** - API token management

---

## Related Documentation

- [API Client Documentation](./API_CLIENT.md) - Frontend API client usage
- [Architecture Documentation](./ARCHITECTURE.md) - System architecture
- [Authentication Documentation](./AUTHENTICATION.md) - Authentication flow
- [Configuration Guide](./CONFIGURATION.md) - API configuration

---

**Last Updated:** 2024-12-19
