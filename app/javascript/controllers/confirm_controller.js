import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
  static values = {
    message: String,
    method: { type: String, default: 'delete' },
    requiresText: { type: Boolean, default: false },
    expectedText: String,
  };

  async click(event) {
    event.preventDefault();
    const href = this.element.getAttribute('href');
    if (!href) return;

    const ok = await window.appConfirm?.({
      message: this.messageValue || '実行してよろしいですか？',
      requiresText: this.requiresTextValue,
      expectedText: this.expectedTextValue || '削除する',
      okText: '実行する',
      cancelText: 'キャンセル',
    });
    if (!ok) return;

    this.submitWithMethod(href, this.methodValue.toUpperCase());
  }

  submitWithMethod(url, method) {
    const token = document.querySelector('meta[name="csrf-token"]')?.content;

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = url;
    form.style.display = 'none';

    const m = document.createElement('input');
    m.type = 'hidden';
    m.name = '_method';
    m.value = method;
    form.appendChild(m);

    if (token) {
      const t = document.createElement('input');
      t.type = 'hidden';
      t.name = 'authenticity_token';
      t.value = token;
      form.appendChild(t);
    }

    document.body.appendChild(form);
    form.requestSubmit();
    form.remove();
  }
}
