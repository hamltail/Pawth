import { expect, type Page } from '@playwright/test';
import { AppShell } from './app-shell.js';

export class AuthPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/users/sign_in');
  }

  async loginAs(email: string): Promise<AppShell> {
    await this.page
      .getByRole('textbox', { name: 'ユーザー名またはメールアドレス' })
      .fill(email);
    await this.page
      .getByRole('textbox', { name: 'パスワード' })
      .fill('password1234');
    await this.page.getByRole('button', { name: 'ログイン' }).click();

    // 未ログイン画面にも「Pawth」リンクがあるため、
    // ログイン済みの場合だけ出現するサイドバーで判定する。
    await expect(this.page.locator('#sidebar')).toBeAttached();

    return new AppShell(this.page);
  }

  async loginAsPlaywright(): Promise<AppShell> {
    return this.loginAs('playwright@example.com');
  }
}
