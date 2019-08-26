const ipc = require('electron').ipcRenderer

let images = {}
function setup() {
  createCanvas(500, 500, WEBGL)
  camera(0, -200, 300, -50, 100 , 0, 0, 30, 0)
}

const singleColumnWidth = 10
const colHeight = -100
const colRowCount = 4
const colDepthCount = 4
const colSpacing = singleColumnWidth * 10
const roomWidth = (colSpacing + singleColumnWidth) * colRowCount
const roomDepth = (colSpacing + singleColumnWidth) * colDepthCount

const imageColumnWidth = 40

function draw() {
  debugMode()
  background(200)
  orbitControl()
  translate(-(roomWidth/2), 0, -(roomDepth/2))
  for(let i = 0; i < 16; i++) {
    const z = Math.floor(i / 4)
    const x = i % 4
    const xValue = Math.round(x * colSpacing)
    const zValue = Math.round(z * colSpacing)

    let image
    if (images && images[i]) {
      image = images && images[i]
    }

    fill(50)
    // left side
    beginShape()
    image && texture(image)
    vertex(
      xValue,
      colHeight,
      zValue,
      0,
      image && image.height
    )

    vertex(
      xValue,
      colHeight,
      zValue + singleColumnWidth,
      image && image.width,
      image && image.height
    )

    vertex(
      xValue,
      0,
      zValue + singleColumnWidth,
      0,
      image && image.width
    )

    vertex(
      xValue,
      0,
      zValue,
      0,
      0
    )
    endShape()

    // right side
    beginShape()
    image && texture(image)
    vertex(
      xValue + singleColumnWidth,
      colHeight,
      zValue,
      0,
      image && image.height
    )

    vertex(
      xValue + singleColumnWidth,
      colHeight,
      zValue + singleColumnWidth,
      image && image.width,
      image && image.height
    )

    vertex(
      xValue + singleColumnWidth,
      0,
      zValue + singleColumnWidth,
      0,
      image && image.width
    )

    vertex(
      xValue + singleColumnWidth,
      0,
      zValue,
      0,
      0
    )
    endShape()


    //back
    beginShape()
    image && texture(image)
    vertex(
      xValue,
      colHeight,
      zValue,
      0,
      image && image.height
    )

    vertex(
      xValue + singleColumnWidth,
      colHeight,
      zValue,
      image && image.width,
      image && image.height
    )

    vertex(
      xValue + singleColumnWidth,
      0,
      zValue,
      0,
      image && image.width
    )

    vertex(
      xValue,
      0,
      zValue,
      0,
      0
    )
    endShape()

    //front
    beginShape()
    image && texture(image)
    // top right
    vertex(
      xValue,
      colHeight,
      zValue + singleColumnWidth,
      image && image.width,
      image && image.height
    )

    // top left
    vertex(
      xValue + singleColumnWidth,
      colHeight,
      zValue + singleColumnWidth,
      0,
      image && image.height
    )

    // bottom left
    vertex(
      xValue + singleColumnWidth,
      0,
      zValue + singleColumnWidth,
      0,
      0
    )

    // bottom right
    vertex(
      xValue,
      0,
      zValue + singleColumnWidth,
      image && image.width,
      0
    )
    endShape()
  }
}

ipc.on('render', (event, message) => {
  Object.keys(message.images).forEach((i) => {
    images[i] = loadImage(message.images[i])
  })
})
