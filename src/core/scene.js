import { width, height, isWebglEnabled } from '../config.js'
import { ctx } from './game.js'
import assets from '../assets.js'
import SpatialHash from './spatialhash.js'
import * as gfx from './webgl.js'
import * as u from './utils.js'
import * as vec2 from './vector2.js'
import * as mat from './matrices.js'
import * as vec3 from './vector3.js'

export default class Scene {
  things = []
  layers = {}
  paused = false
  camera = {
    position: [width / 2, height / 2],
    rotation: 0,
    scale: [1, 1]
  }

  camera3D = {
    width,
    height,
    position: [0, 0, 0],
    yaw: 0,
    pitch: 0,
    fov: 2,
    viewMatrix: mat.getView(),
    projectionMatrix: mat.getPerspective(),
    lookVector: [1, 0, 0],
    setUniforms () {
      gfx.set('viewMatrix', this.viewMatrix)
      gfx.set('projectionMatrix', this.projectionMatrix)
    }
  }

  map = null
  spatialHash = null

  // things can assign themselves to this object
  // so that other things in the scene can reference them by name
  // things are automatically culled from this object when they die
  namedThings = {}

  constructor (name) {
    this.name = name
    this.spatialHash = new SpatialHash()
    this.random = u.randomizer()
    this.init = () => {
      const sceneData = JSON.parse(assets.scenes[name])
      for (const data of sceneData) {
        const thing = this.addThing(new assets.things[data.class]())
        for (const [key, value] of Object.entries(data.properties)) {
          thing[key] = value
        }
      }
    }
  }

  update () {
    const paused = this.paused
    this.paused = false

    // update all things in the scene
    let i = 0
    while (i < this.things.length) {
      const thing = this.things[i]
      const previousDepth = thing.depth
      const [xLast, yLast] = thing.position

      if (!thing.dead && (!paused || thing.pauseException)) thing.update()

      if (thing.dead) {
        // this thing died, so remove it from depth layers, spatial hash, and list
        thing.onDeath()
        const layer = this.layers[Math.round(previousDepth) || 0]
        if (layer) layer.splice(layer.indexOf(thing), 1)
        this.spatialHash.remove(thing)

        // we don't have to increment the index, as the other things "fall into"
        // this thing's current slot
        this.things.splice(i, 1)
      } else {
        // if depth changed, update render order
        if (previousDepth !== thing.depth) this.updateDepth(thing, previousDepth)

        // if position changed, update spatial hash
        if (xLast !== thing.position[0] || yLast !== thing.position[1]) {
          this.spatialHash.update(thing, ...thing.aabbSpatialHash())
        }

        i++
      }
    }

    // make sure all named things are still alive
    // otherwise remove them from the object
    for (const name in this.namedThings) {
      if (this.namedThings[name].dead) {
        delete this.namedThings[name]
      }
    }
  }

  draw () {
    const camera = this.camera
    ctx.save()
    ctx.translate(width / 2, height / 2)
    ctx.scale(...camera.scale)
    ctx.rotate(camera.rotation)
    ctx.translate(-camera.position[0], -camera.position[1])

    const layerOrder = Object.keys(this.layers).map(Number).sort((a, b) => a - b)
    for (const layer of layerOrder) {
      for (const thing of this.layers[layer]) {
        thing.draw()
      }
    }

    ctx.restore()

    for (const layer of layerOrder) {
      for (const thing of this.layers[layer]) {
        thing.guiDraw()
      }
    }
  }

  clearScreen () {
    const bgColor = '#4488ff'
    if (isWebglEnabled) {
      // webgl is enabled, so fill color on the webgl canvas instead of the 2d canvas
      const { gl } = gfx
      gl.clearColor(
        parseInt(bgColor.slice(1, 3), 16) / 255,
        parseInt(bgColor.slice(3, 5), 16) / 255,
        parseInt(bgColor.slice(5, 7), 16) / 255,
        1
      )
      gl.clearDepth(1.0)
      gl.enable(gl.DEPTH_TEST)
      gl.depthFunc(gl.LEQUAL)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
      gl.enable(gl.BLEND)
      gl.blendEquation(gl.FUNC_ADD)
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

      // update 3D camera matrix and look vector
      this.camera3D.viewMatrix = mat.getView({
        position: this.camera3D.position,
        target: vec3.add(this.camera3D.position, this.camera3D.lookVector)
      })
      this.camera3D.projectionMatrix = mat.getPerspective({
        aspect: width / height
      })
      this.camera3D.lookVector = vec3.anglesToVector(
        this.camera3D.yaw,
        this.camera3D.pitch
      )

      // clear the 2d canvas
      ctx.clearRect(0, 0, width, height)
    } else {
      // no webgl, fill the 2d canvas with background color
      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, width, height)
    }
  }

  // adds the given object instance to the thing list
  addThing (thing) {
    this.things.push(thing)
    this.spatialHash.add(thing, ...thing.aabbSpatialHash())
    this.updateDepth(thing)
    return thing
  }

  // update the depth of a thing from one depthSet to another
  updateDepth (thing, previousDepth = 0) {
    const depth = Math.round(thing.depth) || 0

    previousDepth = Math.round(previousDepth)
    if (previousDepth !== depth) {
      this.layers[previousDepth] = this.layers[previousDepth] || []
      this.layers[previousDepth].splice(this.layers[previousDepth].indexOf(thing), 1)
      if (this.layers[previousDepth].length === 0) {
        delete this.layers[previousDepth]
      }
    }

    this.layers[depth] = this.layers[depth] || []
    this.layers[depth].push(thing)
  }
}
