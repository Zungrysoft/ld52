import { height } from './config.js'
import Thing from './core/thing.js'
import * as game from './core/game.js'
import * as u from './core/utils.js'
import Terrain from './terrain.js'

export default class TitleMenu extends Thing {
  time = 0

  constructor (data) {
    super(data)
    this.setName('title')
    game.getScene().addThing(new Terrain())
    game.globals.tutorial = true
  }

  update () {
    super.update()
    this.time += 1
    const cam = game.getScene().camera3D
    cam.pitch = 0.9
    const a = (Math.sin(this.time / 70) / 100 + Math.PI * 2 * 5 / 8) + 0.5
    const r = 30 * 64
    cam.position = [Math.sin(a) * r + 37 * 64, Math.cos(a) * r + 32 * 64, 64 * 30]
    cam.yaw = -a + Math.PI / 2
    // game.getScene().camera3D.pitch += 0.02

    if (this.time > 30 && (Object.keys(game.keysPressed).length || game.mouse.button)) {
      delete game.globals.generated
      //game.mouse.lock()
      game.setNextScene()
    }
  }

  draw () {
    const { ctx } = game
    ctx.save()
    const name = 'Organ-ized Crime'
    // ctx.fillStyle = "white"
    ctx.font = 'italic bold 96px Times New Roman'
    // ctx.font = "bold 96px Courier New"
    ctx.fillStyle = 'black'
    ctx.translate(120, 200)
    ctx.fillText(name, 0, 0)
    ctx.fillStyle = u.colorToString(...u.hsvToRgb(0, 1, (Math.sin(this.time / 30)*0.4 + 0.6)))
    ctx.translate(8, -8)
    ctx.fillText(name, 0, 0)
    ctx.restore()

    ctx.save()
    ctx.fillStyle = u.colorToString(1, 1, 1, u.map(this.time, 60, 90, 0, 1, true))
    ctx.font = '32px Times New Roman'
    ctx.fillText('Press any button to start!', 120, height - 120)
    ctx.restore()
  }
}
