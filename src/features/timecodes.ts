import { Feature } from "../types";

const name = "Clickable Timecodes";
const identifier = "timecodes";
const description = "Enables clickable timecodes in Tweets with a video.";

let enabled = false;
let mutationObserver: MutationObserver | null = null;
const timecodeLinkSelector = "a[data-timecode]";
const tweetTextSelector = "[data-testid='tweetText']";
const mediaSelector = "[data-testid='videoComponent'] video";

const enable = () => {
    if (enabled) {
        return;
    }

    enabled = true;

    // Process all existing media elements
    processMediaElements();

    // Listen for, and process, new media elements
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node instanceof HTMLElement) {
                    processMediaElements(node);
                }
            }
        }
    });

    mutationObserver = observer;
    observer.observe(document.body, { childList: true, subtree: true });

    addTimecodeStyles();

    // Delegate click events on timecode links
    document.body.addEventListener("click", (event) => {
        const target = event.target as HTMLAnchorElement;
        if (target.matches(timecodeLinkSelector)) {
            const tweet = target.closest("[data-testid='tweet']");
            const media = tweet?.querySelector(mediaSelector) as HTMLMediaElement;
            if (media) {
                event.preventDefault();
                handleTimestampClick(target, media);
            }
        }
    });

};

const disable = () => {
    if (!enabled) {
        return;
    }

    enabled = false;
    mutationObserver?.disconnect();
    mutationObserver = null;

    removeTimecodeStyles();
    revertTimecodeLinks();

};

const addTimecodeStyles = () => {
    const style = document.createElement("style");

    style.dataset.identifier = identifier;

    style.textContent = `
      ${timecodeLinkSelector} {
        cursor: pointer;
        color: rgb(29, 155, 240);
        text-decoration: none;
      }
    `;

    document.head.appendChild(style);
};

const removeTimecodeStyles = () => {
    const style = document.querySelector(`style[data-identifier='${identifier}']`);
    style?.remove();
};

const processMediaElements = (root: HTMLElement = document.body) => {
    const mediaElements = root.querySelectorAll(mediaSelector);
    for (const media of mediaElements) {
        const tweet = media.closest("[data-testid='tweet']");
        const content = tweet?.querySelector(tweetTextSelector);
        const timestamps = getTimestamps(content?.textContent || "");
        if (media instanceof HTMLMediaElement && timestamps.length >= 2) {
            waitForMediaReady(media, timestamps);
        }
    }
};

function getTimestamps(text: string): string[] {
    /**
     * Matches timestamps in the format of HH:MM:SS, H:MM:SS, MM:SS, or M:SS.
     * Hours (HH or H) can range from 00-23, and minutes (MM or M) and
     * seconds (SS) can range from 00-59.
     */
    const regex = /(?:(?:[01]?[0-9]|2[0-3]):)?[0-5]?[0-9]:[0-5][0-9]/g;
    return text.match(regex) || [];
}

function makeTimecodesClickable(media: HTMLMediaElement, timestamps: string[]) {

    const tweet = media.closest("[data-testid='tweet']");
    const tweetText = tweet?.querySelector("[data-testid='tweetText']");

    if (!tweetText || !tweetText.textContent) {
        return;
    }

    for (const timestamp of timestamps) {
        if (timestampToSeconds(timestamp) > media.duration) {
            continue;
        }
        const timecodeLink = createTimestampLink(timestamp);
        const regex = new RegExp(timestamp, "g");
        tweetText.innerHTML = tweetText.innerHTML.replace(regex, timecodeLink.outerHTML);
    }

}

function waitForMediaReady(media: HTMLMediaElement, timestamps: string[]) {
    if (media.duration) {
        makeTimecodesClickable(media, timestamps);
    } else {
        media.addEventListener("loadedmetadata", () => {
            makeTimecodesClickable(media, timestamps);
        }, { once: true });
    }
}

function createTimestampLink(timestamp: string): HTMLAnchorElement {
    const element = document.createElement("a");
    element.href = "#";
    element.textContent = timestamp;
    element.dataset.timecode = timestamp;
    return element;
}

function handleTimestampClick(timestamp: HTMLAnchorElement, media: HTMLMediaElement) {
    const seconds = timestampToSeconds(timestamp.dataset.timecode ?? "");
    if (seconds > media.duration) {
        return;
    }
    media.currentTime = seconds;
    media.muted = false;
}

function timestampToSeconds(timestamp: string): number {
    const parts = timestamp.split(":").reverse().map(part => parseInt(part, 10));
    const [seconds, minutes = 0, hours = 0] = parts;
    return seconds + (minutes * 60) + (hours * 60 * 60);
}

function revertTimecodeLinks() {
    const timecodeLinks = document.querySelectorAll(timecodeLinkSelector);
    for (const timecodeLink of timecodeLinks) {
        const parent = timecodeLink.parentNode;
        if (parent) {
            const textNode = document.createTextNode(timecodeLink.textContent || "");
            parent.replaceChild(textNode, timecodeLink);
        }
    }
}

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
