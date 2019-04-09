const eases = require('d3-ease')

class Param {
  constructor(args) {
    let { start, end, ease, speed } = args

    this.args = args
    this.start = start
    this.end = end
    this.ease = ease
    this.speed = parseFloat(speed || 1.0)

    this.min = Math.min(this.start, this.end)
    this.max = Math.max(this.start, this.end)
    this.range = this.max - this.min
    this.direction = this.end - this.start
  }

  get values () {
    return {
      start: this.start,
      end: this.end,
      ease: this.ease,
      speed: this.speed
    }
  }

  setValue(name, value) {
    this[name] = value
  }

  getValue(t) {
    const easeFn = eases[this.ease]
    const easeValue = easeFn(t * this.speed)
    const value = easeValue * this.range

    if (this.direction >= 0) {
      return this.start + value
    }

    return this.start - value
  }
}

module.exports = Param
