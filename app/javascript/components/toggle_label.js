document.addEventListener("turbo:load", function() {
  const checkbox = document.getElementById("toggle-public-profile");
  const label = document.getElementById("public-profile-label");

  if (checkbox && label) {
    checkbox.addEventListener("change", function() {
      label.textContent = checkbox.checked ? "公開" : "非公開";
    });
    label.textContent = checkbox.checked ? "公開" : "非公開";
  }
});
