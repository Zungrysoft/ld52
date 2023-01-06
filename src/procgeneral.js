import { add, lerp, distance } from './core/vector2.js'
import * as utils from './core/utils.js'
import * as cave from './proccaves.js'
import * as room from './procroom.js'
import * as palace from './procpalace.js'
import * as parameters from './data/parameters.js'
import { PriorityQueue } from './core/pqueue.js'

const PLAYER_JUMP_HEIGHT = 4
const ABSOLUTE_HEIGHT_DIFFERENCE_MAX = 10
const RANDOM_POINT_ITERATIONS = 50
const WORLD_HEIGHT = 40
const CARVE_PROXIMITY_WEIGHT = 30
const BELL_CURVE_SAMPLES = 8
const PATH_LOOK = 5
const JUMP_WEIGHT_2 = 3
const JUMP_WEIGHT_3 = 7
const JUMP_WEIGHT_4 = 11

export class GeneratorParams {
  // General
  random = () => { return 4 }

  constructor (seed) {
    // Set up randomizer
    if (typeof seed !== 'number') {
      seed = Math.floor(Math.random() * 100000)
    }
    this.seed = seed
    this.resetRandom(0)

    console.log('Random Seed: ' + seed)

    this.initParameters()
  }

  resetRandom (offset) {
    this.random = utils.randomizer(this.seed + offset)
  }

  initParameters () {
    // Randomize each parameter
    for (const key in parameters.data) {
      this.randomizeParameter(key)
    }

    this.setParametersForLevel(1)
  }

  randomizeParameter (key) {
    const param = parameters.data[key]

    // Set the parameter's base
    if (param.randomMode === 'bell') {
      this[key + '_BASE'] = this.bellRandom(param.bellCenter, param.bellRadius)
    } else if (param.randomMode === 'linear') {
      this[key + '_BASE'] = (this.random() * (param.linearMax - param.linearMin)) + param.linearMin
    } else if (param.randomMode === 'constant') {
      this[key + '_BASE'] = param.value
    } else {
      console.error('Error initializing param [' + key + ']. Invalid randomMode [' + param.randomMode + ']')
    }
  }

  setParameterForLevel (key, level) {
    const param = parameters.data[key]

    // Protect against null
    if (!level) {
      level = 1
    }
    let aa = param.advanceAmount
    if (!aa) {
      aa = 0
    }

    this[key + '_ADVANCED'] = this[key + '_BASE'] + (level * aa)
  }

  setParametersForLevel (level, offset) {
    if (!level) {
      level = 1
    }

    // Reset the random seed
    this.resetRandom(level + ((offset || 0) * 93))

    // Go through params
    for (const key in parameters.data) {
      const param = parameters.data[key]

      // Set the parameter based on the level
      this.setParameterForLevel(key, level)

      // Maybe reroll the parameter's base value
      if (param.rerollChance && this.random() < param.rerollChance) {
        this.randomizeParameter(key)
      }
    }

    // Final processing on params
    this.finalizeParameters()

    // Other special logic for the parameters

    // Level-based advancements
    if (level === 5) {
      this.caveMode = 13
      this.palaceIndoors = false
      this.palaceLength = 80
      this.palaceMaxJumpDistance = 2
    } else if (level === 10) {
      this.caveMode = 13
      this.palaceIndoors = false
      this.palaceLength = 90
      this.palaceMaxJumpDistance = 3
    } else if (level === 15) {
      this.caveMode = 15
      this.palaceIndoors = false
      this.palaceLength = 110
      this.palaceMaxJumpDistance = 3
    } else if (level > 0 && level <= 2) {
      // Type Island
      this.caveMode = 0
    } else if (level > 2 && level <= 7) {
      // Types Island and Cave
      this.caveMode = Math.floor(this.random() * 2)
    } else if (level > 7 && level <= 12) {
      // Types Island, Cave, and Void
      this.caveMode = Math.floor(this.random() * 3)
    } else {
      // Types Cave and Void
      this.caveMode = Math.floor(this.random() * 2) + 1
    }
  }

  finalizeParameters () {
    // Final steps done on each parameter
    for (const key in parameters.data) {
      const param = parameters.data[key]
      let v = this[key + '_ADVANCED']

      // Round the value to an integer
      if (param.round) {
        v = Math.round(v)
      }

      // Bind it to minimum and maximum
      if (param.max) {
        v = Math.min(v, param.max)
      }
      if (param.min) {
        v = Math.max(v, param.min)
      }

      // Set the final value
      this[key] = v
    }
  }

  bellRandom (center, radius) {
    let total = 0
    for (let i = 0; i < BELL_CURVE_SAMPLES; i++) {
      total += this.random()
    }
    let bell = ((total / BELL_CURVE_SAMPLES) * 2) - 1
    bell *= radius
    bell += center

    return bell
  }
}

export class GeneratorResult {
  // General
  terrain = {}
  types = {}
  startPoint = [0, 0]
  startAngle = 0
  endPoint = [0, 0]
  presetClocks = []
}

// Pass in a position in either string format or list format and it will convert it to list format
export function stringToPosition (p) {
  let ret = p
  if (typeof p === 'string') {
    const coords = ret.split(',')
    const px = parseInt(coords[0])
    const py = parseInt(coords[1])
    ret = [px, py]
  }
  return ret
}

export function mergeTerrain (terrain, merge, position) {
  const p = stringToPosition(position)

  for (const key in merge) {
    const value = merge[key]
    const coords = key.split(',')
    const x = parseInt(coords[0])
    const y = parseInt(coords[1])
    terrain[[x + p[0], y + position[1]]] = value
  }
}

export function adjustTerrain (terrain, amt) {
  for (const key in terrain) {
    terrain[key] = terrain[key] + amt
  }
} 

export function guaranteePath (terrain, startPoint, endPoint, params) {
  // Create the list of accessible points from start
  const startAccessibleMap = getDistances(terrain, startPoint)

  // Exit out if end point is already accessible from end
  if (endPoint in startAccessibleMap) {
    return false
  }

  // Create a list of accessible points from end
  const startAccessible = Object.keys(startAccessibleMap)
  const endAccessible = Object.keys(getDistances(terrain, endPoint, true))

  // Find a random point from startAccessible and from endAccessible who are somewhat close
  let closestDist = 1000000
  let closestPoint1 = [0, 0]
  let closestPoint2 = [0, 0]
  for (let i = 0; i < RANDOM_POINT_ITERATIONS; i++) {
    // Pick a random point from each set
    const startInd = Math.floor(params.random() * startAccessible.length)
    const pos1 = stringToPosition(startAccessible[startInd])
    const endInd = Math.floor(params.random() * endAccessible.length)
    const pos2 = stringToPosition(endAccessible[endInd])

    // Check their dist
    let dist = distance(pos1, pos2)

    // Weight against putting the path too close to the start or end point
    if (distance(pos1, startPoint) < CARVE_PROXIMITY_WEIGHT) {
      dist += CARVE_PROXIMITY_WEIGHT - distance(pos1, startPoint)
    }
    if (distance(pos2, endPoint) < CARVE_PROXIMITY_WEIGHT) {
      dist += CARVE_PROXIMITY_WEIGHT - distance(pos2, endPoint)
    }

    // Weigh against the points being too close together (and creating a staircase too steep to climb)
    if (dist < Math.abs(terrain[pos1] - terrain[pos2]) * 2) {
      dist += 30
    }

    if (dist < closestDist) {
      closestPoint1 = pos1
      closestPoint2 = pos2
      closestDist = dist
    }
  }

  // Carve linear hallway between the two points
  carveHallway(terrain, closestPoint1, closestPoint2)

  // Return true, indicating that we did create a path
  return true
}

export function carveHallway (terrain, pos1, pos2) {
  pos1 = stringToPosition(pos1)
  pos2 = stringToPosition(pos2)

  const dist = distance(pos1, pos2)
  if (dist <= 1) {
    return
  }

  const height1 = terrain[pos1]
  const height2 = terrain[pos2]

  // Iterate over hallway
  for (let i = -1; i <= dist + 1; i += 1) {
    const frac = i / dist
    const newPos = lerp(pos1, pos2, frac)
    newPos[0] = Math.round(newPos[0])
    newPos[1] = Math.round(newPos[1])
    const newHeight = Math.floor(((1 - frac) * height1) + (frac * height2))

    terrain[newPos] = newHeight
    cave.carvePoint(terrain, newPos)
  }
}

export function getDistances (terrain, startPoint, invert) {
  const deltas = [[0, 1], [1, 0], [0, -1], [-1, 0]]
  startPoint = stringToPosition(startPoint)

  // Set up the priority queue
  const queue = new PriorityQueue((a, b) => a.dist < b.dist)
  const firstEntry = {
    pos: startPoint,
    prev: startPoint,
    dist: 0
  }
  queue.push(firstEntry)

  // Results go here
  const distances = {}

  // Run search algorithm to find shortest path to the flag
  while (!queue.isEmpty()) {
    const cur = queue.pop()

    // If we've already visited this node, don't visit it again. This can happen if we
    // find multiple paths to a space, since we leave the old copy in the pqueue
    if (cur.pos in distances) {
      continue
    }

    // Put node data into result
    distances[cur.pos] = {
      prev: cur.prev,
      dist: cur.dist
    }

    // Look through the four adjacent spaces
    for (const delta of deltas) {
      // Get the adjacent space
      const adj = add(cur.pos, delta)

      // Make sure this space hasn't already been visited
      if (!(adj in distances)) {
        // Check if the height difference of the adjacent space is at most jump height
        let heightDifference = (terrain[adj] - terrain[cur.pos])

        // Invert is used to search backwards from the endpoint
        if (invert) {
          heightDifference *= -1
        }

        const absoluteHeightDifference = Math.abs(terrain[cur.pos] - terrain[adj])
        if (heightDifference <= PLAYER_JUMP_HEIGHT && absoluteHeightDifference <= ABSOLUTE_HEIGHT_DIFFERENCE_MAX) {
          // Make sure we're not navigating past world height
          if (!isExtreme(terrain[adj])) {
            // Determine the weight based on the height differences between the two spaces
            let weight = 1
            if (heightDifference === 2) { weight = JUMP_WEIGHT_2 }
            if (heightDifference === 3) { weight = JUMP_WEIGHT_3 }
            if (heightDifference === 4) { weight = JUMP_WEIGHT_4 }
            if (heightDifference < -3) {
              weight = Math.floor(Math.abs(heightDifference / 3))
            }

            // Push to the priority queue
            queue.push({
              pos: adj,
              prev: cur.pos,
              dist: cur.dist + weight
            })
          }
        }
      }
    }
  }

  return distances
}

export function findPath (distances, endPoint) {
  endPoint = stringToPosition(endPoint)

  // No path to this point
  if (!(endPoint in distances)) {
    // debug
    const ret = []

    for (const reached in distances) {
      ret.push(stringToPosition(reached))
    }

    return ret
  }

  // Retrace the path
  let retrace = endPoint
  const path = [endPoint]
  while (distances[retrace].dist > 0) {
    retrace = distances[retrace].prev
    path.push(retrace)
  }
  return path
}

export function shortenPath (path, length) {
  // If the path is too long, shorten it
  if (path.length > length) {
    path = path.slice(path.length - length - 1, path.length)

    console.log('Path length: ' + length)
  } else {
    console.log('Path length: ' + path.length)
  }
  return path
}

export function paintPath (types, path, params) {
  const deltas = [[0, 0], [0, 1], [1, 0], [0, -1], [-1, 0], [1, 1], [-1, 1], [1, -1], [-1, -1]]

  for (const space of path) {
    for (const delta of deltas) {
      if (params.random() < 0.5) {
        const newSpace = add(delta, space)
        // Make sure we don't paint over other painted tiles
        if (!(newSpace in types) || types[newSpace] === 0) {
          types[newSpace] = "path"
        }
      }
    }
  }
}

function buildAlongPath (terrain, types, path, params) {
  if (path.length < 2) {
    return
  }

  // Determine build locations
  const build1 = path[Math.floor(path.length * params.room1Position)]
  const build2 = path[Math.floor(path.length * params.room2Position)]

  // Build the rooms
  room.insertRoom(terrain, types, build1, {
    ...params,
    height: terrain[build1]
  })
  room.insertRoom(terrain, types, build2, {
    ...params,
    height: terrain[build2]
  })

  // Build doorways

  for (let i = 0; i < path.length; i++) {
    const pos = path[i]
    // If wall...
    if (types[pos] === "wall") {
      // Carve doorway
      makeDoorway(terrain, types, pos)
    }
  }
}

export function isExtreme (height) {
  if (!height) {
    return true
  }
  if (height >= WORLD_HEIGHT) {
    return true
  }
  if (height <= 0) {
    return true
  }
  return false
}

function makeDoorway (terrain, types, pos) {
  const deltas = [[0, 0], [0, 1], [1, 0], [0, -1], [-1, 0], [1, 1], [-1, 1], [1, -1], [-1, -1]]

  // Find average ground height
  let total = 0
  let count = 0
  for (const delta of deltas) {
    const newPos = add(pos, delta)
    if (types[newPos] !== "wall" && !isExtreme(terrain[newPos])) {
      count += 1
      total += terrain[newPos]
    }
  }
  const average = Math.floor(total / count)

  // Carve doorway
  for (const delta of deltas) {
    const newPos = add(pos, delta)
    terrain[newPos] = average
  }
}

export function validateTerrain (terrain, title) {
  const ret = []
  for (const tile in terrain) {
    if ((!terrain[tile] && !(terrain[tile] === 0)) || (terrain[tile] !== Math.floor(terrain[tile])) || (terrain[tile] < 0)) {
      ret.push({
        p: tile,
        v: terrain[tile]
      })
    }
  }
  if (ret.length > 0) {
    console.log('Invalid tiles ' + title + ':')
    console.log(ret)
  }
}

export function smoothTile (terrain, pos) {
  const deltas = [[0, 0], [0, 1], [1, 0], [0, -1], [-1, 0], [1, 1], [-1, 1], [1, -1], [-1, -1]]

  let total = 0
  let count = 0
  for (const delta of deltas) {
    const newPos = add(pos, delta)

    // Make sure the tile we're checking isn't too much of a height difference
    if (!isExtreme(terrain[newPos])) {
      const heightDifference = Math.abs(terrain[newPos] - terrain[pos])
      if (heightDifference <= 9) {
        // Count this for the average
        total += terrain[newPos]
        count++
      }
    }
  }

  // Average it out
  if (count > 0) {
    terrain[pos] = Math.floor(total / count)
  }
}

export function smoothArea (terrain, pos) {
  const deltas = [[0, 0], [0, 1], [1, 0], [0, -1], [-1, 0], [1, 1], [-1, 1], [1, -1], [-1, -1]]

  // Iterate over the surrounding tiles
  for (const delta of deltas) {
    const newPos = add(pos, delta)

    // Smooth it
    smoothTile(terrain, newPos)
  }
}

export function smoothPath (terrain, path, params) {
  for (let i = 0; i < path.length - 2; i++) {
    const p0 = stringToPosition(path[i])
    const p1 = stringToPosition(path[i + 2])

    // See if there is a big height difference in the path
    const heightDifference = Math.abs(terrain[p0] - terrain[p1])
    if (heightDifference > params.pathSmoothingLedgeMax) {
      smoothArea(terrain, p1)
    }
  }
}

export function generateEverything (params) {
  // Bonus levels
  if (params.caveMode === 13) {
    // Generate the terrain
    const res = cave.generateCaves(params)
    const res2 = palace.generatePalace(params)

    // Offset
    const pt = [-15, -35]

    // Merge the generator data together
    const final = new GeneratorResult()

    mergeTerrain(final.terrain, res.terrain, pt)
    mergeTerrain(final.types, res.types, pt)

    mergeTerrain(final.terrain, res2.terrain, [0, 0])
    mergeTerrain(final.types, res2.types, [0, 0])

    final.startAngle = res2.startAngle
    final.startPoint = res2.startPoint
    final.endPoint = res2.endPoint
    final.presetClocks = res2.presetClocks

    // Return result
    return final
  }

  // Generate caves
  const gen = cave.generateCaves(params)

  // Make sure it is possible to complete the level
  guaranteePath(gen.terrain, gen.startPoint, gen.endPoint, params)

  // Create the path
  let distances = getDistances(gen.terrain, gen.startPoint)
  let path = findPath(distances, gen.endPoint)
  path = shortenPath(path, params.pathLength)
  gen.endPoint = path[0]
  cave.carvePoint(gen.terrain, gen.endPoint)

  // Paint the path and put buildings on it
  buildAlongPath(gen.terrain, gen.types, path, params)

  // Set the player's starting rotation so that they look towards the path
  if (path.length > PATH_LOOK + 2) {
    const point1 = path[path.length - 1]
    const point2 = path[path.length - PATH_LOOK]

    const angle = utils.angleTowards(point2[0], point2[1], point1[0], point1[1])
    gen.startAngle = angle
  }

  // Do another guarantee pass
  if (guaranteePath(gen.terrain, gen.startPoint, gen.endPoint, params)) {
    // If we had to carve another path, mark this as the one true path
    distances = getDistances(gen.terrain, gen.startPoint)
    path = findPath(distances, gen.endPoint)
    path = shortenPath(path, params.pathLength)
    gen.endPoint = path[0]
    cave.carvePoint(gen.terrain, gen.endPoint)
    if (guaranteePath(gen.terrain, gen.startPoint, gen.endPoint, params)) {
      // If we have to carve the path a third time, this may be uncompletable. Just throw an error so we can restart
      throw new Error('Uncompletable terrain')
    }
  }

  // TODO: Move path painting here
  paintPath(gen.types, path, params)

  // Remove tiny holes from the map (frustrating for the player)
  cave.removeHoles(gen.terrain)

  // Smoothing layer over the path
  for (let i = 0; i < params.pathSmoothingIterations; i++) {
    // smoothPath(gen.terrain, path, params)
  }

  // If finale level, put a palace at the end
  if (params.caveMode === 15) {
    // Build params
    const pt = gen.endPoint
    const pathData = {
      path,
      offset: pt
    }
    const heightDelta = Math.max(gen.terrain[pt], 3) - params.palaceFloorHeight - 1

    // Generate
    const res = palace.generatePalace(params, pathData)

    // Place palace into the world
    adjustTerrain(res.terrain, heightDelta)
    mergeTerrain(gen.terrain, res.terrain, pt)
    mergeTerrain(gen.types, res.types, pt)

    gen.endPoint = add(res.endPoint, pt)

    // Add preset clocks
    gen.presetClocks = []
    for (const clockPos of res.presetClocks) {
      gen.presetClocks.push(add(clockPos, pt))
    }
    gen.presetClocks.push(path[Math.floor(path.length * 0.75)])
    gen.presetClocks.push(path[Math.floor(path.length * 0.5)])
    gen.presetClocks.push(add(res.startPoint, pt))
  }

  // Return
  return gen
}
