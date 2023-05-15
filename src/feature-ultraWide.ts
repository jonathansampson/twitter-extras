chrome.storage.local.onChanged.addListener((changes) => {
    if ( changes.ultrawide ) {
        const change = changes.ultrawide;
        change.newValue ? enableUltraWide() : disableUltraWide();
    }
});

chrome.storage.local.get("ultrawide", function (data) {
    data.ultrawide ? enableUltraWide() : disableUltraWide();
});

function enableUltraWide (): void {
    if ( isUltraWideEnabled() ) {
        return;
    }

    let element;

    element = document.createElement("style")
    element.id = "feature-ultraWide";
    element.textContent = `
        [data-testid="sidebarColumn"] {
            display: none;
        }
        [data-testid="primaryColumn"],
        [data-testid="primaryColumn"] > div > div:last-child {
            max-width: none;
        }
    `;

    document.head.appendChild(element);
}

function disableUltraWide (): void {
    if ( !isUltraWideEnabled() ) {
        return;
    }
    console.log("Disabling ultra-wide mode");
    document.getElementById("feature-ultraWide")?.remove();
}

function isUltraWideEnabled (): boolean {
    return document.getElementById("feature-ultraWide") !== null;
}
