document.addEventListener("turbo:load", () => {
  const postsContainer = document.querySelector("#posts");
  if (!postsContainer) return;

  postsContainer.style.opacity = 0;
  postsContainer.style.transition = "opacity 1.5s ease";

  requestAnimationFrame(() => {
    postsContainer.style.opacity = 1;
  });
});
