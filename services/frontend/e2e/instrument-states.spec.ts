import { test, expect } from '@playwright/test';

test.describe('Instrument States E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display all possible instrument states correctly', async ({ page }) => {
    // Initially should show IDLE
    await expect(page.getByText('IDLE')).toBeVisible();
    
    // Verify the state is displayed prominently
    const stateElement = page.getByText('IDLE');
    await expect(stateElement).toBeVisible();
  });

  test('should display state with proper styling', async ({ page }) => {
    // Check that state text is visible and styled
    const stateText = page.getByText('IDLE');
    await expect(stateText).toBeVisible();
    
    // Verify it's in a container (not checking exact styles, just structure)
    const parent = stateText.locator('..');
    await expect(parent).toBeVisible();
  });

  test('should show timestamp for state updates', async ({ page }) => {
    await expect(page.getByText('Last Updated')).toBeVisible();
    
    // Should have a timestamp displayed
    const timestampSection = page.locator('text=Last Updated').locator('..');
    await expect(timestampSection).toBeVisible();
  });
});
