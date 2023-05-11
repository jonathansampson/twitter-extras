window.addEventListener('message', function (event) {
    if (event.source === window && event?.data?.type === 'downloadMedia') {
        chrome.runtime.sendMessage({ type: 'downloadMedia', data: event.data.data });
    }
});
