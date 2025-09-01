import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
  connect() {
    if (document.documentElement.hasAttribute('data-turbo-preview')) return;

    this.element.style.opacity = 0;
    this.element.style.transition = 'opacity 1.5s ease';

    requestAnimationFrame(() => {
      this.element.style.opacity = 1;
    });
  }

  disconnect() {
    this.element.style.opacity = '';
    this.element.style.transition = '';
  }
}
