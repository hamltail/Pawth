import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import { AuthPage } from '../pages/auth-page.js';

test.describe('timeline export', () => {
  test('検索条件に一致する記録をJSONとしてダウンロードできる', async ({
    page,
  }) => {
    const authPage = new AuthPage(page);

    await authPage.goto();
    await authPage.loginAsPlaywright();

    await page.getByRole('link', { name: 'タイムライン' }).click();

    await page.getByRole('button', { name: '記録を検索' }).click();

    const keyword = '過去の日記 87';

    await page.getByRole('textbox', { name: 'キーワード検索' }).fill(keyword);

    await page
      .getByRole('button', { name: 'エクスポート', exact: true })
      .click();

    const dialog = page.getByRole('dialog');

    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText(`「${keyword}」を含む記録`);
    await expect(dialog).toContainText('対象：1件');

    const downloadPromise = page.waitForEvent('download');

    await dialog.getByRole('button', { name: 'エクスポート' }).click();

    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/^pawth-\d{12}\.json$/);

    const json = JSON.parse(await readFile(await download.path(), 'utf8'));

    expect(json.count).toBe(1);
    expect(json.filters).toMatchObject({ q: keyword });

    expect(json.records).toEqual([
      {
        posted_on: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
        content: `Playwright E2E ${keyword}`,
      },
    ]);
  });
});
