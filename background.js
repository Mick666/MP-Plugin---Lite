chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request && request.action === 'createWindow' && request.url) {
        chrome.storage.local.set({ missingContent: request.missingItems }, function() {
            chrome.tabs.create({ url: request.url }, function () {
            })
        })

    }
})