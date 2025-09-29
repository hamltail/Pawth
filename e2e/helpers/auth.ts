import { type Page, expect } from '@playwright/test';

export async function loginAsPlaywright(page: Page): Promise<void> {
  await page.goto('/users/sign_in');
  await page
    .getByRole('textbox', { name: 'ユーザー名またはメールアドレス' })
    .fill('playwright@example.com');
  await page.getByRole('textbox', { name: 'パスワード' }).fill('password1234');
  await page.getByRole('button', { name: 'ログイン' }).click();
  await expect(page.getByRole('link', { name: 'Pawth' })).toBeVisible();
}
