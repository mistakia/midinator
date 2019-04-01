const fs = require('fs')

const leftpad = require('leftpad')
const Frame  = require('canvas-to-buffer')
const rimraf = require('rimraf')
const ffmpeg = require('fluent-ffmpeg')
const jsonfile = require('jsonfile')
const userPrompt = require('electron-osx-prompt')

const { dialog, getCurrentWindow } = require('electron').remote
const win = getCurrentWindow()

const config = require('./config')
let Programs = require('./src/programs')
const { renderApp } = require('./src/app')
const { clearSelectedMeasure } = require('./src/utils')
let { getPlayer, loadMidiPlayer } = require('./src/player')
let Project = require('./src/project')
let Audio = require('./src/audio')

const columnWidth = config.videoWidth / config.ledstrips

if (Project.midiFile) {
  loadMidiPlayer(Project.midiFile)
  if (Project.tempo) {
    const player = getPlayer()
    player.setTempo(Project.tempo)
  }
  renderApp()
}

if (Project.programs.length) {
  Programs.load(Project.programs)
}

if (!fs.existsSync('./frames')) {
  fs.mkdirSync('./frames')
}

if (!fs.existsSync('./tmp')) {
  fs.mkdirSync('./tmp')
}

const progressElem = document.getElementById('progress')
const timeline = document.getElementById('timeline')
const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
canvas.width = config.videoWidth
canvas.height = config.videoHeight

const loadMidiFile = () => {
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
      loadMidiPlayer(Project.midiFile)
      const player = getPlayer()
      Project.midiEvents = player.getEvents()[0]
      renderApp()
    }
  })
}

const play = () => {
  clearSelectedMeasure()
  const player = getPlayer()
  const audio = Audio.getPlayer()
  if (!player) return
  if (player.isPlaying()) {
    player.pause()
    if (audio) audio.pause()
    const elem = document.getElementById('current-position')
    if (elem.parentNode) elem.parentNode.removeChild(elem)
    return document.querySelector('#play').innerHTML = 'Play'
  }

  let currentTick = 0
  const currentPosition = document.createElement('div')
  currentPosition.id = 'current-position'
  const animate = () => {
    if (player.isPlaying()) window.requestAnimationFrame(animate)

    if (currentPosition.parentNode) currentPosition.parentNode.removeChild(currentPosition)
    const measureLength = player.division * 4
    const currentMeasure = Math.ceil(currentTick / measureLength)
    const parent = document.querySelector(`.measure:nth-child(${currentMeasure})`)
    const position = ((currentTick % measureLength) / measureLength) * 100
    currentPosition.setAttribute('style', `left: ${position}%;`)
    if (parent && player.isPlaying()) parent.appendChild(currentPosition)

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
        const cnvs = Programs.run(program.name, { height: canvas.height, width: canvas.width, delta, ...program.params })

        const columns = Object.keys(program.columns).map(c => parseInt(c, 10))
        if (!columns.length) return ctx.drawImage(cnvs, 0, 0)
        for (let i=0; i < columns.length; i++) {
          const column = columns[i]
          const sx = (column * columnWidth) - columnWidth
          const sy = 0
          const columnHeight = config.videoHeight
          const dx = sx
          const dy = sy
          console.log(`${cnvs.width}, ${cnvs.height}`)
          console.log(`${sx}, ${sy}, ${columnWidth}, ${columnHeight}`)
          ctx.drawImage(
            cnvs, sx, sy, columnWidth, columnHeight,
            dx, dy, columnWidth, columnHeight
          )
        }
      })
    }
  }

  player.on('playing', (tick) => currentTick = tick.tick)

  player.play()
  if (audio) audio.play()
  document.querySelector('#play').innerHTML = 'Pause'
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
  rimraf.sync('tmp/*')

  let f = 0

  const renderFrame = () => {
    // reset canvas
    canvas.width = canvas.width
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    for (let e=0; e < Project.midiEvents.length; e++) {
      const midiEvent = Project.midiEvents[e]

      if (midiEvent.tick > f) continue
      if (midiEvent.name !== 'Note on') continue
      if (!midiEvent.programs.length) continue

      midiEvent.programs.forEach((program) => {
        const end = (program.params.length || 10) + midiEvent.tick
        if (f > end) return

        const delta = f - midiEvent.tick
        const cnvs = Programs.run(program.name, { delta, ...program.params, height: canvas.height, width: canvas.width })

        const columns = Object.keys(program.columns).map(c => parseInt(c, 10))
        if (!columns.length) return ctx.drawImage(cnvs, 0, 0)
        for (let i=0; i < columns.length; i++) {
          const column = columns[i]
          const sx = (column * columnWidth) - columnWidth
          const sy = 0
          const columnHeight = config.videoHeight
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
    fs.writeFileSync('tmp/' + leftpad(f, 5) + '.png', frame.toBuffer())

    const player = getPlayer()
    if (f < player.totalTicks) {
      const percent = `${Math.round(f/player.totalTicks * 100)}`

      f += 1
      if (progressElem.value != percent) {
        progressElem.value = parseInt(percent, 10)
        setTimeout(() => renderFrame(), 30)
      } else renderFrame()
    } else runFFmpeg(outputPath)
  }

  console.log('rendering frames')
  renderFrame()
}

const runFFmpeg = (outputPath) => {
  const player = getPlayer()
  console.log('running ffmpeg')
  //TODO: run ffmpeg generate video
  // ffmpeg -r 192 -i frames/%5d.png -c:v libx264 -r 30 -pix_fmt yuv420p mp4/chappell.mp4
  const inputFPS = 1000 / (60000 / (player.tempo * player.division))
  const cmd = ffmpeg('tmp/%5d.png')
    .inputFPS(inputFPS)
    .videoCodec('libx264')
    .outputOptions(['-pix_fmt yuv420p'])
    .outputFps(40)
    .output(outputPath)
    .on('progress', function(progress) {
      progressElem.value = Math.floor(progress.percent)
    })
    .on('end', function() {
      dialog.showMessageBox({ type: 'info', message: 'Export Finished' })
      console.log('Finished processing')
    })
    .on('error', function(err, stdout, stderr) {
      dialog.showErrorBox(err.message, err)
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
      localStorage.setItem('projectFile', file)
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
      loadMidiPlayer(Project.midiFile, () => {
        const player = getPlayer()
        player.tracks[0].events = Project.midiEvents
        player.events[0] = Project.midiEvents
        renderApp()
      })

      if (Project.programs.length) Programs.load(Project.programs)
    }
  })
}

const showProgramDialog = () => {
  dialog.showOpenDialog({
    title: 'Load MOV File',
    message: 'select a .mov file',
    properties: ['openFile'],
    filters: [
      { name: 'MOV', extensions: ['mov'] }
    ]
  }, async (files) => {
    if (files !== undefined) {
      const file = files[0]
      Project.programs.push(file)
      Programs.load(Project.programs)
    }
  })
}

const loadAudio = () => {
  dialog.showOpenDialog({
    title: 'Load Audio File',
    message: 'select an audio file',
    properties: ['openFile'],
    filters: [
      { name: 'Audio', extensions: ['flac', 'mp3', 'wav'] }
    ]
  }, async (files) => {
    if (files !== undefined) {
      const file = files[0]
      Project.audioFile = file
      Audio.load(file)
    }
  })
}

const stop = () => {
  const player = getPlayer()
  const audio = Audio.getPlayer()
  player.stop()
  if (audio) audio.stop()
  document.querySelector('#play').innerHTML = 'Play'
}

const setTempo = () => {
  userPrompt('Set Tempo', '120').then(input => {
    if (input) {
      const player = getPlayer()
      const tempo = parseInt(input, 10)
      Project.tempo = tempo
      player.setTempo(tempo)
      document.getElementById('tempo').innerHTML = `Tempo: ${player.tempo}`
    }
  }).catch(err => {
    console.log(err)
  })
}

document.querySelector('#play').addEventListener('click', play)
document.querySelector('#stop').addEventListener('click', stop)
document.querySelector('#loadMidi').addEventListener('click', loadMidiFile)
document.querySelector('#loadJSON').addEventListener('click', loadJSON)
document.querySelector('#save').addEventListener('click', save)
document.querySelector('#export').addEventListener('click', showExportDialog)
document.querySelector('#loadProgram').addEventListener('click', showProgramDialog)
document.querySelector('#loadAudio').addEventListener('click', loadAudio)
document.querySelector('#setTempo').addEventListener('click', setTempo)
