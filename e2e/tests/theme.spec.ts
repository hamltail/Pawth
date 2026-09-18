import { expect, test } from '@playwright/test';
import { AuthPage } from '../pages/auth-page.js';

test.describe('theme', () => {
  test.beforeEach(async ({ page }) => {
    const authPage = new AuthPage(page);

    await authPage.goto();
    await authPage.loginAsPlaywright();
  });

  test('テーマを切り替えられる', async ({ page }) => {
    const html = page.locator('html');

    const lightButton = page.getByRole('button', { name: 'ライト' });
    const darkButton = page.getByRole('button', { name: 'ダーク' });
    const systemButton = page.getByRole('button', { name: 'システム' });

    await lightButton.click();

    await expect(html).toHaveAttribute('data-theme', 'light');
    await expect(html).toHaveAttribute('data-theme-preference', 'light');
    await expect(lightButton).toHaveAttribute('aria-pressed', 'true');

    await darkButton.click();

    await expect(html).toHaveAttribute('data-theme', 'dark');
    await expect(html).toHaveAttribute('data-theme-preference', 'dark');
    await expect(darkButton).toHaveAttribute('aria-pressed', 'true');

    await systemButton.click();

    await expect(html).toHaveAttribute('data-theme-preference', 'system');
    await expect(systemButton).toHaveAttribute('aria-pressed', 'true');
  });
});
