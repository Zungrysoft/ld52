import * as proc from './procgeneral.js'
import * as terr from './procterrain.js'
import * as basic from './procbasics.js'
import { add } from './core/vector2.js'
import { isExtreme } from './procgeneral.js'

const BIRTH_LIMIT = 3
const DEATH_LIMIT = 2

export function generateCaves (params) {
  // Get necessary params
  let layers = params.caveLayers

  // Set params from cave mode
  let wallHeight = 0
  let boundaryLayer = false
  if (params.caveMode === 1) {
    wallHeight = 40
  } else if (params.caveMode === 2) {
    boundaryLayer = true
    wallHeight = 40
    layers++
  }

  // Start by creating an uncarved flat at wall height
  const terrain = basic.generateFlat({
    ...params,
    height: wallHeight
  })

  // Iterate over cave layers
  let startPoint = [0, 0]
  let endPoint = [0, 0]
  for (let i = layers - 1; i >= 0; i--) {
    // If this is the first layer generated, make it the boundary layer
    let terrainLayer
    let spacesLayer
    if (i === layers - 1 && boundaryLayer) {
      // Terrain
      terrainLayer = basic.generateFlat({
        ...params,
        height: 0
      })
      // Caves
      spacesLayer = caveAlgorithm({
        ...params,
        caveInitialChance: 0.25,
        caveSteps: 3
      })
    } else {
      // Terrain
      terrainLayer = terr.generateTerrain(params).terrain
      // Caves
      spacesLayer = caveAlgorithm(params)
    }

    // If this is layer 0, set the start and end points
    if (i === 0) {
      const sneResult = determineStartAndEndPoint(spacesLayer, params)
      startPoint = sneResult[0]
      endPoint = sneResult[1]

      if (startPoint.toString() === '0,0') {
        startPoint = [10, 10]
        terrain[startPoint] = 10
        spacesLayer[startPoint] = false
      }
      if (endPoint.toString() === '0,0') {
        endPoint = [10, 20]
        terrain[endPoint] = 10
        spacesLayer[endPoint] = false
      }

      carvePoint(terrainLayer, startPoint)
      carvePoint(terrainLayer, endPoint)

      carvePoint(spacesLayer, startPoint)
      carvePoint(spacesLayer, endPoint)
    }

    // Merge the cave-gen with the terrain-gen
    const spacing = boundaryLayer ? 0 : (i * params.caveLayerSpacing)
    for (const key in spacesLayer) {
      if (!(key in spacesLayer) || spacesLayer[key] === false) {
        terrain[key] = Math.floor((terrainLayer[key] || 0) + spacing)
      }
    }
  }

  // Throw if start or end point ended up at z axis of zero
  if (isExtreme(terrain[startPoint])) {
    terrain[startPoint] = 20
    console.warn('Extreme start point')
  }
  if (isExtreme(terrain[endPoint])) {
    terrain[endPoint] = 20
    console.warn('Extreme end point')
  }

  // Return
  const ret = new proc.GeneratorResult()
  ret.terrain = terrain
  ret.startPoint = startPoint
  ret.endPoint = endPoint
  return ret
}

function caveAlgorithm (params) {
  // Init spaces
  const spaces = {}

  // Get necessary params
  const width = params.width
  const length = params.length
  const initialChance = params.caveInitialChance
  const steps = params.caveSteps

  // Iterate
  for (let i = 0; i < width; i++) {
    for (let j = 0; j < length; j++) {
      spaces[[i, j]] = params.random() < initialChance
    }
  }

  // Iterate the algorithm
  for (let i = 0; i < steps; i++) {
    caveIterate(spaces)
  }

  return spaces
}

function caveIterate (spaces) {
  const deltas = [[0, 1], [1, 0], [0, -1], [-1, 0], [1, 1], [-1, 1], [1, -1], [-1, -1]]
  const newSpaces = {}

  for (const key in spaces) {
    // Look through adjacent spaces
    let count = 0
    const pos = proc.stringToPosition(key)
    for (const delta of deltas) {
      const samplePos = add(pos, delta)
      if (samplePos in spaces) {
        if (spaces[samplePos] === true) {
          count += 1
        }
      } else {
        count += 1
      }
    }

    // Set new space based on count
    if (spaces[pos] === true) {
      if (count < DEATH_LIMIT) {
        newSpaces[pos] = false
      } else {
        newSpaces[pos] = true
      }
    } else {
      if (count > BIRTH_LIMIT) {
        newSpaces[pos] = true
      } else {
        newSpaces[pos] = false
      }
    }
  }

  // Save iteration
  for (const key in newSpaces) {
    spaces[key] = newSpaces[key]
  }
}

function determineStartAndEndPoint (spaces, params) {
  const deltas = [[0, 1], [1, 0], [0, -1], [-1, 0], [1, 1], [-1, 1], [1, -1], [-1, -1]]
  let candidates = []
  let cornerFactor = 5

  while (candidates.length < 10 && cornerFactor > 0) {
    candidates = []
    for (const key in spaces) {
      // If this is an open space
      if (spaces[key] === false) {
        // Look through adjacent spaces
        let count = 0
        const pos = proc.stringToPosition(key)
        for (const delta of deltas) {
          const samplePos = add(pos, delta)
          if (samplePos in spaces) {
            if (spaces[samplePos] === true) {
              count += 1
            }
          } else {
            count += 1
          }
        }

        // If this is a corner alcove, add this as a candidate
        if (count >= cornerFactor) {
          candidates.push(pos)
        }
      }
    }
    cornerFactor -= 1
  }

  // Randomly whittle candidates down to seven
  // Adds some RNG and limits the time complexity of the next step
  while (candidates.length > 7) {
    const remove = Math.floor(params.random() * candidates.length)
    candidates.splice(remove, 1)
  }

  // Find the two candidates that are furthest apart
  let maxDistance = 0
  let maxPos1 = [0, 0]
  let maxPos2 = [0, 0]
  for (let i = 0; i < candidates.length; i++) {
    for (let j = i + 1; j < candidates.length; j++) {
      // Determine the distance between the two candidates
      const pos1 = candidates[i]
      const pos2 = candidates[j]
      const distance = Math.pow(pos1[0] - pos2[0], 2) + Math.pow(pos1[1] - pos2[1], 2)

      // Track the max distance pair
      if (distance > maxDistance) {
        maxPos1 = pos1
        maxPos2 = pos2
        maxDistance = distance
      }
    }
  }

  // Return
  return [maxPos1, maxPos2]
}

const HOLE_NEARBY_MAX = 5
const HOLE_RADIUS = 2
export function removeHoles (terrain) {
  const deltas = [[1, 0], [-1, 0], [0, 1], [0, -1]]

  for (const tileStr in terrain) {
    const tile = proc.stringToPosition(tileStr)
    // If this is a hole
    if (!terrain[tile]) {
      // Check neighbors to estimate how small this hole is
      let count = 0
      for (let i = -HOLE_RADIUS; i <= HOLE_RADIUS; i++) {
        for (let j = -HOLE_RADIUS; j <= HOLE_RADIUS; j++) {
          const neighbor = add(tile, [i, j])
          if (!terrain[neighbor]) {
            count++
          }
        }
      }

      // If we have decided to fill in this hole, set its height to the average of its neighbors
      if (count <= HOLE_NEARBY_MAX) {
        let total = 0
        let count = 0
        for (const delta of deltas) {
          const neighbor = add(tile, delta)
          if (!isExtreme(terrain[neighbor])) {
            count++
            total += terrain[neighbor]
          }
        }
        terrain[tile] = Math.floor(total / count)
      }
    }
  }
}

export function carvePoint (terrain, startPoint) {
  // Make sure the start point and end point exist
  if (!(startPoint in terrain)) {
    console.error('Carved point is not a valid space')
    return
  }

  startPoint = proc.stringToPosition(startPoint)

  // Carve out a 3x3 space at each point
  const startHeight = terrain[startPoint]
  const deltas = [[0, 1], [1, 0], [0, -1], [-1, 0], [1, 1], [-1, 1], [1, -1], [-1, -1]]
  for (const delta of deltas) {
    const startAdj = add(startPoint, delta)
    terrain[startAdj] = startHeight
  }
}
