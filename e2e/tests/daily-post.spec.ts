import { expect, test } from '@playwright/test';
import { AuthPage } from '../pages/auth-page.js';

test.describe('daily post', () => {
  test('ログイン後に今日の日記を投稿できる', async ({ page }) => {
    const authPage = new AuthPage(page);

    await authPage.goto();
    await authPage.loginAsPlaywright();

    await page.getByRole('link', { name: '今日の日記をかく' }).click();

    const modal = page.locator('turbo-frame#modal');

    await expect(
      modal.getByRole('heading', { name: '今日の1歩は？' }),
    ).toBeVisible();

    const content = 'Playwrightから今日の日記を投稿しました。';

    await modal.getByPlaceholder('今日の一歩をかこう！').fill(content);

    await modal.getByRole('button', { name: '日記をかく' }).click();

    await expect(page.locator('#daily-post-content')).toHaveText(content);
    await expect(modal).toBeEmpty();
  });
});
