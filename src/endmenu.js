import Thing from './core/thing.js'
import * as game from './core/game.js'
import * as vec3 from './core/vector3.js'
import * as u from './core/utils.js'
import Terrain from './terrain.js'
import { width, height } from './config.js'

export default class TitleMenu extends Thing {
  time = 0
  total = 60


  constructor (data) {
    super(data)
    this.failures = data
    this.isFailure = this.failures.length > 0
  }

  update () {
    super.update()
    this.time += 1

    const faceTarget = game.getThing('player').faceTarget
    const faceSource = game.getThing('player').faceSource

    const cam = game.getScene().camera3D

    // What angle do we need to look at to be facing the target spot?
    let desiredLook = vec3.normalize(vec3.subtract(faceSource, faceTarget))
    let currentLook = cam.lookVector

    let between = vec3.normalize(vec3.lerp(currentLook, desiredLook, 0.1))

    ;[cam.yaw, cam.pitch] = vec3.vectorToAngles(between)

    cam.position = vec3.lerp(cam.position, faceSource, 0.1)

    if (this.time >= this.total) {
      if (this.isFailure) {
        game.getThing('player').endLevelFailure(this.failures)
      }
      else {
        game.getThing('player').endLevelSuccess()
      }
    }
  }

  draw () {
    const { ctx } = game
    if (this.isFailure) {
      ctx.fillStyle = `rgba(100, 0, 0, ${this.time/this.total})`
    }
    else {
      ctx.fillStyle = `rgba(17, 17, 17, ${this.time/this.total})`
    }
    ctx.fillRect(0, 0, width, height)
  }
}
