# 🌐 API Client Documentation

**Last Updated:** 2024-12-19

## 📋 Table of Contents

- [Overview](#overview)
- [API Client Structure](#api-client-structure)
- [Authentication](#authentication)
- [Available Methods](#available-methods)
- [Error Handling](#error-handling)
- [Usage Examples](#usage-examples)
- [Best Practices](#best-practices)

---

## Overview

The API Client (`apiClient`) is a centralized service for making HTTP requests to the backend API. It handles authentication, error handling, and request/response transformation.

**Location:** `apps/web-app/src/services/apiClient.ts`

### Key Features

- ✅ Automatic JWT token injection (Clerk)
- ✅ Centralized error handling
- ✅ Type-safe request/response handling
- ✅ Base URL configuration via environment variables

---

## API Client Structure

### Class Definition

```typescript
class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string);
  setToken(token: string | null): void;
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T>;
  
  // Auth methods
  async register(data: RegisterData): Promise<AuthResponse>;
  async login(email: string, password: string): Promise<AuthResponse>;
  async getCurrentUser(): Promise<User>;
  async updateUser(data: Partial<User>): Promise<User>;
  
  // Subscription methods
  async getSubscriptions(): Promise<Subscription[]>;
  async createSubscription(data: SubscriptionData): Promise<Subscription>;
  async updateSubscription(id: string, data: SubscriptionData): Promise<Subscription>;
  async deleteSubscription(id: string): Promise<void>;
  
  // Insurance methods
  async getInsurances(): Promise<Insurance[]>;
  async createInsurance(data: InsuranceData): Promise<Insurance>;
  async updateInsurance(id: string, data: InsuranceData): Promise<Insurance>;
  async deleteInsurance(id: string): Promise<void>;
  
  // Loan methods
  async getLoans(): Promise<Loan[]>;
  async createLoan(data: LoanData): Promise<Loan>;
  async updateLoan(id: string, data: LoanData): Promise<Loan>;
  async deleteLoan(id: string): Promise<void>;
}
```

### Configuration

**Base URL:** Set via environment variable

```bash
# .env.local
VITE_API_URL=http://localhost:3001/api
```

**Default:** `http://localhost:3001/api` (if not set)

---

## Authentication

### Automatic Token Injection

The API client automatically includes Clerk JWT tokens in all requests:

```typescript
private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Get Clerk token dynamically
  try {
    const { getToken } = await import('@clerk/clerk-react');
    const token = await getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  } catch (error) {
    // Fallback to stored token if Clerk not available
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
  }
  // ...
}
```

### Token Management

The token is managed by the `AuthChecker` component:

```typescript
// In AuthChecker.tsx
const token = await getToken();
if (token) {
  apiClient.setToken(token);
}
```

---

## Available Methods

### Authentication Methods

#### `register(data: RegisterData)`

Register a new user.

**Parameters:**
```typescript
{
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  termsAndPrivacyPolicy: boolean;
  lang?: string;
  timezone?: string;
  ip?: string;
  phoneNumber?: string;
}
```

**Returns:** `Promise<{ success: boolean; user: any; token: string }>`

#### `login(email: string, password: string)`

Authenticate user with email and password.

**Returns:** `Promise<{ success: boolean; user: any; token: string }>`

#### `getCurrentUser()`

Get current authenticated user's data.

**Returns:** `Promise<User>`

#### `updateUser(data: Partial<User>)`

Update current user's data.

**Returns:** `Promise<User>`

### Subscription Methods

#### `getSubscriptions()`

Fetch all user subscriptions.

**Returns:** `Promise<Subscription[]>`

#### `createSubscription(data: SubscriptionData)`

Create a new subscription.

**Returns:** `Promise<Subscription>`

#### `updateSubscription(id: string, data: SubscriptionData)`

Update an existing subscription.

**Returns:** `Promise<Subscription>`

#### `deleteSubscription(id: string)`

Delete a subscription.

**Returns:** `Promise<void>`

### Insurance Methods

#### `getInsurances()`

Fetch all user insurances.

**Returns:** `Promise<Insurance[]>`

#### `createInsurance(data: InsuranceData)`

Create a new insurance.

**Returns:** `Promise<Insurance>`

#### `updateInsurance(id: string, data: InsuranceData)`

Update an existing insurance.

**Returns:** `Promise<Insurance>`

#### `deleteInsurance(id: string)`

Delete an insurance.

**Returns:** `Promise<void>`

### Loan Methods

#### `getLoans()`

Fetch all user loans.

**Returns:** `Promise<Loan[]>`

#### `createLoan(data: LoanData)`

Create a new loan.

**Returns:** `Promise<Loan>`

#### `updateLoan(id: string, data: LoanData)`

Update an existing loan.

**Returns:** `Promise<Loan>`

#### `deleteLoan(id: string)`

Delete a loan.

**Returns:** `Promise<void>`

---

## Error Handling

### Request Error Handling

The API client handles errors consistently:

```typescript
if (!response.ok) {
  const error = await response.json().catch(() => ({ error: response.statusText }));
  throw new Error(error.error || `HTTP ${response.status}`);
}
```

### Error Types

- **Network Errors:** Connection failures, timeouts
- **HTTP Errors:** 4xx, 5xx status codes
- **JSON Parse Errors:** Invalid response format

### Usage in Components

```typescript
try {
  const subscriptions = await apiClient.getSubscriptions();
  // Handle success
} catch (error) {
  if (error instanceof Error) {
    console.error('Failed to fetch subscriptions:', error.message);
    // Show user-friendly error message
  }
}
```

---

## Usage Examples

### Basic Data Fetching

```typescript
import { apiClient } from '~/services/apiClient';

// In component
useEffect(() => {
  const fetchData = async () => {
    try {
      const subscriptions = await apiClient.getSubscriptions();
      setSubscriptions(subscriptions);
    } catch (error) {
      console.error('Error:', error);
    }
  };
  fetchData();
}, []);
```

### Creating a Resource

```typescript
const handleCreate = async (formData: SubscriptionData) => {
  try {
    const newSubscription = await apiClient.createSubscription(formData);
    // Update local state or refetch
    setSubscriptions([...subscriptions, newSubscription]);
  } catch (error) {
    message.error('Failed to create subscription');
  }
};
```

### Updating a Resource

```typescript
const handleUpdate = async (id: string, updates: Partial<SubscriptionData>) => {
  try {
    const updated = await apiClient.updateSubscription(id, updates);
    // Update local state
    setSubscriptions(subscriptions.map(s => s.id === id ? updated : s));
  } catch (error) {
    message.error('Failed to update subscription');
  }
};
```

### Deleting a Resource

```typescript
const handleDelete = async (id: string) => {
  try {
    await apiClient.deleteSubscription(id);
    // Remove from local state
    setSubscriptions(subscriptions.filter(s => s.id !== id));
  } catch (error) {
    message.error('Failed to delete subscription');
  }
};
```

### With Redux Integration

```typescript
import { useAppDispatch } from '~/initializeStore';
import { subscriptionActions } from '@akademiasaas/shared';

const dispatch = useAppDispatch();

const fetchSubscriptions = async () => {
  try {
    const subscriptions = await apiClient.getSubscriptions();
    dispatch(subscriptionActions.setSubscriptions(subscriptions));
  } catch (error) {
    dispatch(subscriptionActions.setError(error.message));
  }
};
```

---

## Best Practices

### 1. Always Handle Errors

✅ **Correct:**
```typescript
try {
  const data = await apiClient.getSubscriptions();
} catch (error) {
  // Handle error
}
```

❌ **Incorrect:**
```typescript
const data = await apiClient.getSubscriptions(); // No error handling!
```

### 2. Use TypeScript Types

✅ **Correct:**
```typescript
const subscriptions: Subscription[] = await apiClient.getSubscriptions();
```

### 3. Check Authentication Before API Calls

✅ **Correct:**
```typescript
const { isSignedIn } = useAuth();
if (isSignedIn) {
  await apiClient.getSubscriptions();
}
```

### 4. Update Local State After Mutations

✅ **Correct:**
```typescript
const newItem = await apiClient.createSubscription(data);
setSubscriptions([...subscriptions, newItem]);
```

### 5. Show Loading States

✅ **Correct:**
```typescript
const [loading, setLoading] = useState(false);

const fetchData = async () => {
  setLoading(true);
  try {
    const data = await apiClient.getSubscriptions();
    setSubscriptions(data);
  } finally {
    setLoading(false);
  }
};
```

---

## Extending the API Client

### Adding New Methods

1. **Add method to ApiClient class:**

```typescript
async getReports(filters?: ReportFilters): Promise<Report[]> {
  const queryParams = filters ? `?${new URLSearchParams(filters)}` : '';
  return this.request<Report[]>(`/reports${queryParams}`);
}
```

2. **Use in components:**

```typescript
const reports = await apiClient.getReports({ year: 2024 });
```

### Custom Request Options

For special cases, you can extend the request method:

```typescript
// In ApiClient class
async uploadFile(file: File, endpoint: string): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  
  return this.request<UploadResponse>(endpoint, {
    method: 'POST',
    body: formData,
    headers: {
      // Don't set Content-Type - browser will set it with boundary
    },
  });
}
```

---

## Related Documentation

- [Authentication Documentation](./AUTHENTICATION.md) - How authentication works
- [State Management](./STATE_MANAGEMENT.md) - Redux integration
- [Configuration Guide](./CONFIGURATION.md) - Environment variables

---

**Last Updated:** 2024-12-19
