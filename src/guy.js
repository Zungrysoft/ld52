import { getScene, getThing } from './core/game.js'
import Creature from './creature.js'
import * as gfx from './core/webgl.js'
import * as mat from './core/matrices.js'
import * as u from './core/utils.js'
import assets from './assets.js'
import * as vec3 from './core/vector3.js'
import { angleToVector } from './core/vector2.js'

export default class Guy extends Creature {
  groundHeight = 0
  color = u.stringToColor('#d77bba')
  legColor = u.stringToColor('#76428a')
  random = getScene().random

  constructor (data) {
    super(data)
    this.addLeg({
      directionOffset: Math.PI / 2,
      offset: 16,
      kneeCount: 0,
      color: this.legColor
    })
    this.addLeg({
      directionOffset: Math.PI / -2,
      offset: 16,
      kneeCount: 0,
      color: this.legColor
    })
    this.collisionSettings.levelContained = true
    this.groundHeight = getThing('terrain').getGroundHeight(this.position[0], this.position[1])
    this.position[2] = this.groundHeight + 64
    this.chooseDirection()
    this.standAndSnap()
  }

  update () {
    this.updateLegs()

    const dir = angleToVector(this.direction)
    const tdir = angleToVector(this.targetDirection)
    dir[0] = u.lerp(dir[0], tdir[0], 0.1)
    dir[1] = u.lerp(dir[1], tdir[1], 0.1)
    this.direction = u.angleTowards(0, 0, ...dir)
    const walk = 0.2
    this.speed[0] += Math.cos(this.direction) * walk
    this.speed[1] += Math.sin(this.direction) * walk
    this.speed[0] *= 0.9
    this.speed[1] *= 0.9

    super.update()
    if (Object.values(this.contactDirections).some(x => x) ||
        this.getAllThingCollisions().some(thing => u.distance3d(...thing.position, ...this.position) < 48)) {
      this.direction += Math.PI
      this.speed[0] *= -1
      this.speed[1] *= -1
      this.chooseDirection()
    }

    const player = getThing('player')
    if (player && u.distance3d(...this.position, ...player.position) < 64) {
      const diff = vec3.subtract(player.position, this.position)
      const bounceFactor = 10

      let push = vec3.toLength(diff, bounceFactor)
      if (vec3.normalize(diff)[2] > 0.7) {
        push = [0, 0, bounceFactor]
      }
      player.speed[0] += push[0]
      player.speed[1] += push[1]
      player.speed[2] = u.clamp(Math.abs(player.speed[2]), push[2], push[2] * 1.5)
      player.stretch = [0.4, 1.3]
      player.canDash = true
      if (this.timer('bounce')) getScene().paused = true
      this.after(15, null, 'bounce')
      assets.sounds.boing.playbackRate = 0.25 * this.random(0.8, 1.2)
      assets.sounds.boing.currentTime = 0
      assets.sounds.boing.play()
    }
  }

  onStep () {
    const player = getThing('player')
    const distance = u.distance3d(...this.position, ...player.position)
    const range = 640
    const volume = 1 - distance / range
    const sound = assets.sounds.boingFootstep
    if (player && volume > 0 && (sound.paused || volume > sound.volume)) {
      sound.playbackRate = this.random(0.8, 1.2)
      sound.currentTime = 0
      sound.volume = volume * 0.2
      sound.play()
    }
  }

  draw () {
    this.drawLegs()

    const camera = getScene().camera3D
    gfx.setShader(assets.shaders.default)
    gfx.setTexture(assets.textures.square)
    camera.setUniforms()
    gfx.set('color', this.color)
    gfx.set('modelMatrix', mat.getTransformation({
      translation: this.position,
      rotation: [0, 0, this.direction],
      scale: u.lerp(24, 48, this.timer('bounce') ? 1 - this.timer('bounce') ** 2 : 0)
    }))
    gfx.drawMesh(assets.models.sphere)

    gfx.set('color', [1, 1, 1, 1])
    gfx.setTexture(assets.textures.face2)
    gfx.drawQuad(
      1, 1, 1,
      1, 1, -1,
      1, -1, 1,
      1, -1, -1
    )

    this.drawShadow(24)
  }

  chooseDirection () {
    this.targetDirection = this.random(0, Math.PI * 2)
    this.after(this.random(60 * 3, 60 * 5), 'choose direction', () => this.chooseDirection())
    this.stand()
    // this.isStanding = this.random() > 0.5
  }

  checkCollision (x = this.position[0], y = this.position[1]) {
    return (
      super.checkCollision(x, y) ||
      getThing('terrain').getGroundHeight(x, y) !== this.groundHeight
    )
  }
}
