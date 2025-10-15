import { test, expect } from '@playwright/test';

test.describe('PWA offline basics', () => {
  test('loads home, registers SW, works offline', async ({ page, context }) => {
    await page.goto('/');

    // Wait for service worker registration
    await page.waitForFunction(() => 'serviceWorker' in navigator && navigator.serviceWorker.controller);

    // Ensure key elements present
    await expect(page.locator('#root')).toBeVisible();

    // Go offline
    await context.setOffline(true);
    await page.reload();

    // App shell should still render (SW cached)
    await expect(page.locator('#root')).toBeVisible();

    // Back online for cleanup
    await context.setOffline(false);
  });
});


