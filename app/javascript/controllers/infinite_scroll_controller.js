import { Controller } from '@hotwired/stimulus';

const TIMELINE_STATE_KEY = 'pawth:timeline-state';

export default class extends Controller {
  static targets = ['posts', 'sentinel'];

  connect() {
    this.loading = false;

    this.observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((entry) => entry.isIntersecting);

        if (visible) {
          this.loadNextPage();
        }
      },
      {
        root: null,
        rootMargin: '300px 0px',
        threshold: 0,
      },
    );

    if (this.hasSentinelTarget) {
      this.observer.observe(this.sentinelTarget);
    }

    this.restoreTimelineState();
  }

  disconnect() {
    this.observer?.disconnect();
  }

  async loadNextPage() {
    if (this.loading || !this.hasSentinelTarget) return false;

    const url = this.sentinelTarget.dataset.nextUrl;

    if (!url) return false;

    this.loading = true;

    try {
      const response = await fetch(url, {
        headers: {
          Accept: 'text/html',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const html = await response.text();
      const documentFragment = new DOMParser().parseFromString(
        html,
        'text/html',
      );

      const nextPosts = documentFragment.querySelector('#posts');

      if (!nextPosts) {
        throw new Error('Next posts were not found');
      }

      this.removeDuplicateMonthHeading(nextPosts);

      Array.from(nextPosts.children).forEach((element) => {
        this.postsTarget.appendChild(element);
      });

      const nextSentinel = documentFragment.querySelector(
        '#infinite-scroll-sentinel',
      );

      if (nextSentinel?.dataset.nextUrl) {
        this.sentinelTarget.dataset.nextUrl = nextSentinel.dataset.nextUrl;
        this.loading = false;

        return true;
      }

      this.observer.unobserve(this.sentinelTarget);
      this.sentinelTarget.remove();
      this.loading = false;

      return true;
    } catch (error) {
      console.error('Failed to load next timeline page:', error);
      this.loading = false;

      return false;
    }
  }

  async restoreTimelineState() {
    const rawState = sessionStorage.getItem(TIMELINE_STATE_KEY);

    if (!rawState) return;

    sessionStorage.removeItem(TIMELINE_STATE_KEY);

    let state;

    try {
      state = JSON.parse(rawState);
    } catch {
      return;
    }

    const scrollY = Number(state.scrollY);
    const loadedPostCount = Number(state.loadedPostCount);

    if (!Number.isFinite(scrollY) || !Number.isFinite(loadedPostCount)) return;

    const targetPostCount = Math.max(loadedPostCount - 1, 0);

    while (this.currentPostCount < targetPostCount && this.hasSentinelTarget) {
      const loaded = await this.loadNextPage();

      if (!loaded) break;
    }

    requestAnimationFrame(() => {
      window.scrollTo({
        top: scrollY,
        behavior: 'instant',
      });
    });
  }

  get currentPostCount() {
    return this.postsTarget.querySelectorAll(':scope > li[id^="post_"]').length;
  }

  removeDuplicateMonthHeading(nextPosts) {
    const currentHeadings = this.postsTarget.querySelectorAll(
      '[data-timeline-month]',
    );

    const nextHeading = nextPosts.querySelector('[data-timeline-month]');

    if (!currentHeadings.length || !nextHeading) return;

    const currentMonth =
      currentHeadings[currentHeadings.length - 1].dataset.timelineMonth;

    const nextMonth = nextHeading.dataset.timelineMonth;

    if (currentMonth === nextMonth) {
      nextHeading.remove();
    }
  }

  isSentinelVisible() {
    if (!this.hasSentinelTarget) return false;

    const rect = this.sentinelTarget.getBoundingClientRect();

    return rect.top <= window.innerHeight + 300;
  }
}
