import * as proc from './procgeneral.js'
import { add } from './core/vector2.js'

export function generateRooms (params) {
  const terrain = {}
  const types = {}

  insertRoom(terrain, types, [0, 0], params)
  insertRoom(terrain, types, [20, 0], params)
  insertRoom(terrain, types, [20, 20], params)

  proc.carveHallway(terrain, [0, 0], [20, 0])
  proc.carveHallway(terrain, [20, 0], [20, 20])

  // Return
  const ret = new proc.GeneratorResult()
  ret.terrain = terrain
  ret.types = types
  ret.startPoint = [0, 0]
  ret.endPoint = [20, 20]
  return ret
}

export function insertRoom (terrain, types, pos, params) {
  const roomTerrain = generateRoom(params)

  proc.mergeTerrain(terrain, roomTerrain.terrain, pos)
  proc.mergeTerrain(types, roomTerrain.types, pos)
}

export function insertPlinth (terrain, types, pos, params) {
  for (let i = -3; i <= 3; i++) {
    for (let j = -3; j <= 3; j++) {
      const newPos = add([i, j], pos)
      terrain[newPos] = params.height
      types[newPos] = "wall"
    }
  }
}

export function generateRoom (params) {
  const rooms = [[[-3, -3], [3, 3]]]
  const deltas = [[0, 1], [1, 0], [0, -1], [-1, 0], [1, 1], [-1, 1], [1, -1], [-1, -1]]
  const terrain = {}
  const types = {}

  // Generate rooms
  const roomCount = Math.floor(params.random() * 4) + 1
  for (let i = 0; i < roomCount; i++) {
    const newRoom = [[0, 0], [0, 0]]
    const x = (params.random() * 10) - 5
    const y = (params.random() * 10) - 5
    const width = (params.random() * (params.roomMaxSize - params.roomMinSize)) + params.roomMinSize
    const height = (params.random() * (params.roomMaxSize - params.roomMinSize)) + params.roomMinSize

    newRoom[1][0] = Math.floor(x + width / 2)
    newRoom[0][0] = Math.floor(x - width / 2)
    newRoom[1][1] = Math.floor(y + height / 2)
    newRoom[0][1] = Math.floor(y - height / 2)

    rooms.push(newRoom)
  }

  // Build floors
  for (const room of rooms) {
    for (let i = room[0][0]; i <= room[1][0]; i++) {
      for (let j = room[0][1]; j <= room[1][1]; j++) {
        terrain[[i, j]] = params.height
        types[[i, j]] = "floor"
      }
    }
  }

  // Add walls
  for (const space in terrain) {
    for (const delta of deltas) {
      const newSpace = add(delta, proc.stringToPosition(space))
      if (!(newSpace in terrain)) {
        terrain[newSpace] = params.height + params.roomWallHeight
        types[newSpace] = "wall"
      }
    }
  }

  // Return
  const ret = new proc.GeneratorResult()
  ret.terrain = terrain
  ret.types = types
  return ret
}
