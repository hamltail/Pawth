import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
  static targets = ['prevButton', 'nextButton'];

  connect() {
    this.pointerStartX = null;
    this.pointerStartY = null;

    this.handlePostSelected = this.handlePostSelected.bind(this);
    this.handleCalendarChanged = this.handleCalendarChanged.bind(this);

    document.addEventListener('pawth:post-selected', this.handlePostSelected);

    document.addEventListener(
      'pawth:calendar-changed',
      this.handleCalendarChanged,
    );

    this.refresh();
  }

  disconnect() {
    document.removeEventListener(
      'pawth:post-selected',
      this.handlePostSelected,
    );

    document.removeEventListener(
      'pawth:calendar-changed',
      this.handleCalendarChanged,
    );

    this.resetPointer();
  }

  handlePostSelected(event) {
    const { date } = event.detail;

    if (!date) return;

    this.refresh(date);
  }

  handleCalendarChanged() {
    // 月が変わった時点では、表示中の日記が
    // 新しい月の日記とは限らないため一度無効化する
    this.disableNavigation();
  }

  previous() {
    const posts = this.posts();
    const currentIndex = this.currentIndex(posts);

    if (currentIndex <= 0) return;

    this.selectPost(posts[currentIndex - 1]);
  }

  next() {
    const posts = this.posts();
    const currentIndex = this.currentIndex(posts);

    if (currentIndex === -1 || currentIndex >= posts.length - 1) return;

    this.selectPost(posts[currentIndex + 1]);
  }

  handlePointerDown(event) {
    if (!event.isPrimary) return;

    this.pointerStartX = event.clientX;
    this.pointerStartY = event.clientY;
  }

  handlePointerUp(event) {
    if (
      !event.isPrimary ||
      this.pointerStartX === null ||
      this.pointerStartY === null
    ) {
      return;
    }

    const deltaX = event.clientX - this.pointerStartX;
    const deltaY = event.clientY - this.pointerStartY;

    this.resetPointer();

    const swipeThreshold = 50;

    if (Math.abs(deltaY) >= Math.abs(deltaX)) return;
    if (Math.abs(deltaX) < swipeThreshold) return;

    // 左スワイプ → 次の日記
    if (deltaX < 0) {
      this.next();
      return;
    }

    // 右スワイプ → 前の日記
    this.previous();
  }

  handlePointerCancel() {
    this.resetPointer();
  }

  posts() {
    return Array.from(
      document.querySelectorAll(
        '#calendar .calendar-mark.calendar-mark--posted',
      ),
    ).sort((a, b) => a.dataset.date.localeCompare(b.dataset.date));
  }

  currentIndex(posts) {
    const dateEl = document.getElementById('daily-post-date');

    if (!dateEl) return -1;

    return posts.findIndex((post) => post.dataset.date === dateEl.textContent);
  }

  selectPost(post) {
    if (!post) return;

    const dateEl = document.getElementById('daily-post-date');
    const contentEl = document.getElementById('daily-post-content');

    if (!dateEl || !contentEl) return;

    const date = post.dataset.date || '';

    dateEl.textContent = date;
    contentEl.textContent =
      post.dataset.content || 'まだ日記をかいていません。';

    // スワイプ・矢印移動ではボヨヨーン等のアニメーションを入れない
    this.refresh(date);

    // 右側の日記移動とカレンダーの選択中マークを同期する
    document.dispatchEvent(
      new CustomEvent('pawth:post-selected', {
        detail: { date },
      }),
    );
  }

  refresh(selectedDate = null) {
    const posts = this.posts();

    if (!posts.length) {
      this.disableNavigation();
      return;
    }

    const currentDate =
      selectedDate || document.getElementById('daily-post-date')?.textContent;

    const currentIndex = posts.findIndex(
      (post) => post.dataset.date === currentDate,
    );

    // 表示中の日記が現在のカレンダー月に存在しない
    if (currentIndex === -1) {
      this.disableNavigation();
      return;
    }

    this.setDisabled(this.prevButtonTarget, currentIndex === 0);

    this.setDisabled(this.nextButtonTarget, currentIndex === posts.length - 1);
  }

  disableNavigation() {
    this.setDisabled(this.prevButtonTarget, true);
    this.setDisabled(this.nextButtonTarget, true);
  }

  setDisabled(button, disabled) {
    button.disabled = disabled;
  }

  resetPointer() {
    this.pointerStartX = null;
    this.pointerStartY = null;
  }
}
