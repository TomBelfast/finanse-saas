import { test, expect } from '@playwright/test';

/**
 * Dashboard Tests
 * 
 * Tests for main dashboard functionality
 */

test.describe('Dashboard', () => {
  test.use({ storageState: 'playwright/.auth/user.json' });

  test('should load dashboard', async ({ page }) => {
    await page.goto('/');
    
    // Should not redirect to login
    await expect(page).not.toHaveURL(/\/auth\/login/);
    
    // Check for dashboard content
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display navigation sidebar', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for sidebar
    const sidebar = page.locator('[data-testid="sidebar"], nav, aside').first();
    await expect(sidebar).toBeVisible();
  });

  test('should navigate to different pages', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Try to navigate to subscriptions
    const subscriptionsLink = page.locator('a:has-text("Subskrypcje"), a[href*="subscriptions"]').first();
    
    if (await subscriptionsLink.isVisible()) {
      await subscriptionsLink.click();
      await page.waitForURL(/\/subscriptions/, { timeout: 10000 });
      await expect(page).toHaveURL(/\/subscriptions/);
    }
  });

  test('should display user profile', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Look for user avatar or profile button
    const userButton = page.locator('[data-clerk-element="userButton"], [data-testid="user-menu"], .avatar').first();
    
    if (await userButton.isVisible()) {
      await userButton.click();
      await page.waitForTimeout(500);
      
      // Check for profile menu
      const profileMenu = page.locator('[role="menu"], [data-testid="profile-menu"]');
      await expect(profileMenu).toBeVisible({ timeout: 2000 });
    }
  });
});

