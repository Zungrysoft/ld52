import { width, height } from './config.js'
import * as u from './core/utils.js'
import * as game from './core/game.js'
import Thing from './core/thing.js'

function * DeathAnimation () {
  const { ctx, globals } = game
  let lives = globals.lives + 1

  for (let i = 0; i < 15; i++) {
    ctx.fillStyle = 'rgba(255, 0, 0, 0.35)'
    ctx.fillRect(0, 0, width, height)
    yield
  }

  const subTime = 30
  globals.powerup = 'none'
  globals.fastRestart = true

  let i = 0
  while (true) {
    ctx.fillStyle = `rgba(0, 0, 0, ${u.map(i, 0, 10, 0, 0.25, true)})`
    ctx.fillRect(0, 0, width, height)

    if (i === subTime) {
      lives -= 1
    }

    ctx.save()
    ctx.translate(width - 64, height - 64)
    ctx.textAlign = 'right'
    ctx.fillStyle = `rgba(255, 255, 255, ${u.map(i, subTime + 10, subTime + 30, 0, 0.5, true)})`
    ctx.font = '32px Times New Roman'
    ctx.fillText('Press any button to try again...', 0, 0)
    ctx.restore()

    ctx.save()
    ctx.translate(width / 2, height / 2)
    ctx.font = 'italic 64px Times New Roman'
    ctx.textAlign = 'center'
    ctx.translate(0, Math.sin(u.map(i, subTime, subTime + 15, 0, Math.PI, true)) * -16)
    const str = 'Lives: ' + lives
    ctx.fillStyle = 'darkBlue'
    ctx.fillText(str, 0, 0)
    ctx.fillStyle = i >= subTime && i <= subTime + 15 ? 'red' : 'white'
    ctx.fillText(str, 4, -4)
    ctx.restore()

    if ((Object.keys(game.keysPressed).length || game.mouse.button) && i > subTime + 10) {
      break
    }

    i += 1
    yield
  }

  game.resetScene()
}

function * GameOver () {
  const { ctx, globals } = game
  delete globals.fastRestart

  for (let i = 0; i < 15; i++) {
    ctx.fillStyle = 'rgba(255, 0, 0, 0.35)'
    ctx.fillRect(0, 0, width, height)
    yield
  }

  let i = 0
  while (true) {
    ctx.fillStyle = `rgba(0, 0, 0, ${u.map(i, 0, 60, 0, 1, true)})`
    ctx.fillRect(0, 0, width, height)

    ctx.save()
    ctx.translate(width / 2, height / 2 + Math.sin(i / 30) * 16)
    const scalar = u.lerp(1, 12, 1 - u.map(i, 0, 30, 0, 1, true) ** 2)
    ctx.scale(scalar, scalar)
    // ctx.fillStyle = "rgba(0, 0, 0, ${u.map(i, 0, 10, 0, 1, true)})"
    ctx.fillStyle = 'black'
    ctx.font = 'italic 80px Times New Roman'
    ctx.textAlign = 'center'
    const str = 'Game Over'
    ctx.fillText(str, 0, 0)
    ctx.translate(4, -4)
    ctx.fillStyle = 'red'
    ctx.fillText(str, 0, 0)
    ctx.restore()

    const subTime = 30
    ctx.save()
    ctx.translate(width / 2, height / 2 + 64)
    ctx.textAlign = 'center'
    ctx.fillStyle = `rgba(255, 255, 255, ${u.map(i, subTime, subTime + 10, 0, 0.8, true)})`
    ctx.font = 'italic 32px Times New Roman'
    ctx.fillText(`Made it to level ${globals.level}`, 0, 0)
    ctx.restore()

    ctx.save()
    ctx.translate(width - 64, height - 64)
    ctx.textAlign = 'right'
    ctx.fillStyle = `rgba(255, 255, 255, ${u.map(i, subTime + 10, subTime + 30, 0, 0.5, true)})`
    ctx.font = '32px Times New Roman'
    ctx.fillText('Press any button to try again...', 0, 0)
    ctx.restore()

    if ((Object.keys(game.keysPressed).length || game.mouse.button) && i > subTime + 10) {
      break
    }

    i += 1
    yield
  }

  delete globals.level
  delete globals.lives
  delete globals.parameterBuilder
  delete globals.generated
  game.resetScene()
}

export default class DeathAnim extends Thing {
  pauseException = true
  sprite = null

  constructor (data) {
    super(data)
    game.globals.lives -= 1
    if (game.globals.lives) {
      this.anim = DeathAnimation()
    } else {
      this.anim = GameOver()
    }
  }

  update () {
    game.getScene().paused = true
    this.anim.next()
  }
}
