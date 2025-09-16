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
    if (this._onResize) window.removeEventListener('resize', this._onResize);
    this._bound = false;
  }

  open() {
    const dlg = this.dialogTarget;
    if (!dlg.open) dlg.show(); // 非モーダル表示
    this.centerDialog();
    this.buttonTarget.setAttribute('aria-expanded', 'true');
    this.pickerTarget.focus?.();

    this._onResize ||= () => {
      if (!dlg.open) return;
      this.centerDialog();
    };
    window.addEventListener('resize', this._onResize, { passive: true });
  }

  close() {
    if (this.dialogTarget.open) this.dialogTarget.close();
    this.buttonTarget.setAttribute('aria-expanded', 'false');
    if (this._onResize) window.removeEventListener('resize', this._onResize);
  }

  insertAtCursor(el, text) {
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    el.value = el.value.slice(0, start) + text + el.value.slice(end);
    const pos = start + text.length;
    el.setSelectionRange(pos, pos);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }

  setupPickerLocale() {
    try {
      const dict = i18nJa?.default ?? i18nJa;
      Object.assign(this.pickerTarget, {
        i18n: dict,
        locale: 'ja',
        dataSource: PICKER_DATA_URL,
      });
    } catch (e) {
      console.warn('emoji i18n setup failed:', e);
    }
    this.onEmojiClick = (e) => {
      const emoji = e.detail.unicode;
      this.insertAtCursor(this.textareaTarget, emoji);
      this.close();
      this.textareaTarget.focus();
    };
    this.pickerTarget.addEventListener('emoji-click', this.onEmojiClick);
  }

  bindHandlers() {
    // 外側クリックで閉じる
    this.onDocClick = (e) => {
      if (!this.dialogTarget.open) return;
      const clickedInside = this.dialogTarget.contains(e.target);
      const clickedButton = e.target === this.buttonTarget;
      if (!clickedInside && !clickedButton) this.close();
    };
    // Escで閉じる
    this.onKeydown = (e) => {
      if (e.key === 'Escape') this.close();
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

  centerDialog() {
    Object.assign(this.dialogTarget.style, {
      position: 'fixed',
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
      margin: '0',
      padding: '0',
      border: '0',
      background: 'transparent',
      zIndex: 60,
    });
  }
}
