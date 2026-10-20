import { expect, test } from '@playwright/test';
import { AuthPage } from '../pages/auth-page.js';

test.describe('theme', () => {
  test.beforeEach(async ({ page }) => {
    const authPage = new AuthPage(page);

    await authPage.goto();
    await authPage.loginAsPlaywright();
  });

  test('テーマを切り替えると選択肢が閉じる', async ({ page }) => {
    const html = page.locator('html');
    const trigger = page.getByRole('button', { name: 'テーマを変更' });
    const panel = page.locator('#theme-options');
    const light = page.locator(
      '[data-theme-target="option"][data-theme="light"]',
    );
    const dark = page.locator(
      '[data-theme-target="option"][data-theme="dark"]',
    );
    const system = page.locator(
      '[data-theme-target="option"][data-theme="system"]',
    );

    await expect(panel).toBeHidden();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await trigger.click();
    await expect(panel).toBeVisible();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await light.click();

    await expect(html).toHaveAttribute('data-theme', 'light');
    await expect(html).toHaveAttribute('data-theme-preference', 'light');
    await expect(light).toHaveAttribute('aria-pressed', 'true');
    await expect(panel).toBeHidden();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await trigger.click();
    await dark.click();

    await expect(html).toHaveAttribute('data-theme', 'dark');
    await expect(html).toHaveAttribute('data-theme-preference', 'dark');
    await expect(dark).toHaveAttribute('aria-pressed', 'true');
    await expect(panel).toBeHidden();

    await trigger.click();
    await system.click();

    await expect(html).toHaveAttribute('data-theme-preference', 'system');
    await expect(system).toHaveAttribute('aria-pressed', 'true');
    await expect(panel).toBeHidden();
  });

  test('選択したテーマは再読み込み後も維持される', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'テーマを変更' });
    const panel = page.locator('#theme-options');

    await trigger.click();
    await page
      .locator('[data-theme-target="option"][data-theme="dark"]')
      .click();
    await page.reload();

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('html')).toHaveAttribute(
      'data-theme-preference',
      'dark',
    );
    await expect(panel).toBeHidden();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await trigger.click();
    await expect(
      page.locator('[data-theme-target="option"][data-theme="dark"]'),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  test('Escと外側クリックでテーマ選択肢だけを閉じる', async ({ page }) => {
    const sidebar = page.locator('#sidebar');
    const trigger = page.getByRole('button', { name: 'テーマを変更' });
    const panel = page.locator('#theme-options');

    await trigger.click();
    await expect(panel).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(panel).toBeHidden();
    await expect(sidebar).toHaveAttribute('aria-hidden', 'false');

    await trigger.click();
    await expect(panel).toBeVisible();
    await page.mouse.click(1100, 30);
    await expect(panel).toBeHidden();
    await expect(sidebar).toHaveAttribute('aria-hidden', 'false');
  });
});
