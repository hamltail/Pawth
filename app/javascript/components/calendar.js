import gsap from 'gsap';

const state = {
  todayTl: null,
  bound: false,
  handlers: { mouseover: null, click: null },
};

function squish(el, { scale = 1.5, duration = 0.15 } = {}) {
  gsap.fromTo(
    el,
    { scale: 1 },
    { scale, duration, yoyo: true, repeat: 1, ease: 'power1.inOut' },
  );
}

function bindPawEvents() {
  const root = document.querySelector('#calendar');
  if (!root || state.bound) return;

  state.handlers.mouseover = (e) => {
    const el = e.target.closest('.paw.paw--posted');
    if (!el || !root.contains(el)) return;
    squish(el);
  };

  state.handlers.click = (e) => {
    const el = e.target.closest('.paw.paw--posted');
    if (!el || !root.contains(el)) return;

    squish(el, { scale: 1.55, duration: 0.16 });

    const date = el.dataset.date;
    const content = el.dataset.content;
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
  };

  root.addEventListener('mouseover', state.handlers.mouseover);
  root.addEventListener('click', state.handlers.click);
  state.bound = true;
}

function unbindPawEvents() {
  const root = document.querySelector('#calendar');
  if (!root || !state.bound) return;
  root.removeEventListener('mouseover', state.handlers.mouseover);
  root.removeEventListener('click', state.handlers.click);
  state.bound = false;
  state.handlers.mouseover = null;
  state.handlers.click = null;
}

function fadeInPaws() {
  const paws = document.querySelectorAll('svg.paw.paw--posted');
  if (!paws.length) return;

  gsap.killTweensOf(paws);
  gsap.fromTo(
    paws,
    { opacity: 0, y: -10 },
    { opacity: 1, y: 0, duration: 1.5, ease: 'power1.out', stagger: 0.03 },
  );
}

function animateTodayBadge() {
  const chars = document.querySelectorAll('.today-badge .today-char');
  if (!chars.length) return;

  if (state.todayTl) {
    state.todayTl.kill();
    state.todayTl = null;
  }

  state.todayTl = gsap.timeline({
    delay: 0.3,
    repeat: -1,
    repeatDelay: 0.8,
  });

  state.todayTl
    .to(chars, { y: -6, duration: 0.22, ease: 'power1.out', stagger: 0.06 })
    .to(chars, { y: 0, duration: 0.22, ease: 'power1.in', stagger: 0.06 }, 0.1);
}

function teardown() {
  if (state.todayTl) {
    state.todayTl.kill();
    state.todayTl = null;
  }
  gsap.killTweensOf([
    '.today-badge .today-char',
    'svg.paw.paw--posted',
    '#daily-post-content',
  ]);
  unbindPawEvents();
}

function onLoad() {
  teardown();
  bindPawEvents();
  fadeInPaws();
  animateTodayBadge();
}

// Turboフック
document.addEventListener('turbo:load', onLoad);
document.addEventListener('turbo:frame-load', onLoad);
document.addEventListener('turbo:before-cache', teardown);

// Stream更新（calendar/latest_postにヒットしたら、描画完了後にre-init）
document.addEventListener('turbo:before-stream-render', (e) => {
  const streamEl = e.target;
  const action = streamEl.getAttribute('action');
  const target = streamEl.getAttribute('target');
  const hit =
    (target === 'calendar' || target === 'latest_post') &&
    (action === 'update' || action === 'replace');

  if (hit) {
    teardown();
    requestAnimationFrame(() => setTimeout(onLoad, 0));
  }
});
