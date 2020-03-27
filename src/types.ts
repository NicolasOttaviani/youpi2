export type Players = (string | undefined)[]

export interface Score {
  team1: number
  team2: number
}

export interface Hello {
  ground: Ground
  users: string[]
  score: Score
  players: Players
  running: boolean
  options: Options
  messages: Message[]
}

export interface Message {
  user: string
  message: string
  timestamp: number
}

export interface Position {
  x: number
  y: number
}

export interface Movement {
  movementX: number
  movementY: number
}

export interface GameEngineOptions {
  maxGoal: number
  width: number
  height: number
  margin: number
  player: {
    spaceMass: number
    force: number
    frictionAir: number
    mass: number
    inertia: number
  }
  border: {
    restitution: number
    friction: number
  }
  ball: {
    restitution: number
    frictionAir: number
    mass: number
  }
}
export interface GroundOptions {
  width: number
  height: number
  ballRadius: number
  playerRadius: number
  goalSize: number
}

export type Options = GameEngineOptions & GroundOptions

export interface Block {
  rect?: Rect
  circle?: Circle
}

export interface Ground {
  borders: Block[]
  ball: Block
  goal1: Block
  goal2: Block
  players: Block[]
}

export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

export interface Circle {
  x: number
  y: number
  r: number
}

export const KEYS = {
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  SHOOT: 32,
}

export const IS_A_KEYS = (key: number) => {
  return (
    key === KEYS.DOWN ||
    key === KEYS.UP ||
    key === KEYS.RIGHT ||
    key === KEYS.LEFT ||
    key === KEYS.SHOOT
  )
}
