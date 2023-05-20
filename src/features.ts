interface Feature {
  id: string;
  enabled: boolean;
  data?: any;
  enable: () => void;
  disable: () => void;
}

interface StorageChanges {
  [key: string]: chrome.storage.StorageChange;
}

interface StorageRecords {
  [key: string]: any;
}

const hideWhatsHappening: Feature = {
  id: "hideWhatsHappening",
  enable: () => {
    if (hideWhatsHappening.enabled) {
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
    if (!hideWhatsHappening.enabled) {
      return;
    }
    document.getElementById(`feature-${hideWhatsHappening.id}`)?.remove();
  },
  get enabled() {
    return document.getElementById(`feature-${hideWhatsHappening.id}`) !== null;
  },
};

const hideWhoToFollow: Feature = {
  id: "hideWhoToFollow",
  enable: () => {
    if (hideWhoToFollow.enabled) {
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
    if (!hideWhoToFollow.enabled) {
      return;
    }
    document.getElementById(`feature-${hideWhoToFollow.id}`)?.remove();
  },
  get enabled() {
    return document.getElementById(`feature-${hideWhoToFollow.id}`) !== null;
  },
};

const formatCodeBlocks: Feature = {
  id: "formatCodeBlocks",
  enabled: false,
  data: {
    codeBlockRegEx: /(?<!`)(`[^`]*`)(?!`)/g,
    observer: null as null | MutationObserver,
  },
  enable: () => {
    if (formatCodeBlocks.enabled) {
      return;
    }

    formatCodeBlocks.enabled = true;

    const processInlineCode = (box: HTMLElement) => {
      // Create a text walker to access every text node
      const nodes: Text[] = [];
      const walker = document.createTreeWalker(box, NodeFilter.SHOW_TEXT);

      // Collect the nodes
      while (walker.nextNode()) {
        nodes.push(walker.currentNode as Text);
      }

      // Examine each of the nodes
      for (const node of nodes) {
        const text = node.textContent as string;
        const parts = text.split(formatCodeBlocks.data.codeBlockRegEx);

        // Process nodes with code blocks
        if (parts.length > 1) {
          const fragment = document.createDocumentFragment();
          for (const part of parts) {
            if (part.startsWith("`") && part.endsWith("`")) {
              const code = document.createElement("code");

              code.style.padding = "0.15em";
              code.style.fontSize = "0.85em";
              code.style.color = "rgb(255, 127, 80)";

              code.textContent = part.substring(1, part.length - 1);
              fragment.append(code);
              continue;
            }
            fragment.append(document.createTextNode(part));
          }
          node.parentNode?.replaceChild(fragment, node);
        }
      }
    };

    const selector = "[data-testid='tweetText']";

    // Process all existing code blocks
    for (const tweetText of document.querySelectorAll(selector)) {
      if (tweetText instanceof HTMLElement) {
        processInlineCode(tweetText);
      }
    }

    // Listen for, and process, new code blocks
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node instanceof HTMLElement) {
            const tweetText = node.querySelector(selector);
            if (tweetText instanceof HTMLElement) {
              processInlineCode(tweetText);
            }
          }
        }
      }
    });

    formatCodeBlocks.data.observer = observer;
    observer.observe(document.body, { childList: true, subtree: true });
  },
  disable: () => {
    if (!formatCodeBlocks.enabled) {
      return;
    }

    // Disable feature and disconnect the observer
    formatCodeBlocks.enabled = false;
    formatCodeBlocks.data.mutationObserver?.disconnect();
    formatCodeBlocks.data.mutationObserver = null;

    // Revert all code blocks to their original state
    for (const code of document.querySelectorAll("code")) {
      const text = code.textContent as string;
      const content = document.createTextNode(`\`${text}\``);
      code.parentNode?.replaceChild(content, code);
    }
  },
};

const features = {
  hideWhatsHappening,
  hideWhoToFollow,
  formatCodeBlocks,
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
