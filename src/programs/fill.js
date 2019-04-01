const eases = require('d3-ease')

const { renderProgramParam } = require('../utils')

const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d')

const COLOR_DEFAULT = '255,255,255'
const LENGTH_DEFAULT = 10
const EASE_DEFAULT = 'easeLinear'

const run = ({ delta, color, length, ease, width, height }) => {
  canvas.width = width
  canvas.height = height

  //TODO: validate params
  length = length || LENGTH_DEFAULT
  ease = ease || EASE_DEFAULT

  const easeFn = eases[ease]
  const t = delta / length

  if (t > 1) return canvas

  const easeValue = easeFn(t)

  const rectHeight = Math.floor(easeValue * canvas.height)
  ctx.fillStyle = color
  ctx.fillRect(0,0, canvas.width, rectHeight)

  return canvas
}

const renderParams = ({ params, parent }) => {
  /* const colorInput = document.createElement('input')
   * colorInput.value = params.color || COLOR_DEFAULT
   * colorInput.oninput = () => {
   *   params.color = colorInput.value
   * }
   * renderProgramParam({ label: 'Color:', inputElem: colorInput, parent })
   */
  const lengthInput = document.createElement('input')
  lengthInput.value = params.length || LENGTH_DEFAULT
  lengthInput.oninput = () => {
    params.length = parseInt(lengthInput.value, 10)
  }
  renderProgramParam({ label: 'Length:', inputElem: lengthInput, parent })
}

module.exports = {
  renderParams,
  run
}
