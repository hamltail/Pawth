import { Controller } from '@hotwired/stimulus';

const TIMELINE_STATE_KEY = 'pawth:timeline-state';

export default class extends Controller {
  static values = {
    message: String,
    method: { type: String, default: 'delete' },
    requiresText: { type: Boolean, default: false },
    expectedText: String,
    preserveScroll: { type: Boolean, default: false },
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

    if (this.preserveScrollValue) {
      this.saveTimelineState();
    }

    this.submitWithMethod(href, this.methodValue.toUpperCase());
  }

  saveTimelineState() {
    const posts = document.querySelectorAll('#posts > li[id^="post_"]');

    const state = {
      scrollY: window.scrollY,
      loadedPostCount: posts.length,
    };

    sessionStorage.setItem(TIMELINE_STATE_KEY, JSON.stringify(state));
  }

  submitWithMethod(url, method) {
    const token = document.querySelector('meta[name="csrf-token"]')?.content;

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = url;
    form.style.display = 'none';

    const methodInput = document.createElement('input');
    methodInput.type = 'hidden';
    methodInput.name = '_method';
    methodInput.value = method;
    form.appendChild(methodInput);

    if (token) {
      const tokenInput = document.createElement('input');
      tokenInput.type = 'hidden';
      tokenInput.name = 'authenticity_token';
      tokenInput.value = token;
      form.appendChild(tokenInput);
    }

    document.body.appendChild(form);
    form.requestSubmit();
    form.remove();
  }
}
