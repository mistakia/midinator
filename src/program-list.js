class ProgramList {
  constructor(list) {
    this.list = list || []
    this.selectedIndex = 0
  }

  add (v) {
    this.list.unshift(v)
  }

  remove (idx) {
    this.list.splice(idx, 1)
  }

  get length () {
    return this.list.length
  }

  getSelected() {
    return this.list[this.selectedIndex].programs
  }

  setSelected(idx) {
    this.selectedIndex = idx
  }
}

module.exports = ProgramList
