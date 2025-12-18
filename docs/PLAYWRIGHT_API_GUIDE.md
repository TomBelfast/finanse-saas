# 🎭 Playwright API Guide

## Overview

**Tak, Playwright ma bardzo rozbudowane API!** To jeden z najsilniejszych aspektów Playwright - kompletne API do kontroli przeglądarki, network interception, file operations i wiele więcej.

## Główne Komponenty API

### 1. 📄 Page API

Interakcje ze stroną internetową:

```typescript
// Nawigacja
await page.goto('/dashboard');
await page.goBack();
await page.goForward();
await page.reload();

// Interakcje z elementami
await page.click('button');
await page.fill('input[name="email"]', 'test@example.com');
await page.selectOption('select', 'value');
await page.check('input[type="checkbox"]');
await page.uncheck('input[type="checkbox"]');

// Screenshot
await page.screenshot({ path: 'screenshot.png', fullPage: true });

// JavaScript execution
const result = await page.evaluate(() => {
  return window.location.href;
});

// Wait for events
await page.waitForLoadState('networkidle');
await page.waitForSelector('.dashboard');
await page.waitForURL(/\/dashboard/);
```

### 2. 🌐 Network API

Intercepcja i mockowanie requestów:

```typescript
// Intercept i mock response
await page.route('**/api/subscriptions', async (route) => {
  await route.fulfill({
    status: 200,
    body: JSON.stringify([{ id: '1', name: 'Test' }]),
  });
});

// Wait for specific API call
const response = await page.waitForResponse(
  response => response.url().includes('/api/subscriptions')
);
const data = await response.json();

// Direct HTTP requests (bez przeglądarki)
const response = await request.get('http://localhost:3015/api/subscriptions', {
  headers: { 'Authorization': 'Bearer token' },
});
```

### 3. 🎯 Locators API

Zaawansowane selektory:

```typescript
// Różne typy selektorów
page.locator('button')                    // CSS selector
page.locator('text=Click me')             // Text selector
page.locator('[data-testid="submit"]')    // Attribute selector
page.locator('button:has-text("Save")')   // CSS + text

// Chained locators
page.locator('table tbody tr').first().locator('button')

// Filter locators
page.locator('button').filter({ hasText: 'Save' })

// Count elements
const count = await page.locator('button').count();
```

### 4. ✅ Assertions API

Asercje i weryfikacje:

```typescript
// Visibility
await expect(page.locator('h1')).toBeVisible();
await expect(page.locator('.hidden')).toBeHidden();

// Text content
await expect(page.locator('h1')).toContainText('Dashboard');
await expect(page.locator('h1')).toHaveText('Dashboard');

// Attributes
await expect(page.locator('input')).toHaveAttribute('type', 'email');
await expect(page.locator('button')).toHaveClass('btn-primary');

// State
await expect(page.locator('input')).toBeEnabled();
await expect(page.locator('button')).toBeDisabled();
await expect(page.locator('input')).toBeEditable();

// Count
await expect(page.locator('.item')).toHaveCount(5);

// URL and Title
await expect(page).toHaveURL(/\/dashboard/);
await expect(page).toHaveTitle(/Dashboard/);

// Soft assertions (nie przerywają testu)
await expect.soft(page.locator('.optional')).toBeVisible();
```

### 5. 🎬 Browser Context API

Zarządzanie kontekstem przeglądarki:

```typescript
// Create new context
const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  userAgent: 'Custom UA',
  storageState: 'playwright/.auth/user.json', // Authentication state
});

// Create multiple pages
const page1 = await context.newPage();
const page2 = await context.newPage();

// Close context
await context.close();
```

### 6. 📱 Device Emulation API

Emulacja urządzeń mobilnych:

```typescript
import { devices } from '@playwright/test';

const context = await browser.newContext({
  ...devices['iPhone 12'],
  // lub
  ...devices['Pixel 5'],
});

// Custom viewport
const context = await browser.newContext({
  viewport: { width: 375, height: 667 },
  isMobile: true,
  hasTouch: true,
});
```

### 7. 🍪 Storage API

Local Storage i Cookies:

```typescript
// Local Storage
await page.evaluate(() => {
  localStorage.setItem('theme', 'dark');
});
const theme = await page.evaluate(() => localStorage.getItem('theme'));

// Cookies
await page.context().addCookies([
  { name: 'session', value: 'abc123', domain: 'localhost', path: '/' },
]);
const cookies = await page.context().cookies();
```

### 8. ⌨️ Keyboard & Mouse API

Zaawansowane interakcje:

```typescript
// Keyboard
await page.keyboard.press('Tab');
await page.keyboard.type('Hello World');
await page.keyboard.press('Enter');
await page.keyboard.press('Control+A'); // Shortcuts

// Mouse
await page.mouse.move(100, 100);
await page.mouse.click(100, 100);
await page.mouse.dblclick(200, 200);
await page.mouse.wheel(0, 100); // Scroll
```

### 9. 📥 Download API

Obsługa pobierania plików:

```typescript
const downloadPromise = page.waitForEvent('download');
await page.click('button:has-text("Download")');
const download = await downloadPromise;

const filename = download.suggestedFilename();
await download.saveAs(`downloads/${filename}`);
```

### 10. 🎭 Dialog API

Obsługa alertów i dialogów:

```typescript
page.on('dialog', async (dialog) => {
  expect(dialog.type()).toBe('alert');
  await dialog.accept(); // lub dismiss()
});

await page.click('button:has-text("Delete")');
```

### 11. 📹 Tracing API

Debugging i tracing:

```typescript
await context.tracing.start({ screenshots: true, snapshots: true });
// ... perform actions ...
await context.tracing.stop({ path: 'trace.zip' });

// View trace: npx playwright show-trace trace.zip
```

### 12. 🔍 Request API

Bezpośrednie wywołania HTTP (API Testing):

```typescript
// GET request
const response = await request.get('http://localhost:3015/api/subscriptions', {
  headers: { 'Authorization': 'Bearer token' },
});
const data = await response.json();

// POST request
const postResponse = await request.post('http://localhost:3015/api/subscriptions', {
  data: { name: 'Test', amount: 99.99 },
  headers: { 'Content-Type': 'application/json' },
});
```

## Zaawansowane Przykłady

### Network Interception z Conditional Logic

```typescript
await page.route('**/api/**', async (route) => {
  const request = route.request();
  
  if (request.method() === 'POST') {
    // Mock POST requests
    await route.fulfill({
      status: 201,
      body: JSON.stringify({ id: '123', success: true }),
    });
  } else {
    // Continue GET requests normally
    await route.continue();
  }
});
```

### Multiple Browser Contexts

```typescript
test('test with multiple users', async ({ browser }) => {
  // User 1 context
  const user1Context = await browser.newContext({
    storageState: 'playwright/.auth/user1.json',
  });
  const user1Page = await user1Context.newPage();
  
  // User 2 context
  const user2Context = await browser.newContext({
    storageState: 'playwright/.auth/user2.json',
  });
  const user2Page = await user2Context.newPage();
  
  // Test interaction between users
  await user1Page.goto('/dashboard');
  await user2Page.goto('/dashboard');
  
  await user1Context.close();
  await user2Context.close();
});
```

### Custom Fixtures

```typescript
import { test as base } from '@playwright/test';

type MyFixtures = {
  authenticatedPage: Page;
  testData: TestData;
};

export const test = base.extend<MyFixtures>({
  authenticatedPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: 'playwright/.auth/user.json',
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
  
  testData: async ({}, use) => {
    const data = require('./fixtures/test-data');
    await use(data);
  },
});
```

## Dokumentacja

- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
- [Page API](https://playwright.dev/docs/api/class-page)
- [Locator API](https://playwright.dev/docs/api/class-locator)
- [Network API](https://playwright.dev/docs/api/class-request)
- [Browser Context API](https://playwright.dev/docs/api/class-browsercontext)

## Podsumowanie

**Playwright ma bardzo rozbudowane API** obejmujące:
- ✅ Interakcje z przeglądarką (page, context, browser)
- ✅ Network interception i mocking
- ✅ File system operations
- ✅ Screenshot i video recording
- ✅ Mobile device emulation
- ✅ Authentication state management
- ✅ Direct HTTP requests (API testing)
- ✅ Advanced selectors i locators
- ✅ Keyboard i mouse events
- ✅ Dialog handling
- ✅ Download management
- ✅ Tracing i debugging

To czyni Playwright idealnym narzędziem do testowania SaaSów - od prostych E2E testów po zaawansowane scenariusze z network mocking i API testing.

