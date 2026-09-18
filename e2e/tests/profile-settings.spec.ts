import { expect, test } from '@playwright/test';
import { AuthPage } from '../pages/auth-page.js';

test.describe('profile settings', () => {
  test.beforeEach(async ({ page }) => {
    const authPage = new AuthPage(page);

    await authPage.goto();
    await authPage.loginAs('playwright-profile@example.com');
  });

  test('表示名を更新できる', async ({ page }) => {
    await page.getByRole('button', { name: '設定' }).click();

    await page.getByRole('link', { name: 'プロフィール設定' }).click();

    await expect(
      page.getByRole('heading', { name: 'プロフィール設定' }),
    ).toBeVisible();

    await page.getByRole('textbox', { name: '表示名' }).fill('Playwright');

    await page.getByRole('button', { name: '更新' }).click();

    await expect(
      page.getByRole('heading', { name: "Playwright's Pawth" }),
    ).toBeVisible();
  });
});
