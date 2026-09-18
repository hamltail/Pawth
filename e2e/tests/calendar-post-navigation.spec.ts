import { expect, test } from '@playwright/test';
import { AuthPage } from '../pages/auth-page.js';

function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

test.describe('calendar post navigation', () => {
  test.beforeEach(async ({ page }) => {
    const authPage = new AuthPage(page);

    await authPage.goto();
    await authPage.loginAsPlaywright();
  });

  test('矢印ボタンで前後の日記へ移動できる', async ({ page }) => {
    const date = page.locator('#daily-post-date');
    const content = page.locator('#daily-post-content');

    await expect(date).toHaveText(daysAgo(3));
    await expect(content).toHaveText('Playwright E2E 過去の日記 3');

    await page.getByRole('button', { name: '前の日記' }).click();

    await expect(date).toHaveText(daysAgo(6));
    await expect(content).toHaveText('Playwright E2E 過去の日記 6');

    await page.getByRole('button', { name: '次の日記' }).click();

    await expect(date).toHaveText(daysAgo(3));
    await expect(content).toHaveText('Playwright E2E 過去の日記 3');
  });
});
