import { expect, test } from '@playwright/test';
import { AuthPage } from '../pages/auth-page.js';

test.describe('sidebar', () => {
  test.beforeEach(async ({ page }) => {
    const authPage = new AuthPage(page);

    await authPage.goto();
    await authPage.loginAsPlaywright();
  });

  test('PCでは閉じるとメニューが現れ、再び開ける', async ({ page }) => {
    const sidebar = page.locator('#sidebar');
    const openButton = page.locator('#menu-button');
    const closeButton = sidebar.getByRole('button', {
      name: 'サイドバーを閉じる',
    });
    const main = page.locator('main');

    await expect(sidebar).toHaveAttribute('aria-hidden', 'false');
    await expect(openButton).toBeHidden();
    await expect(main).toHaveClass(/lg:ml-64/);

    await closeButton.click();

    await expect(sidebar).toHaveAttribute('aria-hidden', 'true');
    await expect(openButton).toBeVisible();
    await expect(main).not.toHaveClass(/lg:ml-64/);

    await openButton.click();

    await expect(sidebar).toHaveAttribute('aria-hidden', 'false');
    await expect(openButton).toBeHidden();
    await expect(main).toHaveClass(/lg:ml-64/);

    await page.keyboard.press('Escape');
    await expect(sidebar).toHaveAttribute('aria-hidden', 'false');
  });

  test('タブレットでは初期状態が閉じており、外側クリックで閉じる', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 820, height: 1024 });
    await page.reload();

    const sidebar = page.locator('#sidebar');
    const openButton = page.locator('#menu-button');

    await expect(sidebar).toHaveAttribute('aria-hidden', 'true');
    await expect(openButton).toBeVisible();
    await expect(page.locator('main')).not.toHaveClass(/lg:ml-64/);

    await openButton.click();

    await expect(sidebar).toHaveAttribute('aria-hidden', 'false');
    await expect(openButton).toBeHidden();
    await expect(page.locator('body')).toHaveClass(/overflow-hidden/);

    await page.keyboard.press('Escape');
    await expect(sidebar).toHaveAttribute('aria-hidden', 'false');

    // 固定座標ではなく、サイドバー外の実際の要素をクリックする。
    await page.getByRole('heading', { name: "playwright's Pawth" }).click();

    await expect(sidebar).toHaveAttribute('aria-hidden', 'true');
    await expect(openButton).toBeVisible();
    await expect(page.locator('body')).not.toHaveClass(/overflow-hidden/);
  });

  test('スマートフォンではメニューを開閉し、リンクから移動できる', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload();

    const sidebar = page.locator('#sidebar');
    const openButton = page.locator('#menu-button');
    const closeButton = sidebar.getByRole('button', {
      name: 'サイドバーを閉じる',
    });

    await expect(sidebar).toHaveAttribute('aria-hidden', 'true');
    await expect(openButton).toBeVisible();

    await openButton.click();
    await expect(sidebar).toHaveAttribute('aria-hidden', 'false');
    await expect(closeButton).toBeVisible();

    await closeButton.click();
    await expect(sidebar).toHaveAttribute('aria-hidden', 'true');
    await expect(openButton).toBeVisible();

    await openButton.click();
    await sidebar.getByRole('link', { name: 'タイムライン' }).click();

    await expect(
      page.getByRole('heading', { name: 'タイムライン' }),
    ).toBeVisible();
    await expect(page.locator('#sidebar')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
    await expect(page.locator('#menu-button')).toBeVisible();
  });
});
