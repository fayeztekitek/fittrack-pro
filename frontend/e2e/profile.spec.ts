import { test, expect } from '@playwright/test';

test.describe('Profile Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder(/email/i).fill('demo@fit.com');
    await page.getByPlaceholder(/password/i).fill('demo123');
    await page.getByRole('button', { name: /log in/i }).click();
    await expect(page.getByText(/FitTrack Pro/i)).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: /^profile$/i }).click();
  });

  test('shows profile page heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /^profile$/i })).toBeVisible();
  });

  test('shows achievements section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /achievements/i })).toBeVisible();
    await expect(page.getByText(/first run/i)).toBeVisible();
  });

  test('shows body data section with sliders', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /body data/i })).toBeVisible();
    await expect(page.getByText(/^weight$/i)).toBeVisible();
    await expect(page.getByText(/^height$/i)).toBeVisible();
    await expect(page.getByText(/^age$/i)).toBeVisible();
    const sliders = page.locator('input[type="range"]');
    await expect(sliders.first()).toBeVisible();
  });

  test('shows gender toggle', async ({ page }) => {
    await expect(page.getByRole('button', { name: /^male$/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /^female$/i })).toBeVisible();
  });

  test('shows daily step goal section', async ({ page }) => {
    await expect(page.getByText(/daily step goal/i)).toBeVisible();
  });

  test('shows save profile button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /save profile/i })).toBeVisible();
  });

  test('shows BMI card', async ({ page }) => {
    await expect(page.getByText(/body mass index/i)).toBeVisible();
  });
});
