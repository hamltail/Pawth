import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
  connect() {
    const open = this.persistedOpen ?? this.element.dataset.open === 'true';
    this.setOpen(open);
  }

  toggle(event) {
    event.preventDefault();

    const open = !this.element.classList.contains('is-open');

    this.setOpen(open);
    this.persistedOpen = open;
  }

  setOpen(open) {
    this.element.classList.toggle('is-open', open);
    this.button?.setAttribute('aria-expanded', String(open));
  }

  get button() {
    return this.element.querySelector('[data-action*="collapsible#toggle"]');
  }

  get storageKey() {
    return this.element.dataset.collapsibleStorageKey;
  }

  get persistedOpen() {
    if (!this.storageKey) return null;

    return sessionStorage.getItem(this.storageKey) === 'true';
  }

  set persistedOpen(open) {
    if (!this.storageKey) return;

    sessionStorage.setItem(this.storageKey, String(open));
  }
}
