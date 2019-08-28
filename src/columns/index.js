const config = require('../../config')

const manual = ({ columnParams }) => {
  const { manualSelections } = columnParams
  const c = manualSelections || {}
  return Object.keys(c).map(c => parseInt(c, 10))
}

const columnFns = {
  manual,
  slide: require('./slide'),
  randomWalk: require('./random-walk')
}

const getColumns = ({ delta, columnParams, params }) => {
  const { type } = columnParams
  if (!type || type === 'manual') {
    return manual({ delta, columnParams, params })
  }

  const columnFn = columnFns[type].run
  return columnFn({ delta, columnParams, params })
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
  console.log(program)
  let { columnParams } = program

  if (!columnParams) {
    columnParams = program.columnParams = { type: 'manual', manualSelections: {} }
  }

  if (program.columns) columnParams.manualSelections = program.columns

  let columnParamsElem = document.querySelector('#program-params .column-params')
  if (columnParamsElem) {
    columnParamsElem.innerHTML = ''
  } else {
    columnParamsElem = document.createElement('div')
    programParamElem.appendChild(columnParamsElem)
  }

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
      const columnActive = isColumnActive((index + 1), { delta, params: program.params, columnParams: columnParams })
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
    renderColumnParams({ programParamElem, program })
  })
  columnParamsElem.appendChild(columnSelect)

  columnParamsElem.appendChild(columnInputs)

  if (columnParams.type !== 'manual' && columnFns[columnParams.type].renderParams) {
    columnFns[columnParams.type].renderParams({
      parent: columnParamsElem,
      columnParams,
      title: program.title
    })
  }
}

module.exports = {
  getColumns,
  renderColumns,
  renderColumnParams
}
