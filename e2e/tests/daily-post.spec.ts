import { expect, test } from '@playwright/test';
import { AuthPage } from '../pages/auth-page.js';

test.describe('daily post', () => {
  test('日記を投稿してタイムラインで編集しログアウトできる', async ({
    page,
  }) => {
    const authPage = new AuthPage(page);

    await authPage.goto();
    const appShell = await authPage.loginAs(
      'playwright-daily-post@example.com',
    );

    const content = 'Playwrightから今日の日記を投稿しました。';

    await page.getByRole('link', { name: '今日の日記をかく' }).click();

    const modal = page.locator('turbo-frame#modal');

    await expect(
      modal.getByRole('heading', { name: '今日の1歩は？' }),
    ).toBeVisible();

    await modal.getByPlaceholder('今日の一歩をかこう！').fill(content);
    await modal.getByRole('button', { name: '日記をかく' }).click();

    await expect(page.locator('#daily-post-content')).toHaveText(content);
    await expect(modal).toBeEmpty();

    await page.getByRole('link', { name: 'タイムライン' }).click();

    await expect(
      page.getByRole('heading', { name: 'タイムライン' }),
    ).toBeVisible();

    await expect(page.getByText(content, { exact: true })).toBeVisible();

    await page.getByRole('link', { name: '編集' }).click();

    await expect(
      modal.getByRole('heading', { name: '今日何をした？' }),
    ).toBeVisible();

    const editedContent = 'Playwrightから今日の日記を編集しました。';

    await modal.getByPlaceholder('今日の一歩をかこう！').fill(editedContent);

    await modal.getByRole('button', { name: '日記をかく' }).click();

    await expect(modal).toBeEmpty();
    await expect(page.getByText(editedContent, { exact: true })).toBeVisible();

    await expect(page.getByText(content, { exact: true })).toHaveCount(0);

    await appShell.logout();
  });
});
