import { Controller } from '@hotwired/stimulus';

const STORAGE_KEY = 'pawth-theme';
const THEMES = ['light', 'dark', 'system'];

export default class extends Controller {
  static targets = ['option'];

  connect() {
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.handleSystemThemeChange = this.handleSystemThemeChange.bind(this);

    this.mediaQuery.addEventListener('change', this.handleSystemThemeChange);

    this.apply(this.currentTheme());
  }

  disconnect() {
    this.mediaQuery?.removeEventListener(
      'change',
      this.handleSystemThemeChange,
    );
  }

  select(event) {
    const theme = event.currentTarget.dataset.theme;

    if (!THEMES.includes(theme)) return;

    localStorage.setItem(STORAGE_KEY, theme);
    this.apply(theme);
  }

  currentTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEY);

    return THEMES.includes(savedTheme) ? savedTheme : 'system';
  }

  apply(theme) {
    const resolvedTheme =
      theme === 'system' ? (this.mediaQuery.matches ? 'dark' : 'light') : theme;

    document.documentElement.dataset.theme = resolvedTheme;
    document.documentElement.dataset.themePreference = theme;

    this.updateOptions(theme);
  }

  handleSystemThemeChange() {
    if (this.currentTheme() !== 'system') return;

    this.apply('system');
  }

  updateOptions(theme) {
    if (!this.hasOptionTarget) return;

    this.optionTargets.forEach((option) => {
      const selected = option.dataset.theme === theme;

      option.setAttribute('aria-pressed', String(selected));

      option.classList.toggle('bg-brand', selected);
      option.classList.toggle('text-white', selected);

      option.classList.toggle('text-muted', !selected);
      option.classList.toggle('hover:bg-surface-muted', !selected);
    });
  }
}
