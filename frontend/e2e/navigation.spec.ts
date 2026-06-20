import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder(/email/i).fill('demo@fit.com');
    await page.getByPlaceholder(/password/i).fill('demo123');
    await page.getByRole('button', { name: /log in/i }).click();
    await expect(page.getByText(/FitTrack Pro/i)).toBeVisible({ timeout: 10000 });
  });

  test('bottom nav tabs navigate between pages', async ({ page }) => {
    await expect(page.getByText(/dashboard/i)).toBeVisible();

    await page.getByRole('button', { name: /^stats$/i }).click();
    await expect(page.getByText(/activity analytics/i)).toBeVisible();

    await page.getByRole('button', { name: /^history$/i }).click();
    await expect(page.getByRole('heading', { name: /history/i })).toBeVisible();

    await page.getByRole('button', { name: /^profile$/i }).click();
    await expect(page.getByRole('heading', { name: /achievements/i })).toBeVisible();
  });

  test('track page shows tracking interface', async ({ page }) => {
    await page.getByRole('button', { name: /^track$/i }).click();
    await expect(page.getByRole('heading', { name: /activity tracking/i })).toBeVisible();
  });
});
