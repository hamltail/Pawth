import { expect, test } from '@playwright/test';
import { AuthPage } from '../pages/auth-page.js';

test.describe('main screens', () => {
  test.beforeEach(async ({ page }) => {
    const authPage = new AuthPage(page);

    await authPage.goto();
    await authPage.loginAsPlaywright();
  });

  test('主要画面を表示できる', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: "playwright's Pawth" }),
    ).toBeVisible();

    await page.getByRole('link', { name: 'タイムライン' }).click();

    await expect(
      page.getByRole('heading', { name: 'タイムライン' }),
    ).toBeVisible();

    await page.getByRole('link', { name: 'カレンダー' }).click();

    await expect(
      page.getByRole('heading', { name: "playwright's Pawth" }),
    ).toBeVisible();

    await page.getByRole('button', { name: '設定' }).click();

    await page.getByRole('link', { name: 'プロフィール設定' }).click();

    await expect(
      page.getByRole('heading', { name: 'プロフィール設定' }),
    ).toBeVisible();

    await page.getByRole('link', { name: 'アカウント設定' }).click();

    await expect(
      page.getByRole('heading', { name: 'アカウント設定' }),
    ).toBeVisible();
  });
});
