document.addEventListener("DOMContentLoaded", () => {
  // Set initial state of feature boxes, as well
  // as bind their change handlers
  const features = document.querySelectorAll("[data-feature]");

  for (const feature of features) {
    if (feature instanceof HTMLInputElement) {
      const featureName = feature.dataset.feature!;
      // Sets initial state from storage
      chrome.storage.local.get(featureName, (data) => {
        feature.checked = data[featureName];
      });
      // Binds change handler for element
      feature.addEventListener("change", (event) => {
        chrome.storage.local.set({ [featureName]: feature.checked });
      });
    }
  }
});
