chrome.runtime.onInstalled.addListener(() => {

    const scripts = [
        {
            id: "mediator",
            js: ["mediator.js"],
            matches: ["https://twitter.com/*"],
        },
        {
            id: "mainWorld",
            world: "MAIN",
            js: ["content.js"],
            matches: ["https://twitter.com/*"],
        },
        {
            id: "feature-ultraWide",
            js: ["feature-ultraWide.js"],
            matches: ["https://twitter.com/*"],
        }
    ] as chrome.scripting.RegisteredContentScript[];

    chrome.scripting.registerContentScripts(scripts);

});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    if (message.type === "downloadMedia") {
        const { authorScreenName, tweetId, url } = message.data;
        const filename = `@${authorScreenName}-${tweetId}.mp4`;

        console.log(`Downloading media from ${authorScreenName}`, url, tweetId);

        chrome.downloads.download({ url, filename });

        sendResponse({ success: true });
    }

    return true;

});
