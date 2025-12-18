# 🧩 Component Library Documentation

**Last Updated:** 2024-12-19

## 📋 Table of Contents

- [Overview](#overview)
- [Component Structure](#component-structure)
- [Core Components](#core-components)
- [UI Components](#ui-components)
- [Form Components](#form-components)
- [Page Components](#page-components)
- [Component Patterns](#component-patterns)
- [Styling Guidelines](#styling-guidelines)

---

## Overview

The component library is built on **Ant Design** with custom components for application-specific functionality. Components are organized by purpose and located in `apps/web-app/src/components/`.

### Component Categories

1. **Core Components** - Authentication, routing, error handling
2. **UI Components** - Reusable interface elements
3. **Form Components** - Input fields, forms, validation
4. **Page Components** - Full page layouts

---

## Component Structure

### Directory Organization

```
apps/web-app/src/components/
├── AuthChecker/           # Authentication state checker
├── ProtectedRoute/        # Route protection
├── ErrorBoundary/         # Error handling
├── FullPageLoader/        # Loading states
├── ModalForm/             # Modal forms
├── UploadField/           # File upload
├── ImageUploadField/      # Image upload
├── Editor/                # Rich text editor
├── DatePicker/            # Date selection
├── CurrencySettings/      # Currency configuration
└── [Other components]/
```

### Component File Structure

Each component follows this structure:

```
ComponentName/
├── ComponentName.tsx      # Main component file
├── ComponentName.module.scss  # Component styles (if needed)
└── types.ts               # TypeScript types (if needed)
```

---

## Core Components

### AuthChecker

**Location:** `apps/web-app/src/components/AuthChecker/AuthChecker.tsx`

**Purpose:** Synchronizes Clerk authentication with Redux store

**Props:**
```typescript
interface Props {
  children: React.ReactNode;
}
```

**Usage:**
```typescript
<AuthChecker>
  <AppRoutes />
</AuthChecker>
```

**Key Features:**
- Monitors Clerk authentication state
- Syncs user data to Redux
- Sets API client token
- Handles redirects

---

### ProtectedRoute

**Location:** `apps/web-app/src/components/ProtectedRoute/ProtectedRoute.tsx`

**Purpose:** Protects routes requiring authentication

**Props:**
```typescript
interface RouteProps {
  component: React.ComponentType<any>;
  path: string;
  // ... other React Router props
}
```

**Usage:**
```typescript
<ProtectedRoute path="/dashboard" component={Dashboard} />
```

**Behavior:**
- Checks authentication status
- Shows loading spinner while checking
- Redirects to login if not authenticated
- Preserves destination URL for redirect after login

---

### ErrorBoundary

**Location:** `apps/web-app/src/components/ErrorBoundary/ErrorBoundary.tsx`

**Purpose:** Catches and handles React errors

**Features:**
- Catches component errors
- Reports to Sentry
- Shows user-friendly error UI
- Provides refresh option

**Usage:**
```typescript
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

---

### FullPageLoader

**Location:** `apps/web-app/src/components/FullPageLoader/FullPageLoader.tsx`

**Purpose:** Full-page loading indicator

**Usage:**
```typescript
<Suspense fallback={<FullPageLoader />}>
  <LazyComponent />
</Suspense>
```

---

## UI Components

### ModalForm

**Location:** `apps/web-app/src/components/ModalForm/ModalForm.tsx`

**Purpose:** Modal dialog with form

**Usage:**
```typescript
<ModalForm
  title="Create Subscription"
  visible={visible}
  onCancel={handleCancel}
  onOk={handleSubmit}
  form={form}
>
  <Form.Item name="name" label="Name">
    <Input />
  </Form.Item>
</ModalForm>
```

---

### UploadField

**Location:** `apps/web-app/src/components/UploadField/UploadField.tsx`

**Purpose:** File upload component

**Props:**
```typescript
interface UploadFieldProps {
  value?: File[];
  onChange?: (files: File[]) => void;
  maxCount?: number;
  accept?: string;
}
```

**Usage:**
```typescript
<UploadField
  value={attachments}
  onChange={setAttachments}
  maxCount={5}
  accept=".pdf,.doc,.docx"
/>
```

---

### ImageUploadField

**Location:** `apps/web-app/src/components/ImageUploadField/ImageUploadField.tsx`

**Purpose:** Image upload with preview

**Usage:**
```typescript
<ImageUploadField
  value={image}
  onChange={setImage}
  maxSize={5 * 1024 * 1024} // 5MB
/>
```

---

### Editor

**Location:** `apps/web-app/src/components/Editor/Editor.tsx`

**Purpose:** Rich text editor (Editor.js based)

**Usage:**
```typescript
<Editor
  data={editorData}
  onChange={setEditorData}
  readOnly={false}
/>
```

---

### DatePicker

**Location:** `apps/web-app/src/components/DatePicker/DatePicker.tsx`

**Purpose:** Date selection component

**Usage:**
```typescript
<DatePicker
  value={date}
  onChange={setDate}
  format="YYYY-MM-DD"
/>
```

---

## Form Components

### CreateApiTokenForm

**Location:** `apps/web-app/src/components/CreateApiTokenForm/CreateApiTokenForm.tsx`

**Purpose:** Form for creating API tokens

---

### SetPasswordForm

**Location:** `apps/web-app/src/components/SetPasswordForm/SetPasswordForm.tsx`

**Purpose:** Password setting form

---

### SetContactEmail

**Location:** `apps/web-app/src/components/SetContactEmail/SetContactEmail.tsx`

**Purpose:** Contact email configuration

---

### InvoiceDataForm

**Location:** `apps/web-app/src/components/InvoiceDataForm/InvoiceFormData.tsx`

**Purpose:** Invoice data input form

---

## Page Components

### Dashboard

**Location:** `apps/web-app/src/pages/Dashboard/Dashboard.tsx`

**Purpose:** Main dashboard page

**Features:**
- User statistics
- Quick actions
- Recent activity
- Navigation menu

---

### Subscriptions

**Location:** `apps/web-app/src/pages/Subscriptions/Subscriptions.tsx`

**Purpose:** Subscription management page

**Features:**
- List of subscriptions
- Create/edit/delete
- Filtering and sorting
- Attachment management

---

### Insurances

**Location:** `apps/web-app/src/pages/Insurances/Insurances.tsx`

**Purpose:** Insurance management page

**Features:**
- Insurance list
- Payment tracking
- Renewal dates
- Document attachments

---

### Loans

**Location:** `apps/web-app/src/pages/Loans/Loans.tsx`

**Purpose:** Loan management page

**Features:**
- Loan list
- Payment schedule
- Remaining balance
- Payment history

---

## Component Patterns

### 1. Controlled Components

✅ **Correct:**
```typescript
const [value, setValue] = useState('');

<Input value={value} onChange={(e) => setValue(e.target.value)} />
```

### 2. Form Handling with Ant Design

✅ **Correct:**
```typescript
const [form] = Form.useForm();

<Form form={form} onFinish={handleSubmit}>
  <Form.Item name="email" rules={[{ required: true }]}>
    <Input />
  </Form.Item>
</Form>
```

### 3. Loading States

✅ **Correct:**
```typescript
const [loading, setLoading] = useState(false);

{loading ? <Spin /> : <DataTable data={data} />}
```

### 4. Error Handling

✅ **Correct:**
```typescript
try {
  await apiClient.createSubscription(data);
  message.success('Created successfully');
} catch (error) {
  message.error('Failed to create');
}
```

### 5. Conditional Rendering

✅ **Correct:**
```typescript
{isAuthenticated ? <Dashboard /> : <Login />}
```

---

## Styling Guidelines

### CSS Modules

Components use CSS Modules for scoped styling:

**File:** `ComponentName.module.scss`

```scss
.container {
  padding: 16px;
}

.title {
  font-size: 24px;
  font-weight: bold;
}
```

**Usage:**
```typescript
import * as styles from './ComponentName.module.scss';

<div className={styles.container}>
  <h1 className={styles.title}>Title</h1>
</div>
```

### Ant Design Theming

Global theme configuration in `apps/web-app/src/theme/appTheme.ts`:

```typescript
export const appTheme = {
  token: {
    colorPrimary: '#1890ff',
    borderRadius: 4,
    // ... other theme tokens
  },
};
```

### SCSS Variables

Shared variables in `apps/web-app/src/theme/variables.scss`:

```scss
$primary-color: #1890ff;
$border-radius: 4px;
```

---

## Best Practices

### 1. Component Composition

✅ **Correct:**
```typescript
<Modal>
  <Form>
    <Form.Item>
      <Input />
    </Form.Item>
  </Form>
</Modal>
```

### 2. Props Typing

✅ **Correct:**
```typescript
interface Props {
  title: string;
  onSave: (data: FormData) => void;
  loading?: boolean;
}

const Component: React.FC<Props> = ({ title, onSave, loading = false }) => {
  // ...
};
```

### 3. Custom Hooks for Logic

✅ **Correct:**
```typescript
// In component
const { data, loading, error } = useSubscriptions();

// Custom hook
function useSubscriptions() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  // ...
  return { data, loading, error };
}
```

### 4. Memoization for Performance

✅ **Correct:**
```typescript
const MemoizedComponent = React.memo(ExpensiveComponent);

const handleClick = useCallback(() => {
  // ...
}, [dependencies]);
```

---

## Related Documentation

- [Ant Design Components](https://ant.design/components/overview/) - Official Ant Design docs
- [React Patterns](https://reactpatterns.com/) - React component patterns
- [State Management](./STATE_MANAGEMENT.md) - State management patterns

---

**Last Updated:** 2024-12-19
