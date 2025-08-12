import gsap from "gsap";

document.addEventListener("turbo:load", function () {
  const checkbox = document.getElementById("toggle-public-profile");
  const label = document.getElementById("public-profile-label");
  const bar = document.getElementById("toggle-bar");

  function updateLabel() {
    if (checkbox.checked) {
      label.textContent = "公開";
      label.classList.remove("text-red-500");
      label.classList.add("text-green-500");
      gsap.to(bar, { backgroundColor: "#2dd4bf", duration: 0 });
    } else {
      label.textContent = "非公開";
      label.classList.remove("text-green-500");
      label.classList.add("text-red-500");
      gsap.to(bar, { backgroundColor: "#d1d5db", duration: 0 });
    }
  }

  if (checkbox && label) {
    checkbox.addEventListener("change", updateLabel);
    updateLabel();
  }
});
