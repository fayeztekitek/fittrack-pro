import { test, expect } from '@playwright/test';

test.describe('i18n Language Switching', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder(/email/i).fill('demo@fit.com');
    await page.getByPlaceholder(/password/i).fill('demo123');
    await page.getByRole('button', { name: /log in/i }).click();
    await expect(page.getByText(/FitTrack Pro/i)).toBeVisible({ timeout: 10000 });
  });

  test('dashboard shows English by default', async ({ page }) => {
    await expect(page.getByText(/dashboard/i)).toBeVisible();
  });

  test('can switch to French', async ({ page }) => {
    const langButton = page.getByRole('button', { name: /switch language/i });
    await langButton.click();
    await expect(page.getByText(/tableau de bord/i)).toBeVisible({ timeout: 5000 });
  });

  test('toggles between English and French', async ({ page }) => {
    const langButton = page.getByRole('button', { name: /switch language/i });
    await langButton.click();
    await expect(page.getByText(/tableau de bord/i)).toBeVisible();

    await langButton.click();
    await expect(page.getByText(/dashboard/i)).toBeVisible();
  });
});
