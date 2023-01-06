import Player from './player.js'
import Terrain from './terrain.js'
import DemoHelper from './demohelper.js'
import Goal from './goal.js'
import TitleMenu from './titlemenu.js'

const assets = {
  shaderFileSources: {
    defaultFrag: 'default.frag',
    defaultShadedFrag: 'defaultshaded.frag',
    mapFrag: 'map.frag',
    scrollingFrag: 'scrolling.frag',
    cloudsFrag: 'clouds.frag',
    defaultVert: 'default.vert',
    billboardVert: 'billboard.vert',
    axisBillboardVert: 'axisbillboard.vert',
    pointDefaultFrag: 'pointdefault.frag',
    pointDefaultVert: 'pointdefault.vert',
    paletteFrag: 'palette.frag',
    triplanarFrag: 'triplanar.frag',
    animatedFrag: 'animated.frag'
  },

  shaderSources: {
    default: ['defaultVert', 'defaultFrag'],
    defaultShaded: ['defaultVert', 'defaultShadedFrag'],
    map: ['defaultVert', 'triplanarFrag'],
    scrolling: ['defaultVert', 'scrollingFrag'],
    clouds: ['defaultVert', 'cloudsFrag'],
    billboard: ['billboardVert', 'defaultFrag'],
    animatedBillboard: ['billboardVert', 'animatedFrag'],
    axisBillboard: ['axisBillboardVert', 'defaultFrag'],
    pointcloud: ['pointDefaultVert', 'pointDefaultFrag'],
    palette: ['defaultVert', 'paletteFrag']
  },

  modelSources: {
    cube: 'cube.obj',
    cylinder: 'cylinder.obj',
    plane: 'plane.obj',
    sphere: 'sphere.obj',
    pistol: 'pistol.obj',
    shotgun: 'shotgun.obj',
    machinegun: 'machinegun.obj'
  },

  imageSources: {
    // Map
    stone: 'stone_grey.png',
    lightStone: 'stone_lgrey.png',
    stoneFloor: 'stone_grey_tile.png',
    roomWall: 'stone_purple_brick.png',
    goldenFloor: 'stone_gold.png',
    goldenWall: 'stone_gold_brick.png',
    tech1: 'tech_lgreen.png',
    techStone: 'stone_dblue.png',
    techFloor: 'stone_dblue_tile.png',
    wood: 'concrete_wall.png',
    cementTile: 'concrete_tile.png',
    dirt: 'dirt.png',
    hive: 'hive_dblue.png',
    snow: 'snow.png',

    // Skyboxes
    skybox1: 'skybox1.png',
    skybox2: 'skybox2.png',
    skybox3: 'skybox3.png',

    // Enemies
    enemy: 'enemy1.png',
    squid: 'enemy2.png',
    turret: 'enemy3.png',

    // Projectiles
    turretbullet: 'turretbullet.png',

    // Collectibles
    goal: 'pickup_flag.png',
    oneUp: 'pickup_oneup.png',
    visionPickup: 'pickup_eye.png',
    timePickup: 'pickup_clock.png',

    // Misc
    circle: 'circle.png',
    square: 'square.png',
    crosshair: 'crosshair.png'
  },

  textureSettings: {},

  soundSources: {
    playerJump: 'jump.wav',
    playerLand: 'land.wav',
    tick: 'clocktick.wav',
    tock: 'clocktock.wav',
    impact: 'impact.wav',
    footstep1: 'bigfootstep3.wav',
    footstep2: 'bigfootstep4.wav',
    win: 'win1.wav',
    shotgun: 'shoot2.wav',
    machinegun: 'shoot3.wav',
    enemyHurt1: 'ehurt1.wav',
    enemyHurt2: 'ehurt2.wav',
    timePickup: 'timepickup.wav',
    oneUp: 'oneup.wav',
    weaponPickup: 'weapon.wav',
    music1: 'music/Starshot5.mp3',
    music2: 'music/Starshot4.mp3',
    music3: 'music/Starshot6.mp3',
    musicFinal: 'music/music11.mp3',
  },

  sceneSources: {
    title: 'title.json',
    main: 'main.json'
  },

  things: {
    Terrain,
    Player,
    DemoHelper,
    Goal,
    TitleMenu
  }
}

export default assets
