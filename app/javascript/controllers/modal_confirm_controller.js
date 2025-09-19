import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
  static targets = ['dialog', 'message'];

  connect() {
    window.appConfirm = (message) => this.open(message);
  }

  disconnect() {
    if (window.appConfirm) delete window.appConfirm;
  }

  open(message = '実行してよろしいですか？') {
    this.messageTarget.textContent = message;
    this.dialogTarget.showModal();

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
