import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
  static targets = ['panel', 'icon'];

  connect() {
    const open = this.element.dataset.open === 'true';
    this.applyInitialState(open);
  }

  toggle(e) {
    e.preventDefault();

    if (this.panelTarget.classList.contains('hidden')) {
      this.open();
    } else {
      this.close();
    }
  }

  open() {
    this.panelTarget.classList.remove('hidden');
    this.updateControls(true);

    this.panelTarget.animate(
      [
        {
          opacity: 0,
          transform: 'translateY(-8px)',
        },
        {
          opacity: 1,
          transform: 'translateY(0)',
        },
      ],
      {
        duration: 220,
        easing: 'ease-out',
      },
    );
  }

  close() {
    const animation = this.panelTarget.animate(
      [
        {
          opacity: 1,
          transform: 'translateY(0)',
        },
        {
          opacity: 0,
          transform: 'translateY(-8px)',
        },
      ],
      {
        duration: 160,
        easing: 'ease-in',
      },
    );

    this.updateControls(false);

    animation.addEventListener(
      'finish',
      () => {
        this.panelTarget.classList.add('hidden');
      },
      { once: true },
    );
  }

  applyInitialState(open) {
    this.panelTarget.classList.toggle('hidden', !open);
    this.updateControls(open);
  }

  updateControls(open) {
    this.button?.setAttribute('aria-expanded', String(open));

    if (this.hasIconTarget) {
      this.iconTarget.classList.toggle('rotate-90', open);
    }
  }

  get button() {
    return this.element.querySelector('[data-action*="collapsible#toggle"]');
  }
}
