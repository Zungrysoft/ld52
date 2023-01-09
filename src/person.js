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
  texture = assets.textures.person
  friction = 0.85
  attackActive = false
  following = false
  followingEnabled = false
  tranquilized = false
  caughtYou = false
  facingAngle = 0
  talkedTo = false

  // Conversation stuff
  conversationSeed = 0
  recentResponse = ""
  friendliness = 0
  topicRelevance = []
  qualities = ["drunkard"]
  alreadyAsked = []
  patience = 3

  constructor (position, qualities) {
    super()
    this.position = position
    this.groundHeight = game.getThing('terrain').getGroundHeight(this.position[0], this.position[1])
    this.position[2] = this.groundHeight + this.height
    this.speed[2] = 0
    this.after(5, () => this.angleUpdate())
    this.conversationSeed = Math.floor(Math.random() * 1000000)
    this.qualities = qualities
    this.randomOffset = Math.floor(Math.random() * 60)
    this.facingAngle = Math.random() * 2 * Math.PI
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
      if (dist > 200) {
        const accel = vec2.angleToVector(this.angle, 1.3)
        this.speed[0] += accel[0]
        this.speed[1] += accel[1]
      }
    }

    this.speed[0] *= this.friction
    this.speed[1] *= this.friction

    this.move()
    this.position[2] += this.speed[2]
  }

  draw () {
    // Determine angle
    const camAngle = (game.getScene().camera3D.yaw + this.facingAngle + (Math.PI / 4)) % (Math.PI * 2)

    gfx.setShader(assets.shaders.animatedBillboard)
    gfx.set('cellSize', [1 / 4, 1 / 4])
    if (this.tranquilized) {
      gfx.set('cellIndex', [(this.time + this.randomOffset) % 40 < 20 ? 2 : 3, 3])
    }
    else if (this.caughtYou) {
      gfx.set('cellIndex', [(this.time + this.randomOffset) % 26 < 13 ? 0 : 1, 3])
    }
    else if (this.following) {
      gfx.set('cellIndex', [(this.time + this.randomOffset) % 60 < 30 ? 2 : 3, 2])
    }
    else {
      if (camAngle < Math.PI * 0.5) {
        gfx.set('cellIndex', [(this.time + this.randomOffset) % 60 < 30 ? 0 : 1, 1])
      }
      else if (camAngle < Math.PI) {
        gfx.set('cellIndex', [(this.time + this.randomOffset) % 60 < 30 ? 2 : 3, 0])
      }
      else if (camAngle < Math.PI * 1.5) {
        gfx.set('cellIndex', [(this.time + this.randomOffset) % 60 < 30 ? 0 : 1, 0])
      }
      else {
        gfx.set('cellIndex', [(this.time + this.randomOffset) % 60 < 30 ? 2 : 3, 1])
      }
    }
    gfx.setTexture(this.texture)
    game.getScene().camera3D.setUniforms()
    gfx.set('modelMatrix', mat.getTransformation({
      translation: this.position,
      scale: 64
    }))
    gfx.set('color', [1, 1, 1, 1])
    gfx.drawBillboard()

    if (!this.caughtYou && !this.tranquilized) {
      if (!this.talkedTo) {
        gfx.setShader(assets.shaders.billboard)
        gfx.setTexture(assets.textures.speechBalloon)
        game.getScene().camera3D.setUniforms()
        gfx.set('modelMatrix', mat.getTransformation({
          translation: vec3.add(this.position, [0, 0, 64]),
          scale: 64
        }))
        gfx.set('color', [1, 1, 1, 1])
        gfx.drawBillboard()
      }
      else if (this.patience <= 0) {
        gfx.setShader(assets.shaders.animatedBillboard)
        gfx.set('cellSize', [1 / 4, 1])
        gfx.set('cellIndex', [Math.floor((this.time + this.randomOffset) / 5) % 4, 0])
        gfx.setTexture(assets.textures.angryCloud)
        game.getScene().camera3D.setUniforms()
        gfx.set('modelMatrix', mat.getTransformation({
          translation: vec3.add(this.position, [0, 0, 64]),
          scale: 64
        }))
        gfx.set('color', [1, 1, 1, 1])
        gfx.drawBillboard()
      }
      else if (this.followingEnabled) {
        gfx.setShader(assets.shaders.billboard)
        gfx.setTexture(assets.textures.followIndicator)
        game.getScene().camera3D.setUniforms()
        gfx.set('modelMatrix', mat.getTransformation({
          translation: vec3.add(this.position, [0, 0, 96 + Math.sin((this.time + this.randomOffset) * 0.07) * 10]),
          scale: 64
        }))
        gfx.set('color', [1, 1, 1, 1])
        gfx.drawBillboard()
      }
    }
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
