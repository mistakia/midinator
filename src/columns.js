const config = require('../config')

const convertCoordsToColumn = (x, y) => {
  const rows = config.totalColumns / config.columnWidth
  let row = y % rows
  if (!row) row = rows
  return x + (y * row)
}

const randomWalk = ({ delta, length }) => {
  const t = delta / length

  const totalSteps = config.totalColumns
  const column = Math.round(Math.random() * totalSteps)
  return [column]
}

const slide = ({ delta, length }) => {
  const loops = 1

  const t = delta / length
  const totalSteps = config.totalColumns / config.columnWidth
  const step = Math.floor(t * totalSteps)
  const base = [1, 2, 3, 4]
  const columns = base.map(c => (c + (step * totalSteps)))
  return columns
}

const manual = ({ manualSelections, columns }) => {
  const c = manualSelections || columns || {}
  return Object.keys(c).map(c => parseInt(c, 10))
}

const columnFns = {
  manual,
  slide,
  randomWalk
}

const getColumns = ({ type, delta, ...params }) => {
  if (!type) {
    return manual({ delta, ...params })
  }

  const columnFn = columnFns[type]
  return columnFn({ delta, ...params })
}

const renderColumns = ({ cnvs, ctx, columns }) => {
  const columnWidth = config.videoWidth / config.totalColumns
  for (let i=0; i < columns.length; i++) {
    const column = columns[i]
    const sx = (column * columnWidth) - columnWidth
    const sy = 0
    const columnHeight = config.videoHeight
    const dx = sx
    const dy = sy
    ctx.drawImage(
      cnvs, sx, sy, columnWidth, columnHeight,
      dx, dy, columnWidth, columnHeight
    )
  }
}

const isColumnActive = (columnNumber, params) => {
  const columns = getColumns(params)
  return columns.includes(columnNumber)
}

/*
   columnParams = {
     type: 'manual',
     manualSelections: {},
     params: {}
   }
*/
const renderColumnParams = ({ programParamElem, program }) => {
  let { columnParams } = program

  if (!columnParams) {
    columnParams = program.columnParams = { type: 'manual', manualSelections: {} }
  }

  if (program.columns) columnParams.manualSelections = program.columns

  const columnParamsElem = document.createElement('div')
  columnParamsElem.className = 'column-params'

  const columnInputs = document.createElement('div')
  columnInputs.className = 'column-container'

  let delta = 0
  const animate = () => {
    if (programParamElem.parentNode) window.requestAnimationFrame(animate)

    if (delta >= program.params.length) delta = 0
    else delta += 1

    const columnInputElems = document.querySelectorAll('.column-container .column')
    columnInputElems.forEach((elem, index) => {
      const columnActive = isColumnActive((index + 1), { delta, ...program.params, ...columnParams })
      if (columnActive)
        elem.classList.add('active')
      else
        elem.classList.remove('active')
    })
  }

  window.requestAnimationFrame(animate)

  for (let i=1; i < (config.totalColumns + 1); i++) {
    const columnInput = document.createElement('div')
    columnInput.className = 'column'

    columnInput.addEventListener('click', (event) => {
      if (columnParams.type !== 'manual') return event.stopPropagation()
      if (columnParams.manualSelections[i]) {
        delete columnParams.manualSelections[i]
        columnInput.classList.remove('active')
      } else {
        columnParams.manualSelections[i] = true
        columnInput.classList.add('active')
      }
    })
    columnInputs.appendChild(columnInput)
  }

  const columnSelect = document.createElement('select')
  Object.keys(columnFns).forEach((type) => {
    const option = document.createElement('option')
    option.text = type
    columnSelect.add(option)
  })
  if (columnParams.type) columnSelect.value = columnParams.type
  columnSelect.addEventListener('input', () => {
    columnParams.type = columnSelect.value
  })
  columnParamsElem.appendChild(columnSelect)

  columnParamsElem.appendChild(columnInputs)
  programParamElem.appendChild(columnParamsElem)
}

module.exports = {
  getColumns,
  renderColumns,
  renderColumnParams
}
