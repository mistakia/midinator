const ffmpeg = require('fluent-ffmpeg')

const Project = require('../project')
const Program = require('../program')
const progressElem = document.getElementById('progress')

let Programs = {
  _index: {
    'solid': require('./solid')
  }
}

Programs.run = function (name, params) {
  return this._index[name].run(params)
}

Programs.renderParams = function(name, params) {
  return this._index[name].renderParams(params)
}

Programs.load = async function(filepaths) {
  progressElem.removeAttribute('value')
  for (let i=0; i < filepaths.length; i++) {
    const filepath = filepaths[i]
    const program = new Program(filepath)
    if (!this._index[program.filename]) {
      await program.load()
      this._index[program.filename] = program
    }
  }
  progressElem.value = 0
}

Programs.list = function () {
  return Object.keys(this._index)
}

module.exports = Programs
