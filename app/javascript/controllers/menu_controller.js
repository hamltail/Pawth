import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
  static targets = ['sidebar', 'button'];

  connect() {
    this.onDocumentClick = this.handleDocumentClick.bind(this);
    this.onKeydown = this.handleKeydown.bind(this);
    this.mq = window.matchMedia('(min-width: 768px)');
    this.onMqlChange = this.handleBreakpointChange.bind(this);

    document.addEventListener('click', this.onDocumentClick);
    document.addEventListener('keydown', this.onKeydown);
    this.mq.addEventListener('change', this.onMqlChange);

    this.syncDesktopState();
  }

  disconnect() {
    document.removeEventListener('click', this.onDocumentClick);
    document.removeEventListener('keydown', this.onKeydown);
    this.mq.removeEventListener('change', this.onMqlChange);
  }

  toggle() {
    if (this.isDesktop()) return; // md以上は常時表示
    this.isOpen() ? this.close() : this.open();
  }

  applyState({ open, desktop }) {
    this.sidebarTarget.classList.toggle('-translate-x-full', !open);
    this.buttonTarget.classList.toggle('hidden', open);
    this.sidebarTarget.setAttribute('aria-hidden', open ? 'false' : 'true');
    this.buttonTarget.setAttribute('aria-expanded', open ? 'true' : 'false');

    if (desktop && open) {
      this.sidebarTarget.classList.remove('-translate-x-full');
      this.buttonTarget.classList.add('hidden');
    }
  }

  open() {
    this.applyState({ open: true, desktop: this.isDesktop() });
  }

  close() {
    if (this.isDesktop()) return;
    this.applyState({ open: false, desktop: this.isDesktop() });
  }

  isOpen() {
    return !this.sidebarTarget.classList.contains('-translate-x-full');
  }

  isDesktop() {
    return this.mq.matches;
  }

  syncDesktopState() {
    this.applyState({ open: this.isDesktop(), desktop: this.isDesktop() });
  }

  handleBreakpointChange(e) {
    if (e.matches) {
      this.sidebarTarget.classList.remove('-translate-x-full');
      this.buttonTarget.classList.add('hidden');
      this.sidebarTarget.setAttribute('aria-hidden', 'false');
      this.buttonTarget.setAttribute('aria-expanded', 'true');
    } else {
      this.close();
    }
  }

  handleDocumentClick(e) {
    if (!this.isOpen() || this.isDesktop()) return;

    const insideSidebar = this.sidebarTarget.contains(e.target);
    const onMenuButton = this.buttonTarget.contains(e.target);
    const noClose = e.target.closest('.sidebar-no-close');

    // 外クリック
    if (!insideSidebar && !onMenuButton) return this.close();

    // サイドバー内リンククリック（no-close除外）
    const link = e.target.closest('#sidebar nav a');
    if (link && !noClose) this.close();
  }

  handleKeydown(e) {
    if (e.key === 'Escape' && this.isOpen() && !this.isDesktop()) {
      this.close();
    }
  }
}
