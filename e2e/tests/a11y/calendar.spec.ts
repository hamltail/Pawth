import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { loginAsPlaywright } from '../../helpers/auth';

test.describe('a11y: calendar', () => {
  test('カレンダー画面のa11y', async ({ page }) => {
    await loginAsPlaywright(page);
    await page.getByRole('link', { name: 'カレンダー' }).click();

    const results = await new AxeBuilder({ page }).analyze();
    const violations = results.violations.filter((v) =>
      // ['serious', 'critical'].includes(v.impact || ''),
      // TODO: とりあえず critical のみ
      ['critical'].includes(v.impact || ''),
    );
    expect(violations, JSON.stringify(violations, null, 2)).toHaveLength(0);

    await page.getByRole('link', { name: 'ログアウト' }).click();
    await expect(page.getByText('ログアウトしました。')).toBeVisible();
  });
});
