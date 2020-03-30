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
  defaultOptions: Options
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

export interface PlayerPosition extends Position {
  shoot: boolean
}

export interface Movement {
  movementX: number
  movementY: number
}

export interface StaticBodyOptions {
  restitution: number /* 0 */
  slop: number /* 0.05 */
}

export interface BodyOptions extends StaticBodyOptions {
  friction: number /* 0.1 */
  frictionAir: number /* 0.01 */
  mass: number
}

export interface GameEngineOptions {
  maxGoal: number
  moveForce: number
  shootForce: number
  width: number
  height: number
  player: BodyOptions
  border: StaticBodyOptions
  ball: BodyOptions
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
