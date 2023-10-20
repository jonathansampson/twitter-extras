import { Feature, StorageChanges, StorageRecords } from "./types";

import * as downloadVoiceTweets from "./features/downloadVoiceTweets";
import * as hideWhatsHappening from "./features/hideWhatsHappening";
import * as hideWhoToFollow from "./features/hideWhoToFollow";
import * as formatCodeBlocks from "./features/formatCodeBlocks";
import * as timecodes from "./features/timecodes";

const defaultFeatures = [
  /* Downloadable Videos */, /* https://twitter.com/HumansNoContext/status/1660339245607780359 */
  /* Picture-in-Picture */, /* https://twitter.com/HumansNoContext/status/1660339245607780359 */
];

const optionalFeatures = {
  hideWhatsHappening,
  hideWhoToFollow,
  formatCodeBlocks,     /* https://twitter.com/jonathansampson/status/1659603602636259333 */
  downloadVoiceTweets,  /* https://twitter.com/ehikian/status/1659670588598923265 */
  timecodes,            /* https://twitter.com/lexfridman/status/1712170815637061914 */
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
 * Create a mutation observer that will notify features
 * of changes in the DOM.
 */
const observer = new MutationObserver((mutations: MutationRecord[]) => {
  for ( const mutation of mutations ) {
    for ( const [featureName, feature] of Object.entries(optionalFeatures) ) {
      if ( feature.enabled ) {
        if ( feature.onAddedNodes ) {
          feature.onAddedNodes(mutation.addedNodes);
        }
      }
    }
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

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
  for (const featureName in optionalFeatures) {
    if (items.hasOwnProperty(featureName)) {
      const value = items[featureName];
      const newValue = typeof value === "object" ? value.newValue : value;
      if (newValue === true) {
        console.log(`Enabling ${featureName}`);
        optionalFeatures[featureName].enable();
      } else if (newValue === false) {
        console.log(`Disabling ${featureName}`);
        optionalFeatures[featureName].disable();
      }
    }
  }
}