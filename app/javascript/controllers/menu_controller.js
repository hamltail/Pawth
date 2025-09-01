import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
  static targets = ['sidebar', 'button'];

  connect() {
    this.onDocumentClick = this.handleDocumentClick.bind(this);
    this.onKeydown = this.handleKeydown.bind(this);
    this.onResize = this.syncDesktopState.bind(this);

    document.addEventListener('click', this.onDocumentClick);
    document.addEventListener('keydown', this.onKeydown);
    window.addEventListener('resize', this.onResize);

    this.syncDesktopState();
  }

  disconnect() {
    document.removeEventListener('click', this.onDocumentClick);
    document.removeEventListener('keydown', this.onKeydown);
    window.removeEventListener('resize', this.onResize);
  }

  toggle() {
    if (this.isDesktop()) return; // md以上は常時表示
    this.isOpen() ? this.close() : this.open();
  }

  open() {
    this.sidebarTarget.classList.remove('-translate-x-full');
    this.buttonTarget.classList.add('hidden');
    this.sidebarTarget.setAttribute('aria-hidden', 'false');
    this.buttonTarget.setAttribute('aria-expanded', 'true');
  }

  close() {
    if (this.isDesktop()) return; // md以上は閉じない
    this.sidebarTarget.classList.add('-translate-x-full');
    this.buttonTarget.classList.remove('hidden');
    this.sidebarTarget.setAttribute('aria-hidden', 'true');
    this.buttonTarget.setAttribute('aria-expanded', 'false');
  }

  isOpen() {
    return !this.sidebarTarget.classList.contains('-translate-x-full');
  }

  isDesktop() {
    return window.matchMedia('(min-width: 768px)').matches;
  }

  syncDesktopState() {
    if (this.isDesktop()) {
      this.sidebarTarget.classList.remove('-translate-x-full');
      this.buttonTarget.classList.add('hidden');
    } else {
      this.buttonTarget.classList.remove('hidden');
    }
  }

  handleDocumentClick(e) {
    // サイドバー開状態で、外側クリックなら閉じる
    if (!this.isOpen() || this.isDesktop()) return;

    const clickedInsideSidebar = this.sidebarTarget.contains(e.target);
    const clickedMenuButton = this.buttonTarget.contains(e.target);
    if (clickedInsideSidebar || clickedMenuButton) {
      // sidebar内でも「sidebar-no-close」は閉じない対象
      const noClose = e.target.closest('.sidebar-no-close');
      if (!noClose) return;
    }

    // 外側クリック（またはno-close以外のリンク）で閉じる
    if (!clickedInsideSidebar && !clickedMenuButton) {
      this.close();
      return;
    }

    // サイドバー内のリンククリックで閉じる（no-closeは除外）
    const link = e.target.closest('#sidebar nav a');
    if (link && !link.classList.contains('sidebar-no-close')) {
      this.close();
    }
  }

  handleKeydown(e) {
    if (e.key === 'Escape' && this.isOpen() && !this.isDesktop()) {
      this.close();
    }
  }
}
