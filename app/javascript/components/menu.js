window.toggleSidebar = () => {
  const sidebar = document.getElementById('sidebar');
  const menuButton = document.getElementById('menu-button');
  sidebar.classList.toggle('-translate-x-full');
  
  if (sidebar.classList.contains('-translate-x-full')) {
    menuButton.classList.remove('hidden');
  } else {
    menuButton.classList.add('hidden');
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.getElementById('sidebar');
  const menuButton = document.getElementById('menu-button');

  document.addEventListener('click', (e) => {
    const sidebarVisible = !sidebar.classList.contains('-translate-x-full');
    const clickedSidebar = sidebar.contains(e.target);
    const clickedMenuButton = menuButton.contains(e.target);

    if (sidebarVisible && !clickedSidebar && !clickedMenuButton) {
      sidebar.classList.add('-translate-x-full');
      menuButton.classList.remove('hidden');
    }
  });

  document.querySelectorAll('#sidebar nav a').forEach(link => {
    link.addEventListener('click', (e) => {
      sidebar.classList.add('-translate-x-full');
      menuButton.classList.remove('hidden');
      e.stopPropagation();
    });
  });
});
