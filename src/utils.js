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

const renderProgramParam = ({ label, inputElem, parent }) => {
  const programParamContainer = document.createElement('div')
  programParamContainer.className = 'program-param'

  const labelElem = document.createElement('label')
  labelElem.innerHTML = label
  programParamContainer.appendChild(labelElem)
  programParamContainer.appendChild(inputElem)
  parent.appendChild(programParamContainer)
}

const setCanvas = (canvas, ctx) => {
  canvas.width = canvas.width
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

module.exports = {
  clearNoteActive,
  clearProgramActive,
  clearProgramParams,
  renderProgramParam,
  setCanvas
}
