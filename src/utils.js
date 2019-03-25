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

const setCanvas = (canvas, ctx) => {
  canvas.width = 600
  canvas.height = 200
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, 600, 200)
}

module.exports = {
  clearNoteActive,
  clearProgramActive,
  clearProgramParams,
  setCanvas
}
