import { test } from '@playwright/test';
import { AuthPage } from '../pages/auth-page.js';

test.describe('auth', () => {
  test('ログインしてログアウトできる', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.goto();
    const appShell = await authPage.loginAsPlaywright();
    await appShell.logout();
  });
});
