import Player from './player.js'
import Terrain from './terrain.js'
import DemoHelper from './demohelper.js'
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
    tranq: 'tranq.obj',
  },

  imageSources: {
    // Map
    stone: 'stone_grey.png',
    lightStone: 'stone_lgrey.png',
    goldenFloor: 'stone_gold.png',
    goldenBrick: 'stone_gold_brick.png',
    purpleFloor: 'stone_purple.png',
    purpleBrick: 'stone_purple_brick.png',
    concreteTile: 'concrete_tile.png',
    concreteComputer: 'concrete_computer.png',
    window: 'window.png',
    window2: 'window2.png',
    window3: 'window3.png',
    window4: 'window4.png',

    roof: 'stone_black_smalltile.png',

    // Organs
    brain: "brain.png",
    eyeball: "eyeball.png",
    finger: "finger.png",
    heart: "heart.png",
    kidney: "kidney.png",
    liver: "liver.png",
    lungs: "lungs.png",
    tongue: "tongue.png",
    organShadow: "shadow.png",
    organBad: "bad.png",

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
    deploy: 'deploy.wav',
    holster: 'holster.wav',
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
    TitleMenu
  }
}

export default assets
