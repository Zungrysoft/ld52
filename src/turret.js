import * as game from './core/game.js'
import * as u from './core/utils.js'
import assets from './assets.js'
import * as vec3 from './core/vector3.js'
import Enemy from './enemy.js'
import TurretBullet from './turretbullet.js'

export default class EnemyTurret extends Enemy {
  texture = assets.textures.turret
  height = 64
  attackTime = 0

  behavior () {
    // Laser attack
    this.friction = 0.60
    this.attackActive = false
    const player = game.getThing('player')
    if (player && u.distance2d(player.position[0], player.position[1], this.position[0], this.position[1]) < 64 * 10) {
      this.friction = 0
      this.attackActive = true

      // Bullet
      this.attackTime--
      if (this.attackTime < 0) {
        this.attackTime = 20

        const dir = vec3.normalize(vec3.subtract(player.position, this.position))
        game.getScene().addThing(new TurretBullet(this.position, dir, 40, this))
      }

      // TODO: Line of sight check

      // TODO: Laser graphic
    } else {
      this.attackTime = 20
    }

    super.behavior()
  }
}
