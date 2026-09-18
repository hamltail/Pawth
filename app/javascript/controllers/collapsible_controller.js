import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
  connect() {
    const open = this.element.dataset.open === 'true';
    this.setOpen(open);
  }

  toggle(event) {
    event.preventDefault();

    this.setOpen(!this.element.classList.contains('is-open'));
  }

  setOpen(open) {
    this.element.classList.toggle('is-open', open);
    this.button?.setAttribute('aria-expanded', String(open));
  }

  get button() {
    return this.element.querySelector('[data-action*="collapsible#toggle"]');
  }
}
