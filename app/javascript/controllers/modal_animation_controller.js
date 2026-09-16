import { Controller } from '@hotwired/stimulus';
import gsap from 'gsap';

export default class extends Controller {
  static values = {
    duration: { type: Number, default: 0.3 },
    offsetY: { type: Number, default: 30 },
  };

  connect() {
    this.handleKeydown = this.handleKeydown.bind(this);
    document.addEventListener('keydown', this.handleKeydown);

    gsap.fromTo(
      this.element,
      { opacity: 0, y: this.offsetYValue },
      {
        opacity: 1,
        y: 0,
        duration: this.durationValue,
        ease: 'power2.out',
      },
    );
  }

  disconnect() {
    document.removeEventListener('keydown', this.handleKeydown);
  }

  handleKeydown(event) {
    if (event.key !== 'Escape') return;

    this.close();
  }

  close() {
    const modal = document.getElementById('modal');
    if (!modal) return;

    modal.innerHTML = '';
  }
}
