const path = require('path')

const eases = require('d3-ease')
const ffmpeg = require('fluent-ffmpeg')
const leftpad = require('leftpad')

const { renderProgramParam } = require('./utils')

const LENGTH_DEFAULT = 10
const EASE_DEFAULT = 'easeLinear'
const REVERSE_DEFAULT = false

const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d')

const loadImage = async (imgpath) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onerror = () => {
      reject('failed to load')
    }
    img.onload = () => {
      resolve(img)
    }
    img.src = `file://${imgpath}`
  })
}

class Program {
  constructor(filepath) {
    this.filepath = filepath
    this.filename = path.basename(filepath)
    this.images = []
  }

  load() {
    return new Promise((resolve, reject) => {
      ffmpeg(this.filepath).ffprobe((err, data) => {
        if (err) return reject(err)

        this.totalFrames = data.streams[0].nb_frames
        console.log(`Loading program with ${this.totalFrames} frames`)

        //ffmpeg -i video.webm -vf "select=eq(pict_type\,I)" -vsync vfr thumb%04d.jpg -hide_banner
        const outputPath = path.resolve(__dirname, `../frames/${this.filename}-%05d.png`)
        const cmd = ffmpeg(this.filepath)
          .filterGraph(['select=eq(pict_type\\,I)'])
          .outputOption('-vsync vfr')
          .outputOption('-hide_banner')
          .output(outputPath)
          .on('end', async () => {
            console.log('Loading images')
            for (let i=1; i <= this.totalFrames; i++) {
              const filename = `${this.filename}-${leftpad(i, 5)}.png`
              const imgpath = path.resolve(__dirname, '../frames/', filename)
              const img = await loadImage(imgpath)
              this.images.push(img)
            }
            console.log('Program loaded!')
            resolve()
          })
          .on('error', (err, stdout, stderr) => {
            reject(err)
          })
          .run()

      })
    })
  }

  run({ delta, length, ease, reverse, width, height }) {
    canvas.width = width
    canvas.height = height

    length = length || LENGTH_DEFAULT
    ease = ease || EASE_DEFAULT
    reverse = reverse || REVERSE_DEFAULT

    const easeFn = eases[ease]
    const t = delta / length
    let easeValue = easeFn(t)
    if (reverse) easeValue = 1 - easeValue

    let frame = Math.floor(easeValue * this.totalFrames)
    const img = this.images[frame]
    if (!img) return canvas

    ctx.drawImage(img, 0, 0, 100, 100 * img.height / img.width)
    return canvas
  }

  renderParams({ params, parent }) {
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
}

module.exports = Program
