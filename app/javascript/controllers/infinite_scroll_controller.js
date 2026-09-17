import { Controller } from '@hotwired/stimulus';

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
  }

  disconnect() {
    this.observer?.disconnect();
  }

  async loadNextPage() {
    if (this.loading || !this.hasSentinelTarget) return;

    const url = this.sentinelTarget.dataset.nextUrl;

    if (!url) return;

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

        if (this.isSentinelVisible()) {
          this.loadNextPage();
        }

        return;
      }

      this.observer.unobserve(this.sentinelTarget);
      this.sentinelTarget.remove();
    } catch (error) {
      console.error('Failed to load next timeline page:', error);
      this.loading = false;
    }
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
