import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
  static values = {
    threshold: { type: Number, default: 300 },
  };

  connect() {
    this.handleScroll = this.handleScroll.bind(this);

    window.addEventListener('scroll', this.handleScroll, { passive: true });

    this.updateVisibility();
  }

  disconnect() {
    window.removeEventListener('scroll', this.handleScroll);
  }

  scroll(event) {
    event.preventDefault();

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  handleScroll() {
    this.updateVisibility();
  }

  updateVisibility() {
    const visible = window.scrollY > this.thresholdValue;

    this.element.classList.toggle('opacity-0', !visible);
    this.element.classList.toggle('translate-y-2', !visible);
    this.element.classList.toggle('pointer-events-none', !visible);

    this.element.classList.toggle('opacity-100', visible);
    this.element.classList.toggle('translate-y-0', visible);
  }
}
