interface ReactHTMLElement extends HTMLElement {
    [key: string]: any;
}

/**
 * @param description This particular function was written in order
 * to close the Tweet … menu. The target must be the menu item which
 * will emit the escape key event.
 * @param target The menu element from which the escape key will be sent
 */
export function sendEscapeKey(target: Document | HTMLElement = document): void {
    
    const event = new KeyboardEvent("keyup", {
        bubbles: true,
        cancelable: true,
        key: "Escape",
    });

    target.dispatchEvent(event);
}

export function getReactProps(el: ReactHTMLElement): any | null {
    for (const property of Object.getOwnPropertyNames(el)) {
        if (property.startsWith("__reactProps")) {
            return el[property];
        }
    }
    return null;
}

export function mainWorldResponse(message: any): void {
    window.postMessage({ ...message, isResponse: true }, "*");
}

export function mainWorldRequest(message: any, timeoutMS: number = 3_000): Promise<any> {
    // We'll generate a message ID to reconcile the response
    const messageID = Math.random().toString(36).substring(2, 9);

    return new Promise((resolve, reject) => {
        // Set a timeout to reject the promise if we don't
        // receive a response within 3 seconds
        const timeout = setTimeout(() => {
            window.removeEventListener("message", listener);
            reject(`Message timed out after ${timeoutMS}ms`);
        }, timeoutMS);

        // If an incoming response matches a recently
        // sent message, we'll resolve the promise
        const listener = (event: MessageEvent) => {
            if (event.data.isResponse) {
                if (event.data.messageID === messageID) {
                    window.removeEventListener("message", listener);
                    clearTimeout(timeout);
                    resolve(event.data);
                }
            }
        };

        // Bind our listener, and send our message
        window.addEventListener("message", listener);
        window.postMessage({
            messageID,
            ...message,
            isResponse: false
        }, "*");
    });
}

export function recursivelyFindProperty(
    object: any,
    property: string
): any | null {

    if ( object && property ) {
        if (object.hasOwnProperty(property)) {
            return object[property];
        }
        for (const [key, value] of Object.entries(object)) {
            if (typeof value === "object") {
                const result = recursivelyFindProperty(value, property);
                if (result) {
                    return result;
                }
            }
        }
    }

    return null;
}

export function getTweetElementForActiveMenu(): HTMLElement | null {
    const tweet = `[data-testid='tweet']`;
    const caret = `[data-testid='caret'][aria-expanded='true']`;
    const element = document.querySelector(`${tweet}:has(${caret})`);

    if (element instanceof HTMLElement) {
        return element;
    }

    return null;
}

export function getTweetIDForActiveMenu(): string | null {
    const element = getTweetElementForActiveMenu();
    const statusLink = element?.querySelector("a[href*='/status/']");
    const href = statusLink?.getAttribute("href");

    if (href) {
        const tweetID = href.match(/\d+/);
        if (tweetID) {
            return tweetID[0];
        }
    }

    return null;
}

export function requestSaveFile(filename: string, url: string): void {
    window.postMessage({ type: "downloadMedia", data: { filename, url } }, "*");
}
