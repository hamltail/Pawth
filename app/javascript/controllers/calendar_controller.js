import { Controller } from '@hotwired/stimulus';
import { gsap } from 'gsap';

export default class extends Controller {
  connect() {
    // プレビュー（キャッシュ表示）中は演出しない
    if (document.documentElement.hasAttribute('data-turbo-preview')) return;

    // 参照を保持
    this.onMouseover = this.handleMouseover.bind(this);
    this.onClick = this.handleClick.bind(this);

    // イベント（デリゲーション）
    this.element.addEventListener('mouseover', this.onMouseover);
    this.element.addEventListener('click', this.onClick);

    // 初期演出
    this.fadeInPaws();
    this.animateTodayBadge();
  }

  disconnect() {
    this.teardown();
  }

  handleMouseover(e) {
    const el = e.target.closest('.paw.paw--posted');
    if (!el || !this.element.contains(el)) return;
    this.squish(el);
  }

  handleClick(e) {
    const el = e.target.closest('.paw.paw--posted');
    if (!el || !this.element.contains(el)) return;

    this.squish(el, { scale: 1.55, duration: 0.16 });

    const { date, content } = el.dataset;
    const dateEl = document.getElementById('daily-post-date');
    const contentEl = document.getElementById('daily-post-content');
    if (dateEl) dateEl.textContent = date || '';
    if (contentEl)
      contentEl.textContent = content || 'まだ日記をかいていません。';

    gsap.killTweensOf('#daily-post-content');
    gsap.fromTo(
      '#daily-post-content',
      { y: -10, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: 'power1.out' },
    );
  }

  squish(el, { scale = 1.5, duration = 0.15 } = {}) {
    gsap.fromTo(
      el,
      { scale: 1 },
      { scale, duration, yoyo: true, repeat: 1, ease: 'power1.inOut' },
    );
  }

  fadeInPaws() {
    const paws = this.element.querySelectorAll('svg.paw.paw--posted');
    if (!paws.length) return;
    gsap.killTweensOf(paws);
    gsap.fromTo(
      paws,
      { opacity: 0, y: -10 },
      { opacity: 1, y: 0, duration: 1.0, ease: 'power1.out', stagger: 0.03 },
    );
  }

  animateTodayBadge() {
    const chars = this.element.querySelectorAll('.today-badge .today-char');
    if (!chars.length) return;

    this.tl?.kill();
    this.tl = gsap
      .timeline({ delay: 0.3, repeat: -1, repeatDelay: 0.8 })
      .to(chars, { y: -6, duration: 0.22, ease: 'power1.out', stagger: 0.06 })
      .to(
        chars,
        { y: 0, duration: 0.22, ease: 'power1.in', stagger: 0.06 },
        0.1,
      );
  }

  teardown() {
    this.tl?.kill();
    this.tl = null;
    gsap.killTweensOf([
      '.today-badge .today-char',
      'svg.paw.paw--posted',
      '#daily-post-content',
    ]);
    this.element.removeEventListener('mouseover', this.onMouseover);
    this.element.removeEventListener('click', this.onClick);
  }
}
