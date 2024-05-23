chrome.runtime.onInstalled.addListener(() => {

    const scripts = [
        {
            id: "mediator",
            js: ["mediator.js"],
            matches: ["https://x.com/*"],
        },
        {
            id: "mainWorld",
            world: "MAIN",
            js: ["content.js"],
            matches: ["https://x.com/*"],
        },
        {
            id: "features",
            js: ["features.js"],
            matches: ["https://x.com/*"],
        }
    ] as chrome.scripting.RegisteredContentScript[];

    chrome.scripting.registerContentScripts(scripts);

});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    if (message.type === "downloadMedia") {
        const { filename, url } = message.data;
        chrome.downloads.download({ url, filename });
        sendResponse({ success: true });
    }

    return true;

});
