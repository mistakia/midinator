const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d')

const { setCanvas } = require('../utils')

const run = ({ delta, color, length }) => {
  setCanvas(canvas, ctx)

  //TODO: validate params
  color = color || '255,255,255'
  length = length || 10

  const opacity = 1 - (delta / length)
  if (opacity <= 0) return canvas
  ctx.fillStyle = `rgba(${color},${opacity})`
  ctx.fillRect(0,0, 600, 200)

  return canvas
}

const renderParams = ({ params }) => {
  const container = document.createElement('div')
  const colorLabel = document.createElement('label')
  colorLabel.innerHTML = 'Color:'
  const colorInput = document.createElement('input')
  colorInput.value = params.color || '255,255,255'
  colorInput.oninput = () => {
    params.color = colorInput.value
  }
  container.appendChild(colorLabel)
  container.appendChild(colorInput)

  const lengthLabel = document.createElement('label')
  lengthLabel.innerHTML = 'Length:'
  const lengthInput = document.createElement('input')
  lengthInput.value = params.length || 10
  lengthInput.oninput = () => {
    params.length = lengthInput.value
  }
  container.appendChild(lengthLabel)
  container.appendChild(lengthInput)
  return container
}

module.exports = {
  renderParams,
  run
}
