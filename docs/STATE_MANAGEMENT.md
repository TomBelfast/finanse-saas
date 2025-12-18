# 🔄 State Management Documentation

**Last Updated:** 2024-12-19  
**Library:** Redux Toolkit

## 📋 Table of Contents

- [Overview](#overview)
- [Redux Store Structure](#redux-store-structure)
- [Store Configuration](#store-configuration)
- [Actions & Reducers](#actions--reducers)
- [Usage in Components](#usage-in-components)
- [Best Practices](#best-practices)
- [Migration Notes](#migration-notes)

---

## Overview

The application uses **Redux Toolkit** for state management. The Redux store is defined in the `@akademiasaas/shared` package and used across both frontend and backend.

### Key Features

- ✅ Centralized state management
- ✅ Type-safe with TypeScript
- ✅ Time-travel debugging
- ✅ Middleware support (logging, analytics)
- ✅ Shared between frontend and backend

---

## Redux Store Structure

### Store Location

**Package:** `packages/shared/src/store/`

**Structure:**
```
packages/shared/src/store/
├── store.ts              # Store configuration
├── reducers/
│   ├── index.ts          # Root reducer
│   ├── user/             # User state
│   │   ├── reducer.ts
│   │   ├── actions/
│   │   └── types.ts
│   ├── subscription/     # Subscription state
│   ├── notifications/    # Notification state
│   └── statistics/       # Statistics state
```

### State Shape

```typescript
interface AppStore {
  user: {
    data: User | null;
    status: UserStatus;
    details: UserDetails | null;
    detailsStatus: RequestStatus;
  };
  subscription: {
    data: Subscription | null;
    status: RequestStatus;
  };
  notifications: {
    items: Notification[];
    unreadCount: number;
  };
  statistics: {
    currentMonth: Statistics | null;
    creator: CreatorStats | null;
  };
}
```

---

## Store Configuration

### Store Creation

**File:** `packages/shared/src/store/store.ts`

```typescript
import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './reducers';

export const createStore = (dependencies: StoreDependencies) => {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: {
          extraArgument: dependencies,
        },
      }),
  });
};
```

### Frontend Store Initialization

**File:** `apps/web-app/src/initializeStore.ts`

```typescript
import { createStore } from '@akademiasaas/shared';

export const { store } = createStore({
  firestore: mockFirestore as any,
  auth: mockAuth as any,
  analytics: analyticsService,
  // ... other dependencies
});
```

### Typed Hooks

**File:** `apps/web-app/src/initializeStore.ts`

```typescript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = ThunkDispatch<AppStore, StoreDependencies, AnyAction>;

export const useAppDispatch = (): AppDispatch => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

---

## Actions & Reducers

### User Actions

**Location:** `packages/shared/src/store/reducers/user/actions/`

**Available Actions:**
- `logInUser` - User login
- `logOutUser` - User logout
- `getUserDetails` - Fetch user details
- `updateUserData` - Update user information
- `setLoggedUserData` - Set user data

**Example:**
```typescript
import { userActions } from '@akademiasaas/shared';

dispatch(userActions.logInSuccess({
  uid: 'user-id',
  email: 'user@example.com',
}));
```

### Subscription Actions

**Location:** `packages/shared/src/store/reducers/subscription/actions/`

**Available Actions:**
- `subscribeToSubscription` - Subscribe to subscription updates
- `changeSubscriptionPlan` - Change subscription plan
- `updateUserInvoiceData` - Update invoice data

### Notification Actions

**Location:** `packages/shared/src/store/reducers/notifications/actions/`

**Available Actions:**
- `subscribeToNotifications` - Subscribe to notifications
- `markAsRead` - Mark notification as read
- `markAllAsRead` - Mark all as read

---

## Usage in Components

### Reading State

```typescript
import { useAppSelector } from '~/initializeStore';

const MyComponent = () => {
  const user = useAppSelector((state) => state.user.data);
  const loading = useAppSelector((state) => state.user.status === UserStatus.LOGGING_IN);
  
  return <div>{user?.email}</div>;
};
```

### Dispatching Actions

```typescript
import { useAppDispatch } from '~/initializeStore';
import { userActions } from '@akademiasaas/shared';

const MyComponent = () => {
  const dispatch = useAppDispatch();
  
  const handleLogout = () => {
    dispatch(userActions.logOutUser());
  };
  
  return <button onClick={handleLogout}>Logout</button>;
};
```

### Async Actions (Thunks)

```typescript
// In AuthChecker.tsx
const syncUserData = async () => {
  if (isSignedIn && user) {
    dispatch(userActions.logInSuccess({
      uid: user.id,
      email: user.primaryEmailAddress?.emailAddress || null,
    }));
    
    // Fetch full user details
    try {
      const fullUser = await apiClient.getCurrentUser();
      if (fullUser) {
        dispatch(userActions.getUserDetails(user.id) as any);
      }
    } catch (error) {
      // Handle error
    }
  }
};
```

### Multiple State Values

```typescript
const MyComponent = () => {
  const { data: user, status } = useAppSelector((state) => state.user);
  const subscriptions = useAppSelector((state) => state.subscription.data);
  
  // ...
};
```

---

## Best Practices

### 1. Use Typed Hooks

✅ **Correct:**
```typescript
import { useAppSelector, useAppDispatch } from '~/initializeStore';

const user = useAppSelector((state) => state.user.data);
const dispatch = useAppDispatch();
```

❌ **Incorrect:**
```typescript
import { useSelector, useDispatch } from 'react-redux';

const user = useSelector((state: any) => state.user.data); // No type safety!
```

### 2. Select Specific State

✅ **Correct:**
```typescript
const user = useAppSelector((state) => state.user.data);
```

❌ **Incorrect:**
```typescript
const userState = useAppSelector((state) => state.user); // Selects entire slice
```

### 3. Memoize Selectors for Performance

✅ **Correct:**
```typescript
import { createSelector } from '@reduxjs/toolkit';

const selectUserEmail = createSelector(
  [(state: RootState) => state.user.data],
  (user) => user?.email
);

const email = useAppSelector(selectUserEmail);
```

### 4. Handle Loading States

✅ **Correct:**
```typescript
const status = useAppSelector((state) => state.user.status);

if (status === UserStatus.LOGGING_IN) {
  return <Spinner />;
}
```

### 5. Don't Mutate State

✅ **Correct:**
```typescript
// Reducer uses Immer (automatic immutability)
case 'UPDATE_USER':
  state.user.data = { ...state.user.data, ...action.payload };
```

---

## State Slices

### User Slice

**State:**
```typescript
{
  data: User | null;
  status: UserStatus;
  details: UserDetails | null;
  detailsStatus: RequestStatus;
}
```

**Status Values:**
- `UserStatus.NOT_LOGGED_IN`
- `UserStatus.LOGGING_IN`
- `UserStatus.LOGGED_IN`
- `UserStatus.LOGGING_OUT`

### Subscription Slice

**State:**
```typescript
{
  data: Subscription | null;
  status: RequestStatus;
}
```

### Notifications Slice

**State:**
```typescript
{
  items: Notification[];
  unreadCount: number;
}
```

---

## Integration with API Client

### Pattern: Fetch and Store

```typescript
const fetchUserDetails = async () => {
  try {
    const user = await apiClient.getCurrentUser();
    dispatch(userActions.setLoggedUserData(user));
  } catch (error) {
    // Handle error
  }
};
```

### Pattern: Update and Sync

```typescript
const updateUser = async (updates: Partial<User>) => {
  try {
    const updated = await apiClient.updateUser(updates);
    dispatch(userActions.updateUserData(updated));
  } catch (error) {
    // Handle error
  }
};
```

---

## Middleware

### Redux Logger (Development)

Logs all actions and state changes in development:

```typescript
import logger from 'redux-logger';

const store = configureStore({
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(logger),
});
```

### Analytics Middleware

Tracks Redux actions for analytics:

```typescript
const analyticsMiddleware: Middleware = (store) => (next) => (action) => {
  analyticsService.track('redux_action', {
    type: action.type,
    // ... other data
  });
  return next(action);
};
```

---

## Migration Notes

### From Firebase to API Client

The Redux store was originally designed for Firebase real-time subscriptions. With the migration to REST API:

1. **Removed:** Firebase real-time listeners
2. **Added:** API client integration
3. **Changed:** Action creators now use API client instead of Firebase SDK

### Action Type Changes

Some actions were updated to work with the API client:

- `logInUser` - Now uses Clerk authentication
- `getUserDetails` - Now uses `apiClient.getCurrentUser()`
- `updateUserData` - Now uses `apiClient.updateUser()`

---

## Related Documentation

- [Redux Toolkit Documentation](https://redux-toolkit.js.org/) - Official Redux Toolkit docs
- [API Client Documentation](./API_CLIENT.md) - API integration
- [Authentication Documentation](./AUTHENTICATION.md) - Auth state management

---

**Last Updated:** 2024-12-19
