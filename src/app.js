const eases = require('d3-ease')
const Pickr = require('@simonwep/pickr')

const Programs = require('./programs')
const {
  getMidiEvent,
  renderInput,
  resetClassName,
  removeClassName,
  updateProgramParam
} = require('./utils')
const { renderColumnParams } = require('./columns')

const {
  getCompositionPrograms,
  addToCompositions,
  haveCompositions,
  renderCompositions
} = require('./compositions')
const {
  getClipboardPrograms,
  addToClipboard,
  haveClipboard,
  renderClipboard
} = require('./clipboard')
const {
  addNoteToSelection,
  getSelectedNotes,
  setSelectedNotes
} = require('./selected-notes')
const Audio = require('./audio')
const { getPlayer } = require('./player')
const config = require('../config')
const { getProject } = require('./project')

const LENGTH_DEFAULT = 10
const COLOR_DEFAULT = 'rgba(255,255,255,1)'
let copySet = []
let selectedMeasure = 1

const timeline = document.getElementById('timeline')
const programParamElem = document.getElementById('program-params')

const getNoteElem = (byteIndex) => document.querySelector(`.note[data-byte-index="${byteIndex}"]`)
const getMidiRange = (start, end) => {
  let range = []
  let onNotes = getProject().midiEvents.filter(e => e.name === 'Note on')
  let lastTick
  for (let i=0; i<onNotes.length; i++) {
    const note = onNotes[i]
    if (note.tick > start && note.tick < end && note.tick !== lastTick) {
      range.push(note)
      lastTick = note.tick
    }
  }

  return range
}

const renderClearPrograms = ({ parent }) => {
  let selectedNotes = getSelectedNotes()
  const clearProgramsElem = document.createElement('div')
  clearProgramsElem.className = 'program-item'
  clearProgramsElem.innerHTML = 'Clear Programs'
  clearProgramsElem.addEventListener('click', () => {
    selectedNotes.forEach((note) => {
      note.programs = []
      const elem = getNoteElem(note.byteIndex)
      elem.classList.remove('not-empty')
    })
    drawProgramList({ programs: [] })
  })
  parent.appendChild(clearProgramsElem)
}

const drawProgramList = ({ programs, mismatch }) => {
  let selectedNotes = getSelectedNotes()
  programParamElem.innerHTML = ''
  const programListElem = document.getElementById('program-list')
  programListElem.innerHTML = ''

  programs.forEach((p, idx) => {
    const programElem = document.createElement('div')
    programElem.className = 'program-item'

    if (!mismatch) {
      const remove = document.createElement('div')
      remove.className = 'close'
      programElem.appendChild(remove)
      remove.addEventListener('click', (event) => {
        event.stopPropagation()
        programs.splice(idx, 1)
        if (!programs.length) {
          selectedNotes.forEach((note) => {
            const elem = getNoteElem(note.byteIndex)
            elem.classList.remove('not-empty')
          })
        }
        drawProgramList({ programs })
      })
    }

    const programTitleInput = document.createElement('input')
    programTitleInput.value = p.name
    programTitleInput.oninput = (event) => {
      p.title = programTitleInput.value
    }
    if (p.title) programTitleInput.value = p.title
    programElem.appendChild(programTitleInput)

    if (!mismatch && idx !== 0) {
      const up = document.createElement('div')
      up.className = 'arrow up'
      programElem.appendChild(up)
      up.addEventListener('click', (event) => {
        event.stopPropagation()
        const to = idx - 1
        programs.splice(to, 0, programs.splice(idx, 1)[0])
        drawProgramList({ programs })
      })
    }

    if (!mismatch && idx !== (programs.length - 1)) {
      const down = document.createElement('div')
      down.className = 'arrow down'
      programElem.appendChild(down)
      down.addEventListener('click', (event) => {
        event.stopPropagation()
        const to = idx + 1
        programs.splice(to, 0, programs.splice(idx, 1)[0])
        drawProgramList({ programs })
      })
    }

    const drawActiveProgram = () => {
      resetClassName('program-item', '#program-list .program-item')
      programElem.classList.add('active')

      programParamElem.innerHTML = ''

      renderColumnParams({ programParamElem, program: p })

      const paramsListElem = document.createElement('div')
      paramsListElem.className = 'params-list'
      programParamElem.appendChild(paramsListElem)

      const programTypeSelect = document.createElement('select')
      Programs.list().forEach((name) => {
        const option = document.createElement('option')
        option.text = name
        programTypeSelect.add(option)
      })
      if (p.name) programTypeSelect.value = p.name
      programTypeSelect.addEventListener('input', () => {
        p.name = programTypeSelect.value
        drawActiveProgram()
      })
      paramsListElem.appendChild(programTypeSelect)

      const colorPickerElem = document.createElement('div')
      paramsListElem.appendChild(colorPickerElem)

      const lengthInput = document.createElement('input')
      lengthInput.value = p.params.length || LENGTH_DEFAULT
      lengthInput.oninput = () => {
        const value = parseInt(lengthInput.value, 10)
        updateProgramParam({ name: 'length', value, title: p.title })
      }
      renderInput({ label: 'Length:', input: lengthInput, parent: paramsListElem })

      const pickr = Pickr.create({
        el: colorPickerElem,
        default: p.params.color,
        defaultRepresentation: 'RGBA',
        adjustableNumbers: true,

        components: {
          // Main components
          preview: true,
          opacity: true,
          hue: true,

          // Input / output Options
          interaction: {
            input: true,
            clear: true,
            save: true
          }
        }
      })

      pickr.on('save', (hvsa) => {
        if (hvsa) {
          const value = hvsa.toRGBA().toString()
          updateProgramParam({ name: 'color', value, title: p.title })
        }
      })

      Programs.renderParams(p.name, {
        params: p.params,
        parent: paramsListElem,
        title: p.title
      })

      const canvas = document.getElementById('preview')
      const ctx = canvas.getContext('2d')
      const rect = canvas.parentNode.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height

      let delta = 0
      const animate = () => {
        if (programElem.classList.contains('active') && programElem.parentNode)
          window.requestAnimationFrame(animate)

        if (delta >= p.params.length) delta = 0
        else delta += 1

        canvas.width = canvas.width
        const cnvs = Programs.run(p.name, { canvasHeight: config.videoHeight, canvasWidth: config.videoWidth, delta, ...p.params })
        const columnWidth = config.videoWidth / config.totalColumns
        ctx.drawImage(
          cnvs, 0, 0, columnWidth, config.videoHeight,
          0, 0, rect.width, rect.height
        )
      }

      window.requestAnimationFrame(animate)
    }

    programElem.addEventListener('click', drawActiveProgram)
    programListElem.appendChild(programElem)
  })

  if (mismatch) {
    const copySetElem = document.createElement('div')
    copySetElem.className = 'program-item'
    copySetElem.innerHTML = 'Copy Set of notes'
    copySetElem.addEventListener('click', (event) => {
      copySet = selectedNotes
    })
    programListElem.appendChild(copySetElem)

    return renderClearPrograms({ parent: programListElem })
  }

  const addProgramElem = document.createElement('div')
  addProgramElem.className = 'program-item'
  addProgramElem.innerHTML = 'Add Program'
  addProgramElem.addEventListener('click', () => {
    const firstProgram = Programs.list()[0]
    if (!programs.length) {
      selectedNotes.forEach((note) => {
        const elem = getNoteElem(note.byteIndex)
        elem.classList.add('not-empty')
      })
    }
    programs.push({
      name: firstProgram,
      params: {
        length: LENGTH_DEFAULT,
        color: COLOR_DEFAULT,
      },
      columnParams: {
        type: 'manual',
        manualSelections: {}
      }
    })
    drawProgramList({ programs })
  })
  programListElem.appendChild(addProgramElem)

  if (programs.length) {
    renderClearPrograms({ parent: programListElem })

    const addToClipboardElem = document.createElement('div')
    addToClipboardElem.className = 'program-item'
    addToClipboardElem.innerHTML = 'Add Programs to Clipboard'
    addToClipboardElem.addEventListener('click', () => {
      const pgs = JSON.parse(JSON.stringify(programs))
      addToClipboard(pgs)
      drawProgramList({ programs })
    })
    programListElem.appendChild(addToClipboardElem)

    const addToCompositionsElem = document.createElement('div')
    addToCompositionsElem.className = 'program-item'
    addToCompositionsElem.innerHTML = 'Add Programs To Compositions'
    addToCompositionsElem.addEventListener('click', () => {
      const pgs = JSON.parse(JSON.stringify(programs))
      addToCompositions(pgs)
      drawProgramList({ programs })
    })
    programListElem.appendChild(addToCompositionsElem)
  }

  if (haveCompositions()) {
    const importCompositionElem = document.createElement('div')
    importCompositionElem.className = 'program-item'
    importCompositionElem.id = 'import-compositions'
    importCompositionElem.innerHTML = 'Import from Compositions'
    importCompositionElem.addEventListener('click', () => {
      const cp = getCompositionPrograms()
      selectedNotes.forEach((note) => {
        note.programs = note.programs.concat(cp)
        if (note.programs.length) {
          const elem = getNoteElem(note.byteIndex)
          elem.classList.add('not-empty')
        }
      })
      drawProgramList({ programs: selectedNotes[0].programs })
    })
    programListElem.appendChild(importCompositionElem)
  }

  if (haveClipboard()) {
    const importElem = document.createElement('div')
    importElem.id = 'import-clipboard'
    importElem.className = 'program-item'
    importElem.innerHTML = 'Import From Clipboard'
    importElem.addEventListener('click', () => {
      const cp = getClipboardPrograms()
      selectedNotes.forEach((note) => {
        note.programs = note.programs.concat(cp)
        if (note.programs.length) {
          const elem = getNoteElem(note.byteIndex)
          elem.classList.add('not-empty')
        }
      })
      drawProgramList({ programs: selectedNotes[0].programs })
    })
    programListElem.appendChild(importElem)
  }

  if (copySet.length && selectedNotes.length == 1) {
    const pasteSetElem = document.createElement('div')
    pasteSetElem.className = 'program-item'
    pasteSetElem.innerHTML = 'Paste Set'
    pasteSetElem.addEventListener('click', () => {
      const sortedCopySet = copySet.sort((a, b) => {
        return a.byteIndex - b.byteIndex
      })

      let note = selectedNotes[0]
      const getNextNote = (tick) => getProject().midiEvents.find(e => e.name === 'Note on' && e.tick > tick)

      for (let i=0; i < sortedCopySet.length; i++) {
        const { programs } = sortedCopySet[i]
        if (programs && programs.length) {
          note.programs = JSON.parse(JSON.stringify(programs))
          const elem = getNoteElem(note.byteIndex)
          elem.classList.add('not-empty')
        }

        note = getNextNote(note.tick)
        if (!note) break
      }

      const { programs } = selectedNotes[0]
      drawProgramList({ programs })
    })
    programListElem.appendChild(pasteSetElem)
  }
}

const drawMeasure = (measureNumber) => {
  const elem = document.createElement('div')
  elem.className = 'measure'
  elem.dataset.measureNumber = measureNumber
  elem.addEventListener('click', () => {
    resetClassName('measure')
    elem.classList.add('selected')
    setPosition(measureNumber)
  })
  timeline.appendChild(elem)
}

const renderApp = () => {
  const player = getPlayer()
  timeline.innerHTML = '' //clear timeline

  renderClipboard()
  renderCompositions()

  const totalTicks = player.totalTicks
  const measureLength = player.division * 4
  const totalMeasures = Math.ceil(totalTicks / measureLength)
  console.log(`Total ticks: ${totalTicks}`)
  console.log(`Division: ${player.division}`)
  console.log(`Tempo: ${player.tempo}`)
  console.log(`Measures: ${totalMeasures}`)

  document.getElementById('tempo').innerHTML = `Tempo: ${player.tempo}`
  document.getElementById('division').innerHTML = `Division: ${player.division}`

  const drawNote = (midiEvent) => {
    const elem = document.createElement('div')
    elem.className = 'note'

    if (midiEvent.programs.length) elem.classList.add('not-empty')
    const measureNumber = Math.floor(midiEvent.tick / measureLength) + 1
    const parent = document.querySelector(`.measure:nth-child(${measureNumber})`)
    const position = ((midiEvent.tick % measureLength) / measureLength) * 100
    elem.setAttribute('style', `left: ${position}%;`)
    elem.dataset.byteIndex = midiEvent.byteIndex
    elem.dataset.tick = midiEvent.tick
    parent.appendChild(elem)
  }

  const loadNote = (event) => {
    let selectedNotes = getSelectedNotes()
    event.stopPropagation()
    if (!event.metaKey && !event.shiftKey) removeClassName('active', '.note.active')
    programParamElem.innerHTML = ''
    event.target.classList.add('active')

    const { byteIndex } = event.target.dataset
    const { midiEvent } = getMidiEvent({ byteIndex })

    if (event.metaKey) addNoteToSelection(midiEvent)
    else if (event.shiftKey && selectedNotes.length) {
      const lastNote = selectedNotes[selectedNotes.length - 1]

      const start = Math.min(midiEvent.tick, lastNote.tick)
      const end = Math.max(midiEvent.tick, lastNote.tick)
      const notes = getMidiRange(start, end)

      notes.forEach((n) => {
        const elem = getNoteElem(n.byteIndex)
        elem.classList.add('active')
      })

      selectedNotes = setSelectedNotes(selectedNotes.concat(notes))
      addNoteToSelection(midiEvent)

      // get all the values in between
    } else selectedNotes = setSelectedNotes([midiEvent])

    // set program var
    let { programs } = selectedNotes[0]
    programs = JSON.parse(JSON.stringify(programs))

    // check if equal
    let matchingPrograms = true
    for (let i=0; i < selectedNotes.length; i++) {
      let p = selectedNotes[i].programs
      if (JSON.stringify(p) !== JSON.stringify(programs)) {
        matchingPrograms = false
        break
      }
    }

    if (!matchingPrograms) {
      let commonProgramNames = programs.map(a => a.title)
      for (let i=1; i< selectedNotes.length; i++) {
        let current = selectedNotes[i].programs.map(a => a.title)
        commonProgramNames = commonProgramNames.filter(a => current.includes(a))
      }

      let commonPrograms = []

      if (commonProgramNames.length) {
        commonPrograms = programs.filter(a => commonProgramNames.includes(a.title))
      }

      /* selectedNotes.forEach((note) => {
       *   const otherPrograms = note.programs.filter(p => !commonProgramNames.includes(p.title))
       *   note.programs = otherPrograms.concat(commonPrograms)
       * })
       */
      return drawProgramList({ programs: commonPrograms, mismatch: true })
    }

    // set selectedNotes to program
    selectedNotes.forEach((note) => {
      if (!programs.length) {
        const elem = getNoteElem(note.byteIndex)
        elem.classList.remove('not-empty')
      }
      note.programs = programs
    })
    drawProgramList({ programs })
  }

  for (let i=1; i<=totalMeasures;i++) {
    drawMeasure(i)
  }

  let lastTick
  const Project = getProject()
  for (let i=0; i < Project.midiEvents.length; i++) {
    const midiEvent = Project.midiEvents[i]
    if (midiEvent.name !== 'Note on') continue
    midiEvent.programs = midiEvent.programs || []
    if (midiEvent.tick !== lastTick) {
      drawNote(midiEvent)
      lastTick = midiEvent.tick
    }
  }

  const noteElems = document.querySelectorAll('.note')
  noteElems.forEach((elem) => elem.addEventListener('click', loadNote))
}

const setPosition = (measure = selectedMeasure) => {
  const player = getPlayer()
  if (player.isPlaying()) return
  const tick = (measure - 1) * (player.division * 4)
  player.skipToTick(tick)
  const seconds = tick / player.division / player.tempo * 60
  console.log(`Seconds: ${seconds}`)
  const audio = Audio.getPlayer()
  if (audio) audio.seek(seconds)

  selectedMeasure = measure
}

module.exports = {
  renderApp,
  setPosition
}
