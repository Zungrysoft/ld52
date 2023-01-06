import assets from './assets.js'
import Thing from './core/thing.js'
import * as gfx from './core/webgl.js'
import * as game from './core/game.js'
import * as u from './core/utils.js'
import * as vec3 from './core/vector3.js'
import * as mat from './core/matrices.js'

class Particle extends Thing {
  time = 0
  texture = assets.textures.circle
  scale = 32
  color = [1, 1, 1, 1]
  deathTime = 60

  constructor (position) {
    super()
    this.position = [...position]
  }

  update () {
    this.time += 1
    this.dead = this.dead || this.time >= this.deathTime
  }

  draw () {
    gfx.setShader(assets.shaders.billboard)
    gfx.setTexture(this.texture)
    game.getScene().camera3D.setUniforms()
    gfx.set('modelMatrix', mat.getTransformation({
      translation: this.position,
      scale: this.scale
    }))
    gfx.set('color', this.color)
    gfx.drawBillboard()
  }
}

export class ItemParticle extends Particle {
  scale = u.random(16, 24)
  color = [1, 1, 1, 0.5]

  constructor (position) {
    super(position)
    {
      const r = 1
      this.speed = vec3.normalize([u.random(-r, r), u.random(-r, r), u.random(-r, r)])
    }
    {
      const r = 16
      this.position = vec3.add(this.position, [u.random(-r, r), u.random(-r, r), u.random(-r, r)])
    }
  }

  update () {
    super.update()
    this.position[0] += this.speed[0]
    this.position[1] += this.speed[1]
    this.position[2] += this.speed[2]
    this.scale -= 0.5
    this.dead = this.dead || this.scale <= 0
  }
}
