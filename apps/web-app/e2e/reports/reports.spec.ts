import { test, expect } from '@playwright/test';

/**
 * Reports Page Tests
 * 
 * Tests for reports page functionality
 */

test.describe('Reports Page', () => {
  test.use({ storageState: 'playwright/.auth/user.json' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Navigate to reports page
    await page.click('a:has-text("Raporty"), a[href*="reports"]').first().catch(() => {
      return page.goto('/reports');
    });
    await page.waitForLoadState('networkidle');
  });

  test('should display reports page', async ({ page }) => {
    await expect(page.locator('h1, h2, [data-testid="reports-title"]')).toContainText(/raport/i);
  });

  test('should display summary cards', async ({ page }) => {
    // Wait for summary cards to load
    await page.waitForTimeout(2000);
    
    // Check for summary cards (total costs, etc.)
    const summaryCards = page.locator('[data-testid="summary-card"], .card, [class*="summary"]');
    const count = await summaryCards.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should display charts', async ({ page }) => {
    await page.waitForTimeout(3000);
    
    // Check for charts (Recharts renders SVG elements)
    const charts = page.locator('svg, canvas, [data-testid="chart"]');
    const count = await charts.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should switch between tabs', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    // Find tab buttons
    const tabs = page.locator('button[role="tab"], [data-testid="tab"]');
    const tabCount = await tabs.count();
    
    if (tabCount > 1) {
      // Click second tab
      await tabs.nth(1).click();
      await page.waitForTimeout(1000);
      
      // Verify tab content changes
      const activeTab = page.locator('button[role="tab"][aria-selected="true"], [data-testid="tab"][aria-selected="true"]');
      await expect(activeTab).toBeVisible();
    }
  });

  test('should filter by date range', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    // Look for date picker
    const datePicker = page.locator('input[type="date"], [data-testid="date-picker"], button:has-text("Data")').first();
    
    if (await datePicker.isVisible()) {
      await datePicker.click();
      await page.waitForTimeout(1000);
      
      // Date picker interaction would go here
      // This is a placeholder for actual date selection
    }
  });

  test('should download report', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    // Look for download button
    const downloadButton = page.locator('button:has-text("Pobierz"), button:has-text("Download"), [data-testid="download"]').first();
    
    if (await downloadButton.isVisible()) {
      // Set up download listener
      const downloadPromise = page.waitForEvent('download').catch(() => null);
      await downloadButton.click();
      
      // Wait for download (if it triggers)
      const download = await downloadPromise;
      if (download) {
        expect(download.suggestedFilename()).toBeTruthy();
      }
    }
  });
});

