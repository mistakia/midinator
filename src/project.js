const jsonfile = require('jsonfile')

const projectFile = localStorage.getItem('projectFile')

let Project = {
  midiFile: '',
  midiEvents: []
}

if (projectFile) {
  Project = jsonfile.readFileSync(projectFile)
}

module.exports = Project
