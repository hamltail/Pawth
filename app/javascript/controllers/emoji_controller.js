import { Controller } from '@hotwired/stimulus';
import 'emoji-picker-element';
import i18nJa from 'emoji-i18n-ja';

const PICKER_DATA_URL =
  'https://cdn.jsdelivr.net/npm/emoji-picker-element-data@^1/ja/emojibase/data.json';

export default class extends Controller {
  static targets = ['button', 'dialog', 'picker', 'textarea'];

  connect() {
    if (this._bound) return;

    this.setupPickerLocale();
    this.bindHandlers();
    this.addGlobalListeners();

    this._bound = true;
  }

  disconnect() {
    if (!this._bound) return;

    this.removeGlobalListeners();
    this.pickerTarget.removeEventListener('emoji-click', this.onEmojiClick);

    this._bound = false;
  }

  open() {
    const dialog = this.dialogTarget;

    if (!dialog.open) dialog.show();

    this.buttonTarget.setAttribute('aria-expanded', 'true');
    this.pickerTarget.focus?.();
  }

  close() {
    if (this.dialogTarget.open) this.dialogTarget.close();

    this.buttonTarget.setAttribute('aria-expanded', 'false');
  }

  insertAtCursor(element, text) {
    const start = element.selectionStart ?? element.value.length;
    const end = element.selectionEnd ?? element.value.length;

    element.value =
      element.value.slice(0, start) + text + element.value.slice(end);

    const position = start + text.length;

    element.setSelectionRange(position, position);
    element.dispatchEvent(new Event('input', { bubbles: true }));
  }

  setupPickerLocale() {
    try {
      const dict = i18nJa?.default ?? i18nJa;

      Object.assign(this.pickerTarget, {
        i18n: dict,
        locale: 'ja',
        dataSource: PICKER_DATA_URL,
      });
    } catch (error) {
      console.warn('emoji i18n setup failed:', error);
    }

    this.onEmojiClick = (event) => {
      const emoji = event.detail.unicode;

      this.insertAtCursor(this.textareaTarget, emoji);
      this.close();
      this.textareaTarget.focus();
    };

    this.pickerTarget.addEventListener('emoji-click', this.onEmojiClick);
  }

  bindHandlers() {
    this.onDocClick = (event) => {
      if (!this.dialogTarget.open) return;

      const clickedInside = this.dialogTarget.contains(event.target);
      const clickedButton = event.target === this.buttonTarget;

      if (!clickedInside && !clickedButton) {
        this.close();
      }
    };

    this.onKeydown = (event) => {
      if (event.key === 'Escape') {
        this.close();
      }
    };
  }

  addGlobalListeners() {
    document.addEventListener('click', this.onDocClick);
    document.addEventListener('keydown', this.onKeydown);
  }

  removeGlobalListeners() {
    document.removeEventListener('click', this.onDocClick);
    document.removeEventListener('keydown', this.onKeydown);
  }
}
