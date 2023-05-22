import { Feature } from "../types";
import * as utils from "../utils";

const name = "Download Voice Tweets";
const identifier = "downloadVoiceTweets";
const description = "Adds a download button on voice tweet menus.";

let enabled = false;
let ourButton: HTMLElement | null = null;
let mutationObserver: MutationObserver | null = null;

const createMenuButton = (dropdown: HTMLElement, onClick: () => void) => {
    const divMenuItem = dropdown.querySelector("div[role='menuitem']");
    const newMenuItem = divMenuItem!.cloneNode(true) as HTMLElement;

    newMenuItem.querySelector("svg > g > path")?.setAttribute(
        "d",
        `
        M11.99 16l-5.7-5.7L7.7 8.88l3.29 3.3V2.59h2v9.59l3.3-3.3 
        1.41 1.42-5.71 5.7zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 
        2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 
        .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z`
    );

    newMenuItem.querySelector("div > span")!.textContent = "Download Voice Tweet";
    newMenuItem.addEventListener("click", onClick);

    ourButton = newMenuItem;

    dropdown.appendChild(newMenuItem);
};

const isVoiceTweetEngaged = () => {
    const element = utils.getTweetElementForActiveMenu();
    const voiceTweet = element?.querySelector("[aria-label='Voice Tweet']");
    if (voiceTweet) {
        return true;
    }
    return false;
};

async function saveVoiceInfo() {

    const { properties } = await utils.mainWorldRequest({
        type: "getVoiceInfo",
        data: { tweetID: utils.getTweetIDForActiveMenu() },
    });

    if (properties) {
        const tweetID = properties.id_str;
        const screenName = properties.user.screen_name;

        const variants = properties.extended_entities.media[0].video_info.variants;
        const highestBitrate = variants.reduce((prev: any, current: any) => {
            return (prev.bitrate || 0) > (current.bitrate || 0) ? prev : current;
        }, {} as any);

        const filename = `@${screenName}-${tweetID}.mp4`;
        const downloadUrl = highestBitrate.url;

        utils.requestSaveFile(filename, downloadUrl);
    }

    // Send Escape key to close menu
    utils.sendEscapeKey(ourButton!);

};

const enable = () => {
    if (enabled) {
        return;
    }

    enabled = true;

    mutationObserver = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node instanceof HTMLElement) {

                    const dropdown = node.querySelector(
                        "#layers [data-testid='Dropdown']"
                    );

                    if (dropdown instanceof HTMLElement) {
                        if (isVoiceTweetEngaged()) {
                            createMenuButton(dropdown, saveVoiceInfo);
                        }
                    }

                }
            }
        }
    });

    mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
    });
};

const disable = () => {
    if (!enabled) {
        return;
    }

    enabled = false;
    mutationObserver?.disconnect();
    mutationObserver = null;
    ourButton = null;
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
