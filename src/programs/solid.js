const { renderParam } = require('../utils')
const { noiseEffect } = require('../effects')
const Param = require('../param')
const config = require('../../config')

const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d')

const COLOR_DEFAULT = 'rgba(255,255,255,1)'

const run = ({
  delta,
  length,
  color,
  y,
  height,
  canvasWidth,
  canvasHeight,
  noise,
  opacity
}) => {

  canvas.width = canvasWidth
  canvas.height = canvasHeight

  color = color || COLOR_DEFAULT

  const t = delta / length

  const heightParam = new Param(height)
  const heightValue = heightParam.getValue(t)

  const yParam = new Param(y)
  const yValue = yParam.getValue(t)

  const opacityParam = new Param(opacity)
  const opacityValue = opacityParam.getValue(t)

  const noiseParam = new Param(noise)
  const noiseValue = noiseParam.getValue(t)

  ctx.fillStyle = color.replace(/[^\,)]+\)/, `${opacityValue})`)

  if (noiseValue) {
    noiseEffect({
      ctx,
      startY: yValue,
      totalHeight: canvas.height,
      width: canvas.width,
      height: heightValue,
      noise: noiseValue
    })
    return canvas
  }

  ctx.fillRect(0, yValue, canvasWidth, heightValue)
  return canvas
}

const renderParams = ({ params, parent }) => {
  if (!params.height) {
    params.height = {
      start: 0,
      end: config.videoHeight,
      ease: 'easeBounce'
    }
  }
  renderParam({
    name: 'Height',
    param: params.height,
    min: 0,
    max: config.videoHeight,
    parent
  })

  if (!params.y) {
    params.y = {
      start: 0,
      end: 0,
      ease: 'easeLinear'
    }
  }
  renderParam({
    name: 'Y Position',
    min: 0,
    max: config.videoHeight,
    param: params.y,
    parent
  })

  if (!params.opacity) {
    params.opacity = {
      start: 1,
      end: 1,
      ease: 'easeLinear'
    }
  }
  renderParam({
    name: 'Opacity',
    min: 0,
    max: 1,
    step: 0.01,
    param: params.opacity,
    parent
  })

  if (!params.noise) {
    params.noise = {
      start: 0,
      end: 0,
      ease: 'easeLinear'
    }
  }
  console.log(params.noise)
  renderParam({
    name: 'Noise',
    min: 0,
    max: 100,
    param: params.noise,
    parent
  })
}

module.exports = {
  renderParams,
  run
}
