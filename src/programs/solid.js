const { renderProgramParam } = require('../utils')

const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d')

const LENGTH_DEFAULT = 10
const COLOR_DEFAULT = '255,255,255'
const OPACITY_DEFAULT = 1
const STROKE_DEFAULT = 5
const Y_DEFAULT = 0

const run = ({ delta, length, color, y, stroke, opacity, width, height }) => {
  canvas.width = width
  canvas.height = height

  color = color || COLOR_DEFAULT
  length = length || LENGTH_DEFAULT
  opacity = opacity || OPACITY_DEFAULT
  stroke = stroke || STROKE_DEFAULT
  y = y || Y_DEFAULT

  ctx.fillStyle = `rgba(${color}, ${opacity})`
  ctx.fillRect(0, y, width, stroke)
  return canvas
}

const renderParams = ({ params, parent }) => {
  const colorInput = document.createElement('input')
  colorInput.value = params.color || COLOR_DEFAULT
  colorInput.oninput = () => {
    params.color = colorInput.value
  }
  renderProgramParam({ label: 'Color:', inputElem: colorInput, parent })

  const lengthInput = document.createElement('input')
  lengthInput.value = params.length || LENGTH_DEFAULT
  lengthInput.oninput = () => {
    params.length = parseInt(lengthInput.value, 10)
  }
  renderProgramParam({ label: 'Length:', inputElem: lengthInput, parent })

  const opacityInput = document.createElement('input')
  opacityInput.value = params.opacity || OPACITY_DEFAULT
  opacityInput.oninput = () => {
    params.opacity = opacityInput.value
  }
  renderProgramParam({ label: 'Opacity:', inputElem: opacityInput, parent })

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
