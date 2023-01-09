import { getScene, getThing, globals } from './core/game.js'
import Thing from './core/thing.js'
import * as gfx from './core/webgl.js'
import * as mat from './core/matrices.js'
import * as u from './core/utils.js'
import * as vec2 from './core/vector2.js'
import * as vec3 from './core/vector3.js'
import * as proc from './procgeneral.js'
import * as themes from './data/themes.js'
import assets from './assets.js'
import SpatialHash from './core/spatialhash.js'
import Player from './player.js'
import Person from './person.js'
import * as levelData from './data/levels.js'

export default class Terrain extends Thing {
  seaLevel = -256
  heightMap = [-256]
  spatialHash = new SpatialHash()
  texturedMeshes = {}
  texturedVerts = {}
  time = 0
  map = {}
  types = {}
  startPoint = [0, 0]
  startAngle = 0
  endPoint = [0, 0]
  powerup = 0

  constructor (data) {
    super(data)
    this.position[2] = 0
    this.setName('terrain')

    for (let i = 1; i <= 128; i++) {
      this.heightMap[i] = (i - 1) * 32
    }
    this.heightMap[0] = this.seaLevel
    this.heightMap.undefined = this.seaLevel

    // if the scene hasn't changed, load the terrain from cache
    // because generating terrain takes a second
    /*
    if (cache.name === getScene().name) {
      for (const field in cache.object) {
        this[field] = cache.object[field]
      }
      this.time = 0
      return
    }
    cache.name = getScene().name
    cache.object = this
    */

    this.generate()
    this.createMesh()
    this.populate()
  }

  createMesh () {
    /********************************************************************************
       list all the tile positions in the map
     ********************************************************************************/

    const grid = 64
    const tileSet = new Set()
    for (const tile of Object.keys(this.map)) {
      const [x, y] = tile.split(',').map(Number)
      tileSet.add([x, y])
      tileSet.add([x + 1, y])
      tileSet.add([x - 1, y])
      tileSet.add([x, y + 1])
      tileSet.add([x, y - 1])
      tileSet.add([x + 1, y + 1])
      tileSet.add([x - 1, y + 1])
      tileSet.add([x + 1, y - 1])
      tileSet.add([x - 1, y - 1])
    }
    const tiles = [...tileSet.values()]

    /********************************************************************************
       geometry functions
     ********************************************************************************/

    const offset = (x, y, z = 0) => {
      // const f = 0.3
      // x += u.octaveNoise(f*x+102, f*y+102)*32
      // y += u.octaveNoise(f*x, f*y)*32
      return [x, y, z]
    }

    const textureScale = 1 / 256
    const meshMap = {}

    const addWall = (p1, p2, v, height, { texture = 'stone', flair } = {}) => {
      p1 = offset(...p1)
      p2 = offset(...p2)
      const normal = vec2.normalize([p2[1] - p1[1], -1 * (p2[0] - p1[0])])

      const addTriangle = (p1, p2, p3, texture, { xWrap = true, yWrap = true, solid = true, norm = [...normal, 0] } = {}) => {
        const points = [p1, p2, p3]
        const zMin = points.reduce((prev, now) => Math.min(prev, now[2]), Infinity)
        const zMax = points.reduce((prev, now) => Math.max(prev, now[2]), 0 - Infinity)
        const utils = u

        for (const [x, y, z] of points) {
          let u, v

          if (Math.abs(normal[1]) <= 0.05) {
            u = -1 * y * textureScale
            v = -1 * z * textureScale
          } else {
            u = -1 * x * textureScale / normal[1]
            v = -1 * z * textureScale
          }

          if (!yWrap) {
            v = utils.map(z, zMin, zMax, 1, 0)
          }

          if (!this.texturedVerts[texture]) {
            this.texturedVerts[texture] = []
          }
          this.texturedVerts[texture].push(
            x, y, z,
            u, v,
            ...norm
          )
        }

        if (solid) this.addToSpatialHash(p1, p2, p3, { material: texture })
      }

      // solid wall
      addTriangle(
        [p1[0], p1[1], height],
        [p2[0], p2[1], height],
        [p1[0], p1[1], v],
        texture
      )
      addTriangle(
        [p2[0], p2[1], v],
        [p1[0], p1[1], v],
        [p2[0], p2[1], height],
        texture
      )

      // this is mainly for grass on top of walls
      if (flair) {
        addTriangle(
          [p1[0], p1[1], height],
          [p2[0], p2[1], height],
          [p1[0], p1[1], height + 256],
          flair,
          { solid: false, yWrap: false, norm: [0, 0, 1] }
        )
        addTriangle(
          [p2[0], p2[1], height + 256],
          [p1[0], p1[1], height + 256],
          [p2[0], p2[1], height],
          flair,
          { solid: false, yWrap: false, norm: [0, 0, 1] }
        )
      }
    }

    const add3DFloorTri = (p1, p2, p3, texture) => {
      if (vec3.getNormalOf(p1, p2, p3)[2] < 0) {
        [p1, p2] = [p2, p1]
      }
      this.addToSpatialHash(p1, p2, p3, { material: texture })

      const addVert = (x, y, z) => {
        const u = x * textureScale
        const v = y * textureScale
        if (!this.texturedVerts[texture]) {
          this.texturedVerts[texture] = []
        }
        this.texturedVerts[texture].push(x, y, z, u, v, 0, 0, 1)
      }

      addVert(...p1)
      addVert(...p2)
      addVert(...p3)
    }

    const addFloorTri = (p1, p2, p3, height, texture) => {
      p1 = offset(...p1, height)
      p2 = offset(...p2, height)
      p3 = offset(...p3, height)
      add3DFloorTri(p1, p2, p3, texture)
    }

    /********************************************************************************
       parse tiles into terrain
     ********************************************************************************/

    const meshed = {}
    const greedyMesh = (x, y) => {
      const xMin = x; const yMin = y
      const tile = this.getTileAt(x, y)
      const tileType = this.getTileAt(x, y, 'TileType')
      while (
        this.getTileAt(x, y) === tile &&
        this.getTileAt(x, y, 'TileType') === tileType
      ) {
        meshed[[x, y]] = true
        y += 1
      }
      const yMax = y

      let stop = false
      while (!stop) {
        for (let y = yMin; y <= yMax; y++) {
          if (
            this.getTileAt(x, y) !== tile ||
            this.getTileAt(x, y, 'TileType') !== tileType
          ) {
            stop = true
            break
          }
          meshed[[x, y]] = true
        }
        x += 1
      }
      const xMax = x

      return [xMin, yMin, xMax, yMax]
    }

    const getTheme = () => {
      return "city1"
    }

    const getTexture = (tileType, textureType) => {
      // Theme data
      let themeData = themes.data[getTheme()].tiles
      if (!themeData) {
        return 'stone'
      }

      // Tile type
      let typeData = themeData[tileType]
      if (!typeData) {
        typeData = themeData["default"]
      }

      // Texture type
      let texture = typeData[textureType]
      if (!texture) {
        typeData = themeData["default"]
        texture = typeData[textureType]
      }
      if (!texture) {
        return 'stone'
      }

      // Return
      return texture
    }

    const getShouldRound = (tileType) => {
      // Theme data
      let themeData = themes.data[getTheme()].tiles
      if (!themeData) {
        return true
      }

      // Tile type
      let typeData = themeData[tileType]
      if (!typeData) {
        typeData = themeData["default"]
      }

      // Texture type
      let noCarve = typeData["noCarve"]
      if (noCarve === null) {
        typeData = themeData["default"]
        noCarve = typeData["noCarve"]
      }
      if (noCarve === null) {
        return 'true'
      }

      // Return
      return !noCarve
    }

    const getShouldSlope = (tileType) => {
      return false
    }

    const cos = what => Math.round(Math.cos(what))
    const sin = what => Math.round(Math.sin(what))
    const pi = Math.PI
    const tau = Math.PI * 2
    for (let [x, y] of tiles) {
      const tile = this.getTileAt(x, y)
      if (!tile) continue
      const height = this.heightMap[tile]

      if (!meshed[[x, y]]) {
        const greedy = greedyMesh(x, y).map(v => v * grid)
        addFloorTri(
          [greedy[0], greedy[1]],
          [greedy[2], greedy[1]],
          [greedy[0], greedy[3]],
          height,
          getTexture(this.getTileAt(x, y, 'TileType'), "floor")
        )
        addFloorTri(
          [greedy[2], greedy[3]],
          [greedy[2], greedy[1]],
          [greedy[0], greedy[3]],
          height,
          getTexture(this.getTileAt(x, y, 'TileType'), "floor")
        )
      }

      x *= grid
      y *= grid

      const cx = x + grid / 2
      const cy = y + grid / 2
      const center = [cx, cy]

      const heightAt = (x, y) => this.heightMap[this.getTileAtWorld(x, y)]

      // deal with sloped floors
      if (getShouldSlope(this.getTileAtWorld(x, y, 'TileType'))) {
        const slopeDistance = height === 0 ? grid * 10 : grid * 1.5

        for (let i = 0; i < tau; i += tau / 4) {
          const normal = [cos(i), sin(i)]
          const coord = [cx + normal[0] * 64, cy + normal[1] * 64]
          const otherHeight = heightAt(...coord)
          if (otherHeight >= height) continue
          const turn = [cos(i + pi / 2), sin(i + pi / 2)]

          add3DFloorTri(
            [
              center[0] + normal[0] * grid / 2 + turn[0] * grid / 2,
              center[1] + normal[1] * grid / 2 + turn[1] * grid / 2,
              height
            ],

            [
              center[0] + normal[0] * grid / 2 - turn[0] * grid / 2,
              center[1] + normal[1] * grid / 2 - turn[1] * grid / 2,
              height
            ],

            [
              center[0] + normal[0] * slopeDistance + turn[0] * grid / 2,
              center[1] + normal[1] * slopeDistance + turn[1] * grid / 2,
              otherHeight
            ],

            getTexture(this.getTileAtWorld(x, y, 'TileType'), "floor")
          )

          add3DFloorTri(
            [
              center[0] + normal[0] * grid / 2 - turn[0] * grid / 2,
              center[1] + normal[1] * grid / 2 - turn[1] * grid / 2,
              height
            ],

            [
              center[0] + normal[0] * slopeDistance - turn[0] * grid / 2,
              center[1] + normal[1] * slopeDistance - turn[1] * grid / 2,
              otherHeight
            ],

            [
              center[0] + normal[0] * slopeDistance + turn[0] * grid / 2,
              center[1] + normal[1] * slopeDistance + turn[1] * grid / 2,
              otherHeight
            ],

            getTexture(this.getTileAtWorld(x, y, 'TileType'), "floor")
          )
        }

        // deal with corners
        for (let i = 0; i < tau; i += tau / 4) {
          const normal = [cos(i), sin(i)]
          const turn = [cos(i + pi / 2), sin(i + pi / 2)]
          const coord = [cx + normal[0] * 64 + turn[0] * 64, cy + normal[1] * 64 + turn[1] * 64]
          const otherHeight = heightAt(...coord)
          if (otherHeight >= height) continue

          add3DFloorTri(
            [
              center[0] + normal[0] * grid / 2 + turn[0] * grid / 2,
              center[1] + normal[1] * grid / 2 + turn[1] * grid / 2,
              height
            ],

            [
              center[0] + normal[0] * grid / 2 + turn[0] * slopeDistance,
              center[1] + normal[1] * grid / 2 + turn[1] * slopeDistance,
              otherHeight
            ],

            [
              center[0] + normal[0] * slopeDistance + turn[0] * grid / 2,
              center[1] + normal[1] * slopeDistance + turn[1] * grid / 2,
              otherHeight
            ],

            getTexture(this.getTileAtWorld(x, y, 'TileType'), "floor")
          )
        }

        continue
      }

      for (let i = 0; i < tau; i += tau / 4) {
        const normal = [cos(i), sin(i)]
        const coord = [cx + normal[0] * 64, cy + normal[1] * 64]
        if (heightAt(...coord) >= height) continue
        const turn = [cos(i + pi / 2), sin(i + pi / 2)]

        // diagonals
        if (getShouldRound(this.getTileAtWorld(x, y, 'TileType'))) {
          if (!meshMap[[coord]]) {
            const n1 = [
              coord[0] + turn[0] * 64,
              coord[1] + turn[1] * 64
            ]

            if (heightAt(...n1) === height) {
              const powerIndex = Math.round(i * 4 / tau)
              meshMap[coord] = meshMap[coord] | 2 ** powerIndex
              meshMap[coord] = meshMap[coord] | 2 ** ((powerIndex + 1) % 4)
              meshMap[coord] = meshMap[coord] | 2 ** ((powerIndex + 2) % 4)
              meshMap[coord] = meshMap[coord] | 2 ** ((powerIndex + 3) % 4)
              meshMap[coord] = meshMap[coord] | 2 ** ((powerIndex + 4) % 4)

              addWall(
                [
                  center[0] + normal[0] * grid * 3 / 2 + turn[0] * grid / 2,
                  center[1] + normal[1] * grid * 3 / 2 + turn[1] * grid / 2
                ],
                [
                  center[0] + normal[0] * grid / 2 + turn[0] * grid / -2,
                  center[1] + normal[1] * grid / 2 + turn[1] * grid / -2
                ],
                -256,
                height,
                {
                  texture: getTexture(this.getTileAtWorld(x, y, 'TileType'), "wall")
                }
              )

              addFloorTri(
                [
                  center[0] + normal[0] * grid * 3 / 2 + turn[0] * grid / 2,
                  center[1] + normal[1] * grid * 3 / 2 + turn[1] * grid / 2
                ],
                [
                  center[0] + normal[0] * grid / 2 + turn[0] * grid / 2,
                  center[1] + normal[1] * grid / 2 + turn[1] * grid / 2
                ],
                [
                  center[0] + normal[0] * grid / 2 + turn[0] * grid / -2,
                  center[1] + normal[1] * grid / 2 + turn[1] * grid / -2
                ],
                height,
                getTexture(this.getTileAtWorld(x, y, 'TileType'), "floor")
              )
            }
          }
        }
      }

      for (let i = 0; i < tau; i += tau / 4) {
        const normal = [cos(i), sin(i)]
        const coord = [cx + normal[0] * 64, cy + normal[1] * 64]
        if (heightAt(...coord) >= height) continue
        const turn = [cos(i + pi / 2), sin(i + pi / 2)]
        // if (meshMap[coord] & 2**Math.round(i*4/tau)) continue
        addWall(
          [
            center[0] + normal[0] * grid / 2 + turn[0] * grid / 2,
            center[1] + normal[1] * grid / 2 + turn[1] * grid / 2
          ],
          [
            center[0] + normal[0] * grid / 2 + turn[0] * grid / -2,
            center[1] + normal[1] * grid / 2 + turn[1] * grid / -2
          ],
          -256,
          height,
          {
            texture: getTexture(this.getTileAtWorld(x, y, 'TileType'), "wall")
          }
        )
      }
    }

    for (const texture in this.texturedVerts) {
      this.texturedMeshes[texture] = gfx.createMesh(this.texturedVerts[texture])
    }
  }

  update () {
    this.time += 1
  }

  draw (_ctx) {
    gfx.setShader(assets.shaders.defaultShaded)
    gfx.set('modelMatrix', mat.getIdentity())
    getScene().camera3D.setUniforms()
    gfx.set('color', [1, 1, 1, 1])
    // const {gl} = gfx
    // gl.enable(gl.CULL_FACE)
    // gl.cullFace(gl.FRONT)

    /*
    gfx.setTexture(assets.textures.grass)
    gfx.drawMesh(this.floors)

    gfx.setTexture(assets.textures.stone)
    gfx.drawMesh(this.walls)
    */

    const { gl } = gfx
    gl.enable(gl.CULL_FACE)
    gl.cullFace(gl.FRONT)
    for (const texture in this.texturedMeshes) {
      gfx.setTexture(assets.textures[texture])
      gfx.drawMesh(this.texturedMeshes[texture])
    }
    gl.disable(gl.CULL_FACE)

    // draw skybox without writing to depth buffer
    gfx.gl.depthMask(false)
    gfx.setShader(assets.shaders.default)
    getScene().camera3D.setUniforms()
    gfx.set('color', [1, 1, 1, 1])
    let skybox = assets.textures.skybox1
    gfx.setTexture(skybox)
    gfx.set('modelMatrix', mat.getTransformation({
      translation: [
        getScene().camera3D.position[0],
        getScene().camera3D.position[1],
        getScene().camera3D.position[2] - 400
      ],
      scale: 10000
    }))
    gfx.drawMesh(assets.models.sphere)
    gfx.gl.depthMask(true)

    // draw a few layers of increasingly
    // opaque blue quads under the water surface
    /*
    gfx.setTexture(assets.textures.square)
    gfx.set("color", u.stringToColor("#5B6EE188"))
    for (let i=0; i<3; i++) {
      gfx.set("modelMatrix", mat.getTransformation({
        translation: [
          getScene().camera3D.position[0],
          getScene().camera3D.position[1],
          u.map(i, 0, 3, -256, -64) + 48
        ],
        scale: 10000,
      }))
      gfx.drawQuad(
       -1, -1, 0,
        1, -1, 0,
       -1, 1, 0,
        1, 1, 0,
      )
    }
    */

    // draw ocean surface

    gfx.setShader(assets.shaders.scrolling)
    getScene().camera3D.setUniforms()
    gfx.setTexture(assets.textures.water)
    gfx.set("color", [1,1,1,1])
    gfx.set("scale", 0.001)
    gfx.set("offset", [this.time/1000, 0])
    gfx.set("cutoff", 0)
    gfx.set("modelMatrix", mat.getTransformation({
      translation: [
        getScene().camera3D.position[0],
        getScene().camera3D.position[1],
        -16
      ],
      scale: 100000,
    }))
    gfx.drawQuad(
      -1, -1, 0,
      1, -1, 0,
      -1, 1, 0,
      1, 1, 0,
    )

    // draw clouds
    /*
    gfx.setShader(assets.shaders.clouds)
    getScene().camera3D.setUniforms()
    gfx.setTexture(assets.textures.perlin)
    gfx.set("color", [1,1,1,1])
    gfx.set("scale", 0.00001)
    gfx.set("offset", [this.time/100000, 0])
    gfx.set("cutoff", 0.65)
    gfx.set("modelMatrix", mat.getTransformation({
      translation: [
        getScene().camera3D.position[0],
        getScene().camera3D.position[1],
        4096
      ],
      scale: 100000,
    }))
    gfx.drawQuad(
      -1, -1, 0,
      1, -1, 0,
      -1, 1, 0,
      1, 1, 0,
    )
    */
  }

  addToSpatialHash (p1, p2, p3, { material } = {}) {
    const x = [p1, p2, p3].reduce((prev, now) => Math.min(prev, now[0]), Infinity)
    const y = [p1, p2, p3].reduce((prev, now) => Math.min(prev, now[1]), Infinity)
    const w = [p1, p2, p3].reduce((prev, now) => Math.max(prev, now[0] - x), 1)
    const h = [p1, p2, p3].reduce((prev, now) => Math.max(prev, now[1] - y), 1)

    for (const point of [p1, p2, p3]) {
      if (point[2] === undefined) {
        point[2] = this.seaLevel
      }
    }

    let normal = vec3.getNormalOf(p1, p2, p3)
    if (normal[2] > 0.99) {
      normal = [0, 0, 1]
    }

    const midpoint = vec3.multiply(vec3.add(vec3.add(p1, p2), p3), 1 / 3)

    const tri = {
      points: [p1, p2, p3],
      midpoint,
      normal,
      material
    }

    this.spatialHash.add(tri, x, y, w, h)

    return tri
  }

  getGroundHeight (x, y, z = Infinity) {
    return this.spatialHash.query(x - 16, y - 16, 32, 32).reduce((prev, now) => {
      if (now.points[0][2] > z) return prev

      if (vec3.isInsideTriangle(...now.points, [0, 0, 1], [x, y, 0])) {
        return Math.max(prev, now.points[0][2])
      }

      return prev
    }, -256)
  }

  query (x, y, w, h) {
    return this.spatialHash.query(x, y, w, h)
  }

  getTileAt (x, y, what) {
    if (what === 'TileType') {
      return this.types[[x, y]]
    }
    return this.map[[x, y]]
  }

  getTileAtWorld (x, y, what) {
    return this.getTileAt(Math.floor(x / 64), Math.floor(y / 64), what)
  }

  generate () {

    if (!globals.level) {
      globals.level = 1
    }

    // Generate the world
    let generated = proc.generateEverything(globals.level)
    globals.generated = generated




    // Set entity data
    this.startPoint = generated.startPoint
    this.endPoint = generated.endPoint
    this.startAngle = generated.startAngle
    this.presetClocks = generated.presetClocks

    // Write terrain data to map

    this.map = generated.terrain
    this.types = generated.types

    this.locations = {
      sidewalk: [],
    }
    for (const coord in this.map) {
      if (this.map[coord] < 30 && this.map[coord] >= 1) {
        const [x, y] = coord.split(',').map(Number)
        if (u.distance2d(x, y, this.startPoint[0], this.startPoint[1]) > 8) {
          if (this.types[coord] === "sidewalk") {
            this.locations.sidewalk.push([x, y])
            continue
          }
        }
      }
    }
  }

  randomizeNpc (index) {
    const lvl = globals.level - 1

    // For the first few npcs, use the preset npcs from the level file
    let presetNpcs = levelData.data[lvl].preset_npcs
    if (index < presetNpcs.length) {
      // console.log(presetNpcs[index])
      return presetNpcs[index]
    }

    // The rest are randomly generated from the level file
    let qualities = []
    for (let qualityEntry of levelData.data[lvl].quality_chances) {
      if (Math.random() < qualityEntry.chance) {
        qualities.push(qualityEntry.quality)
      }
    }
    // console.log(qualities)
    return qualities
  }

  populate () {
    // add the player to the scene if we're not in the title screen
    if (!getThing('title')) {
      getScene().addThing(new Player(
        [this.startPoint[0] * 64 - 32, this.startPoint[1] * 64 - 32, 10000],
        this.startAngle
      ))
    }

    // Locations
    const getLocations = (...types) => {
      const result = []
      for (const t of types) {
        result.push(...this.locations[t])
      }
      return u.shuffle(result)
    }

    const personLocations = getLocations("sidewalk")
    if (!globals.level) {
      globals.level = 1
    }
    const npcCount = levelData.data[globals.level - 1].npc_count
    for (let i = 0; i < npcCount; i++) {
      const coord = personLocations.pop()
      if (coord) {
        let qualities = this.randomizeNpc(i)
        getScene().addThing(new Person([coord[0] * 64 + 32, coord[1] * 64 + 32, 0], qualities))
      }
    }
  }
}
