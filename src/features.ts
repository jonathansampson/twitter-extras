import { Feature, StorageChanges, StorageRecords } from "./types";

import downloadVoiceTweets from "./features/downloadVoiceTweets";
import hideWhatsHappening from "./features/hideWhatsHappening";
import hideWhoToFollow from "./features/hideWhoToFollow";
import formatCodeBlocks from "./features/formatCodeBlocks";

const defaultFeatures = [
  /* Downloadable Videos */, /* https://twitter.com/HumansNoContext/status/1660339245607780359 */
  /* Picture-in-Picture */, /* https://twitter.com/HumansNoContext/status/1660339245607780359 */
];

const optionalFeatures = {
  hideWhatsHappening,
  hideWhoToFollow,
  formatCodeBlocks,     /* https://twitter.com/jonathansampson/status/1659603602636259333 */
  downloadVoiceTweets,  /* https://twitter.com/ehikian/status/1659670588598923265 */
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