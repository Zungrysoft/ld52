import { ctx } from './core/game.js'
import { width, height } from './config.js'
import * as u from './core/utils.js'
import Thing from './core/thing.js'

function * FadeInAnim () {
  for (let i = 0; i < 10; i++) {
    ctx.fillStyle = `rgba(0, 0, 0, ${u.map(i, 0, 10, 1, 0, true)})`
    ctx.fillRect(0, 0, width, height)
    yield
  }
}

export default class FadeIn extends Thing {
  pauseException = true
  sprite = null

  constructor (data) {
    super(data)
    this.anim = FadeInAnim()
  }

  guiDraw () {
    if (this.anim.next().value === 'dead') {
      this.dead = true
    }
  }
}
