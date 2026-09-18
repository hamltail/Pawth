import { expect, test } from '@playwright/test';
import { AuthPage } from '../pages/auth-page.js';

test.describe('timeline', () => {
  test.beforeEach(async ({ page }) => {
    const authPage = new AuthPage(page);

    await authPage.goto();
    await authPage.loginAsPlaywright();

    await page.getByRole('link', { name: 'タイムライン' }).click();

    await expect(
      page.getByRole('heading', { name: 'タイムライン' }),
    ).toBeVisible();
  });

  test('スクロールすると過去の日記を追加で読み込める', async ({ page }) => {
    const posts = page.locator('#posts');

    await expect(
      posts.getByText('Playwright E2E 過去の日記 3', { exact: true }),
    ).toBeVisible();

    await expect(
      posts.getByText('Playwright E2E 過去の日記 180', { exact: true }),
    ).toHaveCount(0);

    while (
      (await posts
        .getByText('Playwright E2E 過去の日記 180', {
          exact: true,
        })
        .count()) === 0
    ) {
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });

      await page.waitForTimeout(300);
    }

    await expect(
      posts.getByText('Playwright E2E 過去の日記 180', { exact: true }),
    ).toBeVisible();

    await expect(page.locator('#infinite-scroll-sentinel')).toHaveCount(0);
  });
});
