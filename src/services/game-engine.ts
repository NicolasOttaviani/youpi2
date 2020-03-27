import { Ground, Block, GameEngineOptions, Position, KEYS } from '../types'
import {
  default as Matter,
  IEventCollision,
  IChamferableBodyDefinition,
  Body as BodyClass,
  World as WorldClass,
  IPair,
  Constraint as ConstraintClass,
} from 'matter-js'

export interface GameEngineCallbacks {
  goal: (team: string) => void
  winner: (team: string) => void
  refresh: (positions: Position[]) => void
}

const { Engine, Bodies, World, Events, Body, Vector, Constraint } = Matter

export interface Score {
  team1: number
  team2: number
}

export interface GameEngine {
  destroy(): void
  getScore(): Score
  keyPress(index: number, code: number): void
  keyRelease(index: number, code: number): void
}

export function gameEngine(
  ground: Ground,
  callbacks: GameEngineCallbacks,
  options: GameEngineOptions,
): GameEngine {
  const { goal, winner, refresh } = callbacks
  const { maxGoal } = options
  const borderOptions: IChamferableBodyDefinition = {
    isStatic: true,
    restitution: options.border.restitution,
    friction: options.border.friction,
    slop: 0,
  }
  const goal1Options: IChamferableBodyDefinition = {
    label: 'team2',
    isStatic: true,
  }
  const goal2Options: IChamferableBodyDefinition = {
    label: 'team1',
    isStatic: true,
  }
  const playerOptions: IChamferableBodyDefinition = {
    slop: 0,
    frictionAir: options.player.frictionAir,
    mass: options.player.mass,
    inertia: options.player.inertia,
  }
  const ballOptions: IChamferableBodyDefinition = {
    label: 'ball',
    restitution: options.ball.restitution,
    frictionAir: options.ball.frictionAir,
    slop: 0,
  }

  const engine = Engine.create({ velocityIterations: 16 })
  const world = engine.world
  world.gravity = { x: 0, y: 0, scale: 1 }
  const { players, ball } = drawGround(ground, world, options.player.force)
  const defaultPositions = {
    ball: { ...ball.position },
    players: players.map(({ body }) => ({ ...body.position })),
  }
  const score: Score = {
    team1: 0,
    team2: 0,
  }

  Engine.run(engine)
  Events.on(engine, 'beforeUpdate', handleBeforeUpdate)
  Events.on(engine, 'afterUpdate', handleAfterUpdate)
  Events.on(engine, 'collisionStart', handleCollisionStart)
  Events.on(engine, 'collisionEnd', handleCollisionEnd)

  return {
    keyPress(index, code) {
      const player = players[index]
      if (!player) throw new Error(`Could not find player index '${index}`)
      player.keyPress(code)
    },
    keyRelease(index, code) {
      const player = players[index]
      if (!player) throw new Error(`Could not find player index '${index}`)
      player.keyRelease(code)
    },
    getScore() {
      return score
    },
    destroy() {
      Events.off(engine, 'beforeUpdate', handleBeforeUpdate)
      Events.off(engine, 'afterUpdate', handleAfterUpdate)
      Events.off(engine, 'collisionStart', handleCollisionStart)
      Events.off(engine, 'collisionEnd', handleCollisionEnd)
    },
  }

  function handleCollisionStart(event: IEventCollision<void>) {
    event.pairs.forEach(pair => {
      handleGoalCollistion(pair)
      handleBallCollision(pair)
    })
  }

  function handleCollisionEnd(event: IEventCollision<void>) {
    event.pairs.forEach(pair => {
      const typeA: string = pair.bodyA.label
      const typeB: string = pair.bodyB.label

      if (typeA === ballOptions.label) {
        if (typeB.indexOf('player') > -1) {
          const index = parseInt(typeB.substring(6))
          const player = players[index]
          player.hasBall = false
        }
      }
    })
  }

  function handleBallCollision(pair: IPair) {
    const typeA: string = pair.bodyA.label
    const typeB: string = pair.bodyB.label
    if (typeA === ballOptions.label) {
      if (typeB.indexOf('player') > -1) {
        const index = parseInt(typeB.substring(6))
        const player = players[index]
        player.hasBall = true
      }
    }
  }

  function handleGoalCollistion(pair: IPair) {
    const typeA: string = pair.bodyA.label
    const typeB: string = pair.bodyB.label
    let newScore: number | undefined

    if (typeB === ballOptions.label) {
      if (typeA === goal2Options.label) {
        score.team1 += 1
        newScore = score.team1
      } else if (typeA === goal1Options.label) {
        score.team2 += 1
        newScore = score.team2
      }
      if (newScore !== undefined) {
        if (newScore >= maxGoal) {
          winner(typeA)
          return
        }
        handleTableReset()
        handleBeforeUpdate()
        goal(typeA)
      }
    }
  }

  function handleBeforeUpdate() {
    clampPositions()
  }

  function handleAfterUpdate() {
    refresh([ball.position, ...players.map(({ body }) => body.position)])
  }

  function clampPositions() {
    const clamp = 60
    const ballVelocity = ball.velocity
    if (ball.velocity.x > clamp) {
      ballVelocity.x = clamp
    }
    if (ball.velocity.y > clamp) {
      ballVelocity.y = clamp
    }
    Body.setVelocity(ball, ballVelocity)
    clampPosition(ball)
    players.forEach(player => {
      player.update()
      clampPosition(player.body)
    })
  }

  function clampPosition(body: BodyClass) {
    const projectedX = body.position.x + body.velocity.x
    const projectedY = body.position.y + body.velocity.y

    if (projectedX > options.width) {
      Body.setPosition(body, {
        x: options.width - options.margin,
        y: body.position.y,
      })
    }
    if (projectedX < 0) {
      Body.setPosition(body, { x: options.margin, y: body.position.y })
    }
    if (projectedY > options.height) {
      Body.setPosition(body, {
        x: body.position.x,
        y: options.height - 2 * options.margin,
      })
    }
    if (projectedY < 0) {
      Body.setPosition(body, { x: body.position.x, y: 0 + 2 * options.margin })
    }
  }

  function handleTableReset() {
    Body.setPosition(ball, defaultPositions.ball)
    Body.setVelocity(ball, { x: 0, y: 0 })
    Body.setAngularVelocity(ball, 0)
    defaultPositions.players.forEach((position, index) => {
      const { body } = players[index]
      Body.setPosition(body, position)
      Body.setVelocity(body, { x: 0, y: 0 })
      Body.setAngularVelocity(body, 0)
    })
  }
  function drawGround(ground: Ground, world: WorldClass, force: number) {
    const all: (BodyClass | ConstraintClass)[] = []
    ground.borders.forEach(elem => draw(all, elem, borderOptions))
    const goal1 = draw(all, ground.goal1, goal1Options)
    const goal2 = draw(all, ground.goal2, goal2Options)
    const ball = draw(all, ground.ball, ballOptions)
    const players = ground.players.map((elem, index) => {
      const label = `player${index}`
      const body = draw(all, elem, { ...playerOptions, label })
      if (!elem.circle) {
        throw new Error('Oh no, i need to implement rectangle player')
      }
      const sensorElem = {
        circle: { x: elem.circle.x, y: elem.circle.y, r: elem.circle.r + 5 },
      }
      const sensor = draw(all, sensorElem, {
        isSensor: true,
        label,
      })
      all.push(Constraint.create({ bodyA: body, bodyB: sensor }))
      return new Player(body, ball, force)
    })
    World.add(world, all as any)
    return { goal1, goal2, players, ball }
  }

  function draw(
    bodies: (BodyClass | ConstraintClass)[],
    elem: Block,
    options: IChamferableBodyDefinition,
  ) {
    let body: BodyClass | undefined
    if (elem.rect) {
      const { x, y, w, h } = elem.rect
      body = Bodies.rectangle(x + w / 2, y + h / 2, w, h, options)
    } else if (elem.circle) {
      const { x, y, r } = elem.circle
      body = Bodies.circle(x, y, r, options)
    }
    if (!body) {
      throw new Error('Could not find rect or circle ?!')
    }
    bodies.push(body)
    return body
  }
}

interface Keys {
  up: boolean
  down: boolean
  left: boolean
  right: boolean
  shoot: boolean
}
const defaultKeys = {
  up: false,
  down: false,
  left: false,
  right: false,
  shoot: false,
}

class Player {
  body: BodyClass
  ball: BodyClass
  force: number
  keys: Keys = { ...defaultKeys }
  hasBall = false
  constructor(body: BodyClass, ball: BodyClass, force: number) {
    this.body = body
    this.force = force
    this.ball = ball
  }
  keyPress(code: number) {
    if (code === KEYS.LEFT) this.keys.left = true
    else if (code === KEYS.RIGHT) this.keys.right = true
    else if (code === KEYS.DOWN) this.keys.down = true
    else if (code === KEYS.UP) this.keys.up = true
    else if (code === KEYS.SHOOT) this.keys.shoot = true
  }
  keyRelease(code: number) {
    if (code === KEYS.LEFT) this.keys.left = false
    else if (code === KEYS.RIGHT) this.keys.right = false
    else if (code === KEYS.DOWN) this.keys.down = false
    else if (code === KEYS.UP) this.keys.up = false
    else if (code === KEYS.SHOOT) this.keys.shoot = false
  }
  releaseAll() {
    this.keys = { ...defaultKeys }
  }
  update() {
    const forceVector = { x: 0, y: 0 }
    if (this.keys.left) forceVector.x = forceVector.x - this.force
    if (this.keys.right) forceVector.x = forceVector.x + this.force
    if (this.keys.up) forceVector.y = forceVector.y - this.force
    if (this.keys.down) forceVector.y = forceVector.y + this.force
    Body.applyForce(this.body, this.body.position, forceVector)

    if (this.keys.shoot && this.hasBall) {
      const force = 0.1
      const deltaVector = Vector.sub(this.ball.position, this.body.position)
      const normalizedDelta = Vector.normalise(deltaVector)
      const forceVector = Vector.mult(normalizedDelta, force)
      Body.applyForce(this.ball, this.ball.position, forceVector)
    }
  }
}
