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

export function generateFlat (params) {
  const width = params.width
  const length = params.length
  const height = params.height
  const type = params.type

  const terrain = {}
  const types = {}

  for (let i = 0; i < width; i++) {
    for (let j = 0; j < length; j++) {
      terrain[[i, j]] = height
      types[[i, j]] = type
    }
  }

  return {
    terrain: terrain,
    types: types,
  }
}

export function mergeTerrain (original, merge, position) {
  const p = stringToPosition(position)

  for (const key in merge.terrain) {
    const value = merge.terrain[key]
    const type = merge.types[key]
    const coords = key.split(',')
    const x = parseInt(coords[0])
    const y = parseInt(coords[1])
    original.terrain[[x + p[0], y + position[1]]] = value
    original.types[[x + p[0], y + position[1]]] = type
  }
}

export function adjustTerrain (terrain, amt) {
  for (const key in terrain) {
    terrain[key] = terrain[key] + amt
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

export function generateEverything () {
  const streetRad = 7;
  const sidewalkRad = streetRad + 3;
  const shelfRad = sidewalkRad + 1;
  const totalSize = 100;

  let world = {
    terrain: {},
    types: {},
  }

  // Base
  {
    let merge = generateFlat({
      width: totalSize + 2,
      length: totalSize + 2,
      height: 18,
      type: "street",
    })
    mergeTerrain(world, merge, [-1, -1])
  }

  // Windows
  {
    let merge = generateFlat({
      width: totalSize,
      length: totalSize,
      height: 41,
      type: "wall",
    })
    mergeTerrain(world, merge, [0, 0])
  }

  // Shelf
  {
    let merge = generateFlat({
      width: shelfRad*2,
      length: totalSize,
      height: 8,
      type: "trim",
    })
    mergeTerrain(world, merge, [totalSize/2 - shelfRad, 0])
  }
  {
    let merge = generateFlat({
      width: totalSize,
      length: shelfRad*2,
      height: 8,
      type: "trim",
    })
    mergeTerrain(world, merge, [0, totalSize/2 - shelfRad])
  }

  // Sidewalk
  {
    let merge = generateFlat({
      width: sidewalkRad*2,
      length: totalSize,
      height: 2,
      type: "sidewalk",
    })
    mergeTerrain(world, merge, [totalSize/2 - sidewalkRad, 0])
  }
  {
    let merge = generateFlat({
      width: totalSize,
      length: sidewalkRad*2,
      height: 2,
      type: "sidewalk",
    })
    mergeTerrain(world, merge, [0, totalSize/2 - sidewalkRad])
  }

  // Street
  {
    let merge = generateFlat({
      width: streetRad*2,
      length: totalSize,
      height: 1,
      type: "street",
    })
    mergeTerrain(world, merge, [totalSize/2 - streetRad, 0])
  }
  {
    let merge = generateFlat({
      width: totalSize,
      length: streetRad*2,
      height: 1,
      type: "street",
    })
    mergeTerrain(world, merge, [0, totalSize/2 - streetRad])
  }
  
  // Return
  return {
    terrain: world.terrain,
    types: world.types,
    startPoint: [totalSize/2, totalSize/2],
    endPoint: [totalSize/2, 6],
    startAngle: 0,
  }
}
