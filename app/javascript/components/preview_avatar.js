document.addEventListener('turbo:load', () => {
  const input = document.getElementById('avatar-input');
  const preview = document.getElementById('avatar-preview');

  if (input && preview) {
    input.addEventListener('change', (e) => {
      const [file] = e.target.files;
      if (file) {
        preview.src = URL.createObjectURL(file);
        preview.classList.remove('hidden');
        preview.style.display = "";
      }
    });
  }
});
