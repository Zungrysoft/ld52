import Thing from './core/thing.js'
import * as game from './core/game.js'
import * as gfx from './core/webgl.js'
import * as mat from './core/matrices.js'
import * as u from './core/utils.js'
import assets from './assets.js'
import * as vec2 from './core/vector2.js'
import * as vec3 from './core/vector3.js'
import Player from './player.js'

export default class Person extends Thing {
  height = 64
  angle = 0
  time = 0
  health = 1
  texture = assets.textures.enemy
  friction = 0.85
  attackActive = false
  following = false
  followingEnabled = false

  // Conversation stuff
  conversationSeed = 0
  recentResponse = ""
  friendliness = 0
  topicRelevance = []
  qualities = ["drunkard"]
  alreadyAsked = []

  constructor (position, qualities) {
    super()
    this.position = position
    this.groundHeight = game.getThing('terrain').getGroundHeight(this.position[0], this.position[1])
    this.position[2] = this.groundHeight + this.height
    this.speed[2] = 0
    this.after(20, () => this.angleUpdate())
    this.conversationSeed = Math.floor(Math.random() * 1000000)
    this.qualities = qualities
  }

  update () {
    this.updateTimers()
    if (this.timer('hurt')) return
    this.time += 1

    this.behavior()

    if (!this.dead && this.health <= 0) {
      this.dead = true

      // Death sound
      const sound = u.choose(assets.sounds.enemyHurt1, assets.sounds.enemyHurt2)
      sound.playbackRate = u.random(0.9, 1.1)
      sound.currentTime = 0
      sound.play()
    }

    for (const thing of this.getAllThingCollisions()) {
      if (
        thing.canDamageEnemies &&
        Math.abs(thing.position[2] - this.position[2]) <= this.height / 2 + 32 &&
        !thing.dead &&
        !this.timer('hurt') &&
        thing.owner !== this
      ) {
        thing.onHit(this)
        break
      }
    }
  }

  behavior () {
    // fall down when above ground
    this.groundHeight = game.getThing('terrain').getGroundHeight(this.position[0], this.position[1])
    if (this.position[2] > this.groundHeight + this.height) {
      this.speed[2] -= 1
    } else if (this.speed[2] < 0) {
      this.speed[2] = 0
      this.position[2] = this.groundHeight + this.height
    }

    // step up when below ground
    if (this.position[2] < this.groundHeight + this.height) {
      this.position[2] += 4
    }

    // move towards player
    const player = game.getThing('player')
    if (this.following && player) {
      let dist = u.distance2d(player.position[0], player.position[1], this.position[0], this.position[1]);
      if (dist < 64 * 16 && dist > 200) {
        const accel = vec2.angleToVector(this.angle, 1.3)
        this.speed[0] += accel[0]
        this.speed[1] += accel[1]
      }
    }

    this.speed[0] *= this.friction
    this.speed[1] *= this.friction

    this.move()
    this.position[2] += this.speed[2]
    this.dead = this.dead || this.position[2] < 32
  }

  draw () {
    gfx.setShader(assets.shaders.animatedBillboard)
    gfx.set('cellSize', [1 / 4, 1 / 2])
    if (this.timer('hurt')) {
      gfx.set('cellIndex', [2, 0])
    } else if (this.attackActive) {
      gfx.set('cellIndex', [0, 1])
    } else {
      gfx.set('cellIndex', [this.time % 60 < 30 ? 0 : 1, 0])
    }
    gfx.setTexture(this.texture)
    game.getScene().camera3D.setUniforms()
    gfx.set('modelMatrix', mat.getTransformation({
      translation: this.position,
      scale: 64
    }))
    gfx.set('color', [1, 1, 1, 1])
    gfx.drawBillboard()
  }

  checkCollision (x = this.position[0], y = this.position[1]) {
    return (
      super.checkCollision(x, y) ||
      game.getThing('terrain').getGroundHeight(x, y) >= this.groundHeight + 96
    )
  }

  angleUpdate () {
    this.after(60, () => this.angleUpdate())
    const player = game.getThing('player')
    if (!player) return
    this.angle = u.angleTowards(this.position[0], this.position[1], player.position[0], player.position[1])
    this.angle += u.random(-0.5, 0.5)
  }
}
