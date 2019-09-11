const hotkeys = require('hotkeys-js')

const { importSelectedClipboard } = require('./app')
const { getSelectedIndex, setSelectedIndex, haveClipboard } = require('./clipboard')

hotkeys('command+up', (event) => {
  event.preventDefault()
  const idx = getSelectedIndex()
  if (typeof idx === 'undefined') {
    return
  }

  setSelectedIndex(idx - 1)
})

hotkeys('command+down', (event) => {
  event.preventDefault()
  const idx = getSelectedIndex()
  if (typeof idx === 'undefined') {
    return
  }

  setSelectedIndex(idx + 1)
})

hotkeys('command+v', (event) => {
  event.preventDefault()
  if (haveClipboard()) {
    importSelectedClipboard()
  }
})

hotkeys('left', (event) => {
  event.preventDefault()
  let selectedNotes = getSelectedNotes()
  if (selectedNotes.length === 1) {
    // get previous note
  }
})

hotkeys('right', (event) => {
  event.preventDefault()
  let selectedNotes = getSelectedNotes()
  if (selectedNotes.length === 1) {
    // get next note
  }
})
