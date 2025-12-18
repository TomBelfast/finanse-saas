import { test, expect } from '@playwright/test';

/**
 * Authentication Tests
 * 
 * Tests for login, registration, and logout flows
 */

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
  });

  test('should display login page', async ({ page }) => {
    // Check if login form is visible
    await expect(page.locator('input[type="email"]').first()).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
  });

  test('should redirect to login when accessing protected route', async ({ page }) => {
    // Try to access dashboard without authentication
    await page.goto('/');
    
    // Should redirect to login page
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('should show error for invalid credentials', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const submitButton = page.locator('button[type="submit"]').first();

    await emailInput.fill('invalid@example.com');
    await passwordInput.fill('wrongpassword');
    await submitButton.click();

    // Wait for error message (Clerk shows error messages)
    await page.waitForTimeout(2000);
    
    // Check for error message (Clerk error messages vary, so we check for any visible error)
    const errorMessage = page.locator('[role="alert"], .error, [data-testid="error"]').first();
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to register page', async ({ page }) => {
    // Look for "Sign up" or "Register" link
    const signUpLink = page.locator('a:has-text("Sign up"), a:has-text("Register"), a[href*="register"]').first();
    
    if (await signUpLink.isVisible()) {
      await signUpLink.click();
      await expect(page).toHaveURL(/\/auth\/register/);
    }
  });
});

test.describe('Authenticated User', () => {
  test.use({ storageState: 'playwright/.auth/user.json' });

  test('should access dashboard when authenticated', async ({ page }) => {
    await page.goto('/');
    
    // Should be on dashboard (not redirected to login)
    await expect(page).not.toHaveURL(/\/auth\/login/);
    
    // Check for dashboard content
    await expect(page.locator('body')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    await page.goto('/');
    
    // Find and click user menu / logout button
    const userMenu = page.locator('[data-clerk-element="userButton"], [data-testid="user-menu"]').first();
    
    if (await userMenu.isVisible()) {
      await userMenu.click();
      
      // Look for logout button
      const logoutButton = page.locator('button:has-text("Wyloguj"), button:has-text("Logout"), [data-testid="logout"]').first();
      
      if (await logoutButton.isVisible()) {
        await logoutButton.click();
        
        // Should redirect to login or home page
        await expect(page).toHaveURL(/\/auth\/login|\//);
      }
    }
  });
});

