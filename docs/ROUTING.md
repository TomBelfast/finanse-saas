# 🗺️ Routing Documentation

**Last Updated:** 2024-12-19

## 📋 Table of Contents

- [Overview](#overview)
- [Route Structure](#route-structure)
- [Protected Routes](#protected-routes)
- [Public Routes](#public-routes)
- [Route Components](#route-components)
- [Navigation](#navigation)

---

## Overview

The application uses **React Router v5** for client-side routing. Routes are organized into public (authentication) and protected (application) sections.

**Router Setup:** `apps/web-app/src/App.tsx`

---

## Route Structure

### High-Level Routes

```
/                           → Dashboard (Protected)
/auth/*                    → Authentication pages (Public)
  /auth/login              → Login page
  /auth/register           → Registration page
  /auth/forgot-password    → Password reset request
  /auth/reset-password     → Password reset form
  /auth/sign-with-link     → Sign in with magic link
  /auth/login-by-link      → Login by email link
```

---

## Protected Routes

### Dashboard

**Route:** `/`  
**Component:** `Dashboard`  
**Protection:** `ProtectedRoute`  
**Authentication:** Required

**Description:** Main application dashboard showing user statistics, quick actions, and navigation.

**Access:** Only authenticated users

---

## Public Routes

### Authentication Routes

All authentication routes are under `/auth` prefix and are public (no authentication required).

#### Login

**Route:** `/auth/login`  
**Component:** `Login`  
**Query Parameters:**
- `continue` - URL to redirect to after login (e.g., `/auth/login?continue=/dashboard`)

**Description:** User login page with Clerk SignIn component.

**Features:**
- Email/password login
- Google OAuth login
- Magic link login option
- Redirects to `continue` parameter or `/` after successful login

#### Register

**Route:** `/auth/register`  
**Component:** `Register`  
**Description:** User registration page with Clerk SignUp component.

#### Forgot Password

**Route:** `/auth/forgot-password/:email?`  
**Component:** `ForgotPassword`  
**URL Parameters:**
- `email` (optional) - Pre-filled email address

**Description:** Password reset request page.

#### Reset Password

**Route:** `/auth/reset-password`  
**Component:** `ResetPassword`  
**Description:** Password reset form page.

#### Sign with Link

**Route:** `/auth/sign-with-link`  
**Component:** `SignWithLink`  
**Description:** Magic link sign-in page.

#### Login by Link

**Route:** `/auth/login-by-link`  
**Component:** `LoginByEmail`  
**Description:** Email link login page.

---

## Route Components

### ProtectedRoute

**Location:** `apps/web-app/src/components/ProtectedRoute/ProtectedRoute.tsx`

**Purpose:** Protects routes requiring authentication.

**Behavior:**
1. Checks Clerk authentication status (`isSignedIn`)
2. Shows loading spinner while checking
3. Redirects to `/auth/login?continue=<current_path>` if not authenticated
4. Renders component if authenticated

**Usage:**
```typescript
<ProtectedRoute path="/" component={Dashboard} />
```

### AuthChecker

**Location:** `apps/web-app/src/components/AuthChecker/AuthChecker.tsx`

**Purpose:** Synchronizes Clerk authentication with Redux store and handles redirects.

**Behavior:**
1. Monitors Clerk authentication state
2. Syncs user data to Redux store
3. Sets API client token
4. Redirects from `/auth/*` to dashboard after login

**Usage:**
```typescript
<AuthChecker>
  <AppRoutes />
</AuthChecker>
```

---

## Navigation

### Programmatic Navigation

**Using React Router:**
```typescript
import { useHistory } from 'react-router-dom';

const history = useHistory();
history.push('/dashboard');
```

**With Query Parameters:**
```typescript
history.push({
  pathname: '/auth/login',
  search: '?continue=/dashboard'
});
```

### Link Components

**Using React Router Link:**
```typescript
import { Link } from 'react-router-dom';

<Link to="/dashboard">Go to Dashboard</Link>
```

---

## Route Protection Flow

```
User navigates to protected route
    ↓
ProtectedRoute checks authentication
    ↓
Not authenticated?
    ↓ Yes
Redirect to /auth/login?continue=/original-path
    ↓
User logs in via Clerk
    ↓
AuthChecker detects authentication
    ↓
Redirects to /original-path (or /)
    ↓
ProtectedRoute renders component
```

---

## Route Configuration

### Main Router Setup

**File:** `apps/web-app/src/App.tsx`

```typescript
<Router>
  <Switch>
    <Route path="/auth" component={Auth} />
    <ProtectedRoute path="/" component={Dashboard} />
  </Switch>
</Router>
```

### Auth Router Setup

**File:** `apps/web-app/src/pages/Auth/Auth.tsx`

```typescript
<Switch>
  <Route exact path="/auth/forgot-password/:email?" component={ForgotPassword} />
  <Route path="/auth/login" component={Login} />
  <Route exact path="/auth/register" component={Register} />
  <Route exact path="/auth/reset-password" component={ResetPassword} />
  <Route exact path="/auth/sign-with-link" component={SignWithLink} />
  <Route exact path="/auth/login-by-link" component={LoginByEmail} />
</Switch>
```

---

## Redirect Behavior

### After Login

When user successfully logs in:
1. AuthChecker detects `isSignedIn === true`
2. Checks if current path starts with `/auth`
3. Reads `continue` query parameter
4. Redirects to `continue` path or `/` (default)

**Example:**
- User visits `/dashboard` → Redirected to `/auth/login?continue=/dashboard`
- User logs in → Redirected back to `/dashboard`

### After Logout

**ClerkProvider Configuration:**
```typescript
<ClerkProvider 
  publishableKey={PUBLISHABLE_KEY} 
  afterSignOutUrl="/"
>
```

After logout, user is redirected to `/` (home), which then redirects to `/auth/login`.

---

## Route Parameters

### Dynamic Routes

Currently, the application uses minimal dynamic routing:
- `/auth/forgot-password/:email?` - Optional email parameter

### Query Parameters

Common query parameters:
- `continue` - Redirect URL after authentication
- `impersonate` - Admin impersonation mode

---

## Related Documentation

- [Authentication Documentation](./AUTHENTICATION.md) - Authentication flow details
- [Components Documentation](./COMPONENTS.md) - Route components
- [API Client Documentation](./API_CLIENT.md) - API integration

---

**Last Updated:** 2024-12-19
