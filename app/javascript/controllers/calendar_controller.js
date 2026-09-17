import { Controller } from '@hotwired/stimulus';
import { gsap } from 'gsap';

export default class extends Controller {
  static targets = ['prevLink', 'nextLink'];

  connect() {
    if (document.documentElement.hasAttribute('data-turbo-preview')) return;

    this.pointerStartX = null;
    this.pointerStartY = null;

    this.ctx = gsap.context(() => {
      this.refreshCurrentPostRefs();
      this.fadeInMarks();
      this.animateTodayBadge();
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

    gsap.killTweensOf(el, 'y,rotation,filter');

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

    gsap.killTweensOf(el, 'y,rotation,filter');

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

    if (this.dateEl) {
      this.dateEl.textContent = date || '';
    }

    if (this.contentEl) {
      this.contentEl.textContent = content || 'まだ日記をかいていません。';

      gsap.killTweensOf(this.contentEl);

      gsap.fromTo(
        this.contentEl,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 1.618,
          ease: 'power1.out',
        },
      );
    }

    // カレンダーマークから日記を選択したら、
    // 日記ナビゲーションの矢印状態を更新する
    document.dispatchEvent(
      new CustomEvent('pawth:post-selected', {
        detail: { date },
      }),
    );
  }

  handlePointerDown(e) {
    if (!e.isPrimary) return;

    this.pointerStartX = e.clientX;
    this.pointerStartY = e.clientY;

    const el = e.target.closest('.calendar-mark.calendar-mark--posted');
    if (!el || !this.element.contains(el)) return;

    this.squish(el, { scale: 1.4 });
  }

  handlePointerUp(e) {
    if (
      !e.isPrimary ||
      this.pointerStartX === null ||
      this.pointerStartY === null
    ) {
      return;
    }

    const deltaX = e.clientX - this.pointerStartX;
    const deltaY = e.clientY - this.pointerStartY;

    this.resetPointer();

    const swipeThreshold = 50;

    // 横方向より縦方向への移動が大きければ、
    // 通常のスクロールとして扱う
    if (Math.abs(deltaY) >= Math.abs(deltaX)) return;

    // 小さなドラッグやクリックでは月を変更しない
    if (Math.abs(deltaX) < swipeThreshold) return;

    // 左へスワイプ → 翌月
    if (deltaX < 0) {
      this.nextLinkTarget.click();
      return;
    }

    // 右へスワイプ → 前月
    this.prevLinkTarget.click();
  }

  handlePointerCancel() {
    this.resetPointer();
  }

  resetPointer() {
    this.pointerStartX = null;
    this.pointerStartY = null;
  }

  squish(el, { scale = 1.3, duration = 0.1 } = {}) {
    // 連打された場合は、進行中のscaleアニメーションだけを破棄する
    gsap.killTweensOf(el, 'scale');

    // 前回の途中状態を引き継がず、必ず等倍から開始する
    gsap.set(el, { scale: 1 });

    gsap.to(el, {
      scale,
      duration,
      yoyo: true,
      repeat: 1,
      ease: 'power2.out',
      overwrite: 'auto',

      // アニメーション終了後も必ず等倍へ戻す
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

    gsap.killTweensOf(marks);

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

  animateTodayBadge() {
    const chars = this.element.querySelectorAll('.today-badge .today-char');

    if (!chars.length) return;

    this.tl?.kill();

    this.tl = gsap
      .timeline({
        delay: 0.3,
        repeat: -1,
        repeatDelay: 0.8,
      })
      .to(chars, {
        y: -6,
        duration: 0.22,
        ease: 'power1.out',
        stagger: 0.06,
      })
      .to(
        chars,
        {
          y: 0,
          duration: 0.22,
          ease: 'power1.in',
          stagger: 0.06,
        },
        0.1,
      );
  }

  teardown() {
    this.tl?.kill();
    this.tl = null;

    gsap.killTweensOf([
      this.contentEl,
      this.element.querySelectorAll('.today-badge .today-char'),
      this.element.querySelectorAll('svg.calendar-mark.calendar-mark--posted'),
    ]);

    this.ctx?.revert();
    this.ctx = null;
    this.dateEl = null;
    this.contentEl = null;

    this.resetPointer();
  }
}
