import { expect, test } from '@playwright/test';

test('loads the Mascoteach app', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Mascoteach/i);
});
