import { Options } from '../types'

const matterDefaultStaticOpts = {
  restitution: 0,
  slop: 0.05,
}
const matterDefaultBodyOpts = {
  ...matterDefaultStaticOpts,
  friction: 0.1,
  frictionAir: 0.01,
}

const DEFAULT_OPTIONS: Options = {
  maxGoal: 2,
  moveForce: 0.05,
  shootForce: 0.1,
  playerPerTeam: 1,
  player: {
    ...matterDefaultBodyOpts,
    frictionAir: 0.05,
    mass: 40,
  },
  ball: {
    ...matterDefaultBodyOpts,
    mass: 1,
    restitution: 0.5,
    frictionAir: 0.02,
  },
  border: {
    ...matterDefaultStaticOpts,
    restitution: 0.2,
  },
  height: 600,
  width: 1800,
  ballRadius: 20,
  playerRadius: 30,
  goalSize: 200,
  borderSize: 40,
}

export function defaultOptions() {
  return JSON.parse(JSON.stringify(DEFAULT_OPTIONS))
}
