import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
  static values = { url: String };

  async download(event) {
    event.preventDefault();

    const form = this.element.form;

    if (!form || typeof window.appConfirm !== 'function') return;

    const params = new URLSearchParams(new FormData(form));
    const previewUrl = new URL(this.urlValue, window.location.origin);

    previewUrl.search = params.toString();
    previewUrl.searchParams.set('preview', '1');

    this.element.disabled = true;

    try {
      const response = await fetch(previewUrl, {
        credentials: 'same-origin',
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch export count');
      }

      const { count } = await response.json();

      if (!Number.isInteger(count) || count < 0) {
        throw new Error('Invalid export count');
      }

      if (count === 0) {
        await window.appConfirm({
          title: '記録をエクスポート',
          message: '対象となる記録がありません。検索条件を確認してください。',
          okOnly: true,
          okText: '閉じる',
          tone: 'primary',
        });
        return;
      }

      const scope = this.describeScope(params);

      const confirmed = await window.appConfirm({
        title: '記録をエクスポート',
        message: `${scope}をJSON形式でエクスポートします。対象：${count}件`,
        okText: 'エクスポート',
        cancelText: 'キャンセル',
        tone: 'primary',
      });

      if (!confirmed) return;

      const downloadUrl = new URL(this.urlValue, window.location.origin);
      downloadUrl.search = params.toString();

      const link = document.createElement('a');
      link.href = downloadUrl.toString();
      link.download = '';

      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      await window.appConfirm({
        title: 'エクスポートエラー',
        message:
          '対象件数を取得できませんでした。時間をおいて再度お試しください。',
        okOnly: true,
        okText: '閉じる',
        tone: 'primary',
      });
    } finally {
      this.element.disabled = false;
    }
  }

  describeScope(params) {
    const year = params.get('year');
    const month = params.get('month');
    const keyword = params.get('q');

    let period = '';

    if (year && month) {
      period = `${year}年${month}月`;
    } else if (year) {
      period = `${year}年`;
    } else if (month) {
      period = `${month}月`;
    }

    const hasKeyword = keyword && keyword.trim() !== '';

    if (period && hasKeyword) {
      return `${period}の「${keyword}」を含む記録`;
    }

    if (hasKeyword) {
      return `「${keyword}」を含む記録`;
    }

    if (period) {
      return `${period}の記録`;
    }

    return 'すべての記録';
  }
}
