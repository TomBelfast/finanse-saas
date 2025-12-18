# Playwright E2E Tests

## Overview

This directory contains end-to-end (E2E) tests for the Finanse SaaS application using Playwright.

**Why Playwright for SaaS Testing?**

Playwright is an excellent choice for testing SaaS applications because:

- ✅ **Cross-browser testing** - Test in Chrome, Firefox, Safari, Edge
- ✅ **Auto-waiting** - No flaky tests, elements are automatically waited for
- ✅ **Authentication state management** - Reuse authenticated sessions across tests
- ✅ **Screenshot & video recording** - Automatic on test failures
- ✅ **Parallel execution** - Run tests in parallel for faster feedback
- ✅ **Network interception** - Mock API responses, test offline scenarios
- ✅ **Mobile emulation** - Test responsive design on mobile devices
- ✅ **CI/CD ready** - Works seamlessly with GitHub Actions, GitLab CI, etc.

## Setup

### 1. Install Dependencies

```bash
cd apps/web-app
pnpm install
```

### 2. Install Playwright Browsers

```bash
pnpm exec playwright install
```

### 3. Configure Test Credentials

Create `.env.local` file in `apps/web-app/`:

```env
PLAYWRIGHT_TEST_EMAIL=test@example.com
PLAYWRIGHT_TEST_PASSWORD=TestPassword123!
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3005
```

## Running Tests

### Run All Tests

```bash
cd apps/web-app
pnpm exec playwright test
```

### Run Tests in UI Mode (Recommended for Development)

```bash
pnpm exec playwright test --ui
```

### Run Specific Test File

```bash
pnpm exec playwright test e2e/auth/login.spec.ts
```

### Run Tests in Specific Browser

```bash
pnpm exec playwright test --project=chromium
```

### Run Tests in Headed Mode (See Browser)

```bash
pnpm exec playwright test --headed
```

### Run Tests with Debug Mode

```bash
pnpm exec playwright test --debug
```

## Test Structure

```
e2e/
├── fixtures/
│   ├── auth.setup.ts      # Authentication setup (runs once)
│   └── test-data.ts       # Shared test data
├── auth/
│   └── login.spec.ts      # Authentication tests
├── dashboard/
│   └── dashboard.spec.ts  # Dashboard tests
├── subscriptions/
│   └── crud.spec.ts       # Subscriptions CRUD tests
└── reports/
    └── reports.spec.ts    # Reports page tests
```

## Writing Tests

### Basic Test Example

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

### Waiting for Elements

```typescript
// Playwright auto-waits, but you can be explicit
await page.waitForSelector('[data-testid="my-element"]');
await expect(page.locator('[data-testid="my-element"]')).toBeVisible();
```

## Best Practices

1. **Use data-testid attributes** - More reliable than CSS selectors
2. **Reuse authenticated state** - Use `storageState` to avoid logging in for each test
3. **Use page object model** - For complex pages, create page objects
4. **Test user flows** - Test complete user journeys, not just individual components
5. **Use fixtures** - Share test data and setup code
6. **Handle async operations** - Use `waitForLoadState` and `waitForURL`

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 22
      - run: pnpm install
      - run: pnpm exec playwright install --with-deps
      - run: pnpm exec playwright test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Troubleshooting

### Tests are flaky

- Use `waitForLoadState('networkidle')` after navigation
- Use explicit waits with `waitForSelector`
- Check for race conditions in your code

### Authentication not working

- Verify test credentials in `.env.local`
- Check if Clerk is properly configured
- Run `auth.setup.ts` manually: `pnpm exec playwright test e2e/fixtures/auth.setup.ts`

### Tests timeout

- Increase timeout in `playwright.config.ts`
- Check if dev server is running
- Verify base URL is correct

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)

