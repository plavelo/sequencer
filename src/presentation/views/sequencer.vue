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
        <div id="workspace" class="workspace">
            <div class="sequence">
                <div class="track">
                    <div :id="'counter' + index" :class="{'cell': true, 'note': true, 'current': index === counter, 'beat': index % 4 === 0, 'bar': index % 16 === 0}" v-for="(note, index) in tracks[0]">
                    </div>
                </div>
            </div>
            <div class="sequence">
                <div class="track" v-for="(track, y) in tracks">
                    <div :class="['cell', 'octave-' + note.octave]" :style="selected(x, y)" v-for="(note, x) in track" @mousedown="keystroke(note.key, note.octave, x, y)" @mouseup="keymute()">
                        {{ note.key }}
                    </div>
                </div>
            </div>
        </div>
        <button @click="addTrack()">add track</button>
        <button @click="play()">play</button>
        <hr>
        <div>
          <div>c,d,e,f,g,a,b: input key</div>
          <div>h: move left</div>
          <div>j: move down</div>
          <div>k: move up</div>
          <div>l: move right</div>
          <div>space: play and stop</div>
          <div>-: input macron</div>
          <div>/: input rest</div>
          <div>v: range selection</div>
          <div>esc: cancel selection</div>
          <div>y: WIP: copy selection</div>
          <div>p: WIP: paste selection</div>
        </div>
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
      tempo: 100,
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
    const storage = window.localStorage
    const tracks = storage.getItem('tracks')
    this.tracks = JSON.parse(tracks)
    this.length = this.tracks[0].length

    window.addEventListener('keydown', event => {
      this.input(event)
    })
  },
  methods: {
    keystroke (key, octave, x = null, y = null) {
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
      if (x !== null && y !== null) {
        Vue.set(this.cursor, 'sx', x)
        Vue.set(this.cursor, 'ex', x)
        Vue.set(this.cursor, 'sy', y)
        Vue.set(this.cursor, 'ey', y)
      }
      if (!(key in offsets)) {
        return
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
        if (currentNote !== null) {
          sequence.push(new Note(currentNote['key'], currentNote['octave'], currentDuration))
        }
        sequences.push(sequence)
      })
      sequences.forEach(sequence => {
        sequence.play()
      })
      const workspace = document.getElementById('workspace')
      workspace.scrollLeft = 0

      this.startedAt = context.currentTime
      const duration = 60 / this.tempo * 0.125
      let lastScrolledCount = 0
      this.intervalId = setInterval(() => {
        this.counter = Math.floor((context.currentTime - this.startedAt) / duration)
        if (this.counter % 64 === 0 && this.counter !== lastScrolledCount) {
          const target = document.getElementById(`counter${this.counter}`)
          if (target === null) {
            return
          }
          workspace.scrollLeft = target.offsetLeft
          lastScrolledCount = this.counter
        }
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
      let top = false
      let left = false
      let right = false
      let bottom = false

      if (y >= Math.min(this.cursor['sy'], this.cursor['ey']) && y <= Math.max(this.cursor['sy'], this.cursor['ey'])) {
        if (this.cursor['sx'] <= this.cursor['ex']) {
          left = (x === this.cursor['sx'])
          right = (x === this.cursor['ex'])
        } else if (this.cursor['sx'] > this.cursor['ex']) {
          left = (x === this.cursor['ex'])
          right = (x === this.cursor['sx'])
        }
      }
      if (x >= Math.min(this.cursor['sx'], this.cursor['ex']) && x <= Math.max(this.cursor['sx'], this.cursor['ex'])) {
        if (this.cursor['sy'] <= this.cursor['ey']) {
          top = (y === this.cursor['sy'])
          bottom = (y === this.cursor['ey'])
        } else if (this.cursor['sy'] > this.cursor['ey']) {
          top = (y === this.cursor['ey'])
          bottom = (y === this.cursor['sy'])
        }
      }
      return (top ? 'border-top: 1px solid #FF0000;' : '') +
      (left ? 'border-left: 1px solid #FF0000;' : '') +
      (right ? 'border-right: 1px solid #FF0000;' : '') +
      (bottom ? 'border-bottom: 1px solid #FF0000;' : '')
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
          const yfrom = Math.min(this.cursor['sy'], this.cursor['ey'])
          const yto = Math.max(this.cursor['sy'], this.cursor['ey'])
          const xfrom = Math.min(this.cursor['sx'], this.cursor['ex'])
          const xto = Math.max(this.cursor['sx'], this.cursor['ex'])
          for (let y = yfrom; y <= yto; y++) {
            for (let x = xfrom; x <= xto; x++) {
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
          } else if (!this.cursor['range'] && this.cursor['sy'] > 0) {
            Vue.set(this.cursor, 'sy', this.cursor['sy'] - 1)
            Vue.set(this.cursor, 'ey', this.cursor['sy'])
          }
          break
        }
        case 'ArrowDown': case 'j': {
          if (this.cursor['range'] && this.cursor['ey'] < this.tracks.length - 1) {
            Vue.set(this.cursor, 'ey', this.cursor['ey'] + 1)
          } else if (!this.cursor['range'] && this.cursor['sy'] < this.tracks.length - 1) {
            Vue.set(this.cursor, 'sy', this.cursor['sy'] + 1)
            Vue.set(this.cursor, 'ey', this.cursor['sy'])
          }
          break
        }
        case 'ArrowLeft': case 'h': {
          if (this.cursor['range'] && this.cursor['ex'] > 0) {
            Vue.set(this.cursor, 'ex', this.cursor['ex'] - 1)
          } else if (!this.cursor['range'] && this.cursor['sx'] > 0) {
            Vue.set(this.cursor, 'sx', this.cursor['sx'] - 1)
            Vue.set(this.cursor, 'ex', this.cursor['sx'])
          }
          break
        }
        case 'ArrowRight': case 'l': {
          if (this.cursor['range'] && this.cursor['ex'] < this.length - 1) {
            Vue.set(this.cursor, 'ex', this.cursor['ex'] + 1)
          } else if (!this.cursor['range'] && this.cursor['sx'] < this.length - 1) {
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
      const storage = window.localStorage
      storage.setItem('tracks', JSON.stringify(this.tracks))
    }
  }
}
</script>

<style scoped>
.workspace {
    width: 100%;
    white-space: nowrap;
    overflow-x: scroll;
}
.sequence {
    display: flex;
    flex-direction: column;
}
.track {
    display: flex;
    user-select: none;
}
.cell {
    width: 12px;
    min-width: 12px;
    height: 18px;
    line-height: 18px;
    text-align: center;
    font-size: 12px;
    border-collapse: collapse;
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
