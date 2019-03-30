const jsonfile = require('jsonfile')
const { Howl, Howler } = require('howler')

const projectFile = localStorage.getItem('projectFile')

let Project = {
  midiFile: '',
  audioFile: '',
  midiEvents: [],
  programs: []
}

if (projectFile) {
  Project = jsonfile.readFileSync(projectFile)
  if (!Project.programs) Project.programs = [] //backwards compatability
}

module.exports = Project
