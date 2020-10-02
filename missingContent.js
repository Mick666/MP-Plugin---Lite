chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log(request)
    if (request && request.missingContent) {
        document.getElementById('missing').innerText = request.missingContent.join('\n')
    }
})
window.onload = function() {
    chrome.storage.local.get({ missingContent: [] }, function (data) {
        console.log(data)
        if (data.missingContent.length === 0) return
        let missingContent = data.missingContent.join(' | ').split(' | ')
        missingContent.forEach(x => {
            let para = document.createElement('P')
            para.innerText = x
            document.getElementById('missing').appendChild(para)
        })
    })
}

