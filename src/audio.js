const { Howl, Howler } = require('howler')

const Project = require('./project')

let sound

const load = (file) => {
  sound = new Howl({
    src: [file]
  })
}

const stop = () => {
  if (sound) sound.stop()
}

const play = () => {
  if (sound) sound.play()
}

if (Project.audioFile) {
  load(Project.audioFile)
}


module.exports = {
  load,
  stop,
  play
}
