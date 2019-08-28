const config = require('../../config')
const { renderParam } = require('../utils')
const Param = require('../param')

const run = ({ delta, params, columnParams }) => {
  if (!columnParams._random || columnParams._random.length !== params.length) {
    columnParams._random = []
    for (let i = 0; i < params.length; i++) {
      columnParams._random.push(Math.random())
    }
  }

  const t = delta / params.length

  const { steps } = columnParams

  const stepsParam = new Param(steps)
  const stepsValue = stepsParam.getValue(t)

  if (columnParams._lastRandomStep && (delta - columnParams._lastRandomStep) < stepsValue) {
    return [columnParams._lastColumn]
  }

  columnParams._lastRandomStep = delta
  //const randomSeeds = columnParams._random.slice(0, stepsValue)
  const randomSeed = columnParams._random[Math.round(t * params.length)]
  columnParams._lastColumn = Math.round(randomSeed * config.totalColumns)

  return [columnParams._lastColumn]
}

const renderParams = ({ parent, columnParams, title }) => {
  if (!columnParams.steps) {
    columnParams.steps = {
      start: 10,
      end: 10,
      ease: 'easeLinear'
    }
  }
  renderParam({
    name: 'steps',
    param: columnParams.steps,
    min: 1,
    max: 100,
    isColumnParam: true,
    title,
    parent
  })
}

module.exports = {
  run,
  renderParams
}
