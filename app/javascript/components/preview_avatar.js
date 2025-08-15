document.addEventListener("change", (e) => {
  const input = e.target.closest("#avatar-input");
  if (!input) return;
  const preview = document.getElementById("avatar-preview");
  if (!preview) return;
  const file = input.files[0];
  if (file) {
    preview.src = URL.createObjectURL(file);
  } else {
    preview.src =
      preview.dataset.defaultSrc || preview.getAttribute("data-default-src");
  }
});
