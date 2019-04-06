const { resetClassName } = require('./utils')

let clipboard = []
let selectedIndex = 0

const haveClipboard = () => {
  return clipboard.length
}

const getClipboardPrograms = () => {
  return JSON.parse(JSON.stringify(clipboard[selectedIndex].programs))
}

const addToClipboard = (v) => {
  clipboard.unshift({
    name: `Clipboard #${clipboard.length}`,
    programs: v
  })
  renderClipboard()
}

const clipboardElem = document.getElementById('clipboard')

const renderClipboard = () => {
  clipboardElem.innerHTML = ''

  clipboard.forEach((item, idx) => {
    const clipboardItemElem = document.createElement('div')
    clipboardItemElem.className = 'clipboard-item'

    if (idx === selectedIndex) {
      clipboardItemElem.classList.add('selected')
    }

    const nameInput = document.createElement('input')
    nameInput.value = item.name
    nameInput.oninput = () => {
      item.name = nameInput.value
    }
    clipboardItemElem.appendChild(nameInput)
    clipboardItemElem.addEventListener('click', () => {
      selectedIndex = idx
      resetClassName('clipboard-item')
      clipboardItemElem.classList.add('selected')
    })
    clipboardElem.appendChild(clipboardItemElem)
  })
}

module.exports = {
  addToClipboard,
  getClipboardPrograms,
  haveClipboard,
  renderClipboard
}
