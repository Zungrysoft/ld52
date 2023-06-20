import {
  ctx,
  globals,
  getScene,
  mouse,
  getThing
} from './core/game.js'
import { width, height } from './config.js'
import Thing from './core/thing.js'
import * as gfx from './core/webgl.js'
import * as mat from './core/matrices.js'
import * as u from './core/utils.js'
import assets from './assets.js'
import * as vec3 from './core/vector3.js'
import * as vec2 from './core/vector2.js'
import * as game from './core/game.js'
import InputHandler from './core/inputs.js'
import Bullet from './bullet.js'
import Pointer from './pointer.js'
import EndMenu from './endmenu.js'
import DeathAnim from './deathanim.js'
import LevelStart from './levelstart.js'
import * as questions from './data/questions.js'
import * as levelData from './data/levels.js'

export default class Player extends Thing {
  height = 90
  onGround = false
  wasOnGround = false
  aabb = [-16, -16, 16, 16]
  cameraTarget = [0, 0, 0]
  cameraLookAhead = 64
  moveDirection = [1, 0, 0]
  forward = [1, 0, 0]
  color = u.stringToColor('#cbdbfc')
  legColor = u.stringToColor('#5b6e99')
  ears = []
  stretch = [1, 1]
  compression = 1
  width = 16
  canDash = true
  wannaJump = 0
  staircaseOffset = 0
  inputs = null
  lastFallSpeed = 0
  time = 0
  showGui = true // cutscenes set this to false
  deliveredCount = 0
  sprite = null
  // framebuffer = gfx.gl.createFramebuffer()
  depth = -10000
  stepCounter = 0
  lastPosition = [0, 0, 0]
  walkFrames = 0
  walkFrameAccel = 0
  slowTime = 0
  inMenu = true
  talkingTo = null
  faceTarget = null
  faceSource = null
  speechQueue = ""
  speechQueueIndex = 0
  hasConvincedPerson = false

  constructor (position, angle = 0) {
    super()

    if (!globals.level) {
      globals.level = 1
    }
    globals.powerup = 'pointer'
    // mouse.setStyle("none")

    // getScene().addThing(new DemoHelper())

    // Set up menu stuff
    this.setMenuData()

    // this.position[2] = 10000
    this.position = position
    this.position[2] = getThing('terrain').getGroundHeight(this.position[0], this.position[1]) + this.height
    getScene().camera3D.position = [...this.position]
    getScene().camera3D.pitch = 0.25
    getScene().camera3D.yaw = angle
    getScene().addThing(new LevelStart())
    // getScene().addThing(new DemoHelper())

    this.spawnPosition = [...this.position]
    this.speed[2] = 0
    // this.direction = 0
    // this.lookDirection = 0

    this.setName('player')

    this.inputs = new InputHandler({
      jump (keys, mouse, gamepad) {
        return keys.Space || gamepad?.buttons[0].pressed
      },
      shoot (keys, mouse, gamepad) {
        return (mouse.isLocked() && mouse.button) || gamepad?.buttons[1].pressed
      },
      changeWeapon (keys, mouse, gamepad) {
        return keys.KeyQ || gamepad?.buttons[4].pressed || gamepad?.buttons[5].pressed
      },

      xMove (keys, mouse, gamepad) {
        const kb = !!keys.KeyD - !!keys.KeyA
        const gp = Math.abs(gamepad?.axes[0]) > 0.1 && gamepad.axes[0]
        return kb + gp
      },
      yMove (keys, mouse, gamepad) {
        const kb = !!keys.KeyS - !!keys.KeyW
        const gp = Math.abs(gamepad?.axes[1]) > 0.1 && gamepad.axes[1]
        return kb + gp
      },

      xLook (keys, mouse, gamepad) {
        const kb = !!keys.ArrowRight - !!keys.ArrowLeft
        const gp = Math.abs(gamepad?.axes[2]) > 0.1 && gamepad.axes[2]
        return kb * 0.02 + gp * 0.04
      },
      yLook (keys, mouse, gamepad) {
        const kb = !!keys.ArrowDown - !!keys.ArrowUp
        const gp = Math.abs(gamepad?.axes[3]) > 0.1 && gamepad.axes[3]
        return kb * 0.02 + gp * 0.04
      },

      pause (keys, mouse, gamepad) {
        return keys.Escape
      },

      reset (keys, mouse, gamepad) {
        return keys.KeyR
      }
    })

    /*
    const mapColors = []
    for (let i=1; i<=64; i++) {
      mapColors.push({
        value: i,
        identifier: `height_${i}`,
        color: u.colorToString(...u.hsvToRgb(0.5 + ((i-1)/128)%0.5, 1, 1))
      })
    }
    console.log(JSON.stringify(mapColors))
    */
  }

  update () {
    this.inputs.update()
    const scene = getScene()
    this.time += 1

    // walking and friction
    let dx = this.inputs.get('xMove')
    let dy = this.inputs.get('yMove')

    // Stop moving if in menu
    if (this.inMenu) {
      dx = 0
      dy = 0
    }

    // Speech sounds
    if (this.speechQueueIndex < this.speechQueue.length) {
      this.speechQueueIndex ++

      let whitespace = "&nbsp;"
      let str = whitespace +
        this.speechQueue.substring(0, this.speechQueueIndex) +
        whitespace.repeat(this.speechQueue.length - this.speechQueueIndex) +
        whitespace;
      document.getElementById("response").innerHTML = str

      if (this.speechQueueIndex % 3 === 1) {
        const sound = assets.sounds.playerLand
        sound.volume = 0.1
        sound.playbackRate = u.random(0.5, 2)
        sound.currentTime = 0
        sound.play()
      }
    }

    // counter for view bobbing
    if (Math.abs(dx) + Math.abs(dy) > 0) {
      this.walkFrameAccel = 0.08
    } else {
      this.walkFrameAccel = Math.max(this.walkFrameAccel - 0.002, 0)
    }
    this.walkFrames += this.walkFrameAccel
    this.walkFrames = this.walkFrames % (Math.PI * 2)

    // normalize movement so diagonals aren't faster (like in doom)
    if (u.distance2d(0, 0, dx, dy) > 1) {
      [dx, dy] = vec2.normalize([dx, dy])
    }

    // player's max speed should be 11.3583

    const yaw = scene.camera3D.yaw - Math.PI / 2
    const friction = this.slowTime > 0 ? 0.85 : 0.9
    const groundSpeed = 1.262
    const airSpeed = 0.8
    const walkSpeed = this.onGround ? groundSpeed : airSpeed
    const maxSpeed = groundSpeed / (1 - friction)
    const xAccel = (Math.cos(yaw) * dx - Math.sin(yaw) * dy) * walkSpeed
    const yAccel = (Math.sin(yaw) * dx + Math.cos(yaw) * dy) * walkSpeed

    this.slowTime--

    this.moveDirection = vec3.normalize([xAccel, yAccel, 0])
    this.forward = vec3.normalize([Math.sin(yaw), Math.cos(yaw), 0])

    // can't move if diving
    if (this.onGround || !this.timer('disableAirControl')) {
      const lastMagnitude = vec2.magnitude(this.speed)
      this.speed[0] += xAccel
      this.speed[1] += yAccel
      const newMagnitude = vec2.magnitude(this.speed)

      if (u.distance2d(0, 0, this.speed[0] + xAccel, this.speed[1] + yAccel) >= maxSpeed) {
        this.speed[0] *= lastMagnitude / newMagnitude
        this.speed[1] *= lastMagnitude / newMagnitude
      }

      // scene.camera3D.yaw += dx*0.025
    }

    let grav = this.speed[2] < 0 ? 0.6 : 0.35
    if (this.slowTime > 0) {
      grav *= 1.7
    }
    this.speed[2] -= grav

    if (this.onGround) {
      this.speed[0] *= friction
      this.speed[1] *= friction
      this.canDash = true
      this.cancelTimer('disableAirControl')

      // land
      if (!this.wasOnGround && this.lastFallSpeed < -5) {
        this.stretch = [1.6, 0.5]
        // const sound = assets.sounds.playerLand
        // sound.volume = 0.1
        // sound.playbackRate = u.random(1, 1.2)
        // sound.currentTime = 0
        // sound.play()
      }
    } else {
      this.lastFallSpeed = this.speed[2]
    }



    if (!this.inputs.get('jump') && this.speed[2] >= 0) {
      this.speed[2] /= 1.25
    }
    // if (this.position[2] < 0) {
    //   // assets.sounds.playerSplash.play()
    //   // resetScene()
    //   this.dead = true
    // }
    this.staircaseOffset = Math.max(this.staircaseOffset - 6, 0)
    this.disableAirControl = Math.max(this.disableAirControl - 1, 0)

    if (this.inputs.get('changeWeapon') && !this.inMenu) {
      if (!this.changeWeaponEdge) {
        this.changeWeaponEdge = true

        if (globals.powerup == "pointer") {
          globals.powerup = "tranq"

          const sound = assets.sounds.deploy
          sound.playbackRate = u.random(1, 1.3)
          sound.currentTime = 0
          sound.volume = 1
          sound.play()
        }
        else {
          globals.powerup = "pointer"

          const sound = assets.sounds.holster
          sound.playbackRate = u.random(0.7, 1.3)
          sound.currentTime = 0
          sound.volume = 1
          sound.play()
        }
      }
    }
    else {
      this.changeWeaponEdge = false
    }

    // shooting
    if (this.inputs.get('shoot') && !this.timer('shoot') && !this.inMenu) {
      this.after(16, () => {}, 'shoot')
      this.after(12, () => {}, 'fire')
      const look = vec3.multiply(getScene().camera3D.lookVector, -1)
      const side = vec3.crossProduct([0, 0, 1], look)
      let pos = vec3.add(this.position, vec3.multiply(side, 16))
      pos = vec3.add(pos, [0, 0, -14])

      if (globals.powerup === 'pointer') {
        // Animation and Timing
        this.after(1, () => {}, 'shoot')
        this.after(1, () => {}, 'fire')

        // Create bullet
        getScene().addThing(new Pointer(pos, look, 45, this))
      } else {
        // Animation and Timing
        this.after(16, () => {}, 'shoot')
        this.after(12, () => {}, 'fire')

        // Create bullet
        getScene().addThing(new Bullet(pos, look, 45, this))

        const sound = assets.sounds.machinegun
        sound.playbackRate = u.random(1, 1.3)
        sound.currentTime = 0
        sound.volume = 0.6
        sound.play()
        /*
        const sound = assets.sounds.pistolShoot
        sound.currentTime = 0
        sound.playbackRate = u.random(0.9, 1.1)
        sound.play()

        */

        this.speed[0] -= look[0] * 1
        this.speed[1] -= look[1] * 1
        this.speed[2] -= look[2] * 0.5
      }
    }

    // step sounds
    if (this.onGround) {
      this.stepCounter += vec2.magnitude(this.speed)
      const interval = 150
      if (this.stepCounter > interval) {
        this.stepCounter -= interval
        const sound = u.choose(
          assets.sounds.footstep1,
          assets.sounds.footstep2
          // assets.sounds.footstep3
        )
        sound.playbackRate = u.random(0.9, 1.1)
        sound.volume = 0.25
        sound.currentTime = 0
        sound.play()
      }
    }

    this.moveAndCollide()
    this.updateTimers()
    this.cameraUpdate()
  }

  moveAndCollide () {
    this.position[0] += this.speed[0]
    this.position[1] += this.speed[1]
    this.position[2] += this.speed[2]
    this.wasOnGround = this.onGround
    this.onGround = false

    // colliders are just triangles considered solid
    const colliderList = getThing('terrain').query(this.position[0] - 64, this.position[1] - 64, 128, 128)

    // floor collisions
    for (const collider of colliderList) {
      const { normal, points } = collider
      if (normal[2] < 0.7) continue
      const position = [...this.position]
      position[2] -= this.height

      if (!vec3.isInsideTriangle(...points, [0, 0, 1], position)) {
        continue
      }

      const distance = vec3.distanceToTriangle(points[0], normal, position)
      if (distance > 0) continue
      if (distance < -64) continue

      const dot = vec3.dotProduct(this.speed, normal)
      this.speed[2] -= dot * normal[2]
      this.position[2] += normal[2] * (-1 * distance)
      this.onGround = true

      if (this.wasOnGround && distance < 0) {
        this.staircaseOffset = Math.min(
          this.staircaseOffset + Math.abs(distance),
          48
        )
      }
    }

    // wall/ceiling collisions
    for (const collider of colliderList) {
      const { normal, points } = collider
      if (normal[2] >= 0.7) continue

      const fakeNormal = vec3.findMostSimilarVector(normal, [
        [0, 0, -1],
        [1, 0, 0],
        [-1, 0, 0],
        [0, 1, 0],
        [0, -1, 0]
      ])

      const stepHeight = this.onGround ? 48 : 16
      for (let h = stepHeight; h <= 64; h += 16) {
        const position = [...this.position]
        position[2] += h - this.height

        if (!vec3.isInsideTriangle(...points, fakeNormal, position)) {
          continue
        }

        const distance = vec3.distanceToTriangle(points[0], normal, position)
        if (distance > this.width) continue
        if (distance < -1 * this.width) continue

        const dot = vec3.dotProduct(this.speed, normal)
        if (dot < 0) {
          this.speed[0] -= dot * normal[0]
          this.speed[1] -= dot * normal[1]
          this.speed[2] -= dot * normal[2]
        }
        const push = (this.width - distance) / 10
        this.position[0] += normal[0] * push
        this.position[1] += normal[1] * push
        this.position[2] += normal[2] * push
      }
    }
  }

  getClosestWall () {
    let closest = null
    let closestDistance = 0
    const position = [...this.position]
    position[2] -= this.height / 2

    for (const collider of getThing('terrain').query(this.position[0] - 64, this.position[1] - 64, 128, 128)) {
      const { normal, points } = collider
      if (normal[2] >= 0.7) continue

      if (!vec3.isInsideTriangle(...points, normal, position)) {
        continue
      }

      const distance = vec3.distanceToTriangle(points[0], normal, position)
      if (distance > this.width * 1.25) continue
      if (distance < -1 * this.width) continue

      let dot = Math.abs(vec3.dotProduct(this.moveDirection, normal))
      if (vec3.magnitude(this.moveDirection) === 0) {
        dot = Math.abs(vec3.dotProduct(this.forward, normal))
      }
      if (dot > closestDistance) {
        closestDistance = dot
        closest = collider
      }
    }

    return closest
  }

  cameraUpdate () {
    const scene = getScene()

    // mouse look
    if (mouse.click && !this.inMenu) {
      mouse.lock()
    }

    if (mouse.isLocked()) {
      scene.camera3D.yaw += mouse.delta[0] / 500
      scene.camera3D.pitch += mouse.delta[1] / 500
    }
    scene.camera3D.yaw += this.inputs.get('xLook')
    scene.camera3D.pitch += this.inputs.get('yLook')
    if (this.faceSource === null) {
      scene.camera3D.position = [
        this.position[0],
        this.position[1],
        Math.max(this.position[2] - this.staircaseOffset, 32)
      ]
    }
    
  }

  draw () {
    gfx.setShader(assets.shaders.defaultShaded)
    gfx.set('viewMatrix', [
      1, 0, 0, 0,
      0, 0, 1, 0,
      0, 1, 0, 0,
      0, 0, 0, 1
    ])

    let knockback = this.timer('fire') ? 1 - this.timer('fire') : 0
    knockback *= Math.PI / 4
    gfx.set('projectionMatrix', mat.getPerspective({ fovy: Math.PI / 4 }))

    // View bobbing
    const t = this.walkFrames
    const bobX = Math.sin(t) * 2 * 0.15
    const bobY = Math.cos(2 * t) * -0.5 * 0.15
    if (knockback > 0) {
      this.walkFrames = 0
    }

    // Animation
    if (globals.powerup === 'pointer') {
      // No viewmodel
    } else {
      gfx.set('modelMatrix', mat.getTransformation({
        translation: [bobX - 2, -7 + knockback * 0.1, bobY - 1.8 - (knockback * 0.2)],
        rotation: [0, -knockback * 0.8, Math.PI / -2],
        scale: 64
      }))
      gfx.set('color', [0.21, 0.2, 0.205, 1])
      gfx.setTexture(assets.textures.square)
      gfx.drawMesh(assets.models.tranq)
    }
  }

  guiDraw () {
    if (!this.showGui) return

    // time
    // ctx.save()
    // ctx.font = 'italic bold 64px Times New Roman'
    // ctx.textAlign = 'center'
    // ctx.translate(width / 2, height - 48)
    // let scale = this.timer('timeBonus') ? u.map(this.timer('timeBonus') ** 2, 0, 1, 2.5, 1, true) : 1
    // scale = Math.max(scale, this.timer('timeWarning') ? u.map(this.timer('timeWarning') ** 2, 0, 1, 1.5, 1, true) : 1)
    // ctx.scale(scale, scale)
    // const seconds = Math.max(this.time / 60, 0)
    // const time = seconds.toFixed(0)
    // ctx.fillStyle = 'black'
    // if (this.timer('timeWarning')) {
    //   ctx.fillStyle = 'black'
    // }
    // ctx.fillText(time, -4, 4)
    // ctx.fillStyle = 'white'
    // if (this.timer('timeWarning')) {
    //   ctx.fillStyle = 'red'
    // }
    // ctx.fillText(time, 0, 0)
    // ctx.restore()

    // crosshair
    if (!this.inMenu) {
      ctx.drawImage(assets.images.crosshair, width / 2 - 16, height / 2 - 16)
    }

    // Organs
    let organScale = 128
    let organs = levelData.data[globals.level-1].organs
    let pos = 1
    for (let organ of organs) {
      ctx.drawImage(assets.images[organ], width - (pos * organScale), height - organScale, organScale, organScale)
      pos += 1
    }

    // Level
    ctx.save()
    ctx.translate(32, height - 48)
    ctx.font = 'italic 32px Times New Roman'
    {
      const str = 'Level: ' + globals.level
      ctx.fillStyle = 'black'
      ctx.fillText(str, 0, 0)
      ctx.fillStyle = 'white'
      ctx.fillText(str, 4, -4)
    }
    ctx.restore()

    // Tranq hint
    if (globals.level <= 2 && this.hasConvincedPerson) {
      ctx.save()
      ctx.translate(32, height - 96)
      ctx.font = 'italic 32px Times New Roman'
      {
        const str = 'Press \'Q\' to draw tranquilizer'
        ctx.fillStyle = 'black'
        ctx.fillText(str, 0, 0)
        ctx.fillStyle = 'white'
        ctx.fillText(str, 4, -4)
      }
      ctx.restore()
    }

  }

  onDeath () {
    getScene().addThing(new DeathAnim())
  }

  // Menu stuff
  closeTitleMenu = () => {
    this.inMenu = false

    // Hide menu
    document.getElementById("levelMenu").setAttribute("hidden", true)

    // Switch the mouse back to first-person mode
    game.mouse.lock()
  }

  setMenuData() {
    // Make sure menu is shown
    document.getElementById("levelMenu").removeAttribute("hidden")
    document.getElementById("finishMenu").setAttribute("hidden", true)
    game.mouse.unlock()
    this.inMenu = true

    // Set menu data
    let lvl = globals.level - 1
    document.getElementById("promptText").innerHTML = levelData.data[lvl].prompt
    document.getElementById("closeButton").onclick = this.closeTitleMenu
    if (levelData.data[lvl].finale) {
      document.getElementById("titleText").innerText = "Congratulations!"
      document.getElementById("closeButton").setAttribute("hidden", true)
    }
    else {
      document.getElementById("titleText").innerText = "Level " + (lvl + 1)

    }

    // Create Organ graphics
    let imageDiv = document.getElementById("organImages")
    imageDiv.innerHTML = ''; // Clear existing graphics
    for (let organ of levelData.data[lvl].organs) {
      // Organ graphic
      let img = document.createElement("img");
      img.setAttribute("src", "images/" + organ + ".png")
      img.setAttribute("width", 192)
      img.setAttribute("height", 192)
      img.setAttribute("class", "organImage")
      imageDiv.appendChild(img)
    }
  }

  targetAcquired(person) {
    // Set this person as the chosen target
    this.faceTarget = person.position
    this.faceSource = this.position

    // Show menu
    game.mouse.unlock()
    this.inMenu = true

    // Determine a win or loss
    let lvl = globals.level - 1
    const qualitiesBanned = levelData.data[lvl].qualities_banned
    const qualitiesRequired = levelData.data[lvl].qualities_required
    let failures = []
    // Check that none of the banned qualities are present in this target
    for (let entry of qualitiesBanned) {
      if (person.qualities.includes(entry.quality)) {
        failures.push(entry)
      }
    }
    // Check that all of the required qualities are present in this target
    for (let entry of qualitiesRequired) {
      if (!person.qualities.includes(entry.quality)) {
        failures.push(entry)
      }
    }

    // Determine if arrested
    let bystanders = game.findByClass("Person")
    let caught = false
    for (let bystander of bystanders) {
      // Make sure this bystander isn't the target
      if (bystander.tranquilized) {
        continue
      }

      // Make sure this bystander doesn't have the 'blind' quality
      if (bystander.qualities.includes('blind')) {
        continue
      }

      let start = vec3.add(person.position, [0, 0, 32])
      let end = vec3.add(bystander.position, [0, 0, 32])
      let collision = vec3.rayTrace(start, end)

      // They have line of sight to you. You were caught!
      if (!collision) {
        caught = true
        bystander.caughtYou = true
        this.faceTarget = bystander.position
        this.faceSource = vec3.add(person.position, [0, 0, 32])

        // Check if they have line of sight to you, to determine whether the camera needs to be adjusted
        let start2 = vec3.add(this.position, [0, 0, 32])
        let collision2 = vec3.rayTrace(start2, end)
        if (!collision2) {
          this.faceSource = this.position
        }
      }
    }
    // If at least one bystander saw you, you get arrested
    if (caught) {
      failures = [
        {
          quality: "",
          organ: "all",
          issue: "You were caught in the act!",
          solution: "Make sure to take your victim to a secluded location."
        },
      ]
    }

    // Create Organ graphics
    let imageDiv = document.getElementById("organImagesFinish")
    imageDiv.innerHTML = ''; // Clear existing graphics
    for (let organ of levelData.data[lvl].organs) {
      // Determine if the organ is bad. If so, cross it out
      let organBad = false
      for (let failure of failures) {
        if (failure.organ === organ || failure.organ === "all") {
          organBad = true
          break
        }
      }

      // Organ graphic
      let organName = organBad ? (organ + "_bad") : organ
      let img = document.createElement("img");
      img.setAttribute("src", "images/" + organName + ".png")
      img.setAttribute("width", 192)
      img.setAttribute("height", 192)
      img.setAttribute("class", "organImage")
      imageDiv.appendChild(img)
    }

    if (failures.length == 0) {
      game.getScene().addThing(new EndMenu(failures))
      //this.endLevelSuccess()
    }
    else {
      game.getScene().addThing(new EndMenu(failures))
      //this.endLevelFailure()
    }

  }

  endLevelSuccess() {
    // Set menu data
    document.getElementById("finishMenu").removeAttribute("hidden")
    let lvl = globals.level - 1
    document.getElementById("titleTextFinish").innerText = "Level " + (lvl + 1) + " Complete!"
    document.getElementById("issueText").innerText = ""
    document.getElementById("solutionText").innerText = ""
    document.getElementById("closeButtonFinish").innerText = "Next Level"
    document.getElementById("closeButtonFinish").onclick = this.nextLevel
  }

  endLevelFailure(failures) {
    // Parse failures data
    let issueText = failures.length > 1 ? "Issues: " : "Issue: "
    for (let failure of failures) {
      issueText += failure.issue + ", "
    }
    issueText = issueText.substring(0, issueText.length-2)

    // Set menu data
    document.getElementById("finishMenu").removeAttribute("hidden")
    let lvl = globals.level - 1
    document.getElementById("titleTextFinish").innerText = "Level " + (lvl + 1) + " Failed"
    document.getElementById("issueText").innerText = issueText
    document.getElementById("solutionText").innerText = failures[0].solution
    document.getElementById("closeButtonFinish").innerText = "Retry"
    document.getElementById("closeButtonFinish").onclick = this.retryLevel
  }

  nextLevel() {
    globals.level += 1
    game.resetScene()
  }

  retryLevel() {
    game.resetScene()
  }

  // Conversation stuff
  weightedSelection(list, seed) {
    let sum = 0
    for (let entry of list) {
      sum += entry.weight
    }
    let selected = seed % sum
    for (let entry of list) {
      selected -= entry.weight
      if (selected < 0) {
        return entry.value
      }
    }
    return list[0].value
  }

  askQuestion = (e) => {
    // Get the question id
    let question_id = e.srcElement.id

    // Determine impatience
    if (questions.data[question_id].impatience_qualities.length > 0) {
      let impatient = true
      for (let quality of this.talkingTo.qualities) {
        if (questions.data[question_id].impatience_qualities.includes(quality)) {
          impatient = false
          break
        }
      }
      if (impatient) {
        this.talkingTo.patience --
        if (this.talkingTo.patience <= 0) {
          this.talkingTo.friendliness = -1000
          this.talkingTo.following = false
          this.talkingTo.followingEnabled = false
        }
      }
    }

    let mode = "default"
    for (let quality of this.talkingTo.qualities) {
      if (("responses_" + quality) in questions.data[question_id]) {
        mode = quality
      }
    }
    this.talkingTo.recentResponse = this.weightedSelection(questions.data[question_id]["responses_" + mode], this.talkingTo.conversationSeed)
    if (this.talkingTo.patience <= 0) {
      this.talkingTo.recentResponse = this.weightedSelection(
        [
          { value: "It's obvious you're not listening to me, so go away.", weight: 100 },
          { value: "This conversation feels rather one-sided. Please stop talking to me.", weight: 100 },
          { value: "Are you even listening to a word that comes out of my mouth? Please go away.", weight: 80 },
          { value: "I've told you I'm not interested. Fuck off.", weight: 80 },
          { value: "It seems like you just enjoy hearing yourself talk. Go away.", weight: 20 },
        ]
        , this.talkingTo.conversationSeed)
    }

    // Add question to already asked list
    this.talkingTo.alreadyAsked.push(question_id)

    // Add friendliness
    const friendlyQualities = questions.data[question_id].friendliness_qualities
    for (let quality of this.talkingTo.qualities) {
      if (friendlyQualities.includes(quality)) {
        this.talkingTo.friendliness += 10
      }
    }
    if (friendlyQualities.includes("all")) {
      this.talkingTo.friendliness += 10
    }

    // Add conversation relevance
    for (let topic in questions.data[question_id].topic_relevance) {
      let added = questions.data[question_id].topic_relevance[topic].added
      this.talkingTo.topicRelevance[topic] = (this.talkingTo.topicRelevance[topic] || 0) + added
    }

    // Some questions will cause the NPC to follow you under certain conditions
    for (let cond of questions.data[question_id].follow_conditions) {
      if (cond === "any" || this.talkingTo.qualities.includes(cond)) {
        this.talkingTo.followingEnabled = true
        this.after(60*4, () => {this.hasConvincedPerson = true})
      }
    }

    // Finish by setting the conversation data anew
    this.setConversationData()
  }

  setConversationData() {
    // Speech queue
    document.getElementById("response").innerHTML = "_"
    this.speechQueue = this.talkingTo.recentResponse
    this.speechQueueIndex = 0

    // Clear existing question buttons
    let talkContainer = document.getElementById("talkContainer")
    talkContainer.innerHTML = '';

    for (var question in questions.data) {
      let q = questions.data[question]

      // Check question hasn't already been asked
      if (this.talkingTo.alreadyAsked.includes(question)) {
        continue
      }

      // Check friendliness score
      if (this.talkingTo.friendliness < q.friendliness_required) {
        continue
      }

      // Check minimum level
      if (globals.level < q.level_required) {
        continue
      }

      // Check conversation relevance
      let relevant = true
      for (let topic in q.topic_relevance) {
        // Track number of topics this question is relevant to
        let theirRelevance = this.talkingTo.topicRelevance[topic] || 0
        if (theirRelevance < q.topic_relevance[topic].required) {
          relevant = false
          break
        }
      }
      if (!relevant) {
        continue
      }

      // All checks passed, render the question
      const newButton = document.createElement("button");
      newButton.innerText = this.weightedSelection(q.options, this.talkingTo.conversationSeed)
      newButton.id = question
      newButton.className = "talkButton"
      newButton.onclick = this.askQuestion
      talkContainer.appendChild(newButton)
    }

    // Set the exit buttons
    let followButton = document.getElementById("followButton")
    if (this.talkingTo.followingEnabled) {
      followButton.removeAttribute("hidden")
      followButton.onclick = () => {this.talkingTo.following = true; this.closeMenu()}
      followButton.innerText = "Follow me!"
      document.getElementById("exitButton").innerText = "Wait here."
    }
    else {
      followButton.setAttribute("hidden", true)
      document.getElementById("exitButton").innerText = "See ya."
    }
    document.getElementById("exitButton").onclick = () => {this.talkingTo.following = false; this.closeMenu()}

  }

  closeMenu = () => {
    this.inMenu = false

    // Hide menu
    document.getElementById("guiContainer").setAttribute("hidden", true)

    // Switch the mouse back to first-person mode
    game.mouse.lock()

    // End speech sounds
    this.speechQueue = ""
    this.speechQueueIndex = 0
  }

  openMenu(person) {
    this.inMenu = true
    this.talkingTo = person
    this.talkingTo.talkedTo = true
    this.talkingTo.facingAngle = ((Math.PI / 2) - game.getScene().camera3D.yaw) % (Math.PI * 2)

    // Reset some data on the person
    // this.talkingTo.alreadyAsked = []
    this.talkingTo.recentResponse = "..."

    // Show menu
    let menu = document.getElementById("guiContainer")
    menu.removeAttribute("hidden")

    // Set data
    this.setConversationData()

    game.mouse.unlock()
  }
}
