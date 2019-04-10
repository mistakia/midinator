const { Howl, Howler } = require('howler')

const { getProject } = require('./project')

let player

let getPlayer = () => {
  return player
}

const load = (file) => {
  player = new Howl({
    src: [file]
  })
}

let Project = getProject()

if (Project.audioFile) {
  load(Project.audioFile)
}


module.exports = {
  load,
  getPlayer
}
