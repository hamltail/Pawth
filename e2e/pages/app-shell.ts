import { expect, type Page } from '@playwright/test';
import { CalendarPage } from './calendar-page.js';

export class AppShell {
  constructor(private readonly page: Page) {}

  async gotoCalendar(): Promise<CalendarPage> {
    await this.page.getByRole('link', { name: 'カレンダー' }).click();
    return new CalendarPage(this.page);
  }

  async logout(): Promise<void> {
    await this.page.getByRole('link', { name: 'ログアウト' }).click();
    await expect(this.page.getByText('ログアウトしました。')).toBeVisible();
  }
}
