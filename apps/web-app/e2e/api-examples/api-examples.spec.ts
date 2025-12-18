import { test, expect, Page, BrowserContext } from '@playwright/test';

/**
 * Playwright API Examples
 * 
 * Playwright ma bardzo rozbudowane API do:
 * - Interakcji z przeglądarką (page, context, browser)
 * - Network interception i mocking
 * - File system operations
 * - Screenshot i video recording
 * - Mobile device emulation
 * - Authentication state management
 * - Database operations
 * - API testing (bezpośrednie wywołania HTTP)
 */

test.describe('Playwright API Examples', () => {
  
  test('API: Page Navigation and Interactions', async ({ page }) => {
    // Navigate to page
    await page.goto('/');
    
    // Wait for specific state
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');
    
    // Get page title
    const title = await page.title();
    expect(title).toBeTruthy();
    
    // Get page URL
    const url = page.url();
    expect(url).toContain('localhost');
    
    // Click element
    await page.click('button:has-text("Click me")');
    
    // Fill input
    await page.fill('input[name="email"]', 'test@example.com');
    
    // Select option
    await page.selectOption('select[name="currency"]', 'PLN');
    
    // Check checkbox
    await page.check('input[type="checkbox"]');
    
    // Upload file
    await page.setInputFiles('input[type="file"]', 'path/to/file.pdf');
  });

  test('API: Network Interception and Mocking', async ({ page }) => {
    // Intercept network requests
    await page.route('**/api/subscriptions', async (route) => {
      // Mock response
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: '1', name: 'Mock Subscription', amount: 99.99 }
        ]),
      });
    });
    
    // Or modify request
    await page.route('**/api/**', async (route) => {
      const request = route.request();
      if (request.method() === 'POST') {
        // Add custom header
        const headers = {
          ...request.headers(),
          'X-Custom-Header': 'test-value',
        };
        await route.continue({ headers });
      } else {
        await route.continue();
      }
    });
    
    // Or abort requests
    await page.route('**/analytics/**', (route) => route.abort());
    
    await page.goto('/subscriptions');
  });

  test('API: Wait for Network Requests', async ({ page }) => {
    await page.goto('/');
    
    // Wait for specific API call
    const responsePromise = page.waitForResponse(
      response => response.url().includes('/api/subscriptions') && response.status() === 200
    );
    
    // Trigger action that makes API call
    await page.click('button:has-text("Load Data")');
    
    // Wait for response
    const response = await responsePromise;
    const data = await response.json();
    expect(data).toBeTruthy();
  });

  test('API: Screenshot and Video', async ({ page }) => {
    await page.goto('/');
    
    // Take screenshot
    await page.screenshot({ path: 'screenshot.png', fullPage: true });
    
    // Screenshot of specific element
    const element = page.locator('.dashboard');
    await element.screenshot({ path: 'dashboard.png' });
    
    // Video is automatically recorded on failure (configured in playwright.config.ts)
  });

  test('API: JavaScript Execution', async ({ page }) => {
    await page.goto('/');
    
    // Execute JavaScript in page context
    const result = await page.evaluate(() => {
      return window.location.href;
    });
    expect(result).toContain('localhost');
    
    // Execute with arguments
    const data = await page.evaluate(({ userId, amount }) => {
      // Access page variables
      return { userId, amount };
    }, { userId: '123', amount: 99.99 });
    
    // Evaluate handle (for DOM elements)
    const element = page.locator('.dashboard');
    const text = await element.evaluate((el) => el.textContent);
  });

  test('API: File System Operations', async ({ page, request }) => {
    // Read file
    const fs = require('fs');
    const testData = fs.readFileSync('e2e/fixtures/test-data.json', 'utf-8');
    const data = JSON.parse(testData);
    
    // Write file
    fs.writeFileSync('test-output.json', JSON.stringify(data, null, 2));
    
    // Use in test
    await page.goto('/');
  });

  test('API: Direct HTTP Requests (API Testing)', async ({ request }) => {
    // Make direct HTTP request (bez przeglądarki)
    const response = await request.get('http://localhost:3015/api/subscriptions', {
      headers: {
        'Authorization': 'Bearer test-token',
      },
    });
    
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    
    // POST request
    const postResponse = await request.post('http://localhost:3015/api/subscriptions', {
      data: {
        name: 'Test Subscription',
        amount: 99.99,
      },
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json',
      },
    });
    
    expect(postResponse.status()).toBe(201);
  });

  test('API: Browser Context and Multiple Pages', async ({ browser }) => {
    // Create new context
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Custom User Agent',
    });
    
    // Create multiple pages
    const page1 = await context.newPage();
    const page2 = await context.newPage();
    
    await page1.goto('/');
    await page2.goto('/subscriptions');
    
    // Close context
    await context.close();
  });

  test('API: Authentication State Management', async ({ browser }) => {
    // Create context with authentication state
    const context = await browser.newContext({
      storageState: 'playwright/.auth/user.json',
    });
    
    const page = await context.newPage();
    await page.goto('/dashboard');
    
    // User is already authenticated
    await expect(page).not.toHaveURL(/\/auth\/login/);
    
    await context.close();
  });

  test('API: Mobile Device Emulation', async ({ browser }) => {
    // Emulate mobile device
    const context = await browser.newContext({
      ...require('@playwright/test').devices['iPhone 12'],
    });
    
    const page = await context.newPage();
    await page.goto('/');
    
    // Check viewport size
    const viewport = page.viewportSize();
    expect(viewport?.width).toBe(390);
    expect(viewport?.height).toBe(844);
    
    await context.close();
  });

  test('API: Local Storage and Cookies', async ({ page }) => {
    await page.goto('/');
    
    // Set local storage
    await page.evaluate(() => {
      localStorage.setItem('theme', 'dark');
      localStorage.setItem('language', 'pl');
    });
    
    // Get local storage
    const theme = await page.evaluate(() => localStorage.getItem('theme'));
    expect(theme).toBe('dark');
    
    // Set cookies
    await page.context().addCookies([
      {
        name: 'session',
        value: 'test-session-id',
        domain: 'localhost',
        path: '/',
      },
    ]);
    
    // Get cookies
    const cookies = await page.context().cookies();
    expect(cookies.length).toBeGreaterThan(0);
  });

  test('API: Dialog Handling', async ({ page }) => {
    await page.goto('/');
    
    // Handle alert
    page.on('dialog', async (dialog) => {
      expect(dialog.type()).toBe('alert');
      expect(dialog.message()).toContain('Warning');
      await dialog.accept();
    });
    
    // Trigger dialog
    await page.click('button:has-text("Delete")');
  });

  test('API: Download Files', async ({ page }) => {
    await page.goto('/reports');
    
    // Wait for download
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Download")');
    
    const download = await downloadPromise;
    const filename = download.suggestedFilename();
    expect(filename).toContain('.pdf');
    
    // Save file
    await download.saveAs(`downloads/${filename}`);
  });

  test('API: Keyboard and Mouse Events', async ({ page }) => {
    await page.goto('/');
    
    // Keyboard
    await page.keyboard.press('Tab');
    await page.keyboard.type('Hello World');
    await page.keyboard.press('Enter');
    
    // Mouse
    await page.mouse.move(100, 100);
    await page.mouse.click(100, 100);
    await page.mouse.dblclick(200, 200);
    await page.mouse.wheel(0, 100); // Scroll
  });

  test('API: Selectors and Locators', async ({ page }) => {
    await page.goto('/');
    
    // Different selector types
    await page.locator('button').click(); // CSS selector
    await page.locator('text=Click me').click(); // Text selector
    await page.locator('[data-testid="submit"]').click(); // Attribute selector
    await page.locator('button:has-text("Save")').click(); // CSS + text
    
    // Chained locators
    const row = page.locator('table tbody tr').first();
    const editButton = row.locator('button:has-text("Edit")');
    await editButton.click();
    
    // Filter locators
    const visibleButtons = page.locator('button').filter({ hasText: 'Save' });
    const count = await visibleButtons.count();
    expect(count).toBeGreaterThan(0);
  });

  test('API: Assertions and Expectations', async ({ page }) => {
    await page.goto('/');
    
    // Various assertions
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('h1')).toContainText('Dashboard');
    await expect(page.locator('input')).toBeEnabled();
    await expect(page.locator('button')).toBeDisabled();
    await expect(page.locator('.error')).toHaveCount(0);
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page).toHaveTitle(/Dashboard/);
    
    // Soft assertions (don't stop test on failure)
    await expect.soft(page.locator('.optional')).toBeVisible();
  });

  test('API: Timeouts and Retries', async ({ page }) => {
    // Set timeout for specific action
    await page.goto('/', { timeout: 60000 });
    
    // Wait with timeout
    await page.waitForSelector('.dashboard', { timeout: 10000 });
    
    // Retry logic
    let retries = 3;
    while (retries > 0) {
      try {
        await page.click('button:has-text("Load")');
        break;
      } catch (error) {
        retries--;
        if (retries === 0) throw error;
        await page.waitForTimeout(1000);
      }
    }
  });

  test('API: Tracing and Debugging', async ({ page, context }) => {
    // Start tracing
    await context.tracing.start({ screenshots: true, snapshots: true });
    
    await page.goto('/');
    await page.click('button');
    
    // Stop tracing
    await context.tracing.stop({ path: 'trace.zip' });
    
    // View trace: npx playwright show-trace trace.zip
  });
});

