import { test, expect } from '@playwright/test';
import { AuthPage } from '../../pages/auth-page.js';

test.describe('a11y: calendar', () => {
  test('カレンダー画面のa11y', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.goto();
    const appShell = await authPage.loginAsPlaywright();
    const calendarPage = await appShell.gotoCalendar();

    const { violations } = await calendarPage.analyzeCriticalA11y();
    expect(violations, JSON.stringify(violations, null, 2)).toHaveLength(0);

    await appShell.logout();
  });
});
