# 🔐 Authentication Documentation

**Last Updated:** 2024-12-19  
**Provider:** Clerk

## 📋 Table of Contents

- [Overview](#overview)
- [Clerk Integration](#clerk-integration)
- [Authentication Flow](#authentication-flow)
- [Component Architecture](#component-architecture)
- [API Integration](#api-integration)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)

---

## Overview

The application uses **Clerk** as the authentication provider. Clerk handles user authentication, session management, and provides pre-built UI components for sign-in and sign-up flows.

### Key Features

- ✅ JWT-based authentication
- ✅ Pre-built authentication UI components
- ✅ Session management
- ✅ User profile management
- ✅ Secure token handling

---

## Clerk Integration

### Setup Location

Authentication is configured in the application entry point:

**File:** `apps/web-app/src/index.tsx`

```typescript
import { ClerkProvider } from '@clerk/clerk-react';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Clerk Publishable Key');
}

root.render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      {/* App components */}
    </ClerkProvider>
  </React.StrictMode>
);
```

### Environment Variable

**Required:** `VITE_CLERK_PUBLISHABLE_KEY`

**Location:** `.env.local` (root directory)

```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

> **Important:** The `VITE_` prefix is required for Vite to expose the variable to client-side code.

---

## Authentication Flow

### 1. Application Initialization

```
User visits app
    ↓
index.tsx loads
    ↓
ClerkProvider initializes with publishable key
    ↓
Clerk SDK checks for existing session
    ↓
AuthChecker component evaluates authentication state
```

### 2. Unauthenticated User Flow

```
User not authenticated
    ↓
ProtectedRoute redirects to /auth/login
    ↓
SignIn component renders (Clerk pre-built UI)
    ↓
User enters credentials
    ↓
Clerk validates and creates session
    ↓
JWT token generated
    ↓
AuthChecker syncs user data
    ↓
Redirect to original destination or dashboard
```

### 3. Authenticated User Flow

```
User authenticated
    ↓
AuthChecker verifies session
    ↓
Clerk token retrieved
    ↓
Token set in API client
    ↓
User data synced with Redux store
    ↓
Protected routes accessible
```

### 4. Sign Out Flow

```
User clicks sign out
    ↓
Clerk signOut() called
    ↓
Session cleared
    ↓
Redirect to afterSignOutUrl ("/")
    ↓
Redux store cleared
    ↓
API client token cleared
```

---

## Component Architecture

### Core Authentication Components

#### 1. ClerkProvider

**Location:** `apps/web-app/src/index.tsx`

**Purpose:** Wraps entire application, provides Clerk context

**Props:**
- `publishableKey`: Clerk publishable key from environment
- `afterSignOutUrl`: URL to redirect after sign out (default: "/")

#### 2. AuthChecker

**Location:** `apps/web-app/src/components/AuthChecker/AuthChecker.tsx`

**Purpose:** Synchronizes Clerk authentication state with Redux store

**Responsibilities:**
- Monitors Clerk authentication state
- Syncs user data to Redux store
- Sets API client token
- Handles redirects after authentication

**Key Hooks Used:**
- `useUser()` - Get current user data
- `useAuth()` - Get authentication state and token

#### 3. ProtectedRoute

**Location:** `apps/web-app/src/components/ProtectedRoute/ProtectedRoute.tsx`

**Purpose:** Protects routes requiring authentication

**Behavior:**
- Checks if user is authenticated
- Shows loading spinner while checking
- Redirects to `/auth/login?continue=/path` if not authenticated
- Renders component if authenticated

**Usage:**
```typescript
<ProtectedRoute path="/dashboard" component={Dashboard} />
```

#### 4. SignIn Component

**Location:** `apps/web-app/src/pages/Auth/components/Login/Login.tsx`

**Purpose:** Renders Clerk's pre-built sign-in UI

**Configuration:**
```typescript
<SignIn
  routing="path"
  path="/auth/login"
  signUpUrl="/auth/register"
  afterSignInUrl={continuePath}
  appearance={{
    elements: {
      rootBox: styles.clerkRoot,
      card: styles.clerkCard,
    },
  }}
/>
```

#### 5. SignUp Component

**Location:** `apps/web-app/src/pages/Auth/components/Register/Register.tsx`

**Purpose:** Renders Clerk's pre-built sign-up UI

**Configuration:**
```typescript
<SignUp
  routing="path"
  path="/auth/register"
  signInUrl="/auth/login"
  afterSignUpUrl={continuePath}
  appearance={{
    elements: {
      rootBox: styles.clerkRoot,
      card: styles.clerkCard,
    },
  }}
/>
```

---

## API Integration

### Token Management

The API client automatically includes Clerk JWT tokens in API requests:

**File:** `apps/web-app/src/services/apiClient.ts`

```typescript
private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Get Clerk token if available
  try {
    const { getToken } = await import('@clerk/clerk-react');
    const token = await getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  } catch (error) {
    // Fallback handling
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });
  // ...
}
```

### Backend Token Validation

The backend validates Clerk tokens using Clerk SDK:

**Example:** (in Express middleware)

```typescript
import { clerkMiddleware } from '@clerk/clerk-sdk-node';

app.use(clerkMiddleware({
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
  secretKey: process.env.CLERK_SECRET_KEY,
}));
```

---

## Configuration

### Environment Variables

#### Frontend (`.env.local`)

```bash
# Required
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...

# Optional
VITE_DEBUG=true  # Enable debug logging
```

#### Backend (`.env.local` in `apps/functions`)

```bash
# Required
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### Clerk Dashboard Configuration

1. **Create Application** in [Clerk Dashboard](https://dashboard.clerk.com)
2. **Get Keys:**
   - Publishable Key (for frontend)
   - Secret Key (for backend)
3. **Configure Allowed Origins:**
   - `http://localhost:3000` (development)
   - Production domain (production)
4. **Set Redirect URLs:**
   - After sign in: `/`
   - After sign out: `/`
   - After sign up: `/`

---

## User Data Synchronization

### Redux Store Integration

The `AuthChecker` component synchronizes Clerk user data with Redux:

**File:** `apps/web-app/src/components/AuthChecker/AuthChecker.tsx`

```typescript
if (isSignedIn && user) {
  // Sync with Redux
  dispatch(userActions.logInSuccess({
    uid: user.id,
    email: user.primaryEmailAddress?.emailAddress || null,
  }));

  // Fetch full user details from API
  const fullUser = await apiClient.getCurrentUser();
  if (fullUser) {
    dispatch(userActions.getUserDetails(user.id));
  }
}
```

### User Data Flow

```
Clerk User Object
    ↓
AuthChecker extracts: id, email
    ↓
Redux Action: logInSuccess()
    ↓
API Call: getCurrentUser()
    ↓
Redux Action: getUserDetails()
    ↓
Component re-renders with user data
```

---

## Troubleshooting

### Common Issues

#### 1. "Missing Clerk Publishable Key" Error

**Symptom:** Application fails to start

**Solution:**
- Ensure `VITE_CLERK_PUBLISHABLE_KEY` is set in `.env.local`
- Restart development server after adding variable
- Verify variable name (must start with `VITE_`)

#### 2. Authentication Not Working

**Symptom:** User cannot sign in

**Checklist:**
- ✅ ClerkProvider is in `index.tsx` (not in App.tsx)
- ✅ Publishable key is correct
- ✅ Allowed origins configured in Clerk Dashboard
- ✅ Network requests not blocked

#### 3. Token Not Sent to API

**Symptom:** API requests return 401 Unauthorized

**Solution:**
- Verify `getToken()` is called in API client
- Check browser console for token errors
- Ensure user is authenticated before API calls

#### 4. Redirect Loop

**Symptom:** Infinite redirect between login and dashboard

**Solution:**
- Check `ProtectedRoute` authentication check
- Verify `AuthChecker` is not blocking render
- Check for conflicting route definitions

### Debug Mode

Enable debug logging:

```bash
# .env.local
VITE_DEBUG=true
```

This enables console logging in:
- `AuthChecker`
- `ProtectedRoute`
- Other authentication-related components

---

## Best Practices

### 1. Always Use ClerkProvider at Root

✅ **Correct:**
```typescript
// index.tsx
<ClerkProvider publishableKey={PUBLISHABLE_KEY}>
  <App />
</ClerkProvider>
```

❌ **Incorrect:**
```typescript
// App.tsx
<ClerkProvider>
  {/* ... */}
</ClerkProvider>
```

### 2. Use ProtectedRoute for Protected Pages

✅ **Correct:**
```typescript
<ProtectedRoute path="/dashboard" component={Dashboard} />
```

❌ **Incorrect:**
```typescript
<Route path="/dashboard" component={Dashboard} />
// No protection!
```

### 3. Check Authentication State Before API Calls

✅ **Correct:**
```typescript
const { isSignedIn } = useAuth();
if (isSignedIn) {
  await apiClient.getData();
}
```

### 4. Handle Loading States

✅ **Correct:**
```typescript
const { isLoaded } = useAuth();
if (!isLoaded) {
  return <Spinner />;
}
```

---

## Related Documentation

- [Clerk Official Docs](https://clerk.com/docs)
- [Clerk React Quickstart](https://clerk.com/docs/quickstarts/react)
- [API Client Documentation](./API_CLIENT.md)
- [State Management](./STATE_MANAGEMENT.md)
- [Configuration Guide](./CONFIGURATION.md)

---

## Migration Notes

### From Firebase Auth to Clerk

The application was migrated from Firebase Authentication to Clerk. Key changes:

1. **Removed:** Firebase Auth SDK
2. **Added:** Clerk React SDK
3. **Updated:** All authentication components
4. **Changed:** Token management approach

See [FIREBASE_REMOVAL_COMPLETE.md](../FIREBASE_REMOVAL_COMPLETE.md) for details.

---

**Last Updated:** 2024-12-19
