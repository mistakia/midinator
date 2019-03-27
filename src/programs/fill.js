const eases = require('d3-ease')

const { setCanvas, renderProgramParam } = require('../utils')

const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d')

const COLOR_DEFAULT = '255,255,255'
const LENGTH_DEFAULT = 10
const EASE_DEFAULT = 'easeLinear'

const run = ({ delta, color, length, ease, brightness }) => {
  setCanvas(canvas, ctx)

  //TODO: validate params
  color = color || COLOR_DEFAULT
  brightness = brightness || 1
  length = length || LENGTH_DEFAULT
  ease = ease || EASE_DEFAULT

  const easeFn = eases[ease]
  const t = delta / length

  const easeValue = easeFn(t)

  const height = Math.floor(easeValue * canvas.height)
  ctx.fillStyle = `rgba(${color},${brightness})`
  ctx.fillRect(0,0, 600, height)

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
    params.length = lengthInput.value
  }
  renderProgramParam({ label: 'Length:', inputElem: lengthInput, parent })
}

module.exports = {
  renderParams,
  run
}
