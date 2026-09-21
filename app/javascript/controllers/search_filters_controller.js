import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
  static targets = ['field', 'clear'];

  connect() {
    this.update();
  }

  update() {
    this.fieldTargets.forEach((field, index) => {
      const clearButton = this.clearTargets[index];

      if (!clearButton) return;

      const hasValue = field.value !== '';

      clearButton.classList.toggle('hidden', !hasValue);
      clearButton.classList.toggle('inline-flex', hasValue);
    });
  }

  clear(event) {
    event.preventDefault();

    const index = Number(event.currentTarget.dataset.fieldIndex);
    const field = this.fieldTargets[index];

    if (!field) return;

    field.value = '';
    field.focus();

    this.update();
  }
}
