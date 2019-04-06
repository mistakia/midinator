const eases = require('d3-ease')
const Param = require('./param')

const isDefined = (value) => (typeof value !== 'undefined' && value !== null)

const resetClassName = (className) => {
  const elems = document.querySelectorAll(`.${className}`)
  elems.forEach((elem) => elem.className = className)
}

const clearProgramParams = () => {
  const programParams = document.getElementById('program-params')
  programParams.innerHTML = ''
}

const renderInput = ({
  label,
  input,
  parent,
  range,
  manual,
  min,
  max,
  value,
  step,
  oninput
}) => {
  const programParamContainer = document.createElement('div')
  programParamContainer.className = 'param-input'

  const labelElem = document.createElement('label')
  labelElem.innerHTML = label
  programParamContainer.appendChild(labelElem)

  let inputElem
  let rangeElem

  if (input) {
    programParamContainer.appendChild(input)
  } else if (manual) {
    inputElem = document.createElement('input')
    inputElem.value = value
    inputElem.oninput = () => {
      oninput(inputElem.value)
      if (rangeElem) rangeElem.value = inputElem.value
    }
    programParamContainer.appendChild(inputElem)
  }

  if (range) {
    rangeElem = document.createElement('input')
    rangeElem.type = 'range'
    if (isDefined(max)) rangeElem.max = max
    if (isDefined(min)) rangeElem.min = min
    if (isDefined(step)) rangeElem.step = step
    if (isDefined(value)) rangeElem.value = value
    rangeElem.oninput = () => {
      oninput(rangeElem.value)
      if (inputElem) inputElem.value = rangeElem.value
    }
    programParamContainer.appendChild(rangeElem)
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
    manual: true,
    range: true,
    oninput: (value) => {
      param.start = parseInt(value, 10)
    },
    parent: programParamContainer
  })

  renderInput({
    label: 'End:', min, max, step,
    value: p.end,
    manual: true,
    range: true,
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

  renderInput({
    label: 'Speed:',
    value: p.speed,
    manual: true,
    oninput: (value) => {
      param.speed = parseFloat(value)
    },
    parent: programParamContainer
  })


  parent.appendChild(programParamContainer)
}

module.exports = {
  clearProgramParams,
  renderInput,
  renderParam,
  resetClassName
}
