import { expect, type Page } from '@playwright/test';
import { AppShell } from './app-shell.js';

export class AuthPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/users/sign_in');
  }

  async loginAsPlaywright(): Promise<AppShell> {
    await this.page
      .getByRole('textbox', { name: 'ユーザー名またはメールアドレス' })
      .fill('playwright@example.com');
    await this.page.getByRole('textbox', { name: 'パスワード' }).fill('password1234');
    await this.page.getByRole('button', { name: 'ログイン' }).click();
    await expect(this.page.getByRole('link', { name: 'Pawth' })).toBeVisible();
    return new AppShell(this.page);
  }
}
