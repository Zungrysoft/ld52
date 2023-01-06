import * as proc from './procgeneral.js'

export function insertFeature (terrain, types, pos, params) {
  let selection = 0
  const r = params.random()
  // Random structure
  if (r < 0.04) {
    selection = Math.floor(params.random() * 100)
  } else if (r < 0.6) {
    // Level Structure
    selection = params.levelFeature
  } else {
    // Favorite Structure
    selection = params.favoriteFeature
  }

  // Pick feature
  const featureTerrain = {}
  const featureTypes = {}
  selection = selection % 2
  if (selection === 1) {
    cube(terrain[pos], featureTerrain, featureTypes)
  } else {
    pyramid(terrain[pos], featureTerrain, featureTypes)
  }

  // Save the feature to the terrain
  proc.mergeTerrain(terrain, featureTerrain, pos)
  proc.mergeTerrain(types, featureTypes, pos)
}

function pyramid (height, terrain, types) {
  for (let i = 3; i >= 1; i--) {
    const h = 8 - (i * 2)
    for (let x = -i + 1; x <= i - 1; x++) {
      for (let y = -i + 1; y <= i - 1; y++) {
        terrain[[x, y]] = height + h
        types[[x, y]] = "wall2"
      }
    }
  }
}

function cube (height, terrain, types) {
  for (let x = -2; x <= 2; x++) {
    for (let y = -2; y <= 2; y++) {
      terrain[[x, y]] = height + 6
      types[[x, y]] = "floor"
    }
  }
  types[[2, 2]] = "wall2"
  types[[-2, 2]] = "wall2"
  types[[2, -2]] = "wall2"
  types[[-2, -2]] = "wall2"
}
