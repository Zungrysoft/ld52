import {
  ctx,
  getFramerate,
  keysPressed,
  getScene,
  mouse
} from './core/game.js'
import Thing from './core/thing.js'

export default class DemoHelper extends Thing {
  paused = false
  pauseException = true
  sprite = null
  frameGraph = []
  delta = [0, 0]

  update () {
    if (keysPressed.KeyP) {
      this.paused = !this.paused
      if (!this.paused) {
        mouse.unlock()
      }
    }

    if (this.paused) {
      getScene().paused = true
    }

    this.frameGraph.push(getFramerate())
    if (this.frameGraph.length > 60) {
      this.frameGraph.splice(0, 1)
    }

    this.delta = mouse.delta.map(x => x.toFixed(2))
  }

  guiDraw () {
    ctx.save()
    ctx.translate(8, 8)
    ctx.fillStyle = 'black'
    ctx.font = 'italic 24px Times New Roman'
    ctx.fillText(getFramerate() + ' FPS', 0, 16)
    // ctx.fillText(JSON.stringify(this.delta), 0, 16)

    ctx.translate(0, 24)
    ctx.fillRect(0.5, 0.5, 60, 60)
    ctx.lineWidth = 1
    this.frameGraph.forEach((e, i) => {
      ctx.strokeStyle = 'cornflowerBlue'
      if (e < 59) {
        ctx.strokeStyle = 'yellow'
        if (e < 50) {
          ctx.strokeStyle = 'red'
        }
      }
      ctx.beginPath()
      ctx.moveTo(i + 0.5, 60 + 0.5)
      ctx.lineTo(i + 0.5, 60 - e + 0.5)
      ctx.stroke()
    })

    ctx.restore()
  }
}
