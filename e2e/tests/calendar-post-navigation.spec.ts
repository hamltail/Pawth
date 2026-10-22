import { expect, test, type Locator, type Page } from '@playwright/test';
import { AuthPage } from '../pages/auth-page.js';

type PostEntry = { date: string; content: string };

async function prepareAdjacentPosts(
  page: Page,
): Promise<{ current: PostEntry; previous: PostEntry }> {
  const calendar = page.locator('#calendar').last();
  const previousButton = page.getByRole('button', { name: '前の日記' });
  const nextButton = page.getByRole('button', { name: '次の日記' });
  const date = page.locator('#daily-post-date');
  const content = page.locator('#daily-post-content');

  // 月移動そのものは calendar-navigation.spec.ts で検証する。
  // このテストでは、月初でも十分な日記がある前月を直接開く。
  // Turbo Frame の更新方式や独自イベントには依存しない。
  const previousMonthUrl = await calendar
    .getByRole('link', { name: '前の月へ' })
    .getAttribute('href');

  if (!previousMonthUrl) {
    throw new Error('前月のURLを取得できませんでした。');
  }

  await page.goto(previousMonthUrl);

  // 最新の日記は前月のカレンダー内にないため、
  // post-navigator が初期化されると両ボタンが無効になる。
  await expect(
    previousButton,
    '日記ナビゲーションが初期化されていません。Trace の Console / Network を確認してください。',
  ).toBeDisabled({ timeout: 10_000 });
  await expect(nextButton).toBeDisabled();

  const posts = await calendar
    .locator('.calendar-mark.calendar-mark--posted')
    .evaluateAll((elements) =>
      elements
        .map((element) => ({
          date: element.getAttribute('data-date') ?? '',
          content: element.getAttribute('data-content') ?? '',
        }))
        .filter((post) => post.date && post.content)
        .sort((a, b) => a.date.localeCompare(b.date)),
    );

  expect(posts.length).toBeGreaterThanOrEqual(3);

  const current = posts[posts.length - 2];
  const previous = posts[posts.length - 3];

  // カレンダーからの日記選択を実際に操作して確認する。
  await calendar
    .locator(`.calendar-mark--posted[data-date="${current.date}"]`)
    .click();

  await expect(date).toHaveText(current.date);
  await expect(content).toHaveText(current.content);
  await expect(previousButton).toBeEnabled();
  await expect(nextButton).toBeEnabled();

  return { current, previous };
}

async function swipe(
  target: Locator,
  direction: 'left' | 'right',
): Promise<void> {
  const startX = direction === 'left' ? 200 : 100;
  const endX = direction === 'left' ? 100 : 200;

  await target.dispatchEvent('pointerdown', {
    isPrimary: true,
    clientX: startX,
    clientY: 100,
  });

  await target.dispatchEvent('pointerup', {
    isPrimary: true,
    clientX: endX,
    clientY: 100,
  });
}

test.describe('calendar post navigation', () => {
  test.beforeEach(async ({ page }) => {
    const authPage = new AuthPage(page);

    await authPage.goto();
    await authPage.loginAsPlaywright();
  });

  test('矢印ボタンで前後の日記へ移動できる', async ({ page }) => {
    const { current, previous } = await prepareAdjacentPosts(page);
    const date = page.locator('#daily-post-date');
    const content = page.locator('#daily-post-content');

    await page.getByRole('button', { name: '前の日記' }).click();

    await expect(date).toHaveText(previous.date);
    await expect(content).toHaveText(previous.content);

    await page.getByRole('button', { name: '次の日記' }).click();

    await expect(date).toHaveText(current.date);
    await expect(content).toHaveText(current.content);
  });

  test('スワイプで前後の日記へ移動できる', async ({ page }) => {
    const { current, previous } = await prepareAdjacentPosts(page);
    const navigator = page.locator('[data-controller="post-navigator"]');
    const date = page.locator('#daily-post-date');
    const content = page.locator('#daily-post-content');

    await swipe(navigator, 'right');

    await expect(date).toHaveText(previous.date);
    await expect(content).toHaveText(previous.content);

    await swipe(navigator, 'left');

    await expect(date).toHaveText(current.date);
    await expect(content).toHaveText(current.content);
  });
});
