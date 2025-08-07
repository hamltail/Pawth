window.toggleSidebar = function () {
  const sidebar = document.getElementById("sidebar");
  const menuButton = document.getElementById("menu-button");
  sidebar.classList.toggle("-translate-x-full");

  if (sidebar.classList.contains("-translate-x-full")) {
    menuButton.style.display = "block";
  } else {
    menuButton.style.display = "none";
  }
}
