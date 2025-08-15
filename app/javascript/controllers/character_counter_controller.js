import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["input", "counter"];
  static values = { max: Number };

  connect() {
    this.update();
  }

  update() {
    const currentLength = this.inputTarget.value.length;
    const remaining = Math.max(this.maxValue - currentLength, 0);
    this.counterTarget.textContent = `残り${remaining}文字`;
  }
}
