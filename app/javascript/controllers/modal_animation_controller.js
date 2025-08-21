import { Controller } from '@hotwired/stimulus';
import gsap from 'gsap';

export default class extends Controller {
  connect() {
    gsap.fromTo(
      this.element,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' },
    );
  }
}
