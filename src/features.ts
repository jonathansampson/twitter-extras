interface Feature {
  id: string;
  enabled: boolean;
  enable: () => void;
  disable: () => void;
}

interface StorageChanges {
  [key: string]: chrome.storage.StorageChange;
}

interface StorageRecords {
  [key: string]: any;
}

const hideWhatsHappening = {
    id: "hideWhatsHappening",
    enable: () => {
        if ( hideWhatsHappening.enabled ) {
            return;
        }

        const element = document.createElement("style");
        element.id = `feature-${hideWhatsHappening.id}`;
        element.textContent = `
            [data-testid="sidebarColumn"] div:has(> div > section [data-testid="trend"]) {
                display: none;
            }
        `;

        document.head.appendChild(element);
    },
    disable: () => {
        if ( !hideWhatsHappening.enabled ) {
            return;
        }
        document.getElementById(`feature-${hideWhatsHappening.id}`)?.remove();
    },
    get enabled() {
        return document.getElementById(`feature-${hideWhatsHappening.id}`) !== null;
    }
};

const hideWhoToFollow = {
    id: "hideWhoToFollow",
    enable: () => {
        if ( hideWhoToFollow.enabled ) {
            return;
        }

        const element = document.createElement("style");
        element.id = `feature-${hideWhoToFollow.id}`;
        element.textContent = `
            [data-testid="sidebarColumn"] div:has(> div > aside a[href*="/i/connect_people"]) {
                display: none;
            }
        `;

        document.head.appendChild(element);
    },
    disable: () => {
        if ( !hideWhoToFollow.enabled ) {
            return;
        }
        document.getElementById(`feature-${hideWhoToFollow.id}`)?.remove();
    },
    get enabled() {
        return document.getElementById(`feature-${hideWhoToFollow.id}`) !== null;
    }
};

const features = {
  hideWhatsHappening,
  hideWhoToFollow,
} as Record<string, Feature>;

/**
 * Start by setting the initial state of the features
 * based on the storage records. Next, listen for changes
 * to the storage records, and enable/disable features
 * based on the changes.
 */
chrome.storage.local.get(null, setFeatures);
chrome.storage.local.onChanged.addListener(setFeatures);

/**
 * We'll call `setFeatures` when retrieving the initial
 * state of the features, as well as when the storage is
 * updated. For this reason, we'll use a union type to
 * allow for both `StorageRecords` and `StorageChanges`.
 */
function setFeatures(items: StorageRecords | StorageChanges) {
  /**
   * Cycle over all features, and enable/disable them
   * based on the value in `items`, if any.
   */
  for (const featureName in features) {
    if (items.hasOwnProperty(featureName)) {
      const value = items[featureName];
      const newValue = typeof value === "object" ? value.newValue : value;
      if (newValue === true) {
        console.log(`Enabling ${featureName}`);
        features[featureName].enable();
      } else if (newValue === false) {
        console.log(`Disabling ${featureName}`);
        features[featureName].disable();
      }
    }
  }
}
