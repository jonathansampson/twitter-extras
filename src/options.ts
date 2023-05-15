document.addEventListener("DOMContentLoaded", () => {
  const checkbox = document.querySelector('[data-feature="ultrawide"]');

  if (checkbox instanceof HTMLInputElement) {
    chrome.storage.local.get("ultrawide", function (data) {
      checkbox.checked = data.ultrawide;
    });

    checkbox.addEventListener("change", (event) => {
      const target = event.target as HTMLInputElement;
      chrome.storage.local.set({ ultrawide: target.checked });
    });
  }
});
