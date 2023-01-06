import assets from './assets.js'
import Thing from './core/thing.js'
import * as gfx from './core/webgl.js'
import * as game from './core/game.js'
import * as mat from './core/matrices.js'
import { ItemParticle } from './particle.js'

export default class Pickup extends Thing {
  time = 0
  height = 32
  texture = assets.textures.circle

  constructor (position) {
    super()
    this.position = position
    this.groundHeight = game.getThing('terrain').getGroundHeight(this.position[0], this.position[1])
    this.position[2] = this.groundHeight + this.height
  }

  update () {
    super.update()
    this.time += 1
    this.position[2] += Math.sin(this.time / 60) / 4

    if (this.time % 16 === 0) {
      game.getScene().addThing(new ItemParticle(this.position))
    }

    const player = game.getThing('player')
    this.player = player
    if (player && this.getAllThingCollisions().includes(player)) {
      this.onPickup()
      this.dead = true
    }
  }

  onPickup () {
  }

  draw () {
    gfx.setShader(assets.shaders.billboard)
    gfx.setTexture(this.texture)
    game.getScene().camera3D.setUniforms()
    gfx.set('modelMatrix', mat.getTransformation({
      translation: this.position,
      scale: 32
    }))
    gfx.set('color', [1, 1, 1, 1])
    gfx.drawBillboard()
  }
}
