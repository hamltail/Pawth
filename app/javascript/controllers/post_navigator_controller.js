import { Controller } from '@hotwired/stimulus';
import { gsap } from 'gsap';
import { createSwipeTracker } from 'lib/swipe';

export default class extends Controller {
  static targets = ['prevButton', 'nextButton', 'card'];

  connect() {
    this.swipe = createSwipeTracker();
    this.isAnimating = false;

    this.handlePostSelected = this.handlePostSelected.bind(this);
    this.handlePostNavigationRequested =
      this.handlePostNavigationRequested.bind(this);
    this.handleCalendarChanged = this.handleCalendarChanged.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);

    document.addEventListener('pawth:post-selected', this.handlePostSelected);

    document.addEventListener(
      'pawth:post-navigation-requested',
      this.handlePostNavigationRequested,
    );

    document.addEventListener(
      'pawth:calendar-changed',
      this.handleCalendarChanged,
    );

    document.addEventListener('keydown', this.handleKeydown);

    this.refresh();
  }

  disconnect() {
    document.removeEventListener(
      'pawth:post-selected',
      this.handlePostSelected,
    );

    document.removeEventListener(
      'pawth:post-navigation-requested',
      this.handlePostNavigationRequested,
    );

    document.removeEventListener(
      'pawth:calendar-changed',
      this.handleCalendarChanged,
    );

    document.removeEventListener('keydown', this.handleKeydown);

    this.finishPageTurn();

    this.swipe?.reset();
    this.swipe = null;
  }

  handlePostSelected(event) {
    const { date } = event.detail;

    if (!date) return;

    this.refresh(date);
  }

  handlePostNavigationRequested(event) {
    const { date } = event.detail;

    if (!date) return;

    const posts = this.posts();
    const post = posts.find((candidate) => candidate.dataset.date === date);

    if (!post) return;

    const currentDate = document.getElementById('daily-post-date')?.textContent;

    if (!currentDate) {
      this.selectPost(post);
      return;
    }

    // 選択中の日記を再度クリックした場合は何もしない
    if (date === currentDate) return;

    this.finishPageTurn();

    // 未来へ進むときはnextと同じく左へ、
    // 過去へ戻るときはpreviousと同じく右へ抜ける
    const direction = date > currentDate ? 'next' : 'previous';

    this.animatePageTurn(post, direction);
  }

  handleCalendarChanged() {
    // 月が変わった時点では、表示中の日記が
    // 新しい月の日記とは限らないため一度無効化する
    this.disableNavigation();
  }

  handleKeydown(event) {
    if (this.isEditableElement(event.target)) return;

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.previous();
      return;
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.next();
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.moveToAdjacentWeek(-1);
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.moveToAdjacentWeek(1);
    }
  }

  previous() {
    this.finishPageTurn();

    const posts = this.posts();
    const currentIndex = this.currentIndex(posts);

    if (currentIndex <= 0) return;

    this.animatePageTurn(posts[currentIndex - 1], 'previous');
  }

  next() {
    this.finishPageTurn();

    const posts = this.posts();
    const currentIndex = this.currentIndex(posts);

    if (currentIndex === -1 || currentIndex >= posts.length - 1) return;

    this.animatePageTurn(posts[currentIndex + 1], 'next');
  }

  moveToAdjacentWeek(direction) {
    this.finishPageTurn();

    const posts = this.posts();
    const currentIndex = this.currentIndex(posts);

    if (currentIndex === -1) return;

    const currentPost = posts[currentIndex];
    const currentDate = this.parseDate(currentPost.dataset.date);
    const currentWeekIndex = this.calendarWeekIndex(currentDate);

    const targetWeekPosts = this.findNextPostedWeek(
      posts,
      currentWeekIndex,
      direction,
    );

    if (!targetWeekPosts.length) return;

    const currentColumn = this.calendarColumnIndex(currentDate);

    const targetPost = targetWeekPosts.reduce((nearestPost, post) => {
      const nearestDate = this.parseDate(nearestPost.dataset.date);
      const postDate = this.parseDate(post.dataset.date);

      const nearestColumnDistance = Math.abs(
        this.calendarColumnIndex(nearestDate) - currentColumn,
      );
      const postColumnDistance = Math.abs(
        this.calendarColumnIndex(postDate) - currentColumn,
      );

      if (postColumnDistance < nearestColumnDistance) {
        return post;
      }

      if (postColumnDistance > nearestColumnDistance) {
        return nearestPost;
      }

      const nearestDateDistance = Math.abs(nearestDate - currentDate);
      const postDateDistance = Math.abs(postDate - currentDate);

      return postDateDistance < nearestDateDistance ? post : nearestPost;
    });

    this.animatePageTurn(targetPost, direction < 0 ? 'previous' : 'next');
  }

  findNextPostedWeek(posts, currentWeekIndex, direction) {
    const weekIndexes = posts
      .map((post) => this.calendarWeekIndex(this.parseDate(post.dataset.date)))
      .filter((weekIndex) =>
        direction < 0
          ? weekIndex < currentWeekIndex
          : weekIndex > currentWeekIndex,
      );

    if (!weekIndexes.length) return [];

    const targetWeekIndex =
      direction < 0 ? Math.max(...weekIndexes) : Math.min(...weekIndexes);

    return posts.filter((post) => {
      const postDate = this.parseDate(post.dataset.date);

      return this.calendarWeekIndex(postDate) === targetWeekIndex;
    });
  }

  calendarWeekIndex(date) {
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);

    // JavaScriptは日曜=0なので、月曜=0へ変換する
    const leadingEmptyCells = (firstDayOfMonth.getDay() + 6) % 7;
    const gridIndex = leadingEmptyCells + date.getDate() - 1;

    return Math.floor(gridIndex / 7);
  }

  calendarColumnIndex(date) {
    // 月曜=0、火曜=1、...、日曜=6
    return (date.getDay() + 6) % 7;
  }

  parseDate(dateString) {
    const [year, month, day] = dateString.split('-').map(Number);

    return new Date(year, month - 1, day);
  }

  isEditableElement(element) {
    if (!(element instanceof Element)) return false;

    return (
      element.matches('input, textarea, select') || element.isContentEditable
    );
  }

  handlePointerDown(event) {
    this.swipe?.start(event);
  }

  handlePointerUp(event) {
    const direction = this.swipe?.finish(event);

    if (direction === 'left') {
      this.next();
      return;
    }

    if (direction === 'right') {
      this.previous();
    }
  }

  handlePointerCancel() {
    this.swipe?.reset();
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

  animatePageTurn(post, direction) {
    if (!post || !this.hasCardTarget) return;

    this.isAnimating = true;

    const card = this.cardTarget;
    const page = card.cloneNode(true);
    const isNext = direction === 'next';

    page.removeAttribute('data-post-navigator-target');
    page.removeAttribute('id');

    page.querySelectorAll('[id]').forEach((element) => {
      element.removeAttribute('id');
    });

    page.classList.add('pointer-events-none');

    Object.assign(page.style, {
      position: 'absolute',
      inset: '0',
      width: '100%',
      height: '100%',
      margin: '0',
      zIndex: '10',
    });

    card.style.position = 'relative';
    card.appendChild(page);

    this.pageTurnLayer = page;

    // 古い日記カードを上に残したまま、
    // 下にある本物のカードを次の日記へ切り替える
    this.selectPost(post);

    gsap.set(page, {
      xPercent: 0,
      y: 0,
      rotationZ: 0,
      scale: 1,
      opacity: 1,
      transformOrigin: isNext ? '0% 50%' : '100% 50%',
    });

    gsap.to(page, {
      xPercent: isNext ? -105 : 105,
      y: 6,
      rotationZ: isNext ? -1.5 : 1.5,
      scale: 0.985,
      opacity: 0,
      duration: 0.44,
      ease: 'power2.inOut',
      onComplete: () => {
        this.removePageTurnLayer();
        this.isAnimating = false;
      },
    });
  }

  finishPageTurn() {
    if (!this.pageTurnLayer) {
      this.isAnimating = false;
      return;
    }

    gsap.killTweensOf(this.pageTurnLayer);
    this.pageTurnLayer.remove();
    this.pageTurnLayer = null;
    this.isAnimating = false;
  }

  removePageTurnLayer() {
    if (!this.pageTurnLayer) return;

    gsap.killTweensOf(this.pageTurnLayer);
    this.pageTurnLayer.remove();
    this.pageTurnLayer = null;
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

    contentEl.scrollTop = 0;

    this.refresh(date);

    // 右側の日記移動とカレンダーの選択中マークを同期し、
    // キーボード・スワイプによる移動では選択マークもアニメーションする
    document.dispatchEvent(
      new CustomEvent('pawth:post-selected', {
        detail: {
          date,
          animateMark: true,
        },
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
}
