import assets from './assets.js'
import Thing from './core/thing.js'
import * as gfx from './core/webgl.js'
import * as game from './core/game.js'
import * as u from './core/utils.js'
import * as vec3 from './core/vector3.js'
import * as mat from './core/matrices.js'

export default class Bullet extends Thing {
  canDamagePlayers = true
  canDamageEnemies = true
  aabb = [-24, -24, 24, 24]

  constructor (position, direction, speed, owner) {
    super()
    this.position = [...position]
    this.speed = vec3.multiply(direction, speed)
    this.direction = [...direction]
    this.owner = owner
    this.after(60, () => { this.dead = true })
  }

  update () {
    const colliderSize = 256
    const colliders = game.getThing('terrain').query(
      this.position[0] - colliderSize,
      this.position[1] - colliderSize,
      colliderSize * 2,
      colliderSize * 2
    )

    for (const collider of colliders) {
      const { points, normal } = collider
      const itx = vec3.rayTriangleIntersection(
        this.position,
        this.speed,
        ...points,
        normal
      )

      if (itx && u.distance3d(...itx, ...this.position) <= vec3.magnitude(this.speed)) {
        this.dead = true
        break
      }
    }

    this.position[0] += this.speed[0]
    this.position[1] += this.speed[1]
    this.position[2] += this.speed[2]

    this.updateTimers()
  }

  draw () {
    for (let i = 0; i < 3; i++) {
      gfx.setShader(assets.shaders.billboard)
      gfx.setTexture(assets.textures.circle)
      game.getScene().camera3D.setUniforms()
      gfx.set('modelMatrix', mat.getTransformation({
        translation: vec3.add(this.position, vec3.multiply(this.direction, i * -12)),
        scale: 14 - i * 3
      }))
      gfx.set('color', i === 0 ? [1, 1, 1, 1] : [1, 0, 0, 1])
      gfx.drawBillboard()
    }
  }

  onHit (other) {
    other.health -= 1
    this.dead = true
    other.after(15, () => {}, 'hurt')
  }
}
