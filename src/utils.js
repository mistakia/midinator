const eases = require('d3-ease')
const Param = require('./param')

const isDefined = (value) => (typeof value !== 'undefined' && value !== null)

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

const renderInput = ({ label, input, parent, min, max, value, step, oninput }) => {
  const programParamContainer = document.createElement('div')
  programParamContainer.className = 'param-input'

  const labelElem = document.createElement('label')
  labelElem.innerHTML = label
  programParamContainer.appendChild(labelElem)

  if (!input) {
    const inputElem = document.createElement('input')
    inputElem.type = 'range'
    if (isDefined(max)) inputElem.max = max
    if (isDefined(min)) inputElem.min = min
    if (isDefined(step)) inputElem.step = step
    if (isDefined(value)) inputElem.value = value
    inputElem.oninput = () => oninput(inputElem.value)
    programParamContainer.appendChild(inputElem)
  } else {
    programParamContainer.appendChild(input)
  }

  parent.appendChild(programParamContainer)
}

const renderParam = ({ name, param, parent, min, max, step }) => {
  const programParamContainer = document.createElement('div')
  programParamContainer.className = 'program-param'
  programParamContainer.dataset.name = name

  const p = new Param(param)

  renderInput({
    label: 'Start:', min, max, step,
    value: p.start,
    oninput: (value) => {
      param.start = parseInt(value, 10)
    },
    parent: programParamContainer
  })

  renderInput({
    label: 'End:', min, max, step,
    value: p.end,
    oninput: (value) => {
      param.end = parseInt(value, 10)
    },
    parent: programParamContainer
  })

  const easeSelect = document.createElement('select')
  Object.keys(eases).forEach((ease) => {
    const option = document.createElement('option')
    option.text = ease
    easeSelect.add(option)
  })
  if (p.ease) easeSelect.value = p.ease
  easeSelect.addEventListener('input', () => {
    param.ease = easeSelect.value
  })
  renderInput({
    label: 'Ease:',
    input: easeSelect,
    parent: programParamContainer
  })

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
  renderInput,
  renderParam
}
