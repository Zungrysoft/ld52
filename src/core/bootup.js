/* global Image, Audio */

import {
  width,
  height,
  isWebglEnabled,
  playButton
} from '../config.js'
import {
  start,
  canvas3d,
  canvas2d
} from './game.js'
import * as gfx from './webgl.js'
import assets from '../assets.js'

function loadImages (images) {
  return new Promise(resolve => {
    const result = {}
    let loadTotal = 0
    let loadCount = 0

    for (const name in images) {
      loadTotal += 1

      const image = new Image()
      image.onload = () => {
        loadCount += 1
        if (loadCount === loadTotal) resolve(result)
      }
      image.src = images[name]

      result[name] = image
    }

    if (!loadTotal) resolve({})
  })
}

function loadText (shaders) {
  return new Promise(resolve => {
    const result = {}
    let loadTotal = 0
    let loadCount = 0

    for (const name in shaders) {
      loadTotal += 1

      fetch(shaders[name]).then(response => response.text().then(what => {
        result[name] = what
        loadCount += 1

        if (loadCount === loadTotal) resolve(result)
      }))
    }

    if (!loadTotal) resolve({})
  })
}

(async () => {
  const loadCanvas = document.createElement('canvas')
  loadCanvas.id = 'loadCanvas'
  loadCanvas.width = width
  loadCanvas.height = height
  document.querySelector('body').appendChild(loadCanvas)
  const loadContext = loadCanvas.getContext('2d')

  function drawText (text) {
    loadContext.fillStyle = 'black'
    loadContext.fillRect(0, 0, width, height)
    loadContext.font = 'italic 40px Times New Roman'
    loadContext.fillStyle = 'gray'
    loadContext.fillText(text, 64, height - 64)
  }

  // slap a file prefix on these bad boys
  function prefixObject (prefix, object) {
    for (const key in object) {
      object[key] = prefix + object[key]
    }
  }
  prefixObject('images/', assets.imageSources)
  prefixObject('models/', assets.modelSources)
  prefixObject('sounds/', assets.soundSources)
  prefixObject('shaders/', assets.shaderFileSources)
  prefixObject('scenes/', assets.sceneSources)

  drawText('Loading images...')
  const startTime = Date.now()
  assets.images = await loadImages(assets.imageSources)

  drawText('Loading sounds...')
  assets.sounds = {}
  for (const [name, path] of Object.entries(assets.soundSources)) {
    assets.sounds[name] = new Audio(path)
  }

  // initialize main canvas here, because webgl needs access to it
  if (isWebglEnabled) {
    gfx.init()

    drawText('Loading textures...')
    assets.textures = {}
    for (const [name, image] of Object.entries(assets.images)) {
      assets.textures[name] = gfx.createTexture(image, assets.textureSettings[name])
    }

    drawText('Loading models...')
    assets.modelFiles = await loadText(assets.modelSources)
    assets.models = {}
    for (const [name, source] of Object.entries(assets.modelFiles)) {
      assets.models[name] = gfx.createMesh(source)
    }

    drawText('Loading shaders...')
    assets.shaderFiles = await loadText(assets.shaderFileSources)

    drawText('Pairing shaders...')
    assets.shaders = {}
    for (const [name, pair] of Object.entries(assets.shaderSources)) {
      assets.shaders[name] = gfx.createShader(assets.shaderFiles[pair[0]], assets.shaderFiles[pair[1]])
    }
  }

  drawText('Loading scenes...')
  assets.sceneOrder = Object.keys(assets.sceneSources)
  assets.scenes = await loadText(assets.sceneSources)

  console.log(`Loading took ${(Date.now() - startTime) / 1000} seconds!`)

  // make all assets read-only
  for (const group of Object.values(assets)) {
    Object.freeze(group)
  }
  Object.freeze(assets)

  loadContext.fillStyle = 'black'
  loadContext.fillRect(0, 0, width, height)
  const body = document.querySelector('body')

  /*
     when in a browser, we need to have the user interact
     with the page to be allowed to play audio and other stuff
     so we create a button to start up the game
   */
  const button = document.createElement('button')
  const startup = () => {
    loadContext.fillStyle = 'black'
    loadContext.fillRect(0, 0, width, height)
    button.remove()
    body.appendChild(canvas3d)
    body.appendChild(canvas2d)
    start()
  }
  button.innerHTML = 'Click to start!'
  button.classList.add('startButton')
  button.autofocus = true
  button.onclick = startup
  body.appendChild(button)

  /*
     when in nwjs we already have these priviledges so skip this step
   */
  if (window.process?.__nwjs || !playButton) {
    startup()
  }
})()
