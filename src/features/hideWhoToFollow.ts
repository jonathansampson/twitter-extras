export const name = "Hide Who to Follow";
export const identifier = "hideWhoToFollow";
export const description = "Hides the Who to Follow section on the sidebar.";

export let enabled = false;

export const enable = () => {
  if (enabled) {
    return;
  }

  enabled = true;

  const element = document.createElement("style");
  element.id = `feature-${identifier}`;
  element.textContent = `
          [data-testid="sidebarColumn"] div:has(> div > aside a[href*="/i/connect_people"]) {
              display: none;
          }
      `;

  document.head.appendChild(element);
};

export const disable = () => {
  if (!enabled) {
    return;
  }

  enabled = false;

  document.getElementById(`feature-${identifier}`)?.remove();
};
