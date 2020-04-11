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
  ...base(1),
  maxGoal: 2,
  moveForce: 0.4,
  shootForce: 0.55,
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
  ballRadius: 20,
  playerRadius: 30,
  borderSize: 40,
}

export function defaultOptions() {
  return JSON.parse(JSON.stringify(DEFAULT_OPTIONS))
}

export function base(playerPerTeam: number) {
  if (playerPerTeam === 1) {
    return {
      playerPerTeam: 1,
      height: 600,
      width: 1700,
      goalSize: 190,
    }
  }
  if (playerPerTeam === 2) {
    return {
      playerPerTeam: 2,
      height: 800,
      width: 1850,
      goalSize: 210,
    }
  }
  return {
    playerPerTeam: 3,
    height: 1100,
    width: 2500,
    goalSize: 260,
  }
}
