import {
  ctx,
  globals,
  getScene,
  mouse,
  getThing
} from './core/game.js'
import { width, height } from './config.js'
import Thing from './core/thing.js'
import * as gfx from './core/webgl.js'
import * as mat from './core/matrices.js'
import * as u from './core/utils.js'
import assets from './assets.js'
import * as vec3 from './core/vector3.js'
import * as vec2 from './core/vector2.js'
import InputHandler from './core/inputs.js'
import Bullet from './bullet.js'
import DeathAnim from './deathanim.js'
import LevelStart from './levelstart.js'

export default class Player extends Thing {
  height = 56
  onGround = false
  wasOnGround = false
  aabb = [-16, -16, 16, 16]
  cameraTarget = [0, 0, 0]
  cameraLookAhead = 64
  moveDirection = [1, 0, 0]
  forward = [1, 0, 0]
  color = u.stringToColor('#cbdbfc')
  legColor = u.stringToColor('#5b6e99')
  ears = []
  stretch = [1, 1]
  compression = 1
  width = 16
  canDash = true
  wannaJump = 0
  coyoteFrames = 0
  staircaseOffset = 0
  inputs = null
  lastFallSpeed = 0
  time = 600
  showGui = true // cutscenes set this to false
  deliveredCount = 0
  sprite = null
  // framebuffer = gfx.gl.createFramebuffer()
  depth = -10000
  stepCounter = 0
  lastPosition = [0, 0, 0]
  walkFrames = 0
  walkFrameAccel = 0
  slowTime = 0

  constructor (position, angle = 0) {
    super()

    const { music1, music2, music3, musicFinal } = assets.sounds
    for (const music of [music1, music2, music3, musicFinal]) {
      music.pause()
    }

    music1.volume = 0.8
    music2.volume = 0.8
    music3.volume = 0.8
    musicFinal.volume = 0.8

    let music = music1
    if (globals.level > 5) {
      music = music2
    }
    if (globals.level > 10) {
      music = music3
    }
    music.loop = true
    //music.volume = 0.5
    music.play()

    if (!globals.level) {
      globals.lives = 3
      globals.level = 1
      globals.powerup = 'none'
    }
    // mouse.setStyle("none")

    // getScene().addThing(new DemoHelper())

    // this.position[2] = 10000
    this.position = position
    this.position[2] = getThing('terrain').getGroundHeight(this.position[0], this.position[1]) + this.height
    getScene().camera3D.position = [...this.position]
    getScene().camera3D.pitch = 0.25
    getScene().camera3D.yaw = angle
    getScene().addThing(new LevelStart())
    // getScene().addThing(new DemoHelper())

    this.spawnPosition = [...this.position]
    this.speed[2] = 0
    // this.direction = 0
    // this.lookDirection = 0

    this.setName('player')

    this.inputs = new InputHandler({
      jump (keys, mouse, gamepad) {
        return keys.Space || gamepad?.buttons[0].pressed
      },
      shoot (keys, mouse, gamepad) {
        return (mouse.isLocked() && mouse.button) || gamepad?.buttons[1].pressed
      },

      xMove (keys, mouse, gamepad) {
        const kb = !!keys.KeyD - !!keys.KeyA
        const gp = Math.abs(gamepad?.axes[0]) > 0.1 && gamepad.axes[0]
        return kb + gp
      },
      yMove (keys, mouse, gamepad) {
        const kb = !!keys.KeyS - !!keys.KeyW
        const gp = Math.abs(gamepad?.axes[1]) > 0.1 && gamepad.axes[1]
        return kb + gp
      },

      xLook (keys, mouse, gamepad) {
        const kb = !!keys.ArrowRight - !!keys.ArrowLeft
        const gp = Math.abs(gamepad?.axes[2]) > 0.1 && gamepad.axes[2]
        return kb * 0.02 + gp * 0.04
      },
      yLook (keys, mouse, gamepad) {
        const kb = !!keys.ArrowDown - !!keys.ArrowUp
        const gp = Math.abs(gamepad?.axes[3]) > 0.1 && gamepad.axes[3]
        return kb * 0.02 + gp * 0.04
      },

      pause (keys, mouse, gamepad) {
        return keys.Escape
      },

      reset (keys, mouse, gamepad) {
        return keys.KeyR
      }
    })

    /*
    const mapColors = []
    for (let i=1; i<=64; i++) {
      mapColors.push({
        value: i,
        identifier: `height_${i}`,
        color: u.colorToString(...u.hsvToRgb(0.5 + ((i-1)/128)%0.5, 1, 1))
      })
    }
    console.log(JSON.stringify(mapColors))
    */
  }

  update () {
    this.inputs.update()
    const scene = getScene()
    this.time -= 1

    // walking and friction
    let dx = this.inputs.get('xMove')
    let dy = this.inputs.get('yMove')

    // counter for view bobbing
    if (Math.abs(dx) + Math.abs(dy) > 0) {
      this.walkFrameAccel = 0.08
    } else {
      this.walkFrameAccel = Math.max(this.walkFrameAccel - 0.002, 0)
    }
    this.walkFrames += this.walkFrameAccel
    this.walkFrames = this.walkFrames % (Math.PI * 2)

    // normalize movement so diagonals aren't faster (like in doom)
    if (u.distance2d(0, 0, dx, dy) > 1) {
      [dx, dy] = vec2.normalize([dx, dy])
    }

    // player's max speed should be 11.3583

    const yaw = scene.camera3D.yaw - Math.PI / 2
    const friction = this.slowTime > 0 ? 0.85 : 0.9
    const groundSpeed = 1.262
    const airSpeed = 0.8
    const walkSpeed = this.onGround ? groundSpeed : airSpeed
    const maxSpeed = groundSpeed / (1 - friction)
    const xAccel = (Math.cos(yaw) * dx - Math.sin(yaw) * dy) * walkSpeed
    const yAccel = (Math.sin(yaw) * dx + Math.cos(yaw) * dy) * walkSpeed

    this.slowTime--

    this.moveDirection = vec3.normalize([xAccel, yAccel, 0])
    this.forward = vec3.normalize([Math.sin(yaw), Math.cos(yaw), 0])

    // can't move if diving
    if (this.onGround || !this.timer('disableAirControl')) {
      const lastMagnitude = vec2.magnitude(this.speed)
      this.speed[0] += xAccel
      this.speed[1] += yAccel
      const newMagnitude = vec2.magnitude(this.speed)

      if (u.distance2d(0, 0, this.speed[0] + xAccel, this.speed[1] + yAccel) >= maxSpeed) {
        this.speed[0] *= lastMagnitude / newMagnitude
        this.speed[1] *= lastMagnitude / newMagnitude
      }

      // scene.camera3D.yaw += dx*0.025
    }

    let grav = this.speed[2] < 0 ? 0.6 : 0.35
    if (this.slowTime > 0) {
      grav *= 1.7
    }
    this.speed[2] -= grav

    if (this.onGround) {
      this.speed[0] *= friction
      this.speed[1] *= friction
      this.canDash = true
      this.cancelTimer('disableAirControl')

      // land
      if (!this.wasOnGround && this.lastFallSpeed < -5) {
        this.stretch = [1.6, 0.5]
        const sound = assets.sounds.playerLand
        sound.volume = 0.1
        sound.playbackRate = u.random(1, 1.2)
        sound.currentTime = 0
        sound.play()
      }
    } else {
      this.lastFallSpeed = this.speed[2]
    }

    // falling and jumping
    if (this.inputs.pressed('jump')) {
      this.wannaJump = 6
    }
    if (this.onGround) {
      this.coyoteFrames = 10
    }

    const jump = () => {
      this.speed[2] = 10
      this.wannaJump = 0
      this.coyoteFrames = 0
      this.stretch = [0.3, 1.4]
      const sound = assets.sounds.playerJump
      sound.volume = 0.2
      sound.playbackRate = u.random(1, 1.2)
      sound.currentTime = 0
      sound.play()
    }

    if (this.wannaJump && this.coyoteFrames) {
      jump()
    }

    if (this.wannaJump) {
      const closestWall = this.getClosestWall()
      if (closestWall) {
        const kickSpeed = 8
        this.speed[0] += closestWall.normal[0] * kickSpeed
        this.speed[1] += closestWall.normal[1] * kickSpeed
        this.after(20, null, 'disableAirControl')
        jump()
      }
    }

    if (!this.inputs.get('jump') && this.speed[2] >= 0) {
      this.speed[2] /= 1.25
    }
    if (this.position[2] < 0) {
      // assets.sounds.playerSplash.play()
      // resetScene()
      this.dead = true
    }
    this.wannaJump = Math.max(this.wannaJump - 1, 0)
    this.coyoteFrames = Math.max(this.coyoteFrames - 1, 0)
    this.staircaseOffset = Math.max(this.staircaseOffset - 6, 0)
    this.disableAirControl = Math.max(this.disableAirControl - 1, 0)

    // shooting
    if (this.inputs.get('shoot') && !this.timer('shoot')) {
      this.after(16, () => {}, 'shoot')
      this.after(12, () => {}, 'fire')
      const look = vec3.multiply(getScene().camera3D.lookVector, -1)
      const side = vec3.crossProduct([0, 0, 1], look)
      let pos = vec3.add(this.position, vec3.multiply(side, 16))
      pos = vec3.add(pos, [0, 0, -14])

      if (globals.powerup === 'shotgun') {
        // Animation and Timing
        this.after(24, () => {}, 'shoot')
        this.after(30, () => {}, 'fire')

        // Create bullets
        for (let i = 0; i < 6; i++) {
          const r = 0.15
          let dir = vec3.add(look, [u.random(-r, r), u.random(-r, r), u.random(-r, r)])
          dir = vec3.normalize(dir)
          getScene().addThing(new Bullet(pos, dir, 28, this))
        }
        // Guarantee that one bullet will go straight ahead
        getScene().addThing(new Bullet(pos, look, 28, this))

        // Sound effect
        const sound = assets.sounds.shotgun
        sound.playbackRate = u.random(1, 1.3)
        sound.currentTime = 0
        sound.volume = 0.6
        sound.play()

        this.speed[0] -= look[0] * 4.5
        this.speed[1] -= look[1] * 4.5
        this.speed[2] -= look[2] * 2.5
      } else if (globals.powerup === 'machinegun') {
        // Animation and Timing
        this.after(7, () => {}, 'shoot')
        this.after(4, () => {}, 'fire')

        // Create bullet
        const r = 0.1
        let dir = vec3.add(look, [u.random(-r, r), u.random(-r, r), u.random(-r, r)])
        dir = vec3.normalize(dir)
        getScene().addThing(new Bullet(pos, dir, 28, this))

        // Sound effect
        const sound = assets.sounds.machinegun
        sound.playbackRate = u.random(1, 1.3)
        sound.currentTime = 0
        sound.volume = 0.6
        sound.play()

        this.speed[0] -= look[0] * 0.9
        this.speed[1] -= look[1] * 0.9
        this.speed[2] -= look[2] * 0.5
      } else if (globals.powerup === 'rifle') {
        // Animation and Timing
        this.after(24, () => {}, 'shoot')
        this.after(30, () => {}, 'fire')

        // Create bullet
        getScene().addThing(new Bullet(pos, look, 90, this))
        getScene().addThing(new Bullet(vec3.add(pos, vec3.multiply(look, 10)), look, 90, this))
        getScene().addThing(new Bullet(vec3.add(pos, vec3.multiply(look, 20)), look, 90, this))
        getScene().addThing(new Bullet(vec3.add(pos, vec3.multiply(look, 30)), look, 90, this))
        getScene().addThing(new Bullet(vec3.add(pos, vec3.multiply(look, 40)), look, 90, this))

        const sound = assets.sounds.machinegun
        sound.playbackRate = u.random(1, 1.3)
        sound.currentTime = 0
        sound.volume = 0.6
        sound.play()

        this.speed[0] -= look[0] * 3
        this.speed[1] -= look[1] * 3
        this.speed[2] -= look[2] * 1.5
      } else {
        // Animation and Timing
        this.after(16, () => {}, 'shoot')
        this.after(12, () => {}, 'fire')

        // Create bullet
        getScene().addThing(new Bullet(pos, look, 28, this))

        const sound = assets.sounds.machinegun
        sound.playbackRate = u.random(1, 1.3)
        sound.currentTime = 0
        sound.volume = 0.6
        sound.play()
        /*
        const sound = assets.sounds.pistolShoot
        sound.currentTime = 0
        sound.playbackRate = u.random(0.9, 1.1)
        sound.play()

        */

        this.speed[0] -= look[0] * 3
        this.speed[1] -= look[1] * 3
        this.speed[2] -= look[2] * 1.5
      }
    }

    // step sounds
    if (this.onGround) {
      this.stepCounter += vec2.magnitude(this.speed)
      const interval = 150
      if (this.stepCounter > interval) {
        this.stepCounter -= interval
        const sound = u.choose(
          assets.sounds.footstep1,
          assets.sounds.footstep2
          // assets.sounds.footstep3
        )
        sound.playbackRate = u.random(0.9, 1.1)
        sound.volume = 0.25
        sound.currentTime = 0
        sound.play()
      }
    }

    this.moveAndCollide()
    this.updateTimers()
    this.cameraUpdate()

    // get hit by enemy bullets
    for (const thing of this.getAllThingCollisions()) {
      if (
        thing.canDamagePlayers &&
        Math.abs(thing.position[2] - this.position[2]) <= this.height / 2 + 8 &&
        !thing.dead &&
        thing.owner !== this
      ) {
        thing.onHit(this)

        break
      }
    }

    // dramatic sounds at end of timer
    if (this.time % 60 === 0 && this.time < 300 - 60 && this.time > 0) {
      const sound = assets.sounds.impact
      sound.playbackRate = u.random(0.9, 1.1)
      sound.currentTime = 0
      sound.volume = 0.75
      sound.play()
      this.after(10, () => {}, 'timeWarning')
    }

    this.dead = this.dead || this.time < -10
  }

  moveAndCollide () {
    this.position[0] += this.speed[0]
    this.position[1] += this.speed[1]
    this.position[2] += this.speed[2]
    this.wasOnGround = this.onGround
    this.onGround = false

    // colliders are just triangles considered solid
    const colliderList = getThing('terrain').query(this.position[0] - 64, this.position[1] - 64, 128, 128)

    // floor collisions
    for (const collider of colliderList) {
      const { normal, points } = collider
      if (normal[2] < 0.7) continue
      const position = [...this.position]
      position[2] -= this.height

      if (!vec3.isInsideTriangle(...points, [0, 0, 1], position)) {
        continue
      }

      const distance = vec3.distanceToTriangle(points[0], normal, position)
      if (distance > 0) continue
      if (distance < -64) continue

      const dot = vec3.dotProduct(this.speed, normal)
      this.speed[2] -= dot * normal[2]
      this.position[2] += normal[2] * (-1 * distance)
      this.onGround = true

      if (this.wasOnGround && distance < 0) {
        this.staircaseOffset = Math.min(
          this.staircaseOffset + Math.abs(distance),
          48
        )
      }
    }

    // wall/ceiling collisions
    for (const collider of colliderList) {
      const { normal, points } = collider
      if (normal[2] >= 0.7) continue

      const fakeNormal = vec3.findMostSimilarVector(normal, [
        [0, 0, -1],
        [1, 0, 0],
        [-1, 0, 0],
        [0, 1, 0],
        [0, -1, 0]
      ])

      const stepHeight = this.onGround ? 48 : 16
      for (let h = stepHeight; h <= 64; h += 16) {
        const position = [...this.position]
        position[2] += h - this.height

        if (!vec3.isInsideTriangle(...points, fakeNormal, position)) {
          continue
        }

        const distance = vec3.distanceToTriangle(points[0], normal, position)
        if (distance > this.width) continue
        if (distance < -1 * this.width) continue

        const dot = vec3.dotProduct(this.speed, normal)
        if (dot < 0) {
          this.speed[0] -= dot * normal[0]
          this.speed[1] -= dot * normal[1]
          this.speed[2] -= dot * normal[2]
        }
        const push = (this.width - distance) / 10
        this.position[0] += normal[0] * push
        this.position[1] += normal[1] * push
        this.position[2] += normal[2] * push
      }
    }
  }

  getClosestWall () {
    let closest = null
    let closestDistance = 0
    const position = [...this.position]
    position[2] -= this.height / 2

    for (const collider of getThing('terrain').query(this.position[0] - 64, this.position[1] - 64, 128, 128)) {
      const { normal, points } = collider
      if (normal[2] >= 0.7) continue

      if (!vec3.isInsideTriangle(...points, normal, position)) {
        continue
      }

      const distance = vec3.distanceToTriangle(points[0], normal, position)
      if (distance > this.width * 1.25) continue
      if (distance < -1 * this.width) continue

      let dot = Math.abs(vec3.dotProduct(this.moveDirection, normal))
      if (vec3.magnitude(this.moveDirection) === 0) {
        dot = Math.abs(vec3.dotProduct(this.forward, normal))
      }
      if (dot > closestDistance) {
        closestDistance = dot
        closest = collider
      }
    }

    return closest
  }

  cameraUpdate () {
    const scene = getScene()

    // mouse look
    mouse.click && mouse.lock()
    if (mouse.isLocked()) {
      scene.camera3D.yaw += mouse.delta[0] / 500
      scene.camera3D.pitch += mouse.delta[1] / 500
    }
    scene.camera3D.yaw += this.inputs.get('xLook')
    scene.camera3D.pitch += this.inputs.get('yLook')
    scene.camera3D.position = [
      this.position[0],
      this.position[1],
      Math.max(this.position[2] - this.staircaseOffset, 32)
    ]
  }

  draw () {
    gfx.setShader(assets.shaders.defaultShaded)
    gfx.set('viewMatrix', [
      1, 0, 0, 0,
      0, 0, 1, 0,
      0, 1, 0, 0,
      0, 0, 0, 1
    ])

    let knockback = this.timer('fire') ? 1 - this.timer('fire') : 0
    knockback *= Math.PI / 4
    gfx.set('projectionMatrix', mat.getPerspective({ fovy: Math.PI / 4 }))

    // View bobbing
    const t = this.walkFrames
    const bobX = Math.sin(t) * 2 * 0.15
    const bobY = Math.cos(2 * t) * -0.5 * 0.15
    if (knockback > 0) {
      this.walkFrames = 0
    }

    // Animation
    if (globals.powerup === 'shotgun') {
      gfx.set('modelMatrix', mat.getTransformation({
        translation: [bobX - 2, -7 + knockback * 4, bobY - 1.8 - (knockback * 0.5)],
        rotation: [0, -knockback / 3, Math.PI / -2],
        scale: 80
      }))
      gfx.set('color', [0, 0, 1, 1])
      gfx.setTexture(assets.textures.square)
      gfx.drawMesh(assets.models.shotgun)
    } else if (globals.powerup === 'machinegun') {
      gfx.set('modelMatrix', mat.getTransformation({
        translation: [bobX - 2, -7 + knockback * 0.9, bobY - 1.8],
        rotation: [0, -knockback * 0.1, Math.PI / -2],
        scale: 64
      }))
      gfx.set('color', [0.8, 0.8, 0, 1])
      gfx.setTexture(assets.textures.square)
      gfx.drawMesh(assets.models.machinegun)
    } else if (globals.powerup === 'rifle') {
      gfx.set('modelMatrix', mat.getTransformation({
        translation: [bobX - 2, -7 + knockback * 0.2, bobY - 1.8 - (knockback * 0.5)],
        rotation: [0, -knockback, Math.PI / -2],
        scale: 64
      }))
      gfx.set('color', [0.9, 0, 0.8, 1])
      gfx.setTexture(assets.textures.square)
      gfx.drawMesh(assets.models.machinegun)
    } else {
      gfx.set('modelMatrix', mat.getTransformation({
        translation: [bobX - 2, -7 + knockback * 0.2, bobY - 1.8 - (knockback * 0.5)],
        rotation: [0, -knockback, Math.PI / -2],
        scale: 64
      }))
      gfx.set('color', [1, 0, 0, 1])
      gfx.setTexture(assets.textures.square)
      gfx.drawMesh(assets.models.pistol)
    }
  }

  guiDraw () {
    if (!this.showGui) return

    // time
    ctx.save()
    ctx.font = 'italic bold 64px Times New Roman'
    ctx.textAlign = 'center'
    ctx.translate(width / 2, height * 2 / 3)
    let scale = this.timer('timeBonus') ? u.map(this.timer('timeBonus') ** 2, 0, 1, 2.5, 1, true) : 1
    scale = Math.max(scale, this.timer('timeWarning') ? u.map(this.timer('timeWarning') ** 2, 0, 1, 1.5, 1, true) : 1)
    ctx.scale(scale, scale)
    const seconds = Math.max(this.time / 60, 0)
    const time = seconds.toFixed(2)
    ctx.fillStyle = 'red'
    if (this.timer('timeWarning')) {
      ctx.fillStyle = 'black'
    }
    ctx.fillText(time, -4, 4)
    ctx.fillStyle = 'white'
    if (this.timer('timeWarning')) {
      ctx.fillStyle = 'red'
    }
    ctx.fillText(time, 0, 0)
    ctx.restore()

    // crosshair
    /*
    const size = 10
    ctx.save()
    ctx.translate(width/2, height/2)
    ctx.strokeStyle = "white"
    ctx.lineWidth = 1
    ctx.moveTo(-size, 0)
    ctx.lineTo(size, 0)
    ctx.moveTo(0, -size + 0.5)
    ctx.lineTo(0, size + 0.5)
    ctx.stroke()
    ctx.restore()
    */
    ctx.drawImage(assets.images.crosshair, width / 2 - 16, height / 2 - 16)

    ctx.save()
    ctx.translate(32, height - 48)
    ctx.font = 'italic 32px Times New Roman'
    {
      const str = 'Lives: ' + globals.lives
      ctx.fillStyle = 'darkBlue'
      ctx.fillText(str, 0, 0)
      ctx.fillStyle = 'white'
      ctx.fillText(str, 4, -4)
    }
    ctx.translate(0, -48)
    {
      const str = 'Level: ' + globals.level
      ctx.fillStyle = 'darkBlue'
      ctx.fillText(str, 0, 0)
      ctx.fillStyle = 'white'
      ctx.fillText(str, 4, -4)
    }
    ctx.restore()
  }

  onDeath () {
    getScene().addThing(new DeathAnim())
  }
}
