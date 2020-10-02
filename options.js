
window.addEventListener('load', async () => {
    chrome.storage.local.get({ heroSentenceOption: true }, function(data){
        document.getElementById('heroSentence').children[0].checked = data.heroSentenceOption
    })

    chrome.storage.local.get({ readmoreScroll: true }, function(data){
        document.getElementById('readmore').children[0].checked = data.readmoreScroll
    })
})

document.getElementById('heroSentence').addEventListener('change', async function(e) {
    chrome.storage.local.set({ heroSentenceOption: e.target.checked }, function() {
    })
})

document.getElementById('readmore').addEventListener('change', function(e) {
    if (e.target.checked) {
        chrome.storage.local.set({ readmoreScroll: true }, function() {
        })
    } else {
        chrome.storage.local.set({ readmoreScroll: false }, function() {
        })
    }
})