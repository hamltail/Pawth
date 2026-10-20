import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
  static targets = ['sidebar', 'button', 'main'];

  connect() {
    this.mq = window.matchMedia('(min-width: 1024px)');
    this.opened = this.mq.matches;

    this.onDocumentClick = this.handleDocumentClick.bind(this);
    this.onMqlChange = this.handleBreakpointChange.bind(this);

    document.addEventListener('click', this.onDocumentClick);
    this.mq.addEventListener('change', this.onMqlChange);

    this.render();
  }

  disconnect() {
    document.removeEventListener('click', this.onDocumentClick);
    this.mq.removeEventListener('change', this.onMqlChange);

    document.body.classList.remove('overflow-hidden');
  }

  open() {
    this.opened = true;
    this.render();
  }

  close() {
    if (!this.opened) return;

    this.opened = false;
    this.render();
    this.buttonTarget.focus();
  }

  isDesktop() {
    return this.mq.matches;
  }

  render() {
    this.sidebarTarget.classList.toggle('-translate-x-full', !this.opened);

    this.sidebarTarget.classList.toggle('translate-x-0', this.opened);

    this.buttonTarget.classList.toggle('hidden', this.opened);

    this.mainTarget.classList.toggle(
      'lg:ml-64',
      this.isDesktop() && this.opened,
    );

    this.sidebarTarget.setAttribute('aria-hidden', String(!this.opened));

    this.sidebarTarget.inert = !this.opened;

    this.buttonTarget.setAttribute('aria-expanded', String(this.opened));

    document.body.classList.toggle(
      'overflow-hidden',
      !this.isDesktop() && this.opened,
    );
  }

  handleBreakpointChange() {
    this.opened = this.isDesktop();
    this.render();
  }

  handleDocumentClick(event) {
    if (this.isDesktop() || !this.opened) return;

    const insideSidebar = this.sidebarTarget.contains(event.target);
    const onMenuButton = this.buttonTarget.contains(event.target);

    if (!insideSidebar && !onMenuButton) {
      this.close();
      return;
    }

    const link = event.target.closest('#sidebar nav a');

    if (link && !link.closest('.sidebar-no-close')) {
      this.close();
    }
  }
}
