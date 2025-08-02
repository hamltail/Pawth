import gsap from "gsap";

document.addEventListener("turbo:load", function() {
  const checkbox = document.getElementById("toggle-public-profile");
  const label = document.getElementById("public-profile-label");
  const bar = document.getElementById("toggle-bar");

  function updateLabel() {
    if (checkbox.checked) {
      label.textContent = "公開";
      label.classList.remove("text-red-700");
      label.classList.add("text-green-700");
      gsap.to(bar, { backgroundColor: "#3b82f6", duration: 0.3 });
    } else {
      label.textContent = "非公開";
      label.classList.remove("text-green-700");
      label.classList.add("text-red-700");
      gsap.to(bar, { backgroundColor: "#d1d5db", duration: 0.3 });
    }
  }

  if (checkbox && label) {
    checkbox.addEventListener("change", updateLabel);
    updateLabel();
  }
});
