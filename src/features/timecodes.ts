import { Feature } from "../types";

const name = "Clickable Timecodes";
const identifier = "timecodes";
const description = "Enables clickable timecodes in Tweets with a video.";

let enabled = false;
let mutationObserver: MutationObserver | null = null;
const timecodeLinkSelector = "a[data-timecode]";
const tweetTextSelector = "[data-testid='tweetText']";
const mediaSelector = `[data-testid='tweet'] [data-testid='videoComponent'] video`;

/**
 * Test URLs:
 * - https://twitter.com/theallinpod/status/1712871157685199032
 * - https://twitter.com/TuckerCarlson (any Tweet with follow-up timecodes)
 * - https://twitter.com/TuckerCarlson/status/1714827415241867538
 */

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
            const media = document.querySelector(`[src='${target.dataset.videoSrc}']`);
            if (media instanceof HTMLMediaElement) {
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

const processMediaElements = async (root: HTMLElement = document.body) => {
    const mediaElements = root.querySelectorAll(mediaSelector);
    for (const media of mediaElements) {
        if (media instanceof HTMLMediaElement) {
            await mediaReady(media);

            /**
             * Locate timecode-tweet. It could be the same Tweet as the
             * media itself, or it could be in a follow-up Tweet (as is
             * the case with @TuckerCarlson often times).
             */
            const mediaTweet = media.closest("[data-testid='tweet']");
            const mediaTweetText = mediaTweet?.querySelector(tweetTextSelector);
            const mediaTimestamps = getTimestamps(mediaTweetText?.textContent || "");

            if (mediaTweet instanceof HTMLElement && mediaTimestamps.length >= 2) {
                activateMediaTimeStamps(media, mediaTweet, mediaTimestamps);
                return;
            }

            /**
             * If we don't find timecodes in the media Tweet, we'll look
             * in the next Tweet in the thread. If the next element doesn't
             * exist, or doesn't have a Tweet format, then we'll proceed to
             * the next media element. We will only check, at most, the next
             * two elements after the main media-containing Tweet.
             */
            let depth = 0;
            let mediaContainer = media.closest("[data-testid='cellInnerDiv']")?.nextElementSibling;

            while (depth < 2 && mediaContainer && !mediaContainer?.querySelector("[data-testid='tweet']")) {
                depth += 1;
                mediaContainer = mediaContainer?.nextElementSibling;
            }

            const nextTweet = mediaContainer?.querySelector("[data-testid='tweet']");
            const nextTweetText = nextTweet?.querySelector(tweetTextSelector);
            const nextTweetTimestamps = getTimestamps(nextTweetText?.textContent || "");

            if (nextTweet instanceof HTMLElement && nextTweetTimestamps.length >= 2) {
                activateMediaTimeStamps(media, nextTweet, nextTweetTimestamps);
                return;
            }
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

function activateMediaTimeStamps(media: HTMLMediaElement, tweet: HTMLElement, timestamps: string[]) {

    const tweetText = tweet.querySelector(tweetTextSelector);

    if (!tweetText || !tweetText.textContent) {
        return;
    }

    for (const timestamp of timestamps) {
        if (timestampToSeconds(timestamp) > media.duration) {
            continue;
        }

        const timecodeLink = createTimestampLink(timestamp);

        timecodeLink.dataset.videoSrc = media.src;

        const regex = new RegExp(timestamp);
        tweetText.innerHTML = tweetText.innerHTML.replace(regex, timecodeLink.outerHTML);
    }

}

async function mediaReady(media: HTMLMediaElement): Promise<boolean> {
    if (media.duration) {
        return true;
    }
    return new Promise((resolve) => {
        media.addEventListener("loadedmetadata", () => {
            resolve(true);
        }, { once: true });
    });
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
