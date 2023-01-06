import { width, height } from './config.js'
import * as u from './core/utils.js'
import * as game from './core/game.js'
import Thing from './core/thing.js'

function * Animation () {
  const { ctx, globals, mouse } = game

  if (false && globals.tutorial) {
    globals.tutorial = false
    game.getThing('player').showGui = false

    let i = 0
    while (true) {
      ctx.save()
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)'
      ctx.fillRect(0, 0, width, height)

      ctx.font = '32px Times New Roman'
      ctx.textAlign = 'center'
      ctx.translate(width / 2, height / 2)
      ctx.fillStyle = u.colorToString(1, 1, 1, u.map(i, 30, 60, 0, 1, true))
      ctx.fillText('You have 10 seconds to get to the green flag.', 0, -64)
      ctx.fillStyle = u.colorToString(1, 1, 1, u.map(i, 30 + 60 * 1.5, 60 + 60 * 1.5, 0, 1, true))
      ctx.fillText('WASD and SPACE to move, click to shoot.', 0, 0)
      ctx.fillStyle = u.colorToString(1, 1, 1, u.map(i, 30 + 60 * 3, 60 + 60 * 3, 0, 1, true))
      ctx.fillText('Reach level 15 to win!', 0, 64)
      ctx.restore()

      const startTime = 60 * 4
      ctx.save()
      ctx.translate(width - 64, height - 64)
      ctx.textAlign = 'right'
      ctx.fillStyle = `rgba(255, 255, 255, ${u.map(i, startTime + 10, startTime + 30, 0, 0.5, true)})`
      ctx.font = '32px Times New Roman'
      ctx.fillText('Press any button to start', 0, 0)
      ctx.restore()

      if ((Object.keys(game.keysPressed).length || game.mouse.button) && i > startTime) {
        break
      }

      i += 1
      yield
    }

    game.getThing('player').showGui = true

    const time = 30
    for (let i = 0; i < time; i++) {
      mouse.click && mouse.lock()
      ctx.save()
      ctx.fillStyle = `rgba(0, 0, 0, ${u.map(i, 0, time, 0.25, 0, true)})`
      ctx.fillRect(0, 0, width, height)
      ctx.restore()
      yield
    }
  } else {
    const time = globals.fastRestart ? 10 : 30
    for (let i = 0; i < time; i++) {
      mouse.click && mouse.lock()
      ctx.save()
      ctx.fillStyle = `rgba(0, 0, 0, ${u.map(i, 0, time, globals.fastRestart ? 0.25 : 1, 0, true)})`
      ctx.fillRect(0, 0, width, height)
      ctx.restore()
      yield
    }
  }

  yield 'done'
}

export default class LevelStart extends Thing {
  sprite = null
  pauseException = true

  constructor (data) {
    super(data)
    this.anim = Animation()
    game.getScene().paused = true
  }

  update () {
    game.getScene().paused = true
    this.dead = this.anim.next().value === 'done'
  }
}
