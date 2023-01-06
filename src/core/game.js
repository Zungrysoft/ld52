/* global requestAnimationFrame, localStorage */

import * as config from '../config.js'
import assets from '../assets.js'
import { map } from './utils.js'
import Scene from './scene.js'

const { width, height } = config
export const gamepads = []
export const keysDown = {}
export const lastKeysDown = {}
export const keysPressed = {}
export const mouse = {
  position: [0, 0],
  delta: [0, 0],
  button: false,
  click: false,
  lock () {
    canvas2d.requestPointerLock()
  },
  unlock () {
    document.exitPointerLock()
  },
  isLocked () {
    return document.pointerLockElement === canvas2d
  },
  setStyle (style = 'default') {
    document.querySelector('#cursorStyle').innerHTML = `canvas {cursor: ${style};}`
  }
}

let scene
let nextScene
let previousFrameTime = null
let accumulator = 0
let frameCount = 0
let isFocused = true
let frameRate = 0
export const canvas3d = document.createElement('canvas')
canvas3d.width = width
canvas3d.height = height
canvas3d.id = 'canvas3d'
export const canvas2d = document.createElement('canvas')
canvas2d.width = width
canvas2d.height = height
canvas2d.id = 'canvas2d'
export const ctx = canvas2d.getContext('2d')
ctx.imageSmoothingEnabled = false
export const globals = {}

export function start () {
  setScene(assets.sceneOrder[0])
  requestAnimationFrame(frame)
  setInterval(() => {
    frameRate = frameCount
    frameCount = 0
  }, 1000)
}

function frame (frameTime) {
  let delta = previousFrameTime === null ? 0 : (frameTime - previousFrameTime) / 1000
  previousFrameTime = frameTime

  delta *= 60
  if (delta >= 0.98 && delta <= 1.02) {
    delta = 1
  }
  accumulator += delta

  // make sure we update at 60hz
  let times = 0
  while (accumulator >= 1 && times < config.catchupFrames) {
    update()
    accumulator -= 1
    times += 1
  }
  accumulator %= 1

  if (times) {
    draw()
    frameCount += 1
  }

  mouse.delta[0] = 0
  mouse.delta[1] = 0
  requestAnimationFrame(frame)
}

function update () {
  if (nextScene) {
    scene = nextScene
    nextScene = null
    if (scene.init) scene.init()
  }

  const focused = document.hasFocus()
  if (!focused && isFocused) {
    loseFocus()
  }
  if (focused && !isFocused) {
    gainFocus()
  }
  isFocused = focused
  if (!isFocused) {
    return
  }

  // update keys pressed
  for (const key in keysPressed) delete keysPressed[key]
  for (const key in keysDown) {
    if (!lastKeysDown[key]) keysPressed[key] = true
  }

  if (navigator?.getGamepads) {
    for (const [i, gamepad] of Object.entries(navigator.getGamepads())) {
      gamepads[i] = gamepad
    }
  }

  scene.clearScreen()
  scene.update()

  // update the last keys down
  for (const key in lastKeysDown) delete lastKeysDown[key]
  for (const key in keysDown) lastKeysDown[key] = true
  mouse.click = false
}

function draw () {
  if (!document.hasFocus()) { return }
  scene?.draw()
}

function loseFocus () {
  for (const key in keysDown) delete keysDown[key]
  for (const sound of Object.values(assets.sounds)) {
    sound.wasPlayingWhenFocused = !sound.paused
    sound.pause()
  }
}

function gainFocus () {
  for (const sound of Object.values(assets.sounds)) {
    if (sound.wasPlayingWhenFocused) {
      sound.play()
    }
  }
}

/********************************************************************************
   input handling
 ********************************************************************************/

document.onkeydown = (event) => {
  keysDown[event.code] = true
  // event.preventDefault()
  // event.returnValue = "Something"
  // return false
  return true
}

document.onkeyup = (event) => {
  delete keysDown[event.code]
  // event.preventDefault()
  // event.returnValue = "Something"
  // return false
  return true
}

document.onmouseup = () => {
  mouse.button = false
}

document.onmousedown = () => {
  mouse.button = true
  mouse.click = true
}

window.onbeforeunload = (event) => {
  // event.preventDefault()

  // chrome requires returnValue to be set
  // event.returnValue = "Really want to quit the game?"
}

canvas2d.onmousemove = (e) => {
  const aspect = Math.min(canvas2d.offsetWidth / width, canvas2d.offsetHeight / height)
  mouse.position[0] = map(
    e.offsetX,
    canvas2d.offsetWidth / 2 - aspect * width / 2,
    canvas2d.offsetWidth / 2 + aspect * width / 2,
    0,
    width,
    true
  )
  mouse.position[1] = map(
    e.offsetY,
    canvas2d.offsetHeight / 2 - aspect * height / 2,
    canvas2d.offsetHeight / 2 + aspect * height / 2,
    0,
    height,
    true
  )
  mouse.delta[0] += e.movementX
  mouse.delta[1] += e.movementY
  mouse.button = !!e.buttons
}

/********************************************************************************
   scene managing
 ********************************************************************************/

export function setScene (name) {
  nextScene = new Scene(name)
}

export function getScene () {
  return scene
}

export function resetScene () {
  nextScene = new Scene(scene.name)
}

export function setNextScene () {
  const index = assets.sceneOrder.indexOf(scene.name)
  const nextName = assets.sceneOrder[index + 1]
  return setScene(nextName)
}

export function getThing (thing) {
  return scene.namedThings[thing]
}

export function getFramerate () {
  return frameRate
}

/********************************************************************************
   saving / loading
 ********************************************************************************/

export const saveData = new Proxy({}, {
  set (obj, prop, value) {
    localStorage.setItem(prop, value)
  },

  get (obj, prop) {
    return localStorage.getItem(prop)
  },

  delete (obj, prop) {
    localStorage.removeItem(prop)
  }
})
