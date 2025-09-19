import { Controller } from '@hotwired/stimulus';
export default class extends Controller {
  static values = { message: String, okText: String };
  async click(e) {
    e.preventDefault();
    await window.appConfirm?.({
      message: this.messageValue,
      okOnly: true,
      okText: this.okTextValue || 'OK',
    });
  }
}
