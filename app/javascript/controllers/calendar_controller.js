import { Controller } from '@hotwired/stimulus';
import { gsap } from 'gsap';
import { createSwipeTracker } from 'lib/swipe';

export default class extends Controller {
  static targets = ['prevLink', 'nextLink'];

  connect() {
    if (document.documentElement.hasAttribute('data-turbo-preview')) return;

    this.swipe = createSwipeTracker();
    this.selectedMark = null;

    this.handlePostSelected = this.handlePostSelected.bind(this);

    document.addEventListener('pawth:post-selected', this.handlePostSelected);

    this.ctx = gsap.context(() => {
      this.refreshCurrentPostRefs();
      this.fadeInMarks();
      this.syncSelectedMark();
    }, this.element);

    // Turbo Frameによって月が切り替わったとき、
    // 日記ナビゲーションの状態を現在月に合わせて更新する
    document.dispatchEvent(new CustomEvent('pawth:calendar-changed'));
  }

  refreshCurrentPostRefs() {
    this.dateEl = document.getElementById('daily-post-date');
    this.contentEl = document.getElementById('daily-post-content');
  }

  disconnect() {
    this.teardown();
  }

  handleMouseover(e) {
    const el = e.target.closest('.calendar-mark.calendar-mark--posted');
    if (!el || !this.element.contains(el)) return;

    if (el.classList.contains('calendar-mark--selected')) {
      gsap.killTweensOf(el, 'y,rotation,scale');

      gsap.to(el, {
        y: -1,
        rotation: 6,
        scale: 1.1,
        duration: 0.18,
        ease: 'power1.out',
        overwrite: 'auto',
      });

      return;
    }

    gsap.killTweensOf(el, 'y,rotation,scale,filter');

    gsap.to(el, {
      y: -1,
      rotation: 6,
      scale: 1.1,
      filter: 'drop-shadow(0 3px 3px rgb(196 181 253 / 0.55))',
      duration: 0.18,
      ease: 'power1.out',
      overwrite: 'auto',
    });
  }

  handleMouseout(e) {
    const el = e.target.closest('.calendar-mark.calendar-mark--posted');
    if (!el || !this.element.contains(el)) return;

    if (el.classList.contains('calendar-mark--selected')) {
      gsap.killTweensOf(el, 'y,rotation,scale');

      gsap.to(el, {
        y: 0,
        rotation: 0,
        scale: 1,
        duration: 0.18,
        ease: 'power1.out',
        overwrite: 'auto',
      });

      return;
    }

    gsap.killTweensOf(el, 'y,rotation,scale,filter');

    gsap.to(el, {
      y: 0,
      rotation: 0,
      scale: 1,
      filter: 'drop-shadow(0 0 0 rgb(0 0 0 / 0))',
      duration: 0.18,
      ease: 'power1.out',
      overwrite: 'auto',
    });
  }

  handleClick(e) {
    this.refreshCurrentPostRefs();

    const el = e.target.closest('.calendar-mark.calendar-mark--posted');
    if (!el || !this.element.contains(el)) return;

    const { date, content } = el.dataset;

    if (!date || !this.dateEl || !this.contentEl) return;
    if (this.dateEl.textContent === date) return;

    this.animatePostReveal({
      date,
      content: content || 'まだ日記をかいていません。',
    });

    document.dispatchEvent(
      new CustomEvent('pawth:post-selected', {
        detail: { date },
      }),
    );
  }

  animatePostReveal({ date, content }) {
    if (!this.dateEl || !this.contentEl) return;

    const revealElements = [this.dateEl.parentElement, this.contentEl].filter(
      Boolean,
    );

    gsap.killTweensOf(revealElements);

    gsap.set(revealElements, {
      opacity: 0.6,
    });

    this.dateEl.textContent = date;
    this.contentEl.textContent = content;
    this.contentEl.scrollTop = 0;

    gsap.to(revealElements, {
      opacity: 1,
      duration: 0.6,
      ease: 'sine.inOut',
      overwrite: 'auto',
      onComplete: () => {
        gsap.set(revealElements, {
          clearProps: 'opacity',
        });
      },
    });
  }

  handlePostSelected(event) {
    const { date, animateMark = false } = event.detail;

    if (!date) return;

    const selectedMark = this.selectMark(date);

    if (animateMark && selectedMark) {
      this.squish(selectedMark, { scale: 1.4 });
    }
  }

  syncSelectedMark() {
    this.refreshCurrentPostRefs();

    const date = this.dateEl?.textContent;

    if (!date) return;

    this.selectMark(date);
  }

  selectMark(date) {
    const nextMark = Array.from(
      this.element.querySelectorAll('.calendar-mark.calendar-mark--posted'),
    ).find((mark) => mark.dataset.date === date);

    this.clearSelectedMark();

    if (!nextMark) return null;

    nextMark.classList.add('calendar-mark--selected');
    this.selectedMark = nextMark;

    return nextMark;
  }

  clearSelectedMark() {
    if (!this.selectedMark) return;

    this.selectedMark.classList.remove('calendar-mark--selected');

    gsap.set(this.selectedMark, {
      clearProps: 'filter',
    });

    this.selectedMark = null;
  }

  handlePointerDown(event) {
    this.swipe?.start(event);

    if (!event.isPrimary) return;

    const el = event.target.closest('.calendar-mark.calendar-mark--posted');
    if (!el || !this.element.contains(el)) return;

    this.squish(el, { scale: 1.4 });
  }

  handlePointerUp(event) {
    const direction = this.swipe?.finish(event);

    if (direction === 'left') {
      this.nextLinkTarget.click();
      return;
    }

    if (direction === 'right') {
      this.prevLinkTarget.click();
    }
  }

  handlePointerCancel() {
    this.swipe?.reset();
  }

  squish(el, { scale = 1.3, duration = 0.1 } = {}) {
    gsap.killTweensOf(el, 'scale');

    gsap.set(el, { scale: 1 });

    gsap.to(el, {
      scale,
      duration,
      yoyo: true,
      repeat: 1,
      ease: 'power2.out',
      overwrite: 'auto',
      onComplete: () => {
        gsap.set(el, { scale: 1 });
      },
    });
  }

  fadeInMarks() {
    const marks = this.element.querySelectorAll(
      'svg.calendar-mark.calendar-mark--posted',
    );

    if (!marks.length) return;

    gsap.killTweensOf(marks, 'opacity,y');

    gsap.fromTo(
      marks,
      {
        opacity: 0,
        y: -10,
      },
      {
        opacity: 1,
        y: 0,
        duration: 1.0,
        ease: 'power1.out',
        stagger: 0.03,
      },
    );
  }

  teardown() {
    this.clearSelectedMark();

    document.removeEventListener(
      'pawth:post-selected',
      this.handlePostSelected,
    );

    gsap.killTweensOf([
      this.dateEl?.parentElement,
      this.contentEl,
      this.element.querySelectorAll('svg.calendar-mark.calendar-mark--posted'),
    ]);

    this.ctx?.revert();
    this.ctx = null;
    this.dateEl = null;
    this.contentEl = null;

    this.swipe?.reset();
    this.swipe = null;
  }
}
