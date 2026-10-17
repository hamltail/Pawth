import { expect, test } from '@playwright/test';
import { AuthPage } from '../pages/auth-page.js';

const privateProfilePath = '/playwright-private';
const todayContent = 'E2E_PRIVATE_TODAY_CONTENT';
const previousContent = 'E2E_PRIVATE_PREVIOUS_CONTENT';

test.describe('private post access control', () => {
  test('未ログインでは非公開日記の内容がHTMLに含まれない', async ({ page }) => {
    const response = await page.goto(privateProfilePath);

    expect(response?.ok()).toBe(true);
    expect(await response!.text()).not.toContain(todayContent);

    await expect(page.getByText('日記は非公開です。')).toBeVisible();

    await expect(page.locator('#calendar [data-content]')).toHaveCount(0);

    await expect(page.locator('#calendar .calendar-mark--posted')).toHaveCount(
      0,
    );
  });

  test('未ログインで前月へ移動しても非公開日記が漏れない', async ({ page }) => {
    await page.goto(privateProfilePath);

    const heading = page.locator('#calendar h2');
    const initialMonth = await heading.innerText();

    await page.getByRole('link', { name: '前の月へ' }).click();

    await expect(heading).not.toHaveText(initialMonth);

    await expect(page.locator('body')).not.toContainText(previousContent);

    await expect(page.locator('#calendar [data-content]')).toHaveCount(0);

    await expect(page.locator('#calendar .calendar-mark--posted')).toHaveCount(
      0,
    );
  });

  test('別ユーザーがログインしていても非公開日記は見えない', async ({
    page,
  }) => {
    const authPage = new AuthPage(page);

    await authPage.goto();
    await authPage.loginAs('playwright-profile@example.com');

    const response = await page.goto(privateProfilePath);

    expect(response?.ok()).toBe(true);
    expect(await response!.text()).not.toContain(todayContent);

    await expect(page.getByText('日記は非公開です。')).toBeVisible();

    await expect(page.locator('#calendar [data-content]')).toHaveCount(0);

    await expect(page.locator('#calendar .calendar-mark--posted')).toHaveCount(
      0,
    );
  });

  test('本人は非公開日記を従来どおり閲覧できる', async ({ page }) => {
    const authPage = new AuthPage(page);

    await authPage.goto();
    await authPage.loginAs('playwright-private@example.com');

    await expect(page.locator('#daily-post-content')).toHaveText(todayContent);

    await expect(page.locator('#calendar .calendar-mark--posted')).toHaveCount(
      1,
    );

    await expect(page.locator('#calendar [data-content]')).toHaveAttribute(
      'data-content',
      todayContent,
    );
  });
});
