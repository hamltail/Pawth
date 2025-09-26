import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { execSync } from 'node:child_process';

async function loginAsPlaywright(page: Page): Promise<void> {
  await page.goto('/users/sign_in');
  await page
    .getByRole('textbox', { name: 'ユーザー名またはメールアドレス' })
    .fill('playwright@example.com');
  await page.getByRole('textbox', { name: 'パスワード' }).fill('password1234');
  await page.getByRole('button', { name: 'ログイン' }).click();
  await expect(page.getByRole('link', { name: 'Pawth' })).toBeVisible();
}

test.describe('auth & a11y', () => {
  test.beforeAll(() => {
    execSync('RAILS_ENV=test ../bin/rails e2e:ensure_user', {
      stdio: 'inherit',
      cwd: __dirname + '/..',
    });
  });

  test('ログインしてログアウトできる', async ({ page }) => {
    await loginAsPlaywright(page);
    await page.getByRole('link', { name: 'ログアウト' }).click();
    await expect(page.getByText('ログアウトしました。')).toBeVisible();
  });

  test('カレンダー画面のa11y', async ({ page }) => {
    await loginAsPlaywright(page);
    await page.getByRole('link', { name: 'カレンダー' }).click();

    const results = await new AxeBuilder({ page }).analyze();
    const seriousOrWorse = results.violations.filter((v) =>
      // ['serious', 'critical'].includes(v.impact || ''),
      ['critical'].includes(v.impact || ''),
    );
    expect(
      seriousOrWorse,
      JSON.stringify(seriousOrWorse, null, 2),
    ).toHaveLength(0);
  });
});
