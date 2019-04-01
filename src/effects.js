const config = require('../config')

const noiseEffect = ({ ctx, totalHeight, width, height, noise, startY }) => {
  const ledHeight = totalHeight / config.ledHeight
  const ledWidth = width / config.ledstrips

  startY = startY || 0

  for (let x=0; x < width; x += ledWidth) {
    let y = startY
    if (height < ledHeight) {
      const seed = Math.round(Math.random() * 100)
      if (seed > noise) {
        ctx.fillRect(x, y, ledWidth, height)
      }
      continue
    }

    const limit = startY + height
    for (; y < limit; y += ledHeight) {
      const seed = Math.round(Math.random() * 100)
      if (seed > noise) {
        ctx.fillRect(x, y, ledWidth, ledHeight)
      }
    }
  }
}

module.exports = {
  noiseEffect
}
