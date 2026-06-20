import { test, expect } from '@playwright/test';

test.describe('Auth Flow', () => {
  test('auth page shows login form by default', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /log in/i })).toBeVisible();
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
    await expect(page.getByPlaceholder(/password/i)).toBeVisible();
  });

  test('can switch between login and signup', async ({ page }) => {
    await page.goto('/');
    await page.getByText(/sign up/i).click();
    await expect(page.getByRole('heading', { name: /sign up/i })).toBeVisible();
    await page.getByText(/log in/i).click();
    await expect(page.getByRole('heading', { name: /log in/i })).toBeVisible();
  });

  test('login with demo credentials and see dashboard', async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder(/email/i).fill('demo@fit.com');
    await page.getByPlaceholder(/password/i).fill('demo123');
    await page.getByRole('button', { name: /log in/i }).click();
    await expect(page.getByText(/FitTrack Pro/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/dashboard/i)).toBeVisible({ timeout: 10000 });
  });
});
