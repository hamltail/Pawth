import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
  static targets = [
    'dialog',
    'message',
    'okButton',
    'cancelButton',
    'textWrap',
    'textInput',
    'hint',
  ];
  static values = { okOnly: Boolean, okText: String, cancelText: String };

  connect() {
    window.appConfirm = (opts) => this.open(opts);
  }
  disconnect() {
    if (window.appConfirm) delete window.appConfirm;
  }

  open(opts) {
    const {
      message,
      okOnly = false,
      okText = '実行する',
      cancelText = 'キャンセル',
      requiresText = false,
      expectedText = '削除する',
    } = typeof opts === 'string' ? { message: opts } : opts || {};

    this._requiresText = !!requiresText;
    this._expectedText = expectedText;

    this.messageTarget.textContent = message || '実行してよろしいですか？';

    if (this.hasCancelButtonTarget) {
      this.cancelButtonTarget.classList.toggle('hidden', !!okOnly);
      this.cancelButtonTarget.textContent = cancelText;
    }
    if (this.hasOkButtonTarget) {
      this.okButtonTarget.textContent = okText;
    }

    // 入力要求の表示と初期状態
    if (this.hasTextWrapTarget) {
      this.textWrapTarget.classList.toggle('hidden', !this._requiresText);

      if (this._requiresText) {
        if (this.hasTextInputTarget) {
          this.textInputTarget.value = '';
        }
        this.setOkDisabled(true);
      } else {
        this.setOkDisabled(false);
      }
    } else {
      // textWrapがないレイアウトでも安全
      this.setOkDisabled(this._requiresText);
    }

    this.dialogTarget.showModal();

    requestAnimationFrame(() => {
      if (this._requiresText && this.hasTextInputTarget) {
        this.textInputTarget.focus();
      } else {
        const target = okOnly ? this.okButtonTarget : this.cancelButtonTarget;
        target?.focus();
      }
    });

    return new Promise((resolve) => {
      this._resolver = (ok) => {
        this.dialogTarget.close();

        if (this.hasTextInputTarget) this.textInputTarget.value = '';
        this.setOkDisabled(true);
        resolve(ok);
      };
    });
  }

  validateText() {
    if (!this._requiresText || !this.hasTextInputTarget) return;
    const typed = this.textInputTarget.value.trim();
    const ok = typed === this._expectedText;
    this.setOkDisabled(!ok);
  }

  setOkDisabled(disabled) {
    if (!this.hasOkButtonTarget) return;
    this.okButtonTarget.disabled = !!disabled;
  }

  ok() {
    if (this.okButtonTarget?.disabled) return;
    this._resolver?.(true);
    this._resolver = null;
  }
  cancel() {
    this._resolver?.(false);
    this._resolver = null;
  }
}
