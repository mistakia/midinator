const fs = require('fs')

const leftpad = require('leftpad')
const Frame  = require('canvas-to-buffer')
const MidiPlayer = require('midi-player-js')
const rimraf = require('rimraf')
const ffmpeg = require('fluent-ffmpeg')
const jsonfile = require('jsonfile')

const { dialog, getCurrentWindow } = require('electron').remote
const win = getCurrentWindow()

let PROGRAMS = require('./src/programs')
const { drawTimeline } = require('./src/draw')

let Player
let Project = {}

const timeline = document.getElementById('timeline')
const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
canvas.width = 600
canvas.height = 200

const loadMidi = () => {
  dialog.showOpenDialog({
    title: 'Load Midi File',
    message: 'select a .mid file',
    properties: ['openFile'],
    filters: [
      { name: 'Midi', extensions: ['mid', 'midi'] }
    ]
  }, function (files) {
    if (files !== undefined) {
      Project.midiFile = files[0]
      Player = new MidiPlayer.Player()
      Player.loadFile(Project.midiFile)

      Project.midiEvents = Player.getEvents()[0]
      drawTimeline({ Player, Project })
    }
  })
}

const play = () => {
  if (!Player) return
  if (Player.isPlaying()) {
    Player.stop()
    const elem = document.getElementById('current-position')
    if (elem.parentNode) elem.parentNode.removeChild(elem)
    return document.querySelector('#play').innerHTML = 'Play'
  }

  let currentTick = 0
  const currentPosition = document.createElement('div')
  currentPosition.id = 'current-position'
  const animate = () => {
    if (Player.isPlaying()) window.requestAnimationFrame(animate)

    if (currentPosition.parentNode) currentPosition.parentNode.removeChild(currentPosition)
    const measureLength = Player.division * 4
    const currentMeasure = Math.ceil(currentTick / measureLength)
    const parent = document.querySelector(`.measure:nth-child(${currentMeasure})`)
    const position = ((currentTick % measureLength) / measureLength) * 100
    currentPosition.setAttribute('style', `left: ${position}%;`)
    if (parent && Player.isPlaying()) parent.appendChild(currentPosition)

    // reset canvas
    canvas.width = canvas.width

    for (let e=0; e < Project.midiEvents.length; e++) {
      const midiEvent = Project.midiEvents[e]

      if (midiEvent.tick > currentTick) continue
      if (midiEvent.name !== 'Note on') continue
      if (!midiEvent.programs.length) continue

      midiEvent.programs.forEach((program) => {
        const end = program.params.length + midiEvent.tick
        if (currentTick > end) return

        const delta = currentTick - midiEvent.tick
        const cnvs = PROGRAMS[program.name].run({ height: canvas.height, width: canvas.width, delta, ...program.params })

        if (!program.columns.length) return ctx.drawImage(cnvs, 0, 0)
        for (let i=0; i<program.columns.length; i++) {
          const column = program.columns[i]
          const sx = (column * 100) - 100
          const sy = 0
          const columnWidth = 100
          const columnHeight = 200
          const dx = sx
          const dy = sy
          ctx.drawImage(
            cnvs, sx, sy, columnWidth, columnHeight,
            dx, dy, columnWidth, columnHeight
          )
        }
      })
    }
  }

  Player.on('playing', (tick) => currentTick = tick.tick)
  //Player.on('midiEvent', (event) => currentEvent = event)


  Player.play()
  document.querySelector('#play').innerHTML = 'Stop'
  window.requestAnimationFrame(animate)
}

const showExportDialog = () => {
  dialog.showSaveDialog({
    title: 'Save Video File',
    defaultPath: '~/Downloads/output',
    //message: 'select a .mid file',
    filters: [
      { name: 'Video', extensions: ['mp4'] }
    ]
  }, function (file) {
    if (file) exportVideo(file)
  })
}

const exportVideo = (outputPath) => {
  console.log('clearing frames')

  if (!fs.existsSync('./tmp')) {
    fs.mkdirSync('./tmp')
  }
  rimraf.sync('tmp/*')

  const progressElem = document.getElementById('progress')
  let f = 0

  const renderFrame = () => {
    // reset canvas
    canvas.width = canvas.width

    for (let e=0; e < Project.midiEvents.length; e++) {
      const midiEvent = Project.midiEvents[e]

      if (midiEvent.tick > f) continue
      if (midiEvent.name !== 'Note on') continue
      if (!midiEvent.programs.length) continue

      midiEvent.programs.forEach((program) => {
        const end = (program.params.length || 10) + midiEvent.tick
        if (f > end) return

        const delta = f - midiEvent.tick
        const cnvs = PROGRAMS[program.name].run({ delta, ...program.params })

        if (!program.columns.length) return ctx.drawImage(cnvs, 0, 0)
        for (let i=0; i<program.columns.length; i++) {
          const column = program.columns[i]
          const sx = (column * 100) - 100
          const sy = 0
          const columnWidth = 100
          const columnHeight = 200
          const dx = sx
          const dy = sy
          ctx.drawImage(
            cnvs, sx, sy, columnWidth, columnHeight,
            dx, dy, columnWidth, columnHeight
          )
        }
      })
    }

    const frame = new Frame(canvas, { quality: 1, image: { types: ['png'] }})
    fs.writeFileSync('tmp/' + leftpad(start, 5) + '.png', frame.toBuffer())

    if (f < Player.totalTicks) {
      const percent = `${Math.round(i/Player.totalTicks * 100)}`

      f += 1
      if (progressElem.value != percent) {
        progressElem.value = parseInt(percent, 10)
        setTimeout(() => renderFrame(), 30)
      } else renderFrame()
    } else runFFmpeg(outputPath)
  }

  renderFrame()
}

const runFFmpeg = (outputPath) => {
  console.log('running ffmpeg')
  //TODO: run ffmpeg generate video
  // ffmpeg -r 192 -i frames/%5d.png -c:v libx264 -r 30 -pix_fmt yuv420p mp4/chappell.mp4
  const inputFPS = 1000 / (60000 / (Player.tempo * Player.division))
  const cmd = ffmpeg('tmp/%5d.png')
    .inputFPS(inputFPS)
    .videoCodec('libx264')
    .outputOptions(['-pix_fmt yuv420p'])
    .outputFps(40)
    .output(outputPath)
    .on('end', function() {
      console.log('Finished processing')
    })
    .on('error', function(err, stdout, stderr) {
      alert(`Error: ${err.message}`)
      console.log('Cannot process video: ' + err.message)
    })
    .run()
}

const save = () => {
  dialog.showSaveDialog({
    title: 'Save Project File',
    defaultPath: '~/Downloads/light-project',
    filters: [
      { name: 'JSON', extensions: ['json'] }
    ]
  }, function (file) {
    if (file) {
      jsonfile.writeFileSync(file, Project)
    }
  })
}

const loadJSON = () => {
  dialog.showOpenDialog({
    title: 'Load JSON File',
    message: 'select a .json file',
    properties: ['openFile'],
    filters: [
      { name: 'JSON', extensions: ['json'] }
    ]
  }, (files) => {
    if (files !== undefined) {
      const file = files[0]
      Project = jsonfile.readFileSync(file)
      Player = new MidiPlayer.Player()
      Player.on('fileLoaded', () => {
        Player.tracks[0].events = Project.midiEvents
        Player.events[0] = Project.midiEvents
        drawTimeline({ Player, Project })
      })
      Player.loadFile(Project.midiFile)
    }
  })
}

document.querySelector('#play').addEventListener('click', play)
document.querySelector('#loadMidi').addEventListener('click', loadMidi)
document.querySelector('#loadJSON').addEventListener('click', loadJSON)
document.querySelector('#save').addEventListener('click', save)
document.querySelector('#export').addEventListener('click', showExportDialog)
