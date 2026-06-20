import { test, expect } from '@playwright/test';

test.describe('History Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder(/email/i).fill('demo@fit.com');
    await page.getByPlaceholder(/password/i).fill('demo123');
    await page.getByRole('button', { name: /log in/i }).click();
    await expect(page.getByText(/FitTrack Pro/i)).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: /^history$/i }).click();
  });

  test('shows history page heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /history/i })).toBeVisible();
  });

  test('shows total sessions count or empty state', async ({ page }) => {
    const hasSessions = page.getByText(/total sessions/i);
    const emptyState = page.getByText(/no activities recorded yet/i);
    await expect(hasSessions.or(emptyState)).toBeVisible({ timeout: 10000 });
  });

  test('shows activity cards when sessions exist', async ({ page }) => {
    const hasSessions = await page.getByText(/total sessions/i).isVisible();
    if (hasSessions) {
      await expect(page.getByText(/min/).first()).toBeVisible();
      await expect(page.getByText(/dist/i).first()).toBeVisible();
      await expect(page.getByText(/cal/i).first()).toBeVisible();
    }
  });
});
