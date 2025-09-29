import { test, expect } from '@playwright/test';
import { loginAsPlaywright } from '../helpers/auth.js';

test.describe('auth', () => {
  test('ログインしてログアウトできる', async ({ page }) => {
    await loginAsPlaywright(page);
    await page.getByRole('link', { name: 'ログアウト' }).click();
    await expect(page.getByText('ログアウトしました。')).toBeVisible();
  });
});
