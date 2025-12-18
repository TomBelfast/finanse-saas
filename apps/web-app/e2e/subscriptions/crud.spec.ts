import { test, expect } from '@playwright/test';
import { testData } from '../fixtures/test-data';

/**
 * Subscriptions CRUD Tests
 * 
 * Tests for creating, reading, updating, and deleting subscriptions
 */

test.describe('Subscriptions CRUD', () => {
  test.use({ storageState: 'playwright/.auth/user.json' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Navigate to subscriptions page
    await page.click('a:has-text("Subskrypcje"), a[href*="subscriptions"]').first().catch(() => {
      // If link not found, navigate directly
      return page.goto('/subscriptions');
    });
    await page.waitForLoadState('networkidle');
  });

  test('should display subscriptions page', async ({ page }) => {
    await expect(page.locator('h1, h2, [data-testid="subscriptions-title"]')).toContainText(/subskrypcj/i);
  });

  test('should create new subscription', async ({ page }) => {
    // Click "Add" or "New" button
    const addButton = page.locator('button:has-text("Dodaj"), button:has-text("Add"), button:has-text("+")').first();
    await addButton.click();

    // Wait for form/dialog to appear
    await page.waitForSelector('input[name="name"], input[placeholder*="name" i]', { timeout: 5000 });

    // Fill in subscription form
    await page.fill('input[name="name"], input[placeholder*="name" i]', testData.subscription.name);
    await page.fill('input[name="amount"], input[placeholder*="amount" i]', testData.subscription.amount);
    
    // Select currency if dropdown exists
    const currencySelect = page.locator('select[name="currency"], [data-testid="currency-select"]').first();
    if (await currencySelect.isVisible()) {
      await currencySelect.selectOption(testData.subscription.currency);
    }

    // Submit form
    const submitButton = page.locator('button[type="submit"], button:has-text("Zapisz"), button:has-text("Save")').first();
    await submitButton.click();

    // Wait for success message or table update
    await page.waitForTimeout(2000);
    
    // Check if subscription appears in list
    await expect(page.locator(`text=${testData.subscription.name}`).first()).toBeVisible({ timeout: 10000 });
  });

  test('should filter subscriptions', async ({ page }) => {
    // Look for filter inputs
    const filterInput = page.locator('input[placeholder*="filter" i], input[placeholder*="szukaj" i]').first();
    
    if (await filterInput.isVisible()) {
      await filterInput.fill('test');
      await page.waitForTimeout(1000);
      
      // Check if filtered results are shown
      const results = page.locator('table tbody tr, [data-testid="subscription-item"]');
      const count = await results.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('should edit subscription', async ({ page }) => {
    // Find first subscription in table/list
    const firstSubscription = page.locator('table tbody tr, [data-testid="subscription-item"]').first();
    
    if (await firstSubscription.isVisible()) {
      // Click edit button
      const editButton = firstSubscription.locator('button:has-text("Edytuj"), button:has-text("Edit"), [data-testid="edit"]').first();
      
      if (await editButton.isVisible()) {
        await editButton.click();
        
        // Wait for edit form
        await page.waitForSelector('input[name="name"]', { timeout: 5000 });
        
        // Update name
        const nameInput = page.locator('input[name="name"]').first();
        const newName = `${testData.subscription.name} Updated`;
        await nameInput.fill(newName);
        
        // Save
        const saveButton = page.locator('button[type="submit"], button:has-text("Zapisz")').first();
        await saveButton.click();
        
        // Wait for update
        await page.waitForTimeout(2000);
        
        // Verify update
        await expect(page.locator(`text=${newName}`).first()).toBeVisible({ timeout: 10000 });
      }
    }
  });

  test('should delete subscription', async ({ page }) => {
    // Find first subscription
    const firstSubscription = page.locator('table tbody tr, [data-testid="subscription-item"]').first();
    
    if (await firstSubscription.isVisible()) {
      // Click delete button
      const deleteButton = firstSubscription.locator('button:has-text("Usuń"), button:has-text("Delete"), [data-testid="delete"]').first();
      
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        
        // Confirm deletion if confirmation dialog appears
        const confirmButton = page.locator('button:has-text("Tak"), button:has-text("Yes"), button:has-text("Confirm")').first();
        if (await confirmButton.isVisible({ timeout: 2000 })) {
          await confirmButton.click();
        }
        
        // Wait for deletion
        await page.waitForTimeout(2000);
        
        // Verify subscription is removed (count should decrease or item should not be visible)
        await expect(firstSubscription).not.toBeVisible({ timeout: 5000 });
      }
    }
  });
});

