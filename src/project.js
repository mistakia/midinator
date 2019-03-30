const jsonfile = require('jsonfile')

const projectFile = localStorage.getItem('projectFile')

let Project = {
  midiFile: '',
  midiEvents: [],
  programs: []
}

if (projectFile) {
  Project = jsonfile.readFileSync(projectFile)
  if (!Project.programs) Project.programs = [] //backwards compatability
}

module.exports = Project
