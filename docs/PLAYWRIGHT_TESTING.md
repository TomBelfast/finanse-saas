# 🎭 Playwright E2E Testing Guide

## Overview

Playwright is an excellent choice for testing SaaS applications. It provides:

- ✅ **Cross-browser testing** (Chrome, Firefox, Safari, Edge)
- ✅ **Auto-waiting** for elements (no flaky tests)
- ✅ **Authentication state management** (reuse authenticated sessions)
- ✅ **Screenshot & video recording** (automatic on failures)
- ✅ **Parallel execution** (faster test runs)
- ✅ **Network interception** (mock API responses)
- ✅ **Mobile emulation** (test responsive design)
- ✅ **CI/CD ready** (GitHub Actions, GitLab CI, etc.)

## Quick Start

### 1. Install Dependencies

```bash
cd apps/web-app
pnpm install
pnpm exec playwright install
```

### 2. Configure Test Credentials

Create `.env.local` in `apps/web-app/`:

```env
PLAYWRIGHT_TEST_EMAIL=test@example.com
PLAYWRIGHT_TEST_PASSWORD=TestPassword123!
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3005
```

### 3. Run Tests

```bash
# Run all tests
pnpm test:e2e

# Run in UI mode (recommended for development)
pnpm test:e2e:ui

# Run in headed mode (see browser)
pnpm test:e2e:headed

# Run specific test file
pnpm exec playwright test e2e/auth/login.spec.ts
```

## Test Structure

```
apps/web-app/e2e/
├── fixtures/
│   ├── auth.setup.ts      # Authentication setup (runs once)
│   └── test-data.ts       # Shared test data
├── auth/
│   └── login.spec.ts      # Authentication tests
├── dashboard/
│   └── dashboard.spec.ts   # Dashboard tests
├── subscriptions/
│   └── crud.spec.ts       # Subscriptions CRUD tests
└── reports/
    └── reports.spec.ts    # Reports page tests
```

## Writing Tests

### Basic Test

```typescript
import { test, expect } from '@playwright/test';

test('should display dashboard', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('Dashboard');
});
```

### Using Authenticated State

```typescript
test.use({ storageState: 'playwright/.auth/user.json' });

test('should access protected route', async ({ page }) => {
  await page.goto('/dashboard');
  // User is already authenticated
});
```

## Test Coverage

### Current Test Suites

1. **Authentication** (`e2e/auth/login.spec.ts`)
   - Login flow
   - Registration flow
   - Logout flow
   - Protected route access

2. **Dashboard** (`e2e/dashboard/dashboard.spec.ts`)
   - Dashboard loading
   - Navigation
   - User profile

3. **Subscriptions CRUD** (`e2e/subscriptions/crud.spec.ts`)
   - Create subscription
   - Read subscriptions
   - Update subscription
   - Delete subscription
   - Filter subscriptions

4. **Reports** (`e2e/reports/reports.spec.ts`)
   - Reports page display
   - Summary cards
   - Charts rendering
   - Tab switching
   - Date filtering
   - Report download

## CI/CD Integration

Tests are configured to run in GitHub Actions (see `.github/workflows/playwright.yml`).

### Required Secrets

- `PLAYWRIGHT_TEST_EMAIL` - Test user email
- `PLAYWRIGHT_TEST_PASSWORD` - Test user password
- `PLAYWRIGHT_TEST_BASE_URL` - Base URL for tests (optional)

## Best Practices

1. **Use data-testid attributes** - More reliable than CSS selectors
2. **Reuse authenticated state** - Use `storageState` to avoid logging in for each test
3. **Test user flows** - Test complete user journeys, not just individual components
4. **Handle async operations** - Use `waitForLoadState` and `waitForURL`
5. **Use fixtures** - Share test data and setup code

## Troubleshooting

### Tests are flaky
- Use `waitForLoadState('networkidle')` after navigation
- Use explicit waits with `waitForSelector`
- Check for race conditions

### Authentication not working
- Verify test credentials in `.env.local`
- Check if Clerk is properly configured
- Run auth setup: `pnpm exec playwright test e2e/fixtures/auth.setup.ts`

### Tests timeout
- Increase timeout in `playwright.config.ts`
- Check if dev server is running
- Verify base URL is correct

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)

