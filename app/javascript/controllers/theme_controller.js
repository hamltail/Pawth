import { Controller } from '@hotwired/stimulus';

const STORAGE_KEY = 'pawth-theme';
const THEMES = ['light', 'dark', 'system'];

export default class extends Controller {
  static targets = ['menu', 'label', 'option'];

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

  toggleMenu() {
    if (!this.hasMenuTarget) return;

    this.menuTarget.classList.toggle('hidden');
  }

  select(event) {
    const theme = event.currentTarget.dataset.theme;

    if (!THEMES.includes(theme)) return;

    localStorage.setItem(STORAGE_KEY, theme);
    this.apply(theme);

    if (this.hasMenuTarget) {
      this.menuTarget.classList.add('hidden');
    }
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

    this.updateLabel(theme);
    this.updateOptions(theme);
  }

  handleSystemThemeChange() {
    if (this.currentTheme() !== 'system') return;

    this.apply('system');
  }

  updateLabel(theme) {
    if (!this.hasLabelTarget) return;

    const labels = {
      light: 'ライト',
      dark: 'ダーク',
      system: 'システム',
    };

    this.labelTarget.textContent = labels[theme];
  }

  updateOptions(theme) {
    if (!this.hasOptionTarget) return;

    this.optionTargets.forEach((option) => {
      const selected = option.dataset.theme === theme;

      option.setAttribute('aria-checked', String(selected));
      option.classList.toggle('text-brand', selected);
      option.classList.toggle('font-bold', selected);
    });
  }
}
