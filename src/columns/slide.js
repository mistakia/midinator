const config = require('../../config')
const Param = require('../param')
const { renderParam } = require('../utils')

const convertCoordsToColumn = (x, y) => {
  const rows = config.totalColumns / config.columnWidth

  // ignore if x coord is greater than number of columns
  if (x > rows) {
    return null
  }

  return (x + (y * rows) - rows)
}

const columnLength = (config.totalColumns / config.columnWidth)

const run = ({ delta, params, columnParams }) => {
  const loops = 1

  const t = delta / params.length

  const xParam = new Param(columnParams.x)
  const xValue = Math.round(xParam.getValue(t))

  const yParam = new Param(columnParams.y)
  const yValue = Math.round(yParam.getValue(t))

  const xWidthParam = new Param(columnParams.xWidth)
  const xWidthValue = Math.round(xWidthParam.getValue(t))

  const yWidthParam = new Param(columnParams.yWidth)
  const yWidthValue = Math.round(yWidthParam.getValue(t))

  let columns = []
  for (let xInt=0; xInt<xWidthValue; xInt++) {
    for (let yInt=0; yInt<yWidthValue; yInt++) {
      let x = (xValue + xInt)
      let y = (yValue + yInt)
      const c = convertCoordsToColumn(x, y)
      columns.push(c)
    }
  }

  return columns
}

const renderParams = ({ parent, columnParams, title }) => {
  if (!columnParams.x) {
    columnParams.x = {
      start: 1,
      end: config.columnWidth,
      ease: 'easeLinear'
    }
  }
  renderParam({
    name: 'x',
    param: columnParams.x,
    min: 1,
    max: config.columnWidth,
    isColumnParam: true,
    title,
    parent
  })

  if (!columnParams.y) {
    columnParams.y = {
      start: 1,
      end: 1,
      ease: 'easeLinear'
    }
  }
  renderParam({
    name: 'y',
    param: columnParams.y,
    min: 1,
    max: columnLength,
    isColumnParam: true,
    title,
    parent
  })

  if (!columnParams.xWidth) {
    columnParams.xWidth = {
      start: 1,
      end: 1,
      ease: 'easeLinear'
    }
  }
  renderParam({
    name: 'xWidth',
    param: columnParams.xWidth,
    min: 1,
    max: config.columnWidth,
    isColumnParam: true,
    title,
    parent
  })

  if (!columnParams.yWidth) {
    columnParams.yWidth = {
      start: 4,
      end: 4,
      ease: 'easeLinear'
    }
  }
  renderParam({
    name: 'yWidth',
    param: columnParams.yWidth,
    min: 1,
    max: columnLength,
    isColumnParam: true,
    title,
    parent
  })
}

module.exports = {
  run,
  renderParams
}
