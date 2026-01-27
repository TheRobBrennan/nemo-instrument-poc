import { test, expect } from '@playwright/test';

test.describe('WebSocket Integration E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should attempt WebSocket connection on load', async ({ page }) => {
    // Listen for WebSocket connection attempts
    const wsMessages: string[] = [];
    
    page.on('console', (msg) => {
      const text = msg.text();
      if (text.includes('WebSocket') || text.includes('connect')) {
        wsMessages.push(text);
      }
    });

    await page.waitForTimeout(2000);
    
    // Should see connection attempt or reconnection messages
    expect(wsMessages.length).toBeGreaterThan(0);
  });

  test('should display disconnected state without backend', async ({ page }) => {
    // Without backend running, should show disconnected
    await expect(page.getByText(/disconnected/i)).toBeVisible();
    
    // Should show IDLE state
    await expect(page.getByText('IDLE')).toBeVisible();
  });

  test('should show reconnection attempts in console', async ({ page }) => {
    const reconnectMessages: string[] = [];
    
    page.on('console', (msg) => {
      const text = msg.text();
      if (text.includes('Reconnecting')) {
        reconnectMessages.push(text);
      }
    });

    // Wait for reconnection attempts
    await page.waitForTimeout(3000);
    
    // Should see at least one reconnection attempt
    expect(reconnectMessages.length).toBeGreaterThan(0);
  });
});
