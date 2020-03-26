import { Ground, Block, GameEngineOptions, Position } from '../types'
import {
  default as Matter,
  IEventCollision,
  IChamferableBodyDefinition,
  Body as BodyClass,
  World as WorldClass,
} from 'matter-js'

export interface GameEngineCallbacks {
  goal: (team: string) => void
  winner: (team: string) => void
  refresh: (positions: Position[]) => void
}

const { Engine, Bodies, World, Events, Body, Vector } = Matter
const borderOptions: IChamferableBodyDefinition = {
  isStatic: true,
  restitution: 0.9,
  friction: 1,
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
  frictionAir: 1,
  inverseInertia: 0,
}
const ballOptions: IChamferableBodyDefinition = {
  label: 'ball',
  restitution: 0.5,
  friction: 0,
  frictionAir: 0.02,
  slop: 0,
}

export interface Score {
  team1: number
  team2: number
}

export interface GameEngine {
  move(index: number, movementX: number, movementY: number): void
  destroy(): void
  getScore(): Score
}

export function gameEngine(
  ground: Ground,
  callbacks: GameEngineCallbacks,
  options: GameEngineOptions,
): GameEngine {
  const { goal, winner, refresh } = callbacks
  const { force, maxGoal } = options
  const engine = Engine.create({ velocityIterations: 16 })
  const world = engine.world
  world.gravity = { x: 0, y: 0, scale: 1 }
  const { players, ball } = drawGround(ground, world)
  const defaultPositions = {
    ball: { ...ball.position },
    players: players.map(({ position }) => ({ ...position })),
  }
  const score: Score = {
    team1: 0,
    team2: 0,
  }
  Engine.run(engine)
  Events.on(engine, 'beforeUpdate', handleBeforeUpdate)
  Events.on(engine, 'collisionStart', handleCollision)

  return {
    move(index: number, movementX: number, movementY: number) {
      const player = players[index]
      if (!player) throw new Error(`Could not find player index '${index}`)
      const vector = { x: movementX * force, y: movementY * force }
      Body.applyForce(player, player.position, vector)
    },
    getScore() {
      return score
    },
    destroy() {
      Events.off(engine, 'beforeUpdate', handleBeforeUpdate)
      Events.off(engine, 'collisionStart', handleCollision)
    },
  }

  function handleCollision(event: IEventCollision<void>) {
    const pairs = event.pairs
    pairs.forEach(pair => {
      const type: string = pair.bodyA.label
      const containsPuck = pair.bodyB.label === ballOptions.label
      const contaisGoal =
        type === goal1Options.label || type === goal2Options.label
      if (containsPuck && contaisGoal) {
        let newScore: number
        if (type === goal2Options.label) {
          score.team1 += 1
          newScore = score.team1
        } else {
          score.team2 += 1
          newScore = score.team2
        }
        if (newScore >= maxGoal) {
          winner(type)
          return
        }
        handleTableReset()
        handleBeforeUpdate()
        goal(type)
      }
    })
  }

  function handleBeforeUpdate() {
    clampPositions()
    refresh([ball.position, ...players.map(({ position }) => position)])
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
    players.forEach(clampPosition)
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
      const player = players[index]
      Body.setPosition(player, position)
      Body.setVelocity(player, { x: 0, y: 0 })
      Body.setAngularVelocity(player, 0)
    })
  }
}

function drawGround(ground: Ground, world: WorldClass) {
  const all: BodyClass[] = []
  ground.borders.forEach(elem => draw(all, elem, borderOptions))
  const goal1 = draw(all, ground.goal1, goal1Options)
  const goal2 = draw(all, ground.goal2, goal2Options)
  const ball = draw(all, ground.ball, ballOptions)
  const players = ground.players.map(elem => draw(all, elem, playerOptions))
  World.add(world, all)
  return { goal1, goal2, players, ball }
}

function draw(
  bodies: BodyClass[],
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
