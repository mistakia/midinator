const { Howl, Howler } = require('howler')

const Project = require('./project')

let sound

const load = (file) => {
  sound = new Howl({
    src: [file]
  })
}

if (Project.audioFile) {
  load(Project.audioFile)
}


module.exports = {
  load,
  sound
}
