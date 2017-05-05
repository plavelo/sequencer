<template>
    <div>
        <div class="track">
            <div class="key octave-1" v-for="key in scale" @mousedown="playSound(key, 1)" @mouseup="stopSound()">
                {{ key }}
            </div>
        </div>
        <div class="track">
            <div class="key octave-2" v-for="key in scale" @mousedown="playSound(key, 2)" @mouseup="stopSound()">
                {{ key }}
            </div>
        </div>
        <div class="track">
            <div class="key octave-3" v-for="key in scale" @mousedown="playSound(key, 3)" @mouseup="stopSound()">
                {{ key }}
            </div>
        </div>
        <div class="track">
            <div class="key octave-4" v-for="key in scale" @mousedown="playSound(key, 4)" @mouseup="stopSound()">
                {{ key }}
            </div>
        </div>
        <div class="track">
            <div class="key octave-5" v-for="key in scale" @mousedown="playSound(key, 5)" @mouseup="stopSound()">
                {{ key }}
            </div>
        </div>
        <hr>
        <div id="workspace" class="workspace">
            <div class="sequence">
                <div class="track">
                    <div :id="'label' + index" class="label" v-if="index % 16 === 0" v-for="(note, index) in tracks[0]">
                        {{ index }}
                    </div>
                </div>
            </div>
            <div class="sequence">
                <div class="track">
                    <div :id="'counter' + index" :class="{'counter': true, 'current': index === counter, 'beat': index % 4 === 0, 'bar': index % 16 === 0}" v-for="(note, index) in tracks[0]" @click="move(index)">
                    </div>
                </div>
            </div>
            <div class="sequence">
                <div class="track" v-for="(track, y) in tracks">
                    <div :class="['cell', 'octave-' + note.octave]" :style="selected(x, y)" v-for="(note, x) in track" @mousedown="mouseDown(x, y, note.key, note.octave)" @mouseover="mouseOver(x, y, note.key, note.octave)" @mouseup="mouseUp(x, y, note.key, note.octave)">
                        {{ note.key }}
                    </div>
                </div>
            </div>
        </div>
        <button @click="addTrack()">add track</button>
        <button @click="play()">play</button>
        <button @click="back()">back</button>
        <hr>
        <div>
          <div>c,C,d,D,e,f,F,g,G,a,A,b: input key</div>
          <div>1,2,3,4,5: change octave</div>
          <div>-: input macron</div>
          <div>/: input rest</div>
          <div>h: move left (H: WIP: move one beat left)</div>
          <div>j: move down</div>
          <div>k: move up</div>
          <div>l: move right (L: WIP: move one beat right)</div>
          <div>^: WIP: move to the beginning</div>
          <div>$: WIP: move to the end</div>
          <div>space: play and stop</div>
          <div>v: range selection</div>
          <div>esc: cancel selection</div>
          <div>y: copy selection</div>
          <div>p: paste selection</div>
          <div>i: insert mode (I: replace mode)</div>
          <div>u: WIP: undo (U: WIP: redo)</div>
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
      insert: false,
      counter: 0,
      clickhold: false,
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

    // remove over columns
    for (let i = 0; i < this.tracks.length; i++) {
      this.tracks[i].splice(this.length)
    }

    window.addEventListener('keydown', event => {
      this.input(event)
    })
    window.addEventListener('mouseup', event => {
      this.clickhold = false
    })
  },
  methods: {
    mouseDown (x, y, key, octave) {
      this.clickhold = true
      this.playSound(key, octave)
      this.rangeStart(x, y)
    },
    mouseOver (x, y, key, octave) {
      if (!this.clickhold) {
        return
      }
      this.rangeOver(x, y)
    },
    mouseUp (x, y, key, octave) {
      this.clickhold = false
      this.stopSound()
    },
    playSound (key, octave) {
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
    stopSound () {
      if (oscillator !== null) {
        oscillator.stop(0)
        oscillator = null
      }
    },
    rangeStart (x, y) {
      Vue.set(this.cursor, 'range', true)
      Vue.set(this.cursor, 'sx', x)
      Vue.set(this.cursor, 'ex', x)
      Vue.set(this.cursor, 'sy', y)
      Vue.set(this.cursor, 'ey', y)
    },
    rangeOver (x, y) {
      if (!this.cursor['range']) {
        return
      }
      Vue.set(this.cursor, 'ex', x)
      Vue.set(this.cursor, 'ey', y)
    },
    addTrack () {
      this.tracks.push(Array(this.length).fill({'key': '-', 'octave': 5}))
    },
    play () {
      this.tracks.forEach(track => {
        const sequence = new Sequence(context, this.tempo)
        let currentDuration = 0
        let currentNote = null
        for (let i = this.counter; i < track.length; i++) {
          if (currentNote === null) {
            currentNote = track[i]
            currentDuration = 0.125
            continue
          }
          if (track[i]['key'] === '-') {
            currentDuration += 0.125
          } else {
            sequence.push(new Note(currentNote['key'], currentNote['octave'], currentDuration))
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
      this.startedAt = context.currentTime
      const workspace = document.getElementById('workspace')
      const lastCounter = this.counter
      const duration = 60 / this.tempo * 0.125
      let lastScrolledCount = 0
      this.intervalId = setInterval(() => {
        this.counter = lastCounter + Math.floor((context.currentTime - this.startedAt) / duration)
        if (this.counter >= this.length) {
          this.counter = this.length - 1
        }
        // scroll
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
      // FIXME: for next play, too dirty
      this.counter += 1
    },
    move (counter) {
      this.stop()
      this.counter = counter
    },
    back () {
      this.stop()
      const workspace = document.getElementById('workspace')
      workspace.scrollLeft = 0
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
      const color = this.insert ? '#3F51B5' : '#E91E63'
      return (top ? `border-top: 1px solid ${color};` : '') +
      (left ? `border-left: 1px solid ${color};` : '') +
      (right ? `border-right: 1px solid ${color};` : '') +
      (bottom ? `border-bottom: 1px solid ${color};` : '')
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
        case 'i': case 'I': {
          this.insert = (input === 'i')
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
              const key = this.tracks[y][x]['key']
              const octave = this.tracks[y][x]['octave']
              if (['c', 'C', 'd', 'D', 'e', 'f', 'F', 'g', 'G', 'a', 'A', 'b'].indexOf(key) >= 0) {
                buffer += (key + octave)
              } else {
                buffer += (key + ' ')
              }
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
        case 'p': {
          const tracks = []
          const lines = this.clipboard.trim().split('\n')
          lines.forEach(line => {
            const track = line.split(/(.{2})/).filter(x => x !== '').map(token => {
              const value = token.trim()
              if (/^[c,C,d,D,e,f,F,g,G,a,A,b]/.test(value)) {
                const [key, octave] = value.split('')
                return {'key': key, 'octave': octave}
              }
              return {'key': value, 'octave': 4}
            })
            tracks.push(track)
          })
          for (let y = 0; y < tracks.length; y++) {
            for (let x = 0; x < tracks[y].length; x++) {
              const targety = this.cursor['sy'] + y
              const targetx = this.cursor['sx'] + x
              if (targety > this.tracks.length - 1) {
                continue
              }
              this.tracks[targety].splice(targetx, this.insert ? 0 : 1, tracks[y][x])
            }
          }
          let longest = 0
          for (let i = 0; i < this.tracks.length; i++) {
            if (longest < this.tracks[i].length) {
              longest = this.tracks[i].length
            }
          }
          this.length = longest
          for (let i = 0; i < this.tracks.length; i++) {
            if (this.tracks[i].length < this.length) {
              const count = this.length - this.tracks[i].length
              this.tracks[i].push(...Array(count).fill({'key': '-', 'octave': 4}))
            }
          }
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
          const fromy = Math.min(this.cursor['sy'], this.cursor['ey'])
          const fromx = Math.min(this.cursor['sx'], this.cursor['ex'])
          const toy = Math.max(this.cursor['sy'], this.cursor['ey'])
          const tox = Math.max(this.cursor['sx'], this.cursor['ex'])
          for (let y = fromy; y <= toy; y++) {
            for (let x = fromx; x <= tox; x++) {
              Vue.set(this.tracks[y][x], 'octave', input)
            }
          }
          for (let y = fromy; y <= toy; y++) {
            for (let x = tox + 1; x < this.length; x++) {
              if (this.tracks[y][x]['key'] !== '-') {
                break
              }
              Vue.set(this.tracks[y][x], 'octave', input)
            }
            for (let x = fromx; x >= 0; x--) {
              Vue.set(this.tracks[y][x], 'octave', input)
              if (this.tracks[y][x]['key'] !== '-') {
                break
              }
            }
          }
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
          const originy = Math.min(this.cursor['sy'], this.cursor['ey'])
          const originx = Math.min(this.cursor['sx'], this.cursor['ex'])
          const lengthy = Math.abs(this.cursor['ey'] - this.cursor['sy']) + 1
          const lengthx = Math.abs(this.cursor['ex'] - this.cursor['sx']) + 1
          for (let y = 0; y < lengthy; y++) {
            for (let x = 0; x < lengthx; x++) {
              const targety = originy + y
              const targetx = originx + x
              this.tracks[targety].splice(targetx, this.insert ? 0 : 1, {'key': input, 'octave': 4})
            }
          }

          let longest = 0
          for (let i = 0; i < this.tracks.length; i++) {
            if (longest < this.tracks[i].length) {
              longest = this.tracks[i].length
            }
          }
          this.length = longest
          for (let i = 0; i < this.tracks.length; i++) {
            if (this.tracks[i].length < this.length) {
              const count = this.length - this.tracks[i].length
              this.tracks[i].push(...Array(count).fill({'key': '-', 'octave': 4}))
            }
          }

          if (this.cursor['sx'] === this.length - 1) {
            for (let y = 0; y < this.tracks.length; y++) {
              this.tracks[y].push({'key': '-', 'octave': 4})
            }
            this.length = this.length += 1
          }

          const startx = Math.max(this.cursor['sx'], this.cursor['ex'])
          const count = this.length - startx
          for (let y = 0; y < lengthy; y++) {
            const targety = originy + y
            const octave = this.tracks[targety][startx]['octave']
            for (let x = 1; x < count; x++) {
              const targetx = startx + x
              if (this.tracks[targety][targetx]['key'] !== '-') {
                break
              }
              Vue.set(this.tracks[targety][targetx], 'octave', octave)
            }
          }

          if (this.cursor['sx'] < this.length) {
            if (this.cursor['range']) {
              Vue.set(this.cursor, 'ey', this.cursor['sy'])
              Vue.set(this.cursor, 'ex', this.cursor['sx'])
              Vue.set(this.cursor, 'range', false)
            } else {
              Vue.set(this.cursor, 'sx', this.cursor['sx'] + 1)
              Vue.set(this.cursor, 'ex', this.cursor['sx'])
            }
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
.counter {
    width: 12px;
    min-width: 12px;
    height: 14px;
    line-height: 14px;
    background-color: #FFFFFF;
    border: 1px solid #FFFFFF;
}
.label {
    width: 222px;
    min-width: 222px;
    height: 10px;
    line-height: 10px;
    padding-left: 2px;
    font-size: 8px;
    color: #9E9E9E;
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
