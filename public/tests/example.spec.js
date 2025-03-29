import { test, expect } from '@playwright/test';

test('page loads and shows app title', async ({ page }) => {
  await page.goto('http://localhost:8080');
  await expect(page.locator('h1')).toContainText('VTT');
});
