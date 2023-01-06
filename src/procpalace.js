import { add, scale, subtract, equals } from './core/vector2.js'
import { GeneratorResult, stringToPosition } from './procgeneral.js'

const TOWARDS_CHANCE = 0.8
const PALACE_WALL_HEIGHT = 80
const PALACE_SCALE = 3

export function generatePalace (params, pathData) {
  const terrainSmall = {}

  terrainSmall[[0, 0]] = params.palaceFloorHeight
  terrainSmall[[0, 1]] = params.palaceFloorHeight
  terrainSmall[[0, -1]] = params.palaceFloorHeight
  terrainSmall[[1, 0]] = params.palaceFloorHeight
  terrainSmall[[1, 1]] = params.palaceFloorHeight
  terrainSmall[[1, -1]] = params.palaceFloorHeight
  terrainSmall[[-1, 0]] = params.palaceFloorHeight
  terrainSmall[[-1, 1]] = params.palaceFloorHeight
  terrainSmall[[-1, -1]] = params.palaceFloorHeight

  const data = {
    endPoint: [0, 1],
    firstClock: [0, -1],
    firstClockPlaced: false,
    secondClock: [1, 0],
    secondClockPlaced: false,
    thirdClock: [1, 0],
    thirdClockPlaced: false
  }
  const tileData = {}
  palaceAlgorithm(terrainSmall, params.palaceFloorHeight, [0, 0], params, false, 0, data, tileData, pathData)

  // Scale up terrain by a factor of 2
  const types = {}
  const terrain = scaleTerrain(terrainSmall, types, params, tileData)

  const ret = new GeneratorResult()
  ret.terrain = terrain
  ret.types = types
  ret.startPoint = [2, 0]
  ret.endPoint = add(scale(data.endPoint, PALACE_SCALE), [1, 1])
  ret.presetClocks = [scale(data.firstClock, PALACE_SCALE), scale(data.secondClock, PALACE_SCALE), scale(data.thirdClock, PALACE_SCALE)]
  ret.startAngle = Math.PI
  return ret
}

function palaceAlgorithm (terrain, height, pos, params, towards, depth, data, tileData, pathData) {
  // console.log("Started iteration at position " + pos)

  // Take an action
  const actionNumber = Math.floor(params.random() * 13)
  let action = 'turn' // move forward, turning at a chasm
  if (actionNumber >= 4 && actionNumber <= 6) { action = 'jump' } // move forward, jumping over chasm
  if (actionNumber >= 7 && actionNumber <= 12) { action = 'stair' } // staircase upwards, stopping at chasm

  let distance = Math.floor(params.random() * 4) + 2

  if (action === 'stair') {
    distance += 3
  }

  // Determine which direction we're going
  const deltas = [[1, 0], [0, 1], [-1, 0], [0, -1]]
  let direction = deltas[Math.floor(params.random() * 4)]
  if (towards) {
    if (params.random() < TOWARDS_CHANCE && pos[0] > 0) {
      direction = [-1, 0]
    } else if (params.random() < TOWARDS_CHANCE && pos[0] < 0) {
      direction = [1, 0]
    } else if (params.random() < TOWARDS_CHANCE && pos[1] > 0) {
      direction = [0, -1]
    } else if (params.random() < TOWARDS_CHANCE && pos[1] < 0) {
      direction = [0, 1]
    }
  }

  // Special case: the first carve always goes north
  if (depth === 0) {
    direction = [1, 0]
  }

  // console.log("Iteration: " + action + " for " + distance + " spaces in direction " + direction)

  let curTowards = towards
  let curPos = pos
  let curHeight = height
  for (let i = 0; i < distance; i++) {
    // Move perpendicular on the last space
    if (i === distance - 1) {
      direction = [direction[1], direction[0]]
    }

    if (action === 'follow') {
      // Track which of the adjacent spaces is the most ledge-like (ledgy?)
      let bestScore = 0
      let bestDir = [0, 1]

      for (const d1 of deltas) {
        const check = add(curPos, d1)
        let score = 0

        // Do not attempt any space that's already carved
        if (terrain[check]) {
          continue
        }

        // Loop over spaces adjacent to candidate
        for (const d2 of deltas) {
          const next = add(check, d2)

          if (terrain[next] < curHeight) { score += 1 }
        }

        // Track score
        if (score > bestScore) {
          bestScore = score
          bestDir = d1
        }
      }

      // Move in chosen direction
      direction = bestDir
    }

    // Move
    curPos = add(curPos, direction)

    // Move upwards
    if (action === 'stair') {
      curHeight += 1

      tileData[curPos] = { ...tileData[curPos], stair: true }
    }

    // Check if this space was already carved
    if (!canBuild(curPos, terrain, pathData)) {
      // If this is a ledge, start following
      if (action === 'turn' && terrain[curPos] < curHeight) {
        // Turn and follow the ledge
        // console.log("Turned after distance " + i)
        action = 'follow'
        distance += 3
        curPos = subtract(curPos, direction)
        curTowards = false
      } else if (action === 'jump') {
        // Attempt to jump over the ledge

        // Make sure there is a place we can go a certain distance ahead
        const jumpPos = add(curPos, scale(direction, params.palaceMaxJumpDistance))

        // console.log("Jump!")

        // No space to jump
        if (canBuild(jumpPos, terrain, pathData)) {
          curTowards = false
          distance = i

          // No retaining wall on space before either
          const prev = subtract(curPos, direction)
          tileData[prev] = { ...tileData[prev], noRetainingWall: true }

          for (let j = 0; j < params.palaceMaxJumpDistance; j++) {
            // Track distance
            distance++

            // Make sure there is no retaining wall on this tile
            tileData[curPos] = { ...tileData[curPos], noRetainingWall: true }

            // Move forward
            curPos = add(curPos, direction)

            // Stop once we get to the other side
            if (canBuild(curPos, terrain, pathData)) {
              terrain[curPos] = curHeight
              data.endPoint = curPos
            }
          }

          // End this step
          break
        } else { // Jump
          // Backpedal by one space
          curPos = subtract(curPos, direction)

          // console.log("Failed jump")

          // End action and set distance to the distance we actually traveled
          distance = i
          break
        }
      } else {
        // End here
        curTowards = false

        // Backpedal by one space
        curPos = subtract(curPos, direction)
        if (action === 'stair') {
          curHeight -= 1
        }

        // End action and set distance to the distance we actually traveled
        distance = i
        // console.log("End after distance " + i)
        break
      }
    } else {
      // Carve
      terrain[curPos] = curHeight
      // Move up endpoint
      data.endPoint = curPos
    }
  }

  // If we've gone back up, turn towards the start
  if (action === 'stair') {
    curTowards = true
  }

  // Clocks are put into the palace at specific points
  if (depth / params.palaceLength > 0.25 && data.firstClockPlaced === false) {
    data.firstClock = curPos
    data.firstClockPlaced = true
  }
  if (depth / params.palaceLength > 0.5 && data.secondClockPlaced === false) {
    data.secondClock = curPos
    data.secondClockPlaced = true
  }
  if (depth / params.palaceLength > 0.68 && data.thirdClockPlaced === false) {
    data.thirdClock = curPos
    data.thirdClockPlaced = true
  }

  // Recurse
  if (depth + distance < params.palaceLength) {
    palaceAlgorithm(terrain, curHeight, curPos, params, curTowards, depth + distance, data, tileData, pathData)
  }
}

function scaleTerrain (terrain, types, params, tileData) {
  const floorDeltas = [
    [0, 0], [0, 1], [0, 2],
    [1, 0], [1, 1], [1, 2],
    [2, 0], [2, 1], [2, 2]
  ]
  const wallDeltas = [
    [-1, -1], [-1, 0], [-1, 1], [-1, 2], [-1, 3],
    [0, 3], [1, 3], [2, 3], [3, 3],
    [3, 2], [3, 1], [3, 0], [3, -1],
    [2, -1], [1, -1], [0, -1]
  ]
  const terrainRet = {}

  for (const pos in terrain) {
    const p = stringToPosition(pos)
    const p2 = scale(p, PALACE_SCALE)

    for (const delta of floorDeltas) {
      const pf = add(delta, p2)
      terrainRet[pf] = terrain[p]
      types[pf] = "floor2"
    }

    for (const delta of wallDeltas) {
      const pf = add(delta, p2)
      if (!(pf in terrainRet)) {
        if (params.palaceIndoors) {
          terrainRet[pf] = PALACE_WALL_HEIGHT
          types[pf] = "wall2"
        } else {
          // Make sure this space wasn't marked as not having a retaining wall
          if (!(tileData[p] && tileData[p].noRetainingWall)) {
            // Determine if this is a junction
            let xPaths = 0
            let yPaths = 0
            if (Math.abs(terrain[add(p, [1, 0])] - terrain[p]) <= 1) { xPaths++ }
            if (Math.abs(terrain[add(p, [-1, 0])] - terrain[p]) <= 1) { xPaths++ }
            if (Math.abs(terrain[add(p, [0, 1])] - terrain[p]) <= 1) { yPaths++ }
            if (Math.abs(terrain[add(p, [0, -1])] - terrain[p]) <= 1) { yPaths++ }

            if (xPaths === 1 || yPaths === 1) {
              const isStair = tileData[p] && tileData[p].stair
              terrainRet[pf] = terrain[p] + (isStair ? 3 : 2)
              types[pf] = "wall2"
            }
          }
        }
      }
    }
  }

  return terrainRet
}

function canBuild (pos, terrain, pathData) {
  // Don't build over lower parts of the structure
  if (pos in terrain) {
    return false
  }
  // Don't build over the path
  if (pathData) {
    for (const tile of pathData.path) {
      // Get position of the tile relative to the tower
      const newTile = subtract(tile, pathData.offset)

      // Divide tile position to get position after scaling
      const nx = Math.floor(newTile[0] / PALACE_SCALE)
      const ny = Math.floor(newTile[1] / PALACE_SCALE)
      const divTile = [nx, ny]

      // Check if they overlap
      if (equals(pos, divTile)) {
        return false
      }
    }
  }
  return true
}
