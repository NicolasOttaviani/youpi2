<script lang="ts">
  import Matter from 'matter-js'

  const { Engine, Render, World, Bodies, Body, Events } = Matter

  function init(elem: Element) {
    let canMove = false
    const force = 0.01
    const paddleClamp = 0.05
    const engine = Engine.create({ velocityIterations: 16 })
    const world = engine.world
    world.gravity = { x: 0, y: 0 }

    const render = Render.create({
      element: document.body,
      engine: engine,
      options: {
        height: 800,
        width: 1800,
        wireframes: false,
        showBounds: true,
        background: '#e84',
      },
    })

    const paddle1 = Bodies.circle(100, 304, 30, {
      slop: 0,
      frictionAir: 1,
      inverseInertia: 0,
    })

    const paddle2 = Bodies.circle(868, 304, 30, {
      slop: 0,
      frictionAir: 1,
      inverseInertia: 0,
    })

    const puck = Bodies.circle(484, 304, 20, {
      label: 'puck',
      restitution: 0.5,
      friction: 0,
      frictionAir: 0.02,
      slop: 0,
    })

    const goal1 = Bodies.rectangle(0, 0, 64, 180, {
      label: 'goal-1',
      isStatic: true,
      render: {
        fillStyle: '#673AB7',
      },
    })

    const goal2 = Bodies.rectangle(968, 304, 64, 180, {
      label: 'goal-2',
      isStatic: true,
      render: {
        fillStyle: '#673AB7',
      },
    })

    const tableBackLeft = Bodies.rectangle(0, 117, 128, 234, {
      isStatic: true,
      restitution: 0.9,
      friction: 1,
      slop: 0,
    })

    const tableBackRight = Bodies.rectangle(0, 491, 128, 234, {
      isStatic: true,
      restitution: 0.9,
      friction: 1,
      slop: 0,
    })

    const tableFrontLeft = Bodies.rectangle(968, 117, 128, 234, {
      isStatic: true,
      restitution: 0.9,
      friction: 1,
      slop: 0,
    })

    const tableFrontRight = Bodies.rectangle(491, 968, 128, 234, {
      isStatic: true,
      restitution: 0.9,
      friction: 1,
      slop: 0,
    })

    const tableSideLeft = Bodies.rectangle(900, 38, 1800, 64, {
      isStatic: true,
      restitution: 0.9,
      friction: 1,
      slop: 0,
      render: {
        fillStyle: '#666',
      },
    })

    const tableSideRight = Bodies.rectangle(638, 608, 988, 64, {
      isStatic: true,
      restitution: 0.9,
      friction: 1,
      slop: 0,
    })

    World.add(engine.world, [
      puck,
      paddle1,
      paddle2,
      goal1,
      goal2,
      tableBackLeft,
      tableBackRight,
      tableFrontLeft,
      tableFrontRight,
      tableSideLeft,
      tableSideRight,
    ])

    generateBoxCorner(48, { x: 48, y: 94 }, false, false, 8, world, '#fff')
    generateBoxCorner(48, { x: 88, y: 568 }, false, true, 8, world, '#673AB7')
    generateBoxCorner(48, { x: 880, y: 40 }, true, false, 8, world, '#673AB7')
    generateBoxCorner(48, { x: 880, y: 568 }, false, false, 8, world, '#673AB7')

    function generateBoxCorner(
      size,
      startVector,
      flipVertical,
      flipHorizontal,
      detail,
      world,
      color,
    ) {
      for (let i = 0; i < detail; i++) {
        let vectorOffset = (size / (detail - 1)) * i
        let vectorOffsetX = vectorOffset
        let vectorOffsetY = vectorOffset
        let rotationStepInDegrees = 90 / (detail - 1)
        let rotation = rotationStepInDegrees * i
        if (flipVertical === true) {
          vectorOffsetX *= -1
          rotation *= -1
        }
        if (flipHorizontal === true) {
          vectorOffsetY *= -1
          rotation *= -1
        }
        const body = Bodies.rectangle(
          startVector.x + vectorOffsetX,
          startVector.y - vectorOffsetY,
          size,
          size * 2,
          {
            isStatic: true,
            render: {
              fillStyle: color,
            },
          },
        )
        Body.rotate(body, rotation * (Math.PI / 180))
        World.add(world, body)
      }
    }

    function handleCollision(event) {
      const pairs = event.pairs
      pairs.forEach(function(pair) {
        const containsPuck = pair.bodyA.label === 'puck'
        const containsGoal =
          pair.bodyB.label === 'goal-1' || pair.bodyB.label === 'goal-2'
        if (containsPuck && containsGoal) {
          handleTableReset()
        }
      })
    }

    function handleTableReset() {
      Body.setPosition(puck, { x: 484, y: 304 })
      Body.setVelocity(puck, { x: 0, y: 0 })
      Body.setAngularVelocity(puck, 0)
      Body.setPosition(paddle1, { x: 100, y: 304 })
      Body.setVelocity(paddle1, { x: 0, y: 0 })
      Body.setAngularVelocity(paddle1, 0)
      Body.setPosition(paddle2, { x: 868, y: 304 })
      Body.setVelocity(paddle2, { x: 0, y: 0 })
      Body.setAngularVelocity(paddle2, 0)
    }

    function handleBeforeUpdate() {
      /*
    const clamp = 60
    const clampedVelocity = puck.velocity
    if(puck.velocity.X > clamp) {
      clampedVelocity.x = clamp
    }
    if(puck.velocity.y > clamp) {
      clampedVelocity.y = clamp
    }
    Body.setVelocity(puck, clampedVelocity)
    clampPaddlePosition(paddle1)
    clampPaddlePosition(paddle2)
    */

      if (canMove) {
        console.log(new Date().getTime())
      }
    }

    function updatePosition(e) {
      if (canMove) {
        const vector = { x: e.movementX * force, y: e.movementY * force }
        Body.applyForce(paddle2, paddle2.position, vector)
      }
    }

    function unlock() {
      canMove = document.pointerLockElement === render.canvas ? true : false
    }

    function clampPaddlePosition(paddle) {
      const projectedX = paddle.position.x + paddle.velocity.x
      const projectedY = paddle.position.y + paddle.velocity.y
      Body.setPosition(paddle, { x: paddle.position.x, y: paddle.position.y })
    }

    Engine.run(engine)
    Render.run(render)
    Events.on(engine, 'beforeUpdate', () => handleBeforeUpdate())
    Events.on(engine, 'collisionStart', event => handleCollision(event))
    window.addEventListener('mousemove', e => updatePosition(e))
    render.canvas.addEventListener('click', () =>
      render.canvas.requestPointerLock(),
    )
    document.addEventListener('pointerlockchange', () => unlock())
  }
</script>

<div use:init />
