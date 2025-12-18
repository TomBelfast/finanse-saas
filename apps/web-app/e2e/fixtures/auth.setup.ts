import { test as setup, expect } from '@playwright/test';
import * as path from 'path';

/**
 * Authentication Setup for Playwright Tests
 * 
 * This file creates authenticated user state that can be reused across tests.
 * This is more efficient than logging in before each test.
 */

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate', async ({ page }) => {
  // Navigate to login page
  await page.goto('/auth/login');

  // Wait for Clerk SignIn component to load
  await page.waitForSelector('[data-testid="clerk-sign-in"]', { timeout: 10000 }).catch(() => {
    // If Clerk component doesn't have test ID, wait for email input
    return page.waitForSelector('input[type="email"]', { timeout: 10000 });
  });

  // Get test credentials from environment variables
  const testEmail = process.env.PLAYWRIGHT_TEST_EMAIL || 'test@example.com';
  const testPassword = process.env.PLAYWRIGHT_TEST_PASSWORD || 'TestPassword123!';

  // Fill in login form
  const emailInput = page.locator('input[type="email"]').first();
  const passwordInput = page.locator('input[type="password"]').first();
  const submitButton = page.locator('button[type="submit"]').first();

  await emailInput.fill(testEmail);
  await passwordInput.fill(testPassword);
  await submitButton.click();

  // Wait for successful login - check for redirect to dashboard or user menu
  await page.waitForURL(/^\/(?!auth)/, { timeout: 30000 }).catch(async () => {
    // If redirect doesn't happen, check for user menu or dashboard content
    await page.waitForSelector('[data-testid="user-menu"], .dashboard, [data-clerk-element="userButton"]', { timeout: 10000 });
  });

  // Save authenticated state
  await page.context().storageState({ path: authFile });
});

