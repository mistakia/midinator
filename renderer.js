const { dialog, getCurrentWindow } = require('electron').remote
const win = getCurrentWindow()

const MidiPlayer = require('midi-player-js')

let programs = require('./src/programs')

let MEASURE_LENGTH
let Player

const timeline = document.getElementById('timeline')
const canvas = document.getElementById('canvas')
canvas.width = win.getSize()[0]
canvas.height = 200

const ctx = canvas.getContext('2d')
const listen = (event) => console.log(event)

const setCanvas = () => {
  canvas.width = canvas.width
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, 600, 100)
}

const load = () => {
  dialog.showOpenDialog({
    title: 'Load Midi File',
    message: 'select a .mid file',
    properties: ['openFile'],
    filters: [
      { name: 'Midi', extensions: ['mid', 'midi'] }
    ]
  }, function (files) {
    if (files !== undefined) {
      const midiFile = files[0]
      Player = new MidiPlayer.Player(listen)
      Player.loadFile(midiFile)

      console.log(Player)
      const events = Player.getEvents()[0]
      const totalTicks = Player.totalTicks
      MEASURE_LENGTH = Player.division * 4
      const totalMeasures = Math.ceil(totalTicks / MEASURE_LENGTH)
      console.log(`Total ticks: ${totalTicks}`)
      console.log(`Division: ${Player.division}`)
      console.log(`Tempo: ${Player.tempo}`)
      console.log(`Measures: ${totalMeasures}`)

      for (let i=0; i<totalMeasures;i++) {
        drawMeasure()
      }

      for (let i=0; i<events.length; i++) {
        const event = events[i]
        if (event.name !== 'Note on') continue
        event.program = programs.BLINK
        drawNote(event)
      }
    }
  })
}

const drawMeasure = () => {
  const elem = document.createElement('div')
  elem.className = 'measure'
  timeline.appendChild(elem)
}

const drawNote = (event) => {
  const elem = document.createElement('div')
  elem.className = 'note'

  const measureNumber = Math.floor(event.tick / MEASURE_LENGTH) + 1

  const parent = document.querySelector(`.measure:nth-child(${measureNumber})`)
  const position = ((event.tick % MEASURE_LENGTH) / MEASURE_LENGTH) * 100
  elem.setAttribute('style', `left: ${position}%;`)
  parent.appendChild(elem)
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

    setCanvas()
    const delta = currentTick - currentEvent.tick
    if (currentEvent.program) currentEvent.program({ canvas, ctx, delta })
  }

  Player.on('playing', (tick) => currentTick = tick.tick)
  Player.on('midiEvent', (event) => currentEvent = event)


  Player.play()
  document.querySelector('#play').innerHTML = 'Stop'
  window.requestAnimationFrame(animate)
}

const make = () => {
  //
}

document.querySelector('#play').addEventListener('click', play)
document.querySelector('#load').addEventListener('click', load)
