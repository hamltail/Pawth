import gsap from "gsap";

function bindPawEvents() {
  document.querySelectorAll(".paw.paw--posted").forEach((el) => {
    el.addEventListener("mouseenter", () => {
      gsap.fromTo(
        el,
        { scale: 1 },
        {
          scale: 1.5,
          duration: 0.15,
          yoyo: true,
          repeat: 1,
          ease: "power1.inOut",
        },
      );
    });

    el.addEventListener("click", (e) => {
      const target = e.currentTarget;
      const date = target.dataset.date;
      const content = target.dataset.content;
      document.getElementById("daily-post-date").textContent = date;
      document.getElementById("daily-post-content").textContent =
        content || "投稿がありません。";

      gsap.fromTo(
        "#daily-post-content",
        { y: -10, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "power1.out" },
      );
    });
  });
}

function fadeInPaws() {
  const paws = document.querySelectorAll("svg.paw.paw--posted");
  if (!paws.length) return;

  gsap.fromTo(
    paws,
    { opacity: 0, y: -10 },
    {
      opacity: 1,
      y: 0,
      duration: 1.5,
      ease: "power1.out",
      stagger: 0.03,
    },
  );
}

const onLoad = () => {
  bindPawEvents();
  fadeInPaws();
};

document.addEventListener("turbo:load", onLoad);
document.addEventListener("turbo:frame-load", onLoad);
