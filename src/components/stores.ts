import io from 'socket.io-client'
import { Writable, writable, derived, get } from 'svelte/store'
import {
  Message,
  Score,
  Hello,
  Players,
  Block,
  Position,
  PlayerPosition,
  Options,
  IS_A_KEYS,
  KEYS,
} from '../types'
import { onDestroy } from 'svelte'

export interface LastInfo {
  user: string
  options: Options | undefined
  defaultOptions: Options | undefined
}

export interface PlayGround {
  borders: Block[]
  ball: undefined | Block
  players: Block[]
  camera: Position | undefined
}

interface Emitter {
  on(event: string, callback: (...data: any) => void): Emitter
  emit(event: string, ...data: any): void
  removeListener(event: string, callback: (...data: any) => void): Emitter
}

interface Socket extends Emitter {
  close(): void
}

const initScore = {
  team1: 0,
  team2: 0,
}

export const messages: Writable<Message[]> = writable([])
export const users: Writable<string[]> = writable([])
export const players: Writable<Players> = writable([])
export const score: Writable<Score> = writable(initScore)
export const running: Writable<boolean> = writable(false)
export const winner: Writable<string | undefined> = writable(undefined)
export const ready: Writable<boolean> = writable(false)
export const isPlaying = derived(players, players => {
  if (!socket || !players) return undefined
  const player = players.find(p => p === lastInfo.user)
  return player !== undefined
})
let socket: Socket | undefined
export const lastInfo: LastInfo = {
  user: '',
  options: undefined,
  defaultOptions: undefined,
}

export const ground: PlayGround = {
  borders: [],
  players: [],
  ball: undefined,
  camera: undefined,
}

function stopEngine() {
  running.set(false)
}

export function connect(user: string) {
  const team1Color = getVar('--team1')
  const team2Color = getVar('--team2')
  const borderColor = getVar('--accent')
  const font = getVar('--font')

  lastInfo.user = user
  socket = io({ query: { user } })
  socket
    .on('hello', (hello: Hello) => {
      users.set(hello.users)
      score.set(hello.score)
      players.set(hello.players)
      running.set(hello.running)
      messages.set(hello.messages)
      lastInfo.defaultOptions = hello.defaultOptions
      lastInfo.options = hello.options
      ground.borders = mapBorders(hello)
    })
    .on('message', (message: Message) => {
      messages.update($messages => [...$messages, message])
    })
    .on('options', (hello: Hello) => {
      lastInfo.options = hello.options
      ground.borders = mapBorders(hello)
    })
    .on('user changed', (newUsers: string[]) => {
      users.set(newUsers)
    })
    .on('game pick player', newPlayers => {
      players.set(newPlayers)
    })
    .on('game start', () => {
      winner.set(undefined)
      running.set(true)
      score.set(initScore)
      ground.ball = undefined
      ground.camera = undefined
      ground.players = []
    })
    .on('game goal', (newScore: Score) => {
      score.set(newScore)
    })
    .on('game stop', () => {
      stopEngine()
    })
    .on('r', (newPositions: number[]) => {
      if (!lastInfo.options) return
      const { ballRadius, playerRadius } = lastInfo.options
      const base: Block[] = []
      if (newPositions.length < 2) return
      const ball = {
        x: newPositions.shift() as number,
        y: newPositions.shift() as number,
      }
      ground.ball = {
        circle: {
          ...ball,
          r: ballRadius,
        },
        render: {
          color: borderColor,
          stroke: '#000',
        },
      }
      ground.camera = ball
      let teamCount = 0
      ground.players = newPositions.reduce((result, value, index, array) => {
        if (index % 3 === 0) {
          const [x, y, shoot] = array.slice(index, index + 3)
          const color = teamCount % 2 === 0 ? team1Color : team2Color
          const player = get(players)[index]
          const stroke = shoot ? '#fff' : '#000'
          const block: Block = {
            circle: { x, y, r: playerRadius },
            render: {
              color,
              stroke,
              font,
              text: player,
            },
          }
          if (player === user) {
            ground.camera = { x, y }
          }
          result.push(block)
          ++teamCount
        }
        return result
      }, base)
    })
    .on('game winner', (team: string) => {
      stopEngine()
      winner.set(team)
    })

  function mapBorders({ ground }: Hello) {
    return [
      ...ground.borders.map(border => ({
        ...border,
        render: { color: borderColor },
      })),
      { ...ground.goal1, render: { color: team1Color } },
      { ...ground.goal2, render: { color: team2Color } },
    ]
  }

  return new Promise((resolve, reject) => {
    if (!socket) {
      reject()
      return
    }
    socket.on('hello', ({ ground }: Hello) => {
      resolve(ground)
      ready.set(true)
    })
    socket.on('reject', () => {
      reject(new Error('This name is already in use. Please choose another.'))
      if (!socket) return
      socket.close()
    })
  })
}

function getVar(name: string) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(
    name,
  )
  if (!value) throw new Error(`oh no, i could not find css var ${name}`)
  return value
}

export function emit(message: string) {
  if (!socket) return
  socket.emit('message', message)
}

export function keyPress(code: number) {
  if (!socket || !get(isPlaying)) return
  if (code === 17) code = KEYS.SHOOT
  if (!IS_A_KEYS(code)) return
  socket.emit('game keypress', code)
}

export function keyRelease(code: number) {
  if (!socket || !get(isPlaying)) return
  if (code === 17) code = KEYS.SHOOT
  if (!IS_A_KEYS(code)) return
  socket.emit('game keyrelease', code)
}

export function pickPlayer(index: number) {
  if (!socket) return
  socket.emit('game pick player', index)
}

export function start() {
  if (!socket || get(running)) return
  socket.emit('game start')
}

export function stop() {
  if (!socket || !get(running)) return
  socket.emit('game stop')
}

export function saveConfig(options: Options) {
  if (!socket) return
  socket.emit('options', options)
}

export function configureClose() {
  onDestroy(() => {
    if (!socket) return
    ready.set(false)
    socket.close()
  })
}
