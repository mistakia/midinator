const eases = require('d3-ease')

const { renderProgramParam } = require('../utils')

const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d')

const COLOR_DEFAULT = '255,255,255'
const LENGTH_DEFAULT = 10
const EASE_DEFAULT = 'easeLinear'
const REVERSE_DEFAULT = false

const run = ({ delta, color, length, ease, reverse, width, height }) => {
  canvas.width = width
  canvas.height = height

  //TODO: validate params
  color = color || COLOR_DEFAULT
  length = length || LENGTH_DEFAULT
  ease = ease || EASE_DEFAULT
  reverse = reverse || REVERSE_DEFAULT

  const easeFn = eases[ease]
  const t = delta / length

  if (t > 1) return canvas

  let easeValue = easeFn(t)
  if (reverse) easeValue = 1 - easeValue

  if (easeValue <= 0) return canvas
  ctx.fillStyle = `rgba(${color},${easeValue})`
  ctx.fillRect(0, 0, 600, 200)

  return canvas
}

const renderParams = ({ params, parent }) => {
  const colorInput = document.createElement('input')
  colorInput.value = params.color || '255,255,255'
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

  const reverseInput = document.createElement('input')
  reverseInput.type = 'checkbox'
  reverseInput.checked = !!params.reverse
  reverseInput.oninput = () => {
    params.reverse = reverseInput.checked
  }
  renderProgramParam({ label: 'Reverse:', inputElem: reverseInput, parent })
}

module.exports = {
  renderParams,
  run
}