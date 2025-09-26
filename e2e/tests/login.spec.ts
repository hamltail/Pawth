import { test, expect } from '@playwright/test';
import { execSync } from 'node:child_process';

test.beforeAll(() => {
  execSync('RAILS_ENV=test ../bin/rails e2e:ensure_user', {
    stdio: 'inherit',
    cwd: __dirname + '/..',
  });
});
test('ログインしてログアウトできる', async ({ page }) => {
  await page.goto('/users/sign_in');
  await page
    .getByRole('textbox', { name: 'ユーザー名またはメールアドレス' })
    .fill('playwright@example.com');
  await page.getByRole('textbox', { name: 'パスワード' }).fill('password1234');
  await page.getByRole('button', { name: 'ログイン' }).click();
  await expect(page.getByRole('link', { name: 'Pawth' })).toBeVisible();
  await page.getByRole('link', { name: 'ログアウト' }).click();
  await expect(page.getByText('ログアウトしました。')).toBeVisible();
});
