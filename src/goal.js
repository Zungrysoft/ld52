import Thing from './core/thing.js'
import assets from './assets.js'
import { getScene, getThing } from './core/game.js'
import * as gfx from './core/webgl.js'
import * as mat from './core/matrices.js'
import * as u from './core/utils.js'

import LevelWin from './levelwin.js'

export default class Goal extends Thing {
  time = 0
  visited = false
  aabb = [-Infinity, -Infinity, Infinity, Infinity]
  depth = 10000

  constructor (data) {
    super(data)
    this.position[2] = getThing('terrain').getGroundHeight(this.position[0], this.position[1]) + 64
    this.setName('goal')
  }

  update () {
    this.time += 1
    const player = getThing('player')
    if (!player) return

    if (!this.visited && u.distance3d(...this.position, ...player.position) < 80) {
      this.visited = true
      assets.sounds.win.currentTime = 0
      assets.sounds.win.volume = 0.25
      assets.sounds.win.playbackRate = u.random(0.8, 1.2)
      assets.sounds.win.play()
      getScene().addThing(new LevelWin())
    }
  }

  draw () {
    const camera = getScene().camera3D
    const { gl } = gfx

    gfx.setShader(assets.shaders.billboard)
    gfx.setTexture(assets.textures.goal)
    camera.setUniforms()
    const boing = this.visited ? 64 : u.map(Math.sin(this.time / 30), -1, 1, 64 - 16, 64 + 16)
    gfx.set('modelMatrix', mat.getTransformation({
      translation: [this.position[0], this.position[1], this.position[2] - 64 + boing],
      scale: [64, 64, boing]
    }))
    gfx.set('color', [1, 1, 1, 1])
    gfx.drawBillboard()

    gl.depthFunc(gl.ALWAYS)
    gfx.set('color', [1, 1, 1, 0.65])
    gfx.drawBillboard()
    gl.depthFunc(gl.LEQUAL)
  }
}
