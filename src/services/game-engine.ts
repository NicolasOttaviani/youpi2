import { Ground, Block, Options, Position, KEYS } from '../types'
import { generateGround } from './ground'
import {
  default as Matter,
  IEventCollision,
  IChamferableBodyDefinition,
  Body as BodyClass,
  IPair,
} from 'matter-js'

export interface PlayerPosition extends Position {
  shoot: boolean
  index: number
}

export interface GameEngineCallbacks {
  refresh: (ball: Position, players: PlayerPosition[]) => void
  goal: (team: string) => void
}

const { Engine, Bodies, World, Events, Body, Vector } = Matter

export interface Player {
  index: number
}

const defaultCategoryFilter = 0x0001
const ballCategoryFilter = 0x0002
const playerCategoryFilter = 0x0004

export interface GameEngine {
  addPlayer(index: number): void
  removePlayer(index: number): void
  resetPositions(): void
  keyPress(index: number, code: number): void
  keyRelease(index: number, code: number): void
  destroy(): void
}

export function gameEngine(
  options: Options,
  callbacks: GameEngineCallbacks,
): GameEngine {
  const engine = Engine.create({ velocityIterations: 16 })
  const { goal, refresh } = callbacks
  const world = engine.world
  world.gravity = { x: 0, y: 0, scale: 1 }
  const pause = false
  const players: PlayerBody[] = []
  const { ground, borders } = createGround(options)
  World.add(world, borders)
  const ball = createBall(ground, options)
  World.add(world, ball)

  Engine.run(engine)
  Events.on(engine, 'beforeUpdate', handleBeforeUpdate)
  Events.on(engine, 'afterUpdate', handleAfterUpdate)
  Events.on(engine, 'collisionStart', handleCollisionStart)
  Events.on(engine, 'collisionEnd', handleCollisionEnd)

  return {
    addPlayer(index) {
      const player = createPlayer(index, ground, options)
      World.add(world, [player.body, player.sensor])
      players.push(player)
    },
    removePlayer(index) {
      const toRemove = players.findIndex(p => p.index === index)
      const player = players[toRemove]
      if (toRemove > -1) players.splice(toRemove, 1)
      World.remove(world, player.body)
      World.remove(world, player.sensor)
    },
    keyPress(index, code) {
      const player = players.find(p => p.index === index)
      if (!player) throw new Error('oh no i could not find player?!')
      player.keyPress(code)
    },
    keyRelease(index, code) {
      const player = players.find(p => p.index === index)
      if (!player) throw new Error('oh no i could not find player?!')
      player.keyRelease(code)
    },
    resetPositions() {
      Body.setPosition(ball, ground.getBallDefaultPosition())
      Body.setVelocity(ball, { x: 0, y: 0 })
      players.forEach(p => {
        p.hasBall = undefined
        Body.setPosition(p.body, ground.getPlayerDefaultPosition(p.index))
        Body.setVelocity(p.body, { x: 0, y: 0 })
      })
    },
    destroy() {
      World.clear(world, false)
      Engine.clear(engine)
      Events.off(engine, 'beforeUpdate', handleBeforeUpdate)
      Events.off(engine, 'afterUpdate', handleAfterUpdate)
      Events.off(engine, 'collisionStart', handleCollisionStart)
      Events.off(engine, 'collisionEnd', handleCollisionEnd)
    },
  }

  function handleCollisionStart(event: IEventCollision<void>) {
    if (pause) return
    event.pairs.forEach(pair => {
      handleGoalCollistion(pair)
      handleBallCollision(pair)
    })
  }

  function handleCollisionEnd(event: IEventCollision<void>) {
    if (pause) return
    event.pairs.forEach(pair => {
      const typeA: string = pair.bodyA.label
      const typeB: string = pair.bodyB.label

      if (typeA === 'ball') {
        if (typeB.indexOf('player') > -1) {
          const index = parseInt(typeB.substring(6))
          const player = players.find(p => p.index === index)
          if (!player) {
            throw new Error('oh no i found collision with a phantom player :(')
          }
          player.hasBall = undefined
        }
      }
    })
  }

  function handleBallCollision(pair: IPair) {
    const typeA: string = pair.bodyA.label
    const typeB: string = pair.bodyB.label
    if (typeA === 'ball') {
      if (typeB.indexOf('player') > -1) {
        const index = parseInt(typeB.substring(6))
        const player = players.find(p => p.index === index)
        if (!player) {
          throw new Error('oh no i found collision with a phantom player :(')
        }
        player.hasBall = pair.bodyA
        pair.restitution = 0
      }
    }
  }

  function handleGoalCollistion(pair: IPair) {
    if (pause) return
    const typeA: string = pair.bodyA.label
    const typeB: string = pair.bodyB.label
    if (typeB === 'ball') {
      if (typeA === 'team1') {
        goal('team1')
      } else if (typeA === 'team2') {
        goal('team2')
      }
    }
  }

  function handleBeforeUpdate() {
    players.forEach(player => {
      if (player === undefined) return
      player.update()
    })
  }

  function handleAfterUpdate() {
    const ballPosition = roudPosition(ball.position)
    const playersPositions = players.reduce((result, player) => {
      if (player === undefined) return result
      const position = roudPosition(player.body.position)
      result.push({
        ...position,
        shoot: player.keys.shoot,
        index: player.index,
      })
      return result
    }, [] as PlayerPosition[])
    refresh(ballPosition, playersPositions)
  }
}

function createGround(options: Options) {
  const borderOptions: IChamferableBodyDefinition = {
    isStatic: true,
    ...options.border,
    collisionFilter: {
      category: defaultCategoryFilter,
    },
  }
  const goal1Options: IChamferableBodyDefinition = {
    label: 'team2',
    isStatic: true,
    isSensor: true,
  }
  const goal2Options: IChamferableBodyDefinition = {
    label: 'team1',
    isStatic: true,
    isSensor: true,
  }

  const ground = generateGround(options)
  const borders = ground.borders.map(elem => draw(elem, borderOptions))
  return {
    ground,
    borders: [
      ...borders,
      draw(ground.goal1, goal1Options),
      draw(ground.goal2, goal2Options),
    ],
  }
}
function createBall(ground: Ground, options: Options) {
  const ballOptions: IChamferableBodyDefinition = {
    label: 'ball',
    ...options.ball,
    collisionFilter: {
      category: ballCategoryFilter,
      mask: ballCategoryFilter | playerCategoryFilter | defaultCategoryFilter,
    },
  }
  const ball = draw(
    ground.getBall(ground.getBallDefaultPosition()),
    ballOptions,
  )
  return ball
}

function createPlayer(index: number, ground: Ground, options: Options) {
  const { shootForce, moveForce } = options
  const playerOptions: IChamferableBodyDefinition = {
    ...options.player,
    collisionFilter: {
      category: playerCategoryFilter,
      mask: ballCategoryFilter | playerCategoryFilter,
    },
  }

  const label = `player${index}`
  const defaultPosition = ground.getPlayerDefaultPosition(index)
  const elem = ground.getPlayer(defaultPosition)
  const body = draw(elem, { ...playerOptions, label })
  if (!elem.circle) {
    throw new Error('Oh no, i need to implement rectangle player')
  }
  const sensorElem = {
    circle: { x: elem.circle.x, y: elem.circle.y, r: elem.circle.r + 5 },
  }
  const sensor = draw(sensorElem, {
    isSensor: true,
    label,
    collisionFilter: {
      mask: ballCategoryFilter,
    },
  })
  return new PlayerBody(index, body, sensor, moveForce, shootForce)
}

function draw(elem: Block, options: IChamferableBodyDefinition) {
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
  return body
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

class PlayerBody {
  index: number
  body: BodyClass
  sensor: BodyClass
  moveForce: number
  shootForce: number
  keys: Keys = { ...defaultKeys }
  hasBall: BodyClass | undefined
  constructor(
    index: number,
    body: BodyClass,
    sensor: BodyClass,
    moveForce: number,
    shootForce: number,
  ) {
    this.index = index
    this.body = body
    this.sensor = sensor
    this.moveForce = moveForce / 10
    this.shootForce = shootForce / 10
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
    if (this.keys.left) forceVector.x = forceVector.x - this.moveForce
    if (this.keys.right) forceVector.x = forceVector.x + this.moveForce
    if (this.keys.up) forceVector.y = forceVector.y - this.moveForce
    if (this.keys.down) forceVector.y = forceVector.y + this.moveForce
    Body.applyForce(this.body, this.body.position, forceVector)

    if (this.hasBall) {
      if (this.keys.shoot) {
        const deltaVector = Vector.sub(
          this.hasBall.position,
          this.body.position,
        )
        const normalizedDelta = Vector.normalise(deltaVector)
        const forceVector = Vector.mult(normalizedDelta, this.shootForce)
        Body.applyForce(this.hasBall, this.hasBall.position, forceVector)
      }
    }
  }
}

function roudPosition<T extends Position>(p: T) {
  return {
    ...p,
    x: Math.round(p.x),
    y: Math.round(p.y),
  }
}
