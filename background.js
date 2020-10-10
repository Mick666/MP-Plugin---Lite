chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request && request.action === 'createWindow' && request.url) {
        chrome.storage.local.set({ missingContent: request.missingItems, currentPortal: request.currentPortal }, function() {
            chrome.tabs.create({ url: request.url }, function () {
            })
        })

    }
})

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request && request.action === 'logTabs') {
        chrome.tabs.query({}, function(foundTabs) {
            const MPTabs = foundTabs.filter(tab => tab.url.startsWith('https://app.mediaportal') && tab.incognito === request.incog)
            console.log(foundTabs)
            sendResponse({ tabs: MPTabs.length })
        })
    }
    return true
})