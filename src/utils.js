const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')

const clearNoteActive = () => {
  const noteElems = document.querySelectorAll('.note')
  noteElems.forEach((elem) => elem.className = 'note')
}

const clearProgramActive = () => {
  const programElems = document.querySelectorAll('.program-item')
  programElems.forEach((elem) => elem.className = 'program-item')
}

const clearProgramParams = () => {
  const programParams = document.getElementById('program-params')
  programParams.innerHTML = ''
}

const setCanvas = () => {
  canvas.width = canvas.width
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, 600, 100)
}

module.exports = {
  clearNoteActive,
  clearProgramActive,
  clearProgramParams,
  setCanvas
}
