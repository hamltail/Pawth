import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
  static targets = ['panel', 'icon'];

  connect() {
    const open = this.element.dataset.open === 'true';
    this.applyState(open);
  }

  toggle(e) {
    e.preventDefault();
    this.applyState(this.panelTarget.classList.contains('hidden'));
  }

  applyState(open) {
    this.panelTarget.classList.toggle('hidden', !open);
    this.button?.setAttribute('aria-expanded', String(open));
    if (this.hasIconTarget) this.iconTarget.classList.toggle('rotate-90', open);
  }

  get button() {
    return this.element.querySelector('[data-action*="collapsible#toggle"]');
  }
}
