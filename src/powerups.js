import assets from './assets.js'
import * as gfx from './core/webgl.js'
import * as game from './core/game.js'
import * as mat from './core/matrices.js'
import Pickup from './pickup.js'

export class ShotgunPickup extends Pickup {
  model = assets.models.shotgun
  color = [0, 0, 1, 1]

  onPickup () {
    const { globals } = game
    const sound = assets.sounds.weaponPickup
    sound.currentTime = 0
    sound.play()
    globals.powerup = 'shotgun'
  }

  draw () {
    gfx.setShader(assets.shaders.defaultShaded)
    gfx.setTexture(assets.textures.square)
    game.getScene().camera3D.setUniforms()
    gfx.set('modelMatrix', mat.getTransformation({
      translation: this.position,
      rotation: [0, 0, this.time / 30],
      scale: 640
    }))
    gfx.set('color', this.color)
    gfx.drawMesh(this.model)
  }
}

export class MachinegunPickup extends ShotgunPickup {
  model = assets.models.machinegun
  color = [0.8, 0.8, 0, 1]

  onPickup () {
    const { globals } = game
    const sound = assets.sounds.weaponPickup
    sound.currentTime = 0
    sound.play()
    globals.powerup = 'machinegun'
  }
}

export class RiflePickup extends ShotgunPickup {
  model = assets.models.machinegun
  color = [0.9, 0, 0.8, 1]

  onPickup () {
    const { globals } = game
    const sound = assets.sounds.weaponPickup
    sound.currentTime = 0
    sound.play()
    globals.powerup = 'rifle'
  }
}

export class VisionPickup extends Pickup {
  onPickup () {
    const { globals } = game
    const sound = assets.sounds.magic
    sound.currentTime = 0
    sound.play()
    sound.volume = 0.7
    globals.powerup = 'vision'
  }
}
