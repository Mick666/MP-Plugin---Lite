chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log(request)
    if (request && request.missingContent) {
        document.getElementById('missing').innerText = request.missingContent.join('\n')
    }
})
window.onload = async function() {
    document.getElementById('btn').addEventListener('click', toggleDetailedContent)
    const missingContent = await getMissingContent()
    const currentPortal = await getCurrentPortal()
    const detailedArchivedContent = await getDetailedArchivedContent()

    missingContent.forEach(item => {
        let [headline, outlet] = item.split(' | ')
        let headlinePara = document.createElement('P')
        headlinePara.innerText = headline
        let outletPara = document.createElement('P')
        outletPara.innerText = outlet
        document.getElementById('missing').appendChild(headlinePara)
        document.getElementById('missing').appendChild(outletPara)

        detailedArchivedContent[currentPortal][item].forEach(x => {
            x.forEach(y => {
                let paraElem = document.createElement('P')
                paraElem.innerText = y.toString()
                paraElem.className = 'detailed'
                if (y.toString() === '') paraElem.innerText = 'N/A'
                document.getElementById('missing').appendChild(paraElem)
            })
        })
    })
}

function toggleDetailedContent(e) {
    e.preventDefault()
    let btn = document.getElementById('btn')
    if (btn.innerText === 'Show detailed information') {
        document.getElementById('missing').style.gridTemplateColumns = 'repeat(7, minmax(0, 1fr))'
        const hiddenElems = document.getElementsByClassName('detailed')
        for (let i = 0; i < hiddenElems.length; i++) {
            hiddenElems[i].style.display = 'inline'
        }
        btn.innerText = 'Hide detailed information'
        document.getElementById('container').style.width = '1500px'
    } else if (btn.innerText === 'Hide detailed information') {
        document.getElementById('missing').style.gridTemplateColumns = 'repeat(2, minmax(0, 1fr))'
        const hiddenElems = document.getElementsByClassName('detailed')
        for (let i = 0; i < hiddenElems.length; i++) {
            hiddenElems[i].style.display = 'none'
        }
        btn.innerText = 'Show detailed information'
        document.getElementById('container').style.width = '700px'
    }
}


function getMissingContent() {
    return new Promise(options => {
        chrome.storage.local.get({ missingContent: {} }, function (data) {
            options(data.missingContent)
        })
    })
}

function getDetailedArchivedContent() {
    return new Promise(options => {
        chrome.storage.local.get({ detailedArchiveContent: {} }, function (data) {
            options(data.detailedArchiveContent)
        })
    })
}


function getCurrentPortal() {
    return new Promise(options => {
        chrome.storage.local.get({ currentPortal: null }, function (data) {
            options(data.currentPortal)
        })
    })
}



