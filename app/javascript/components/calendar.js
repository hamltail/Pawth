document.addEventListener("turbo:load", function() {
  document.querySelectorAll('span[data-date]').forEach(el => {
    el.addEventListener('click', function() {
      const date = this.dataset.date;
      const content = this.dataset.content;
      document.getElementById('daily-post-date').textContent = date;
      document.getElementById('daily-post-content').textContent = content || "まだ投稿がありません。";
    });
  });
});
