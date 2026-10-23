import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
  static targets = ['raw', 'month', 'day', 'weekday'];

  connect() {
    this.updateDisplay();

    this.observer = new MutationObserver(() => {
      this.updateDisplay();
    });

    this.observer.observe(this.rawTarget, {
      childList: true,
      characterData: true,
      subtree: true,
    });
  }

  disconnect() {
    this.observer?.disconnect();
    this.observer = null;
  }

  updateDisplay() {
    const value = this.rawTarget.textContent.trim();
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

    if (!match) return;

    const [, year, month, day] = match;

    const date = new Date(
      Date.UTC(Number(year), Number(month) - 1, Number(day)),
    );

    if (
      Number.isNaN(date.getTime()) ||
      date.toISOString().slice(0, 10) !== value
    ) {
      return;
    }

    this.monthTarget.textContent = new Intl.DateTimeFormat('en-US', {
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    })
      .format(date)
      .toUpperCase();

    this.dayTarget.textContent = String(date.getUTCDate());
    this.dayTarget.dateTime = value;

    this.weekdayTarget.textContent = new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      timeZone: 'UTC',
    })
      .format(date)
      .toUpperCase();

    this.updateWeekdayColor(value);
  }

  updateWeekdayColor(value) {
    const mark = Array.from(
      document.querySelectorAll('#calendar .calendar-mark--posted'),
    ).find((element) => element.dataset.date === value);

    const weekdayClass = mark?.dataset.weekdayClass;

    const allowedClasses = [
      'theme-link',
      'calendar-saturday',
      'calendar-sunday',
    ];

    // 選択中の日記が表示月の外にある場合は、
    // サーバーが設定した初期色を維持する
    if (!allowedClasses.includes(weekdayClass)) return;

    this.weekdayTarget.classList.remove(...allowedClasses);
    this.weekdayTarget.classList.add(weekdayClass);
  }
}
