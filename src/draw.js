const timeline = document.getElementById('timeline')
const PROGRAMS = require('./programs')
const {
  clearProgramActive,
  clearNoteActive,
  clearProgramParams
} = require('./utils')

const drawColumnParams = (program, parent) => {
  const { columns } = program
  const label = document.createElement('label')
  label.innerHTML = 'Columns:'
  const input = document.createElement('input')
  input.value = columns.length ? columns.toString() : ''
  input.oninput = () => {
    const values = JSON.parse('[' + input.value + ']')
    //TODO: validate
    program.columns = values
  }
  parent.appendChild(label)
  parent.appendChild(input)
}

const drawProgramList = (programs) => {
  clearProgramParams()
  const programListElem = document.getElementById('program-list')
  programListElem.innerHTML = ''

  programs.forEach((p, idx) => {
    const programElem = document.createElement('div')
    programElem.className = 'program-item'

    const remove = document.createElement('div')
    remove.className = 'close'
    programElem.appendChild(remove)
    remove.addEventListener('click', (event) => {
      event.stopPropagation()
      programs.splice(idx, 1)
      drawProgramList(programs)
    })

    const select = document.createElement('select')
    Object.keys(PROGRAMS).forEach((name) => {
      const option = document.createElement('option')
      option.text = name
      select.add(option)
    })
    programElem.addEventListener('click', (event) => {
      clearProgramActive()
      programElem.className += ' active'

      const programName = select.value
      const paramElem = PROGRAMS[programName].renderParams({ params: p.params } )
      drawColumnParams(p, paramElem)
      const programParamElem = document.getElementById('program-params')
      programParamElem.innerHTML = ''
      programParamElem.appendChild(paramElem)

      const canvas = document.getElementById('preview')
      const ctx = canvas.getContext('2d')
      const rect = canvas.parentNode.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, rect.width, rect.height)

      let delta = 0
      const animate = () => {
        if (programElem.classList.contains('active') && programElem.parentNode)
          window.requestAnimationFrame(animate)

        if (delta > (p.params.length || 10)) delta = 0
        else delta += 1

        canvas.width = canvas.width
        const cnvs = PROGRAMS[programName].run({ delta, ...p.params })
        ctx.drawImage(cnvs, 0, 0)
      }

      window.requestAnimationFrame(animate)
    })
    programElem.appendChild(select)
    programListElem.appendChild(programElem)
  })

  const addProgramElem = document.createElement('div')
  addProgramElem.className = 'program-item'
  addProgramElem.innerHTML = 'Add Program'
  addProgramElem.addEventListener('click', (event) => {
    const firstProgram = Object.keys(PROGRAMS)[0]
    programs.push({ name: firstProgram, params: {}, columns: [] })
    drawProgramList(programs)
  })
  programListElem.appendChild(addProgramElem)
}

const drawMeasure = (measureNumber) => {
  const elem = document.createElement('div')
  elem.className = 'measure'
  elem.dataset.measureNumber = measureNumber
  timeline.appendChild(elem)
}

const drawTimeline = ({ Player, Project }) => {
  timeline.innerHTML = '' //clear timeline

  const totalTicks = Player.totalTicks
  const measureLength = Player.division * 4
  const totalMeasures = Math.ceil(totalTicks / measureLength)
  console.log(`Total ticks: ${totalTicks}`)
  console.log(`Division: ${Player.division}`)
  console.log(`Tempo: ${Player.tempo}`)
  console.log(`Measures: ${totalMeasures}`)

  const drawNote = (event, eventIndex) => {
    const elem = document.createElement('div')
    elem.className = 'note'

    const measureNumber = Math.floor(event.tick / measureLength) + 1

    const parent = document.querySelector(`.measure:nth-child(${measureNumber})`)
    const position = ((event.tick % measureLength) / measureLength) * 100
    elem.setAttribute('style', `left: ${position}%;`)
    elem.dataset.eventIndex = eventIndex
    parent.appendChild(elem)
  }

  const loadNote = (event) => {
    clearNoteActive()
    clearProgramParams()
    event.target.className += ' active'
    const eventIndex = event.target.dataset.eventIndex
    const midiEvent = Project.midiEvents[eventIndex]

    let { programs } = midiEvent
    drawProgramList(programs)
  }

  for (let i=1; i<=totalMeasures;i++) {
    drawMeasure(i)
  }

  for (let i=0; i < Project.midiEvents.length; i++) {
    const event = Project.midiEvents[i]
    if (event.name !== 'Note on') continue
    event.programs = event.programs || []
    drawNote(event, i)
  }

  const noteElems = document.querySelectorAll('.note')
  noteElems.forEach((elem) => elem.addEventListener('click', loadNote))
}

module.exports = {
  drawTimeline
}
