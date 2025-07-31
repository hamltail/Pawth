import gsap from "gsap";

document.addEventListener("turbo:load", function() {
  document.querySelectorAll('span[data-date]').forEach(el => {
    el.addEventListener('click', function() {
      const date = this.dataset.date;
      const content = this.dataset.content;
      document.getElementById('daily-post-date').textContent = date;
      document.getElementById('daily-post-content').textContent = content || "まだ投稿がありません。";

      gsap.fromTo("#daily-post-content", 
        { y: -10, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "power1.out" }
      );
    });
  });
});
