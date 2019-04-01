const eases = require('d3-ease')

const { renderProgramParam } = require('../utils')

const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d')

const LENGTH_DEFAULT = 10
const EASE_DEFAULT = 'easeLinear'
const REVERSE_DEFAULT = false
const COLOR_DEFAULT = 'rgba(255,255,255,1)'

const run = ({ delta, color, length, ease, reverse, width, height }) => {
  canvas.width = width
  canvas.height = height

  //TODO: validate params
  length = length || LENGTH_DEFAULT
  ease = ease || EASE_DEFAULT
  reverse = reverse || REVERSE_DEFAULT
  color = color || COLOR_DEFAULT

  const easeFn = eases[ease]
  const t = delta / length

  if (t > 1) return canvas

  let easeValue = easeFn(t)
  if (reverse) easeValue = 1 - easeValue

  if (easeValue <= 0) return canvas
  ctx.fillStyle = color.replace(/[^\,)]+\)/, `${easeValue})`) //`rgba(${color},${easeValue})`
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  return canvas
}

const renderParams = ({ params, parent }) => {
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
