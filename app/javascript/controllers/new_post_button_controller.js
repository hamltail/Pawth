import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
  static values = { postedToday: Boolean, message: String };

  handle(e) {
    if (!this.postedTodayValue) return;
    e.preventDefault();
    alert(this.messageValue || '今日はすでに日記をかいています。');
  }
}
