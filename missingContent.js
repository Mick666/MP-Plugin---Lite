window.onload = async function () {
    document.getElementsByClassName('btn')[0].addEventListener('click', toggleDetailedContent)
    document.getElementsByClassName('btn')[1].addEventListener('click', showDeleteButtons)
    const missingContent = await getMissingContent()
    const currentPortal = await getCurrentPortal()
    const detailedArchivedContent = await getDetailedArchivedContent()

    missingContent.forEach((item, index) => {
        let [headline, outlet] = item.split(' ||| ')
        let tableRow = document.createElement('TR')

        let btnRow = document.createElement('td')
        btnRow.className = 'button-parent'
        let btn = document.createElement('button')
        btn.innerText = 'Delete row'
        btn.className = `deleteButton ${index}`
        btn.addEventListener('click', () => deleteRow(index))

        let headlinePara = document.createElement('td')
        headlinePara.innerText = headline
        headlinePara.className = index

        let outletPara = document.createElement('td')
        outletPara.innerText = outlet
        outletPara.className = index

        btnRow.appendChild(btn)
        tableRow.appendChild(btnRow)
        tableRow.appendChild(headlinePara)
        tableRow.appendChild(outletPara)

        if (detailedArchivedContent[currentPortal][item]) {
            detailedArchivedContent[currentPortal][item].forEach(y => {
                let paraElem = document.createElement('td')
                paraElem.innerText = y.toString()
                paraElem.className = `detailed ${index}`
                if (y.toString() === '') paraElem.innerText = 'N/A'
                tableRow.appendChild(paraElem)
            })
        } else {
            for (let i = 0; i < 5; i++) {
                let para = document.createElement('td')
                para.innerText = 'N/A'
                para.className = `detailed ${index}`
                tableRow.appendChild(para)
            }
        }
        console.log(document.getElementById('missing').firstElementChild)
        document.getElementById('missing').firstElementChild.appendChild(tableRow)
    })
}

function toggleDetailedContent(e) {
    e.preventDefault()
    let btn = document.getElementsByClassName('btn')[0]
    if (btn.innerText === 'Show detailed information') {
        const hiddenElems = document.getElementsByClassName('detailed')
        for (let i = 0; i < hiddenElems.length; i++) {
            hiddenElems[i].style.display = 'table-cell'
        }
        btn.innerText = 'Hide detailed information'
        document.getElementById('container').style.width = '1500px'
    } else if (btn.innerText === 'Hide detailed information') {
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

const deleteRow = (row) => [...document.getElementsByClassName(row)][0].parentElement.parentElement.remove()

const showDeleteButtons = () => {
    [...document.getElementsByClassName('button-parent')].forEach(button => button.style.display = button.style.display === 'none' || button.style.display === '' ? 'table-cell' : 'none')
    document.getElementsByClassName('btn')[1].innerText = document.getElementsByClassName('btn')[1].innerText === 'Show delete buttons' ? 'Hide delete buttons' : 'Show delete buttons'
}
