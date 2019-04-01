const MidiPlayer = require('midi-player-js')

let Player

let getPlayer = () => {
  return Player
}

let loadMidiPlayer = (file, onLoaded) => {
  Player = new MidiPlayer.Player()
  if (onLoaded) {
    Player.on('fileLoaded', onLoaded)
  }
  Player.loadFile(file)
}

module.exports = {
  getPlayer,
  loadMidiPlayer
}
