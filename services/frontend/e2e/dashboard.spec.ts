import { test, expect } from '@playwright/test';

test.describe('Dashboard E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the application and display dashboard', async ({ page }) => {
    await expect(page).toHaveTitle(/Nemo Instrument Control/i);
    await expect(page.getByText('Nemo Instrument Control')).toBeVisible();
  });

  test('should display connection status', async ({ page }) => {
    // Should show disconnected initially (no backend running in test)
    await expect(page.getByText(/disconnected/i)).toBeVisible();
  });

  test('should display instrument state', async ({ page }) => {
    // Should show IDLE state initially
    await expect(page.getByText('IDLE')).toBeVisible();
  });

  test('should display last updated timestamp', async ({ page }) => {
    await expect(page.getByText('Last Updated')).toBeVisible();
  });

  test('should have proper layout structure', async ({ page }) => {
    // Check for main content area
    const main = page.locator('main');
    await expect(main).toBeVisible();
    
    // Check for header
    const header = page.locator('header');
    await expect(header).toBeVisible();
  });

  test('should be responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByText('Nemo Instrument Control')).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.getByText('Nemo Instrument Control')).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.getByText('Nemo Instrument Control')).toBeVisible();
  });
});
