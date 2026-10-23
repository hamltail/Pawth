import { expect, test } from '@playwright/test';
import { AuthPage } from '../pages/auth-page.js';

test.describe('calendar navigation', () => {
  test.beforeEach(async ({ page }) => {
    const authPage = new AuthPage(page);

    await authPage.goto();
    await authPage.loginAsPlaywright();
  });

  test('矢印ボタンで前後の月へ移動できる', async ({ page }) => {
    const calendar = page.locator('#calendar').last();

    const initialMonth = await calendar.getByRole('heading').textContent();

    await calendar.getByRole('link', { name: '前の月へ' }).click();

    await expect(calendar.getByRole('heading')).not.toHaveText(
      initialMonth ?? '',
    );

    await calendar.getByRole('link', { name: '次の月へ' }).click();

    await expect(calendar.getByRole('heading')).toHaveText(initialMonth ?? '');

    await calendar.getByRole('link', { name: '次の月へ' }).click();

    await expect(calendar.getByRole('heading')).not.toHaveText(
      initialMonth ?? '',
    );
  });

  test('モバイルとタブレットでは日付セルが正方形になる', async ({ page }) => {
    const calendar = page.locator('#calendar').last();
    const cells = calendar.locator('.calendar-day-cell');

    const viewports = [
      { width: 375, height: 812 },
      { width: 768, height: 900 },
      { width: 1023, height: 900 },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      // PCからモバイルへ切り替える際のメイン領域の移動完了を待つ
      await expect(page.locator('main')).toHaveCSS('margin-left', '0px');

      const cell = await cells.first().boundingBox();
      const grid = await calendar.locator('.calendar-days-grid').boundingBox();

      expect(cell).not.toBeNull();
      expect(grid).not.toBeNull();

      if (!cell || !grid) continue;

      // 日付セルが正方形であること
      expect(Math.abs(cell.width - cell.height)).toBeLessThan(1.5);

      // カレンダーが画面幅を超えないこと
      expect(grid.x).toBeGreaterThanOrEqual(0);
      expect(grid.x + grid.width).toBeLessThanOrEqual(viewport.width + 1);

      // SVGのレイアウト上のサイズを取得する。
      // boundingBox() はGSAPのscaleアニメーションの影響を受けるため使わない。
      const markSize = await cells
        .first()
        .locator('.calendar-mark')
        .evaluate((element) => {
          const style = window.getComputedStyle(element);

          return {
            width: Number.parseFloat(style.width),
            height: Number.parseFloat(style.height),
          };
        });

      // 肉球・星アイコンが日付セルに収まること
      expect(markSize.width).toBeLessThanOrEqual(cell.width + 1);
      expect(markSize.height).toBeLessThanOrEqual(cell.height + 1);
    }
  });

  test('PCでは1カラムと2カラムでカレンダーのサイズが変わらない', async ({
    page,
  }) => {
    const calendar = page.locator('#calendar').last();
    const widths: number[] = [];

    const viewports = [
      { width: 1024, height: 900 },
      { width: 1280, height: 900 },
      { width: 1376, height: 900 },
      { width: 1440, height: 900 },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      const shell = await calendar.locator('.calendar-shell').boundingBox();
      const cell = await calendar
        .locator('.calendar-day-cell')
        .first()
        .boundingBox();

      expect(shell).not.toBeNull();
      expect(cell).not.toBeNull();

      if (!shell || !cell) continue;

      widths.push(shell.width);

      // 元のPC表示と同じ64pxの固定高さ
      expect(Math.abs(cell.height - 64)).toBeLessThan(1);
    }

    expect(widths).toHaveLength(viewports.length);
    expect(Math.max(...widths) - Math.min(...widths)).toBeLessThan(2);
  });
});
