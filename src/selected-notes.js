let selectedNotes = []

const getSelectedNotes = () => {
  return selectedNotes
}

const addNoteToSelection = (note) => {
  selectedNotes.push(note)
}

const setSelectedNotes = (arr) => {
  return selectedNotes = arr
}

module.exports = {
  addNoteToSelection,
  getSelectedNotes,
  setSelectedNotes
}
