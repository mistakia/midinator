const eases = require('d3-ease')

class Param {
  constructor(args) {
    let { start, end, ease } = args

    this.args = args
    this.start = start
    this.end = end
    this.ease = ease

    this.min = Math.min(this.start, this.end)
    this.max = Math.max(this.start, this.end)
    this.range = this.max - this.min
    this.direction = this.end - this.start
  }

  getValue(t) {
    const easeFn = eases[this.ease]
    const easeValue = easeFn(t)
    const value = easeValue * this.range

    if (this.direction >= 0) {
      return this.start + value
    }

    return this.start - value
  }
}

module.exports = Param