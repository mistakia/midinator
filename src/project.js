const jsonfile = require('jsonfile')
const { Howl, Howler } = require('howler')

const projectFile = localStorage.getItem('projectFile')

let Project = {
  midiFile: '',
  audioFile: '',
  midiEvents: [],
  tempo: null,
  programs: []
}

try {
  if (projectFile) {
    Project = jsonfile.readFileSync(projectFile)
    if (!Project.programs) Project.programs = [] //backwards compatability
  }
} catch (e) {
  localStorage.removeItem('projectFile')
  console.log(e)
}

module.exports = Project
