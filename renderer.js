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
const { setCanvas } = require('./src/utils')
const { drawTimeline } = require('./src/draw')

let Player
let Project = {}

const timeline = document.getElementById('timeline')
const canvas = document.getElementById('canvas')
setCanvas()

const ctx = canvas.getContext('2d')
const listen = (event) => console.log(event)

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
      Player = new MidiPlayer.Player(listen)
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
    return document.querySelector('#play').innerHTML = 'Play'
  }

  let currentEvent
  let currentTick = 0
  const animate = () => {
    if (Player.isPlaying()) window.requestAnimationFrame(animate)
    if (!currentEvent) return
    if (currentEvent.name !== 'Note on') return

    setCanvas()
    const delta = currentTick - currentEvent.tick
    const { programs } = currentEvent
    if (programs.length) {
      programs.forEach((p) => PROGRAMS[p.name].run({ canvas, ctx, delta, ...p.params }))
    }
  }

  Player.on('playing', (tick) => currentTick = tick.tick)
  Player.on('midiEvent', (event) => currentEvent = event)


  Player.play()
  document.querySelector('#play').innerHTML = 'Stop'
  window.requestAnimationFrame(animate)
}

const showMakeDialog = () => {
  dialog.showSaveDialog({
    title: 'Save Video File',
    defaultPath: '~/Downloads/output',
    //message: 'select a .mid file',
    filters: [
      { name: 'Video', extensions: ['mp4'] }
    ]
  }, function (file) {
    if (file) make(file)
  })
}

const make = (outputPath) => {

  console.log('clearing frames')
  rimraf.sync('tmp/*')

  console.log('making frames')
  let createdFrames = {}
  for (let i=0; i < Project.midiEvents.length; i++) {
    const midiEvent = Project.midiEvents[i]
    if (midiEvent.name !== 'Note on') continue
    if (!midiEvent.programs.length) continue

    const nextEvent = Project.midiEvents[i+1]
    let start = midiEvent.tick
    const end = nextEvent ? nextEvent.tick : Player.totalTicks
    for (;start < end; start++) {
      setCanvas()
      const delta = start - midiEvent.tick
      midiEvent.programs.forEach((program) => {
        PROGRAMS[program.name].run({ canvas, ctx, delta, ...program.params })
      })

      createdFrames[start] = true
      const frame = new Frame(canvas, { quality: 1, image: { types: ['png'] }})
      fs.writeFileSync('tmp/' + leftpad(start, 5) + '.png', frame.toBuffer())
    }
  }

  setCanvas()
  console.log('filling in background')
  let i=0
  const progressElem = document.getElementById('progress')

  const makeBackgroundFrame = () => {
    i += 1
    if (!createdFrames[i]) {
      const frame = new Frame(canvas, { quality: 1, image: { types: ['png'] }})
      fs.writeFileSync('tmp/' + leftpad(i, 5) + '.png', frame.toBuffer())
    }
    if (i < Player.totalTicks) {
      const percent = `${Math.round(i/Player.totalTicks * 100)}`

      if (progressElem.value != percent) {
        progressElem.value = parseInt(percent, 10)
        setTimeout(() => makeBackgroundFrame(), 30)
      } else makeBackgroundFrame()
    } else runFFmpeg(outputPath)
  }

  makeBackgroundFrame()
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
      Player = new MidiPlayer.Player(listen)
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
document.querySelector('#make').addEventListener('click', showMakeDialog)
