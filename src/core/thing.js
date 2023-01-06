/* global Image */

import { sign } from './utils.js'
import { ctx, getScene } from './game.js'

const defaultSprite = new Image()
defaultSprite.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAc5JREFUeJztm8FywyAMREWn///L9FCTEMZDhVhJ6ynvHIN2kQGBI3L435SEPqvxOZdYIw2oIiK12vSX8goVGnOEAVvCR9BGeBtQUcJHLiO24/c0wE18A5ENXga4i+/ZyQYPA0LFN6wmoA1IEd+wmPAF7D9VvBVUBpjFdxPZ2OBOe2pdCAOWxd+Ivovj1aixfZW276WWASwsXe8flgLdTPXszgFLo7+xbpffx/GLFnISnALawqpMuAZFNTI7BqhH36uQQRCWAUIoXiTAAIf3FjoXRGUA5eiLOBvgMWujicgA6npjx4Dpu/iE0RfZz4BbExyXPXjBBSuGHNv+aF9jwMoAoGoBt5MlEXMNwFkMKXErfkaYDDCXvz2rky/NzRBitC2Tb7QB3vcEIouaQq/G2MSbHjBCKV4kthyGg9hwMa0CKpQHqmoeY8AgHPbq0hvgJbxBaQA6zad9eTXcoVoBIkX3sGVA+M700csgAgoDMk+PKAy4SHGByYAUjgHZAWRzDMgOIJuQmyHmC5TUEyGG7wbCzwQJYjgcOsIORZP6/ZOU8wDUt/4I0v4wwWJC6h8mGEw4O8HsALI5Bji2TV0DNDKXwaj+p2RthCL7Phwm/ABT44Ss5V9iMgAAAABJRU5ErkJggg=='

export default class Thing {
  // visual settings
  sprite = defaultSprite
  spriteOffset = [0, 0]
  rotation = 0
  scale = [1, 1]
  depth = 1

  // collision and movement
  position = [0, 0]
  speed = [0, 0]
  aabb = [-32, -32, 32, 32]
  contactDirections = { left: false, right: false, up: false, down: false }
  isCollisionEnabled = true // can other things detect my presence
  isSolid = false // stop movement of other things
  isSolidRespecting = true // is stopped by solid things

  // animation
  animations = { idle: { frames: [0], speed: 0 } }
  animation = 'idle'
  lastAnimation = 'idle'
  animationIndex = 0
  animationFrameSize = 64
  timers = []

  // give myself a name so that other things can
  // reference me with getThing()
  setName (name) {
    getScene().namedThings[name] = this
  }

  /********************************************************************************
     scene events
  ********************************************************************************/

  update () {
    this.updateTimers()
    this.move()
    this.animate()
  }

  draw () {
    const anim = this.animations[this.animation]
    const frame = anim.frames[Math.floor(this.animationIndex)]

    ctx.save()
    ctx.translate(this.position[0], this.position[1])
    ctx.scale(...this.scale)
    ctx.rotate(this.rotation)
    this.drawSprite(ctx, frame)
    ctx.restore()
  }

  drawSprite (ctx, frame = 0, x = 0, y = 0) {
    if (!this.sprite) return
    const size = this.animationFrameSize
    ctx.translate(-size / 2, -size / 2)
    ctx.translate(...this.spriteOffset)
    ctx.drawImage(this.sprite, frame * size, 0, size, size, x, y, size, size)
  }

  guiDraw () {}

  onDeath () {}

  /********************************************************************************
     timer handling
  ********************************************************************************/

  after (...args) {
    if (args.length === 3) {
      const [time, action, name] = args
      this.timers[name] = { time, start: time, action }
      return
    }

    const [time, action] = args
    this.timers.push({ time, start: time, action })
  }

  updateTimers () {
    for (const [name, value] of Object.entries(this.timers)) {
      value.time -= 1
      if (value.time <= 0) {
        if (typeof value.action === 'function') value.action()

        if (Number(name) === name) {
          this.timers.splice(Number(name), 1)
        } else {
          delete this.timers[name]
        }
      }
    }
  }

  timer (name, fraction = true) {
    if (!this.timers[name]) return 0
    if (!fraction) return this.timers[name].time
    return 1 - this.timers[name].time / this.timers[name].start
  }

  cancelTimer (name) {
    if (this.timers[name]) {
      delete this.timers[name]
    }
  }

  /********************************************************************************
     basic animation
  ********************************************************************************/

  animate () {
    const anim = this.animations[this.animation]

    // option to restart the animation on change
    if (this.animation !== this.lastAnimation && anim.restart) {
      this.animationIndex = 0
    }
    this.lastAnimation = this.animation

    this.animationIndex += anim.speed ?? 0

    // option to not repeat the animation
    if (anim.noRepeat) {
      this.animationIndex = Math.min(this.animationIndex, anim.frames.length - 1)
    } else {
      this.animationIndex %= anim.frames.length
    }
  }

  /********************************************************************************
     movement and collision handling
  ********************************************************************************/

  move (dx = this.speed[0], dy = this.speed[1], stepSize = 1) {
    for (const key in this.contactDirections) this.contactDirections[key] = false

    while (Math.round(dx * 1000)) {
      const step = sign(dx) * Math.min(Math.abs(dx), stepSize)
      if (this.checkCollision(this.position[0] + step, this.position[1])) {
        this.speed[0] = 0
        this.position[0] = Math.round(this.position[0]) - sign(dx) * 0.0001
        if (sign(dx) > 0) this.contactDirections.right = true
        if (sign(dx) < 0) this.contactDirections.left = true
        break
      }
      this.position[0] += step
      dx -= step
    }

    while (Math.round(dy * 1000)) {
      const step = sign(dy) * Math.min(Math.abs(dy), stepSize)
      if (this.checkCollision(this.position[0], this.position[1] + step)) {
        this.speed[1] = 0
        this.position[1] = Math.round(this.position[1]) - sign(dy) * 0.0001
        if (sign(dy) > 0) this.contactDirections.down = true
        if (sign(dy) < 0) this.contactDirections.up = true
        break
      }
      this.position[1] += step
      dy -= step
    }
  }

  // put this thing's AABB in terms the SpatialHash understands
  aabbSpatialHash () {
    const a = this.aabb
    const p = this.position
    return [a[0] + p[0], a[1] + p[1], a[2] - a[0], a[3] - a[1]]
  }

  checkThingCollision (x = this.position[0], y = this.position[1]) {
    return this.getAllThingCollisions(x, y).some(thing => thing.isSolid)
  }

  checkCollision (x = this.position[0], y = this.position[1]) {
    return this.isSolidRespecting && this.checkThingCollision(x, y)
  }

  getAllThingCollisions (x = this.position[0], y = this.position[1]) {
    const a = this.aabb
    let hits = getScene().spatialHash.query(x + a[0], y + a[1], a[2] - a[0], a[3] - a[1])
    hits = hits.filter(thing => {
      if (thing === this || !thing.isCollisionEnabled) return false
      return (
        x + a[0] <= thing.aabb[2] + thing.position[0] &&
        y + a[1] <= thing.aabb[3] + thing.position[1] &&
        x + a[2] >= thing.aabb[0] + thing.position[0] &&
        y + a[3] >= thing.aabb[1] + thing.position[1]
      )
    })
    return hits
  }
}
