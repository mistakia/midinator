const { renderProgramParam } = require('../utils')
const { noiseEffect } = require('../effects')

const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d')

const LENGTH_DEFAULT = 10
const STROKE_DEFAULT = 5
const Y_DEFAULT = 0
const COLOR_DEFAULT = 'rgba(255,255,255,1)'

const run = ({ delta, length, color, y, stroke, width, height, noise }) => {
  canvas.width = width
  canvas.height = height

  length = length || LENGTH_DEFAULT
  stroke = stroke || STROKE_DEFAULT
  y = y || Y_DEFAULT
  color = color || COLOR_DEFAULT

  ctx.fillStyle = color
  if (noise) {
    noiseEffect({
      ctx,
      startY: y,
      totalHeight: canvas.height,
      width: canvas.width,
      height: stroke,
      noise
    })
    return canvas
  }

  ctx.fillRect(0, y, width, stroke)
  return canvas
}

const renderParams = ({ params, parent }) => {
  const lengthInput = document.createElement('input')
  lengthInput.value = params.length || LENGTH_DEFAULT
  lengthInput.oninput = () => {
    params.length = parseInt(lengthInput.value, 10)
  }
  renderProgramParam({ label: 'Length:', inputElem: lengthInput, parent })

  const strokeInput = document.createElement('input')
  strokeInput.value = params.stroke || STROKE_DEFAULT
  strokeInput.oninput = () => {
    params.stroke = parseInt(strokeInput.value, 10)
  }
  renderProgramParam({ label: 'Stroke:', inputElem: strokeInput, parent })

  const yInput = document.createElement('input')
  yInput.value = params.y || Y_DEFAULT
  yInput.oninput = () => {
    params.y = parseInt(yInput.value, 10)
  }
  renderProgramParam({ label: 'Y:', inputElem: yInput, parent })
}

module.exports = {
  renderParams,
  run
}
