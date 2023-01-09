import * as vec2 from './core/vector2.js'
import * as levelSelector from './levelselection.js'
import * as game from './core/game.js'

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

// export function generateEverything () {
//   const streetRad = 7;
//   const sidewalkRad = streetRad + 3;
//   const shelfRad = sidewalkRad + 1;
//   const totalSize = 100;

//   let world = {
//     terrain: {},
//     types: {},
//   }

//   // Base
//   {
//     let merge = generateFlat({
//       width: totalSize + 2,
//       length: totalSize + 2,
//       height: 18,
//       type: "street",
//     })
//     mergeTerrain(world, merge, [-1, -1])
//   }

//   // Windows
//   {
//     let merge = generateFlat({
//       width: totalSize,
//       length: totalSize,
//       height: 41,
//       type: "wall",
//     })
//     mergeTerrain(world, merge, [0, 0])
//   }

//   // Shelf
//   {
//     let merge = generateFlat({
//       width: shelfRad*2,
//       length: totalSize,
//       height: 8,
//       type: "trim",
//     })
//     mergeTerrain(world, merge, [totalSize/2 - shelfRad, 0])
//   }
//   {
//     let merge = generateFlat({
//       width: totalSize,
//       length: shelfRad*2,
//       height: 8,
//       type: "trim",
//     })
//     mergeTerrain(world, merge, [0, totalSize/2 - shelfRad])
//   }

//   // Sidewalk
//   {
//     let merge = generateFlat({
//       width: sidewalkRad*2,
//       length: totalSize,
//       height: 2,
//       type: "sidewalk",
//     })
//     mergeTerrain(world, merge, [totalSize/2 - sidewalkRad, 0])
//   }
//   {
//     let merge = generateFlat({
//       width: totalSize,
//       length: sidewalkRad*2,
//       height: 2,
//       type: "sidewalk",
//     })
//     mergeTerrain(world, merge, [0, totalSize/2 - sidewalkRad])
//   }

//   // Street
//   {
//     let merge = generateFlat({
//       width: streetRad*2,
//       length: totalSize,
//       height: 1,
//       type: "street",
//     })
//     mergeTerrain(world, merge, [totalSize/2 - streetRad, 0])
//   }
//   {
//     let merge = generateFlat({
//       width: totalSize,
//       length: streetRad*2,
//       height: 1,
//       type: "street",
//     })
//     mergeTerrain(world, merge, [0, totalSize/2 - streetRad])
//   }

//   // Return
//   return {
//     terrain: world.terrain,
//     types: world.types,
//     startPoint: [totalSize/2, totalSize/2],
//     endPoint: [totalSize/2, 6],
//     startAngle: 0,
//   }
// }

function heightToType(height) {
  if (height == 2) {return "sidewalk"}
  if (height >= 8 && height <= 11) {
    let trimHeight = height % 4
    if (trimHeight == 0) {return "trim3"}
    if (trimHeight == 1) {return "trim"}
    if (trimHeight == 2) {return "trim3"}
    if (trimHeight == 3) {return "trim2"}
  }
  if (height >= 12 && height <= 17) {return "machinery"}
  if (height == 18) {return "street"}
  if (height == 59 || height == 64) {return "trim3"}

  // Windows
  if (height >= 19) {
    let windowHeight = height % 4
    if (windowHeight == 0) {return "wall"}
    if (windowHeight == 1) {return "wall2"}
    if (windowHeight == 2) {return "wall3"}
    if (windowHeight == 3) {return "wall4"}
  }

  return "street"
}

export function generateEverything (level) {
  let isMenu = true
  if (game.getThing('player')) {
    isMenu = false
  }
  const lvl = levelSelector.selectLevel(level)
  const chunkSize = 64

  let terrain = {}
  let types = {}
  let startPoint = [0, 0]

  // Parse level file
  for (let layer of lvl.layers) {
    for (let chunk in layer.grid) {
      let chunkData = layer.grid[chunk]

      for (let ind in chunkData) {
        let height = chunkData[ind]
        if (height > 0) {
          let point = [ind % chunkSize, Math.floor(ind / chunkSize)]
          let finalPoint = vec2.add(point, stringToPosition(chunk))
          terrain[finalPoint] = height
          types[finalPoint] = heightToType(height)
        }
      }
    }
    for (let thing of layer.things) {
      if (thing.name === "playerStart") {
        startPoint = thing.position
      }
    }
  }

  return {
    terrain: terrain,
    types: types,
    startPoint: startPoint,
    startAngle: 180,
  }
}
