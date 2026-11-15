import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
  static targets = [
    'dialog',
    'title',
    'message',
    'okButton',
    'cancelButton',
    'textWrap',
    'textInput',
    'hint',
  ];

  static values = { okOnly: Boolean, okText: String, cancelText: String };

  connect() {
    this.handleCancel = (event) => {
      event.preventDefault();
      this.cancel();
    };

    this.dialogTarget.addEventListener('cancel', this.handleCancel);
    window.appConfirm = (opts) => this.open(opts);
  }

  disconnect() {
    this.dialogTarget.removeEventListener('cancel', this.handleCancel);

    if (window.appConfirm) delete window.appConfirm;
  }

  open(opts) {
    const {
      title = '確認',
      message,
      okOnly = false,
      okText = '実行する',
      cancelText = 'キャンセル',
      requiresText = false,
      expectedText = '削除する',
      tone = 'danger',
    } = typeof opts === 'string' ? { message: opts } : opts || {};

    this._requiresText = !!requiresText;
    this._expectedText = expectedText;

    if (this.hasTitleTarget) {
      this.titleTarget.textContent = title;
    }

    this.messageTarget.textContent = message || '実行してよろしいですか？';

    if (this.hasCancelButtonTarget) {
      this.cancelButtonTarget.classList.toggle('hidden', !!okOnly);
      this.cancelButtonTarget.textContent = cancelText;
    }

    if (this.hasOkButtonTarget) {
      this.okButtonTarget.textContent = okText;
      this.setOkTone(tone);
    }

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

  setOkTone(tone) {
    if (!this.hasOkButtonTarget) return;

    const danger = tone !== 'primary';
    const button = this.okButtonTarget;

    button.classList.toggle('bg-red-600', danger);
    button.classList.toggle('hover:bg-red-500', danger);
    button.classList.toggle('disabled:bg-red-300', danger);

    button.classList.toggle('bg-brand', !danger);
    button.classList.toggle('hover:bg-brand-light', !danger);
    button.classList.toggle('disabled:opacity-50', !danger);
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
