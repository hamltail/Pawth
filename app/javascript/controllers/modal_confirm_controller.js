import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
  static targets = ['dialog', 'message', 'okButton', 'cancelButton'];
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
    } = typeof opts === 'string' ? { message: opts } : opts || {};

    this.messageTarget.textContent = message || '実行してよろしいですか？';

    // ボタン表示/文言
    if (this.hasCancelButtonTarget) {
      this.cancelButtonTarget.classList.toggle('hidden', !!okOnly);
      if (this.hasCancelTextValue)
        this.cancelButtonTarget.textContent = this.cancelTextValue;
      else this.cancelButtonTarget.textContent = cancelText;
    }
    if (this.hasOkButtonTarget) {
      if (this.hasOkTextValue)
        this.okButtonTarget.textContent = this.okTextValue;
      else this.okButtonTarget.textContent = okText;
    }

    this.dialogTarget.showModal();

    requestAnimationFrame(() => {
      const target = okOnly ? this.okButtonTarget : this.cancelButtonTarget;
      target?.focus();
    });

    return new Promise((resolve) => {
      this._resolver = (ok) => {
        this.dialogTarget.close();
        resolve(ok);
      };
    });
  }

  ok() {
    this._resolver?.(true);
    this._resolver = null;
  }
  cancel() {
    this._resolver?.(false);
    this._resolver = null;
  }
}
