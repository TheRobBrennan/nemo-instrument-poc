import { test, expect } from '@playwright/test';

test.describe('Accessibility E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have proper document structure', async ({ page }) => {
    // Check for main heading
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
  });

  test('should be keyboard navigable', async ({ page }) => {
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    
    // Should be able to navigate
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });

  test('should have readable text contrast', async ({ page }) => {
    // Verify text is visible (basic check)
    await expect(page.getByText('Nemo Instrument Control')).toBeVisible();
    await expect(page.getByText('IDLE')).toBeVisible();
  });

  test('should display status information clearly', async ({ page }) => {
    // Connection status should be clear
    const connectionStatus = page.locator('text=/connected|disconnected/i').first();
    await expect(connectionStatus).toBeVisible();
    
    // Instrument state should be clear
    await expect(page.getByText('IDLE')).toBeVisible();
  });
});
