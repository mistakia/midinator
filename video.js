const ipc = require('electron').ipcRenderer
const config = require('./config')

const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
canvas.width = config.videoWidth
canvas.height = config.videoHeight

ipc.on('video', (event, message) => {
  const { imageData } = message
  const data = new Uint8ClampedArray(imageData.data)
  const ig = new ImageData(data, config.videoWidth, config.videoHeight)
  ctx.putImageData(ig, 0, 0)
})
