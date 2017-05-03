export default class {
  constructor (context, tempo) {
    this.context = context
    {
      const equalizer = [ [ 'bass', 100 ], [ 'mid', 1000 ], [ 'treble', 2500 ] ]
      this.gain = this.context.createGain()
      let previous = this.gain
      equalizer.forEach((config, index) => {
        const filter = this.context.createBiquadFilter()
        filter.type = 'peaking'
        filter.frequency.value = config[1]
        previous.connect(filter)
        previous = filter
      })
      previous.connect(this.context.destination)
    }
    this.tempo = tempo
    // this.smoothing = 0.1
    this.waveType = 'square'
    this.notes = []
  }

  push (note) {
    this.notes.push(note)
  }

  play () {
    let when = this.context.currentTime
    this.oscillator = this.context.createOscillator()
    this.oscillator.type = this.waveType
    this.oscillator.connect(this.gain)
    this.oscillator.start(when)

    this.notes.forEach((note, i) => {
      when = this.scheduleNote(i, when)
    })

    this.oscillator.stop(when)
  }

  stop () {
    if (this.oscillator) {
      this.oscillator.onended = null
      this.oscillator.disconnect()
      this.oscillator = null
    }
  }

  scheduleNote (index, when) {
    const duration = 60 / this.tempo * this.notes[index].duration
    this.oscillator.frequency.setValueAtTime(this.notes[index].frequency, when)
    /*
    if (this.smoothing && this.notes[index].frequency) {
      const next = this.notes[index < this.notes.length - 1 ? index + 1 : 0]
      const start = duration - Math.min(duration, 60 / this.tempo * this.smoothing)
      this.oscillator.frequency.setValueAtTime(this.notes[ index ].frequency, when + start)
      this.oscillator.frequency.linearRampToValueAtTime(next.frequency, when + duration)
    }
    */
    this.oscillator.frequency.setValueAtTime(0, when + duration)
    return when + duration
  }
}
