import { Controller } from '@hotwired/stimulus';
import gsap from 'gsap';

export default class extends Controller {
  static values = {
    duration: { type: Number, default: 0.3 },
    offsetY: { type: Number, default: 30 },
  };
  connect() {
    gsap.fromTo(
      this.element,
      { opacity: 0, y: this.offsetYValue },
      { opacity: 1, y: 0, duration: this.durationValue, ease: 'power2.out' },
    );
  }
}
