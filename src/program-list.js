class ProgramList {
  constructor(list) {
    this.list = list || []
    this._selectedIndex = 0
  }

  get selectedIndex () {
    return this._selectedIndex
  }

  set selectedIndex (idx) {
    this._selectedIndex = idx
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

  has (idx) {
    return !!this.list[idx]
  }

  getSelected() {
    return this.list[this._selectedIndex].programs
  }
}

module.exports = ProgramList
