import { Feature } from "../types";

const name = "Hide Who to Follow";
const identifier = "hideWhoToFollow";
const description = "Hides the Who to Follow section on the sidebar.";

let enabled = false;

const enable = () => {
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
