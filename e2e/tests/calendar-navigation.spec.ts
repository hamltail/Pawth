import { expect, test } from '@playwright/test';
import { AuthPage } from '../pages/auth-page.js';

test.describe('calendar navigation', () => {
  test.beforeEach(async ({ page }) => {
    const authPage = new AuthPage(page);

    await authPage.goto();
    await authPage.loginAsPlaywright();
  });

  test('矢印ボタンで前後の月へ移動できる', async ({ page }) => {
    const calendar = page.locator('#calendar').last();

    const initialMonth = await calendar.getByRole('heading').textContent();

    await calendar.getByRole('link', { name: '前の月へ' }).click();

    await expect(calendar.getByRole('heading')).not.toHaveText(
      initialMonth ?? '',
    );

    await calendar.getByRole('link', { name: '次の月へ' }).click();

    await expect(calendar.getByRole('heading')).toHaveText(initialMonth ?? '');

    await calendar.getByRole('link', { name: '次の月へ' }).click();

    await expect(calendar.getByRole('heading')).not.toHaveText(
      initialMonth ?? '',
    );
  });
});
