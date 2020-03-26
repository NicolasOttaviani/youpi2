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
  force: number
  width: number
  height: number
  margin: number
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
