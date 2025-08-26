import gsap from 'gsap';

function squish(el, { scale = 1.5, duration = 0.15 } = {}) {
  gsap.fromTo(
    el,
    { scale: 1 },
    { scale, duration, yoyo: true, repeat: 1, ease: 'power1.inOut' },
  );
}

function bindPawEvents() {
  document.querySelectorAll('.paw.paw--posted').forEach((el) => {
    el.addEventListener('mouseenter', () => squish(el));
    el.addEventListener('click', (e) => {
      squish(el, { scale: 1.55, duration: 0.16 });
      const target = e.currentTarget;
      const date = target.dataset.date;
      const content = target.dataset.content;
      document.getElementById('daily-post-date').textContent = date;
      document.getElementById('daily-post-content').textContent =
        content || 'まだ日記をかいていません。';
      gsap.fromTo(
        '#daily-post-content',
        { y: -10, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power1.out' },
      );
    });
  });
}

function fadeInPaws() {
  const paws = document.querySelectorAll('svg.paw.paw--posted');
  if (!paws.length) return;

  gsap.fromTo(
    paws,
    { opacity: 0, y: -10 },
    {
      opacity: 1,
      y: 0,
      duration: 1.5,
      ease: 'power1.out',
      stagger: 0.03,
    },
  );
}

function animateTodayBadge() {
  const chars = document.querySelectorAll('.today-badge .today-char');
  if (!chars.length) return;

  const tl = gsap.timeline({
    delay: 0.3,
    repeat: -1,
    repeatDelay: 0.8,
  });
  tl.to(chars, { y: -6, duration: 0.22, ease: 'power1.out', stagger: 0.06 }).to(
    chars,
    { y: 0, duration: 0.22, ease: 'power1.in', stagger: 0.06 },
    0.1,
  );
}

const onLoad = () => {
  bindPawEvents();
  fadeInPaws();
  animateTodayBadge();
};

document.addEventListener('turbo:load', onLoad);
document.addEventListener('turbo:frame-load', onLoad);
document.addEventListener('turbo:before-stream-render', (e) => {
  const streamEl = e.target;
  const action = streamEl.getAttribute('action');
  const target = streamEl.getAttribute('target');
  const hit =
    (target === 'calendar' || target === 'latest_post') &&
    (action === 'update' || action === 'replace');

  if (hit) {
    requestAnimationFrame(() => setTimeout(onLoad, 0));
  }
});
