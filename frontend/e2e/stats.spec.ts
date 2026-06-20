import { test, expect } from '@playwright/test';

test.describe('Stats Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder(/email/i).fill('demo@fit.com');
    await page.getByPlaceholder(/password/i).fill('demo123');
    await page.getByRole('button', { name: /log in/i }).click();
    await expect(page.getByText(/FitTrack Pro/i)).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: /^stats$/i }).click();
  });

  test('shows stats page heading and subtitle', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /statistics/i })).toBeVisible();
    await expect(page.getByText(/activity analytics/i)).toBeVisible();
  });

  test('shows period toggle buttons', async ({ page }) => {
    await expect(page.getByRole('button', { name: /^week$/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /^month$/i })).toBeVisible();
  });

  test('shows chart section headings', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /steps trend/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /calories burned/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /activity breakdown/i })).toBeVisible();
  });

  test('can switch between week and month periods', async ({ page }) => {
    await page.getByRole('button', { name: /^month$/i }).click();
    await expect(page.getByRole('button', { name: /^month$/i })).toBeVisible();
  });
});
