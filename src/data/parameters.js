export const data = {
  // General
  level: {
    randomMode: 'constant',
    value: 0,
    advanceAmount: 1,
    round: true
  },
  width: {
    randomMode: 'bell',
    bellCenter: 40,
    bellRadius: 10,
    advanceAmount: 3,
    max: 45,
    round: true
  },
  length: {
    randomMode: 'bell',
    bellCenter: 70,
    bellRadius: 17,
    advanceAmount: 3,
    max: 90,
    round: true
  },
  height: {
    randomMode: 'constant',
    value: 20,
    round: true
  },

  // Path
  pathLength: {
    randomMode: 'constant',
    value: 74,
    advanceAmount: 2,
    max: 100,
    round: true
  },
  pathSmoothingLedgeMax: {
    randomMode: 'constant',
    value: 0.2,
    advanceAmount: 0.35,
    round: true
  },
  pathSmoothingIterations: {
    randomMode: 'constant',
    value: 3.2,
    advanceAmount: -0.3,
    min: 0,
    round: true
  },

  // Cave
  caveSteps: {
    randomMode: 'bell',
    bellCenter: 6.5,
    bellRadius: 1.7,
    rerollChance: '0.3',
    round: true
  },
  caveInitialChance: {
    randomMode: 'bell',
    bellCenter: 0.3,
    bellRadius: 0.01,
    rerollChance: '0.3',
    round: false
  },
  caveLayers: {
    randomMode: 'constant',
    value: 1,
    advanceAmount: 0.45,
    max: 15,
    round: true
  },
  caveLayerSpacing: {
    randomMode: 'constant',
    value: 2,
    round: true
  },
  caveMode: {
    randomMode: 'constant',
    value: 0,
    round: true
  },

  // Terrain
  terrainVariance: {
    randomMode: 'bell',
    bellCenter: 14,
    bellRadius: 10,
    advanceAmount: 3,
    round: true
  },
  terrainRoughness: {
    randomMode: 'constant',
    value: 0.4,
    round: false
  },

  // Rooms
  roomMaxSize: {
    randomMode: 'bell',
    bellCenter: 7,
    bellRadius: 5,
    max: 100,
    advanceAmount: 1,
    round: true
  },
  roomMinSize: {
    randomMode: 'bell',
    bellCenter: 3,
    bellRadius: 2,
    round: true
  },
  roomWallHeight: {
    randomMode: 'bell',
    bellCenter: 8,
    bellRadius: 7,
    rerollChance: '0.3',
    round: true
  },
  room1Position: {
    randomMode: 'linear',
    linearMin: 0.01,
    linearMax: 0.99,
    rerollChance: '0.4',
    round: false
  },
  room2Position: {
    randomMode: 'linear',
    linearMin: 0.01,
    linearMax: 0.99,
    rerollChance: '0.4',
    round: false
  },

  // Palace
  palaceFloorHeight: {
    randomMode: 'constant',
    value: 20,
    round: true
  },
  palaceMaxJumpDistance: {
    randomMode: 'constant',
    value: 3,
    round: true
  },
}
