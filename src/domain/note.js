export default class {
  constructor (key, octave, duration) {
    this.middleC = 440 * Math.pow(Math.pow(2, 1 / 12), -9)
    this.octaveOffset = 4
    this.offsets = {
      'c': 0,
      'C': 1,
      'd': 2,
      'D': 3,
      'e': 4,
      'f': 5,
      'F': 6,
      'g': 7,
      'G': 8,
      'a': 9,
      'A': 10,
      'b': 11
    }
    this.frequency = this.getFrequency(key, octave)
    this.duration = duration
  }

  getFrequency (key, octave) {
    if (!(key in this.offsets)) {
      return 0
    }
    const distance = this.offsets[key]
    const frequency = this.middleC * Math.pow(Math.pow(2, 1 / 12), distance)
    const octaveDiff = octave - this.octaveOffset
    return frequency * Math.pow(2, octaveDiff)
  }
}
