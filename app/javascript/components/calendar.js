import gsap from "gsap";

document.addEventListener("turbo:load", function() {
  document.querySelectorAll('.gsap-box').forEach(el => {
    el.addEventListener('mouseenter', () => {
      gsap.fromTo(el,
        { scale: 1 },
        { scale: 1.5, duration: 0.15, yoyo: true, repeat: 1, ease: "power1.inOut" }
      );
    });

    el.addEventListener('click', function() {
      const date = this.dataset.date;
      const content = this.dataset.content;
      document.getElementById('daily-post-date').textContent = date;
      document.getElementById('daily-post-content').textContent = content || "投稿がありません。";

      gsap.fromTo("#daily-post-content", 
        { y: -10, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "power1.out" }
      );
    });
  });
});
