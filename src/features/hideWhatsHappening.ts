import { Feature } from "../types";

const name = "Hide What's Happening";
const identifier = "hideWhatsHappening";
const description = "Hides the What's Happening section on the sidebar.";

let enabled = false;

const enable = () => {
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

const disable = () => {
  if (!enabled) {
    return;
  }

  enabled = false;

  document.getElementById(`feature-${identifier}`)?.remove();
};

const feature: Feature = {
  name,
  identifier,
  description,
  enable,
  disable,
  get enabled() {
    return enabled;
  },
};

export default feature;
