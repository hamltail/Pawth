import { Controller } from '@hotwired/stimulus';

const STORAGE_KEY = 'pawth-theme';
const THEMES = ['light', 'dark', 'system'];

export default class extends Controller {
  static targets = ['option', 'trigger', 'triggerIcon', 'panel'];

  connect() {
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.handleSystemThemeChange = this.handleSystemThemeChange.bind(this);
    this.handleOutsidePointerDown = this.handleOutsidePointerDown.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);

    this.mediaQuery.addEventListener('change', this.handleSystemThemeChange);
    document.addEventListener('pointerdown', this.handleOutsidePointerDown);
    document.addEventListener('keydown', this.handleKeydown);

    this.apply(this.currentTheme());
    this.close();
  }

  disconnect() {
    this.mediaQuery?.removeEventListener(
      'change',
      this.handleSystemThemeChange,
    );

    document.removeEventListener('pointerdown', this.handleOutsidePointerDown);
    document.removeEventListener('keydown', this.handleKeydown);
  }

  toggle() {
    if (!this.hasPanelTarget) return;

    if (this.panelTarget.classList.contains('hidden')) {
      this.open();
    } else {
      this.close();
    }
  }

  open() {
    if (!this.hasPanelTarget) return;

    this.panelTarget.classList.remove('hidden');
    this.panelTarget.classList.add('flex');
    this.panelTarget.hidden = false;
    this.triggerTarget.setAttribute('aria-expanded', 'true');
  }

  close() {
    if (!this.hasPanelTarget) return;

    this.panelTarget.classList.remove('flex');
    this.panelTarget.classList.add('hidden');
    this.panelTarget.hidden = true;
    this.triggerTarget.setAttribute('aria-expanded', 'false');
  }

  select(event) {
    const theme = event.currentTarget.dataset.theme;

    if (!THEMES.includes(theme)) return;

    localStorage.setItem(STORAGE_KEY, theme);
    this.apply(theme);
    this.close();
    this.triggerTarget.focus();
  }

  handleOutsidePointerDown(event) {
    if (!this.element.contains(event.target)) {
      this.close();
    }
  }

  handleKeydown(event) {
    if (
      event.key === 'Escape' &&
      this.hasPanelTarget &&
      !this.panelTarget.classList.contains('hidden')
    ) {
      this.close();
      this.triggerTarget.focus();
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

    this.updateOptions(theme);
    this.updateTrigger(theme);
  }

  handleSystemThemeChange() {
    if (this.currentTheme() !== 'system') return;

    this.apply('system');
  }

  updateTrigger(theme) {
    if (!this.hasTriggerIconTarget) return;

    const selected = this.optionTargets.find(
      (option) => option.dataset.theme === theme,
    );

    const svg = selected?.querySelector('svg');

    if (!svg) return;

    this.triggerIconTarget.replaceChildren(svg.cloneNode(true));
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
