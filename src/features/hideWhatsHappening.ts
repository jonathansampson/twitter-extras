export const name = "Hide What's Happening";
export const identifier = "hideWhatsHappening";
export const description = "Hides the What's Happening section on the sidebar.";

export let enabled = false;

export const enable = () => {
  if (enabled) {
    return;
  }

  enabled = true;

  const element = document.createElement("style");

  element.id = `feature-${identifier}`;
  element.textContent = `
    [data-testid="sidebarColumn"] div:has(> div > section [data-testid="trend"]) {
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
