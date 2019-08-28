const eases = require('d3-ease')
const Param = require('./param')
const config = require('../config')
const { getProject } = require('./project')
const { getSelectedNotes } = require('./selected-notes')

const getMidiEvent = ({ byteIndex, tick, delta, noteNumber }) => {
  const Project = getProject()
  let midiEvent
  let midiIndex

  for (let i=0; i<Project.midiEvents.length; i++) {
    const e = Project.midiEvents[i]
    let match = true

    if (isDefined(byteIndex)) {
      match = e.byteIndex == byteIndex && match
    }

    if (isDefined(tick)) {
      match = e.tick == tick && match
    }

    if (isDefined(delta)) {
      match = e.delta == delta && match
    }

    if (isDefined(noteNumber)) {
      match = e.noteNumber == noteNumber && match
    }

    if (match) {
      midiEvent = e
      midiIndex = i
      break
    }
  }

  return { midiEvent, midiIndex }
}
const isDefined = (value) => (typeof value !== 'undefined' && value !== null)

const removeClassName = (className, selector) => {
  const elems = document.querySelectorAll(selector || `.${className}`)
  elems.forEach((elem) => elem.classList.remove(className))
}

const resetClassName = (className, selector) => {
  const elems = document.querySelectorAll(selector || `.${className}`)
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

const renderParam = ({ name, param, parent, min, max, step, title, isColumnParam }) => {
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
      p.setValue('start', parseFloat(value))
      updateProgramParam({ name, value: p.values, title, isColumnParam })
    },
    parent: programParamContainer
  })

  renderInput({
    label: 'End:', min, max, step,
    value: p.end,
    manual: true,
    range: true,
    oninput: (value) => {
      p.setValue('end', parseFloat(value))
      updateProgramParam({ name, value: p.values, title, isColumnParam })
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
    p.setValue('ease', easeSelect.value)
    updateProgramParam({ name, value: p.values, title, isColumnParam })
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
      p.setValue('speed', parseFloat(value))
      updateProgramParam({ name, value: p.values, title, isColumnParam })
    },
    parent: programParamContainer
  })

  parent.appendChild(programParamContainer)
}

const updateProgramParam = ({ name, value, title, isColumnParam }) => {
  const selectedNotes = getSelectedNotes()
  selectedNotes.forEach((note, noteIdx) => {
    note.programs.forEach((p, pIdx) => {
      if (p.title === title) {
        if (isColumnParam) {
          p.columnParams[name] = value
        } else {
          p.params[name] = value
        }
      }
    })
  })
}

module.exports = {
  clearProgramParams,
  getMidiEvent,
  renderInput,
  renderParam,
  resetClassName,
  removeClassName,
  updateProgramParam
}
