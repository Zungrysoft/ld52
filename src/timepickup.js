import assets from './assets.js'
import Pickup from './pickup.js'

export default class TimePickup extends Pickup {
  texture = assets.textures.timePickup

  onPickup () {
    const sound = assets.sounds.timePickup
    sound.currentTime = 0
    sound.volume = 0.5
    sound.play()
    this.player.time += 5 * 60
    this.player.after(15, () => {}, 'timeBonus')
  }
}
