module.exports = function({ canvas, ctx, delta }) {
  console.log('program')
  ctx.fillStyle = `rgba(255,255,255,${1-delta})`
  ctx.fillRect(0,0, 600, 100)
  //fs.writeFileSync('frames/' + leftpad(start, 5) + '.png', canvas.toBuffer())
}
