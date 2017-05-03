<template>
    <div>
        <div class="track">
            <div class="key octave-1" v-for="key in scale" @mousedown="keystroke(key, 1)" @mouseup="keymute()">
                {{ key }}
            </div>
        </div>
        <div class="track">
            <div class="key octave-2" v-for="key in scale" @mousedown="keystroke(key, 2)" @mouseup="keymute()">
                {{ key }}
            </div>
        </div>
        <div class="track">
            <div class="key octave-3" v-for="key in scale" @mousedown="keystroke(key, 3)" @mouseup="keymute()">
                {{ key }}
            </div>
        </div>
        <div class="track">
            <div class="key octave-4" v-for="key in scale" @mousedown="keystroke(key, 4)" @mouseup="keymute()">
                {{ key }}
            </div>
        </div>
        <div class="track">
            <div class="key octave-5" v-for="key in scale" @mousedown="keystroke(key, 5)" @mouseup="keymute()">
                {{ key }}
            </div>
        </div>
        <hr>
        <div class="sequence">
            <div class="track">
                <div :class="{'cell': true, 'note': true, 'current': index === counter, 'beat': index % 4 === 0, 'bar': index % 16 === 0}" v-for="(note, index) in tracks[0]">
                </div>
            </div>
        </div>
        <div class="sequence">
            <div class="track" v-for="(track, y) in tracks">
                <div :class="['cell', 'octave-' + note.octave, selected(x, y) ? 'selected' : '']" v-for="(note, x) in track" @mousedown="keystroke(note.key, note.octave)" @mouseup="keymute()">
                    {{ note.key }}
                </div>
            </div>
        </div>
        <button @click="addTrack()">add track</button>
        <button @click="play()">play</button>
        <input type="text" @keydown="input($event)">
    </div>
</template>

<script>
import Vue from 'vue'
import Note from '@/domain/note'
import Sequence from '@/domain/sequence'

const context = new AudioContext()
let oscillator = null
let sequences = []

export default {
  name: 'sequencer',
  data () {
    return {
      tempo: 60,
      cursor: {'sx': 0, 'sy': 0, 'ex': 0, 'ey': 0, 'range': false},
      startedAt: 0,
      counter: 0,
      playing: false,
      length: 1,
      scale: ['c', 'C', 'd', 'D', 'e', 'f', 'F', 'g', 'G', 'a', 'A', 'b'],
      tracks: [[{'key': '-', 'octave': 4}]],
      intervalId: 0,
      clipboard: ''
    }
  },
  mounted () {
    const sequence = new Sequence(context, this.tempo)
    sequence.push(new Note('c', 4, 1))
    sequence.play()
  },
  methods: {
    keystroke (key, octave) {
      const offsets = {
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
      const gain = context.createGain()
      gain.connect(context.destination)
      oscillator = context.createOscillator()
      oscillator.waveType = 'square'
      oscillator.connect(gain)
      const middleC = 440 * Math.pow(Math.pow(2, 1 / 12), -9)
      const frequency = middleC * Math.pow(Math.pow(2, 1 / 12), offsets[key])
      const octaveDiff = octave - 4
      oscillator.frequency.value = frequency * Math.pow(2, octaveDiff)
      oscillator.start(context.currentTime)
    },
    keymute () {
      if (oscillator !== null) {
        oscillator.stop(0)
        oscillator = null
      }
    },
    addTrack () {
      this.tracks.push(Array(this.length).fill({'key': '-', 'octave': 5}))
    },
    play () {
      this.tracks.forEach(track => {
        const sequence = new Sequence(context, this.tempo)
        let currentDuration = 0
        let currentNote = null
        for (let i = 0; i < track.length; i++) {
          if (track[i]['key'] === '-') {
            currentDuration += 0.125
          } else {
            if (currentNote !== null) {
              sequence.push(new Note(currentNote['key'], currentNote['octave'], currentDuration))
            }
            currentNote = track[i]
            currentDuration = 0.125
          }
        }
        sequences.push(sequence)
      })
      sequences.forEach(sequence => {
        sequence.play()
      })
      this.startedAt = context.currentTime
      const duration = 60 / this.tempo * 0.125
      this.intervalId = setInterval(() => {
        this.counter = Math.floor((context.currentTime - this.startedAt) / duration)
      }, 30)
    },
    stop () {
      sequences.forEach(sequence => {
        sequence.stop()
      })
      sequences = []
      clearInterval(this.intervalId)
      this.counter = 0
    },
    selected (x, y) {
      return (y >= this.cursor['sy']) && (x >= this.cursor['sx']) && (y <= this.cursor['ey']) && (x <= this.cursor['ex'])
    },
    input (e) {
      const input = e.key
      switch (input) {
        case ' ': {
          if (this.playing) {
            this.stop()
          } else {
            this.play()
          }
          this.playing = !this.playing
          break
        }
        case 'v': {
          Vue.set(this.cursor, 'range', true)
          break
        }
        case 'y': {
          let buffer = ''
          for (let y = this.cursor['sy']; y <= this.cursor['ey']; y++) {
            for (let x = this.cursor['sx']; x <= this.cursor['ex']; x++) {
              buffer += this.tracks[y][x]['key']
            }
            buffer += '\n'
          }
          this.clipboard = buffer
          Vue.set(this.cursor, 'range', false)
          Vue.set(this.cursor, 'ex', this.cursor['sx'])
          Vue.set(this.cursor, 'ey', this.cursor['sy'])
          console.log(this.clipboard)
          break
        }
        case 'Escape': {
          Vue.set(this.cursor, 'range', false)
          Vue.set(this.cursor, 'ex', this.cursor['sx'])
          Vue.set(this.cursor, 'ey', this.cursor['sy'])
          break
        }
        case 'ArrowUp': case 'k': {
          if (this.cursor['range'] && this.cursor['ey'] > 0) {
            Vue.set(this.cursor, 'ey', this.cursor['ey'] - 1)
          } else if (this.cursor['sy'] > 0) {
            Vue.set(this.cursor, 'sy', this.cursor['sy'] - 1)
            Vue.set(this.cursor, 'ey', this.cursor['sy'])
          }
          break
        }
        case 'ArrowDown': case 'j': {
          if (this.cursor['range'] && this.cursor['ey'] < this.tracks.length - 1) {
            Vue.set(this.cursor, 'ey', this.cursor['ey'] + 1)
          } else if (this.cursor['sy'] < this.tracks.length - 1) {
            Vue.set(this.cursor, 'sy', this.cursor['sy'] + 1)
            Vue.set(this.cursor, 'ey', this.cursor['sy'])
          }
          break
        }
        case 'ArrowLeft': case 'h': {
          if (this.cursor['range'] && this.cursor['ex'] > 0) {
            Vue.set(this.cursor, 'ex', this.cursor['ex'] - 1)
          } else if (this.cursor['sx'] > 0) {
            Vue.set(this.cursor, 'sx', this.cursor['sx'] - 1)
            Vue.set(this.cursor, 'ex', this.cursor['sx'])
          }
          break
        }
        case 'ArrowRight': case 'l': {
          if (this.cursor['range'] && this.cursor['ex'] < this.length - 1) {
            Vue.set(this.cursor, 'ex', this.cursor['ex'] + 1)
          } else if (this.cursor['sx'] < this.length - 1) {
            Vue.set(this.cursor, 'sx', this.cursor['sx'] + 1)
            Vue.set(this.cursor, 'ex', this.cursor['sx'])
          }
          break
        }
        case '1': case '2': case '3': case '4': case '5': {
          const x = this.cursor['sx']
          const y = this.cursor['sy']
          Vue.set(this.tracks[y][x], 'octave', input)
          break
        }
        case 'c': case 'C':
        case 'd': case 'D':
        case 'e':
        case 'f': case 'F':
        case 'g': case 'G':
        case 'a': case 'A':
        case 'b':
        case '-':
        case '/':
          this.tracks[this.cursor['sy']].splice(this.cursor['sx'], 1, {'key': input, 'octave': 4})
          if (this.cursor['sx'] === this.length - 1) {
            for (let y = 0; y < this.tracks.length; y++) {
              this.tracks[y].push({'key': '-', 'octave': 4})
            }
            this.length = this.length += 1
          }
          if (this.cursor['sx'] < this.length) {
            Vue.set(this.cursor, 'sx', this.cursor['sx'] + 1)
            Vue.set(this.cursor, 'ex', this.cursor['sx'])
          }
          break
      }
    }
  }
}
</script>

<style scoped>
.sequence {
    display: flex;
    flex-direction: column;
}
.track {
    display: flex;
}
.cell {
    width: 12px;
    height: 18px;
    line-height: 18px;
    text-align: center;
    font-size: 12px;
}
.key {
  width: 36px;
  height: 24px;
  line-height: 24px;
  text-align: center;
  font-size: 12px;
}
.octave-1 {
    color: #FFFFFF;
    background-color: #673AB7;
    border: 1px solid #5E35B1;
}
.octave-2 {
    color: #000000;
    background-color: #03A9F4;
    border: 1px solid #039BE5;
}
.octave-3 {
    color: #000000;
    background-color: #8BC34A;
    border: 1px solid #7CB342;
}
.octave-4 {
    color: #000000;
    background-color: #FFEB3B;
    border: 1px solid #FDD835;
}
.octave-5 {
    color: #000000;
    background-color: #FF9800;
    border: 1px solid #FB8C00;
}
.selected {
    border: 1px solid #FF0000;
}
.note {
    background-color: #FFFFFF;
    border: 1px solid #FFFFFF;
}
.beat {
    background-color: #FFFFFF;
    border-top: 1px solid #FFFFFF;
    border-bottom: 1px solid #FFFFFF;
    border-right: 1px solid #FFFFFF;
    border-left: 1px solid #EEEEEE;
}
.bar {
    background-color: #FFFFFF;
    border-top: 1px solid #FFFFFF;
    border-bottom: 1px solid #FFFFFF;
    border-right: 1px solid #FFFFFF;
    border-left: 1px solid #AAAAAA;
}
.current {
    background-color: #673AB7;
    border: 1px solid #673AB7;
}
</style>
