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

  test('キーワードで日記を検索できる', async ({ page }) => {
    await page.getByRole('button', { name: '記録を検索' }).click();

    await page
      .getByRole('textbox', { name: 'キーワード検索' })
      .fill('過去の日記 90');

    await page.getByRole('button', { name: '検索', exact: true }).click();

    const posts = page.locator('#posts');

    await expect(
      posts.getByText('Playwright E2E 過去の日記 90', { exact: true }),
    ).toBeVisible();

    await expect(
      posts.getByText('Playwright E2E 過去の日記 87', { exact: true }),
    ).toHaveCount(0);

    await expect(
      posts.getByText('Playwright E2E 過去の日記 93', { exact: true }),
    ).toHaveCount(0);
  });

  test('過去までスクロールして削除しても表示位置を維持できる', async ({
    page,
  }) => {
    const posts = page.locator('#posts');
    const targetContent = 'Playwright E2E 過去の日記 90';
    const nearbyContent = 'Playwright E2E 過去の日記 93';

    const targetPost = posts
      .locator('li[id^="post_"]')
      .filter({ hasText: targetContent });

    const nearbyPost = posts
      .locator('li[id^="post_"]')
      .filter({ hasText: nearbyContent });

    while (
      (await targetPost.count()) === 0 ||
      (await nearbyPost.count()) === 0
    ) {
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });

      await page.waitForTimeout(300);
    }

    await targetPost.scrollIntoViewIfNeeded();

    await expect(targetPost).toBeVisible();
    await expect(nearbyPost).toBeVisible();

    await targetPost.getByRole('link', { name: '削除' }).click();

    const dialog = page.getByRole('dialog');

    await expect(dialog).toBeVisible();

    await dialog.getByRole('textbox').fill('削除する');
    await dialog.getByRole('button', { name: '実行する' }).click();

    await expect(posts.getByText(targetContent, { exact: true })).toHaveCount(
      0,
    );

    await expect(nearbyPost).toBeVisible();

    await expect
      .poll(() =>
        nearbyPost.evaluate((element) => {
          const rect = element.getBoundingClientRect();

          return rect.bottom > 0 && rect.top < window.innerHeight;
        }),
      )
      .toBe(true);
  });

  test('キーワード検索中に削除しても検索条件を維持できる', async ({ page }) => {
    const keyword = '過去の日記 120';
    const posts = page.locator('#posts');

    await page.getByRole('button', { name: '記録を検索' }).click();

    const keywordInput = page.getByRole('textbox', {
      name: 'キーワード検索',
    });

    await keywordInput.fill(keyword);

    await page.getByRole('button', { name: '検索', exact: true }).click();

    await expect(
      posts.getByText(`Playwright E2E ${keyword}`, { exact: true }),
    ).toBeVisible();

    const targetPost = posts
      .locator('li[id^="post_"]')
      .filter({ hasText: `Playwright E2E ${keyword}` });

    await targetPost.getByRole('link', { name: '削除' }).click();

    const dialog = page.getByRole('dialog');

    await expect(dialog).toBeVisible();

    await dialog.getByRole('textbox').fill('削除する');
    await dialog.getByRole('button', { name: '実行する' }).click();

    await expect(
      posts.getByText(`Playwright E2E ${keyword}`, { exact: true }),
    ).toHaveCount(0);

    await expect
      .poll(() => new URL(page.url()).searchParams.get('q'))
      .toBe(keyword);

    await page.getByRole('button', { name: '記録を検索' }).click();

    await expect(
      page.getByRole('textbox', { name: 'キーワード検索' }),
    ).toHaveValue(keyword);
  });
});
