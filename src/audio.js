const { Howl, Howler } = require('howler')

const Project = require('./project')

let player

let getPlayer = () => {
  return player
}

const load = (file) => {
  player = new Howl({
    src: [file]
  })
}

if (Project.audioFile) {
  load(Project.audioFile)
}


module.exports = {
  load,
  getPlayer
}
