import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
  static targets = ['checkbox', 'label', 'bar', 'dot'];

  connect() {
    this.render();
  }

  render() {
    const on = !!this.checkboxTarget.checked;

    this.labelTarget.textContent = on ? '公開' : '非公開';
    this.labelTarget.classList.toggle('text-green-700', on);
    this.labelTarget.classList.toggle('text-red-600', !on);

    this.barTarget.classList.toggle('bg-teal-400', on);
    this.barTarget.classList.toggle('bg-gray-300', !on);

    this.dotTarget.style.transform = on ? 'translateX(2rem)' : 'translateX(0)';
  }
}
