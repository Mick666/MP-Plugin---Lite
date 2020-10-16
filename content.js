let listenerOptions = [true]
let currentPortal = null
let lastAddedContent = []

window.onload = async function () {
    const browserURL = window.location.href.toString()
    let lastReset = await getLastContentReset()
    let currentDate = new Date()
    let timeDif = (currentDate.getTime() - new Date(lastReset).getTime()) / 1000 / 3600
    if (timeDif > 15) {
        chrome.storage.local.set({ contentReset: currentDate.toString() }, function() {
        })
        chrome.storage.local.set({ archivedContent: {} }, function() {
        })
        chrome.storage.local.set({ detailedArchiveContent: {} }, function() {
        })
    }

    if (browserURL.startsWith('https://app.mediaportal.com/')) currentPortal = await getCurrentPortal()
    if (!currentPortal && browserURL !== 'https://www.mediaportal.com/' && !browserURL.startsWith('https://www.mediaportal.com/login.aspx') && browserURL.startsWith('https://app.mediaportal.com')) {
        alert('Plugin error: The briefing login for this portal hasn\'t been saved. Please log out and into this portal to resolve this issue.\
        \nIf you\'re still seeing this message after relogging, contact Michael.Martino@isentia.com. Note the unadded item tracker won\'t work with no login saved')
    }
    console.log(currentPortal)
    if (browserURL === 'https://app.mediaportal.com/#/report-builder/view') {
        document.title = 'Report Builder'
        if (document.getElementsByClassName('dropdown-display').length > 0 && document.getElementsByClassName('dropdown-display')[0].innerText === ' Excel') createRPButton()
        else {
            setTimeout((() => {
                if (document.getElementsByClassName('dropdown-display').length > 0 && document.getElementsByClassName('dropdown-display')[0].innerText === ' Excel') createRPButton()
            }), 500)
        }
    }
}

document.addEventListener('mousedown', async function (e) {

    if (e.button !== 0 || e.ctrlKey || !e.target) return

    if (e.target.nodeName === 'SPAN' && e.target.outerText === ' BACK') {
        document.addEventListener('scroll', func)
    } else if (e.target.nodeName === 'A' && e.target.outerText === ' Coverage') {
        document.addEventListener('scroll', func)
    } else if (e.target.href === 'https://app.mediaportal.com/#/monitor/media-coverage' || (e.target.parentElement && e.target.parentElement.href === 'https://app.mediaportal.com/#/monitor/media-coverage')) {
        document.addEventListener('scroll', func)
        document.title = 'Mediaportal Coverage'
    } else if (e.target.href === 'https://app.mediaportal.com/#/report-builder/view' || (e.target.parentElement && e.target.parentElement.href === 'https://app.mediaportal.com/#/report-builder/view')) {
        document.removeEventListener('scroll', func)
        document.title = 'Report Builder'
        setTimeout(() => {
            if (document.getElementsByClassName('dropdown-display').length > 0 && document.getElementsByClassName('dropdown-display')[0].innerText === ' Excel') {
                createRPButton()
            }
        }, 2000)
    } else if (e.target.id === 'btnLogin') {
        let lastReset = await getLastContentReset()
        let currentDate = new Date()
        let timeDif = (currentDate.getTime() - new Date(lastReset).getTime()) / 1000 / 3600
        if (timeDif > 15) {
            chrome.storage.local.set({ contentReset: currentDate.toString() }, function() {
            })
            chrome.storage.local.set({ archivedContent: {} }, function() {
            })
            chrome.storage.local.set({ detailedArchiveContent: {} }, function() {
            })
        }
        if (chrome.extension.inIncognitoContext) {
            chrome.storage.local.set({ currentPortalIncog: document.getElementById('txtUsername').value.toLowerCase() }, function() {
            })
        } else {
            chrome.storage.local.set({ currentPortalRegular: document.getElementById('txtUsername').value.toLowerCase() }, function() {
            })
        }
    }  else if (e.target.parentElement && e.target.parentElement.className === 'modal-footer ng-scope' && e.target.innerText === 'Add') {
        archiveSelectedContent()
    } else if (e.target.parentElement && e.target.parentElement.className === 'modal-footer ng-scope' && e.target.innerText === 'Remove') {
        removeArchivedContent()
    } else if (window.location.href.toString() === 'https://app.mediaportal.com/#/report-builder/view' && document.getElementsByClassName('dropdown-display').length > 0
        && e.target.parentElement && e.target.parentElement.parentElement === document.getElementsByClassName('dropdown-list')[0].firstElementChild.children[4]) {
        setTimeout(createRPButton, 500)
    }
})

if (window.location.href.toString() === 'https://www.mediaportal.com/' || window.location.href.toString() === 'https://www.mediaportal.com' || window.location.href.toString().startsWith('https://www.mediaportal.com/login.aspx')) {
    document.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter') {
            let lastReset = await getLastContentReset()
            let currentDate = new Date()
            let timeDif = (currentDate.getTime() - new Date(lastReset).getTime()) / 1000 / 3600
            if (timeDif > 15) {
                chrome.storage.local.set({ contentReset: currentDate.toString() }, function() {
                })
                chrome.storage.local.set({ archivedContent: {} }, function() {
                })
                chrome.storage.local.set({ detailedArchiveContent: {} }, function() {
                })
            }
            if (chrome.extension.inIncognitoContext) {
                chrome.storage.local.set({ currentPortalIncog: document.getElementById('txtUsername').value.toLowerCase() }, function() {
                })
            } else {
                chrome.storage.local.set({ currentPortalRegular: document.getElementById('txtUsername').value.toLowerCase() }, function() {
                })
            }
        }
    })
}

chrome.storage.local.get({ heroSentenceOption: true }, function (data) {
    if (data.heroSentenceOption && window.location.toString() !== 'https://app.mediaportal.com/dailybriefings/#/briefings') {
        document.addEventListener('scroll', function () {
            const readMores = [...document.getElementsByClassName('btn-read-more ng-scope')].filter(item => item.firstElementChild && item.firstElementChild.innerText === 'Read more...')
            readMores.forEach(item => item.firstElementChild.click())
        })
    }
})

function func() {
    if (listenerOptions[0]) {
        let links = [...document.querySelectorAll('a')].filter(link => /app\.mediaportal\.com\/#\/connect\/media-contact/.test(link.href) || /app\.mediaportal\.com\/#connect\/media-outlet/.test(link.href))
        links.map(link => link.href = '')
    }
}


chrome.storage.local.get({ readmoreScroll: true }, function (data) {
    if (data.readmoreScroll) {
        document.addEventListener('mousedown', function (e) {
            if (e.target.outerText === ' Read More' && e.target.parentElement.parentElement.parentElement.className === 'media-item-body media-item-details clearfix ng-scope') {
                setTimeout(function () {
                    e.target.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.children[0].scrollIntoView(true)
                    window.scrollTo(window.scrollX, window.scrollY - 150)
                }, 1000)
            }
        })
    }
})

async function archiveSelectedContent() {

    let archivedContent = await getArchivedContent()
    if (!archivedContent[currentPortal]) archivedContent[currentPortal] = []
    const selectedItems = [...document.getElementsByClassName('media-item-checkbox')].filter(x => x.parentElement && x.checked).map(x => {
        const outletName = x.parentElement.children[3].firstElementChild.firstElementChild.firstElementChild.innerText.replace(/ \(page [0-9]{1,}\)/, '')
        let headline
        if (x.parentElement.parentElement.parentElement.parentElement.className.startsWith('media-item-syndication')) {
            headline = x.parentElement.parentElement.parentElement.parentElement.parentElement.children[0].children[1].innerText.slice(0, 90)
        } else headline = x.parentElement.parentElement.parentElement.children[0].children[1].innerText.slice(0, 90)
        headline = headline.replace(/’|‘/g, '\'')
        return `${headline} ||| ${outletName}`
    }).filter(x => !archivedContent[currentPortal].includes(x))
    console.log(selectedItems.length)
    const archiveDate = new Date().toString()
    const groupOption = document.getElementsByClassName('content-options').length > 1 ? document.getElementsByClassName('content-options')[0].innerText.trimEnd() : 'N/A'
    const sortOption = document.getElementsByClassName('content-options').length > 1 ? document.getElementsByClassName('content-options')[1].innerText.trimEnd() : document.getElementsByClassName('content-options')[0].innerText.trimEnd()
    const groupings = [...document.getElementsByClassName('media-group ng-scope')].map(x => x.innerText.split('\n').slice(0, 2).join(' with ').trimStart().trimEnd()).join(', ')
    const tabs = await getMPTabs()

    let selectedFolders = [...document.getElementsByClassName('checkbox-custom')].filter(x => /^Brands|^Competitors|^Personal|^Release Coverage|^Spokespeople/.test(x.id) && x.checked).map(x => x.parentElement.children[1].innerText.trimStart())
    if (selectedFolders.length === 0) return

    console.log(archivedContent)
    let detailedArchiveContent = await getDetailedArchivedContent()
    if (!detailedArchiveContent[currentPortal]) detailedArchiveContent[currentPortal] = {}

    archivedContent[currentPortal].push(selectedItems)
    archivedContent[currentPortal] = archivedContent[currentPortal].flat()

    selectedItems.forEach(item => {
        let detailedInfo = [archiveDate, groupOption, sortOption, groupings, tabs]
        if (!detailedArchiveContent[currentPortal][item]) {
            detailedArchiveContent[currentPortal][item] = detailedInfo
        }
    })

    console.log(archivedContent)
    console.log(detailedArchiveContent)

    lastAddedContent = [window.location.href.toString(), selectedItems]

    chrome.storage.local.set({ archivedContent: archivedContent }, function() {
    })

    chrome.storage.local.set({ detailedArchiveContent: detailedArchiveContent }, function() {
    })

}

async function removeArchivedContent() {
    let selectedItems = [...document.getElementsByClassName('media-item-checkbox')].filter(x => x.parentElement && x.checked).map(x => {
        const outletName = x.parentElement.children[3].firstElementChild.firstElementChild.firstElementChild.innerText.replace(/ \(page [0-9]{1,}\)/, '')
        let headline
        if (x.parentElement.parentElement.parentElement.parentElement.className.startsWith('media-item-syndication')) {
            headline = x.parentElement.parentElement.parentElement.parentElement.parentElement.children[0].children[1].innerText.slice(0, 90)
        } else headline = x.parentElement.parentElement.parentElement.children[0].children[1].innerText.slice(0, 90)
        headline = headline.replace(/’|‘/g, '\'')
        return `${headline} ||| ${outletName}`
    })
    let archivedContent = await getArchivedContent()

    if (lastAddedContent[0] === window.location.href.toString()) {
        selectedItems = selectedItems.filter(x => !lastAddedContent[1].includes(x))
    }

    if (!archivedContent[currentPortal]) archivedContent[currentPortal] = []
    archivedContent[currentPortal] = archivedContent[currentPortal].filter(x => !selectedItems.includes(x))
    console.log(archivedContent)

    chrome.storage.local.set({ archivedContent: archivedContent }, function() {
    })
}

async function checkAddedContent() {
    let RPItems = [...document.getElementsByClassName('media-item media-item-compact')].map(x => {
        const outletName = x.children[1].firstElementChild.children[3].firstElementChild.innerText.replace(/ \(page [0-9]{1,}\)/, '')
        const headline = x.firstElementChild.children[1].innerText.slice(0, 90).replace(/’|‘/g, '\'')
        return `${headline} ||| ${outletName}`
    })
    console.log(RPItems)
    console.log(currentPortal)
    let archivedContent = await getArchivedContent()
    console.log(archivedContent)

    if (archivedContent[currentPortal]) {
        let missingItems = [...new Set(archivedContent[currentPortal])].filter(x => RPItems.indexOf(x) === -1)
        console.log(missingItems)
        if (missingItems.length > 0) {
            chrome.runtime.sendMessage({
                action: 'createWindow',
                url: 'missingContent.html',
                missingItems: missingItems,
                currentPortal: currentPortal
            })
        } else {
            alert('No missing items detected!*\n\n\n*We hope anyway')
        }

    }
}

function createRPButton() {
    let button = document.createElement('BUTTON')
    button.innerText = 'Check for missing content'
    button.addEventListener('click', checkAddedContent)
    button.style.marginLeft = '19px'
    button.style.color = 'black'
    button.style.borderColor = 'black'
    document.getElementsByClassName('dropdown-menu scroll-menu')[0].children[1].appendChild(button)
    let para = document.createElement('P')
    para.innerText = 'Instructions:\n1: Do selections normally.\n2: Add all selections to RP when done, switch to Excel template\n3: If RP is grouped by anything, make sure each grouping\
     is open. Scroll to the bottom to ensure all the content loads also.\n4: Click the above button, a new window will open if missing items are detected.\n\n NB: Some syndications may incorrectly appear\
      as missing, this is a known bug'
    para.style.marginLeft = '19px'
    para.style.marginTop = '10px'
    para.style.marginRight = '10px'
    document.getElementsByClassName('dropdown-menu scroll-menu')[0].children[1].appendChild(para)
}

chrome.storage.local.get({ listenerOptions: [true, true, true] }, function (data) {
    if (window.location.toString() !== 'https://app.mediaportal.com/dailybriefings/#/briefings' && window.location.toString() !== 'https://app.mediaportal.com/#/report-builder/view') {
        document.addEventListener('scroll', func)
        listenerOptions = data.listenerOptions
    }
})

function getArchivedContent() {
    return new Promise(options => {
        chrome.storage.local.get({ archivedContent: {} }, function (data) {
            options(data.archivedContent)
        })
    })
}

function getCurrentPortal() {
    if (chrome.extension.inIncognitoContext) {
        return new Promise(options => {
            chrome.storage.local.get({ currentPortalIncog: null }, function (data) {
                options(data.currentPortalIncog)
            })
        })
    } else {
        return new Promise(options => {
            chrome.storage.local.get({ currentPortalRegular: null }, function (data) {
                options(data.currentPortalRegular)
            })
        })
    }
}

function getLastContentReset() {
    return new Promise(options => {
        chrome.storage.local.get({ contentReset: 'September 30, 2020' }, function (data) {
            options(data.contentReset)
        })
    })
}


function getMPTabs() {
    return new Promise(response => {
        chrome.runtime.sendMessage({
            action: 'logTabs',
            incog: chrome.extension.inIncognitoContext
        }, function(tabs) {
            response(tabs.tabs)
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