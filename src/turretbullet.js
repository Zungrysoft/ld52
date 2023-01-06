import Bullet from './bullet.js'

export default class TurretBullet extends Bullet {
  canDamagePlayers = true
  canDamageEnemies = false

  onHit (other) {
    other.slowTime = 30
    this.dead = true
  }
}
