import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
  static targets = ['checkbox'];

  connect() {
    this.render();
  }

  render() {
    this.element.classList.toggle('is-public', this.checkboxTarget.checked);
  }
}
