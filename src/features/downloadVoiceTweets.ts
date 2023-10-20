import * as utils from "../utils";

export const name = "Download Voice Tweets";
export const identifier = "downloadVoiceTweets";
export const description = "Adds a download button on voice tweet menus.";

const menuItemSelector = "div[role='menuitem']";
const voicePostElementSelector = "[aria-label='Voice post']";
const menuElementSelector = "#layers [data-testid='Dropdown']";
const downloadVoicePostLabel = "Download Voice Post";

export let enabled = false;
let ourButton: HTMLElement | null = null;

export const enable = () => {
    if (enabled) {
        return;
    }

    enabled = true;
};

export const disable = () => {
    if (!enabled) {
        return;
    }

    enabled = false;
    ourButton = null;
};

export const onAddedNodes = (nodes: NodeList) => {
    if (!enabled) {
        return;
    }
    for (const node of nodes) {
        if (node instanceof HTMLElement) {
            const menu = node.querySelector(menuElementSelector);
            if (menu instanceof HTMLElement) {
                if (isVoiceTweetEngaged()) {
                    createMenuButton(menu, saveVoiceInfo);
                }
            }
        }
    }
}

const createMenuButton = (dropdown: HTMLElement, onClick: () => void) => {
    const divMenuItem = dropdown.querySelector(menuItemSelector);
    const newMenuItem = divMenuItem!.cloneNode(true) as HTMLElement;

    newMenuItem.querySelector("svg > g > path")?.setAttribute(
        "d",
        `
        M11.99 16l-5.7-5.7L7.7 8.88l3.29 3.3V2.59h2v9.59l3.3-3.3 
        1.41 1.42-5.71 5.7zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 
        2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 
        .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z`
    );

    newMenuItem.querySelector("div > span")!.textContent = downloadVoicePostLabel;
    newMenuItem.addEventListener("click", onClick);

    ourButton = newMenuItem;

    dropdown.appendChild(newMenuItem);
};

const isVoiceTweetEngaged = () => {
    const element = utils.getTweetElementForActiveMenu();
    const voiceTweet = element?.querySelector(voicePostElementSelector);
    if (voiceTweet) {
        return true;
    }
    return false;
};

async function saveVoiceInfo() {

    const { properties } = await utils.mainWorldRequest({
        type: "getVoiceInfo",
        data: { tweetID: await utils.getTweetIDForActiveMenu() },
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
