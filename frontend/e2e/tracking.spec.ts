import { test, expect } from '@playwright/test';

test.describe('Tracking Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder(/email/i).fill('demo@fit.com');
    await page.getByPlaceholder(/password/i).fill('demo123');
    await page.getByRole('button', { name: /log in/i }).click();
    await expect(page.getByText(/FitTrack Pro/i)).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: /^track$/i }).click();
  });

  test('shows tracking page heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /activity tracking/i })).toBeVisible();
  });

  test('shows start button and activity types', async ({ page }) => {
    await expect(page.getByRole('button', { name: /^start$/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /^running$/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /^walking$/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /^cycling$/i })).toBeVisible();
  });

  test('shows simulation toggle', async ({ page }) => {
    await expect(page.getByRole('button', { name: /use simulation/i })).toBeVisible();
  });

  test('shows GPS status', async ({ page }) => {
    await expect(page.getByText(/gps status/i)).toBeVisible();
  });

  test('shows ready to start message', async ({ page }) => {
    await expect(page.getByText(/ready to start/i)).toBeVisible();
  });
});
