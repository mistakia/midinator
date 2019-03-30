const clearNoteActive = () => {
  const noteElems = document.querySelectorAll('.note')
  noteElems.forEach((elem) => elem.classList.remove('active'))
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

const clearSelectedMeasure = () => {
  const elem = document.querySelector('.measure.selected')
  if (elem) elem.className = 'measure'
}

module.exports = {
  clearNoteActive,
  clearProgramActive,
  clearProgramParams,
  clearSelectedMeasure,
  renderProgramParam
}
