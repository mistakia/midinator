const { resetClassName } = require('./utils')
const ProgramList = require('./program-list')

const clipboard = new ProgramList()

const haveClipboard = () => (clipboard.length)

const getSelectedIndex = () => {
  return clipboard.selectedIndex
}

const setSelectedIndex = (idx) => {
  if (!clipboard.has(idx)) {
    return
  }

  clipboard.selectedIndex = idx
  resetClassName('program-item', '#clipboard .program-item')
  const elem = document.querySelector(`#clipboard .program-item:nth-child(${idx + 1})`)
  elem.classList.add('selected')
}

const getClipboardPrograms = () => {
  return JSON.parse(JSON.stringify(clipboard.getSelected()))
}

const addToClipboard = (v) => {
  clipboard.add({
    name: 'Clipboard #' + clipboard.length,
    programs: v
  })
  renderClipboard()
}

const clipboardElem = document.getElementById('clipboard')

const renderClipboard = () => {
  clipboardElem.innerHTML = ''

  clipboard.list.forEach((item, idx) => {
    const clipboardItemElem = document.createElement('div')
    clipboardItemElem.className = 'program-item'

    const removeElem = document.createElement('div')
    removeElem.className = 'close'
    clipboardItemElem.appendChild(removeElem)
    removeElem.addEventListener('click', (event) => {
      event.stopPropagation()
      clipboard.remove(idx)
      renderClipboard()
      if (!clipboard.length) {
        const elem = document.getElementById('import-clipboard')
        if (elem) elem.remove()
      }
    })

    if (idx === clipboard.selectedIndex) {
      clipboardItemElem.classList.add('selected')
    }

    const nameInput = document.createElement('input')
    nameInput.value = item.name
    nameInput.oninput = () => {
      item.name = nameInput.value
    }
    clipboardItemElem.appendChild(nameInput)
    clipboardItemElem.addEventListener('click', () => {
      clipboard.selectedIndex = idx
      resetClassName('program-item', '#clipboard .program-item')
      clipboardItemElem.classList.add('selected')
    })
    clipboardElem.appendChild(clipboardItemElem)
  })
}

module.exports = {
  addToClipboard,
  getSelectedIndex,
  setSelectedIndex,
  getClipboardPrograms,
  haveClipboard,
  renderClipboard
}
