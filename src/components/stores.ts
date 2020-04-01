import io from 'socket.io-client'
import { Writable, writable, derived, get } from 'svelte/store'
import {
  User,
  Message,
  Score,
  Hello,
  Block,
  Position,
  Options,
  IS_A_KEYS,
  KEYS,
} from '../types'
import { onDestroy } from 'svelte'
import { generateGround } from '../services/ground'

export interface PlayGround {
  borders: Block[]
  ball: undefined | Block
  players: Block[]
  camera: Position | undefined
  options: Options | undefined
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

let user: string | undefined
let socket: Socket | undefined

export const messages: Writable<Message[]> = writable([])
export const users: Writable<User[]> = writable([])
export const score: Writable<Score> = writable(initScore)
export const running: Writable<boolean> = writable(false)
export const winner: Writable<string | undefined> = writable(undefined)
export const ready: Writable<boolean> = writable(false)
export const playerPerTeam: Writable<number> = writable(0)
export const team1 = derived([users, playerPerTeam], ([users, playerPerTeam]) =>
  deriveUser(users, playerPerTeam, 0),
)
export const team2 = derived([users, playerPerTeam], ([users, playerPerTeam]) =>
  deriveUser(users, playerPerTeam, 1),
)
export const isPlaying = derived(users, users => {
  if (!socket) return false
  const player = users.find(u => u.user === user && u.index > -1)
  return player !== undefined
})

export const ground: PlayGround = {
  borders: [],
  players: [],
  ball: undefined,
  camera: undefined,
  options: undefined,
}

function deriveUser(users: User[], playerPerTeam: number, modulo: number) {
  const team = users.reduce((result, user) => {
    if (user.index > -1) {
      if (user.index % 2 === modulo) {
        const index = Math.trunc(user.index / 2)
        result[index] = user.user
      }
    }
    return result
  }, [] as string[])
  team.length = playerPerTeam
  return team
}

function stopEngine() {
  running.set(false)
}

export function connect(login: string) {
  const team1Color = getVar('--team1')
  const team2Color = getVar('--team2')
  const borderColor = getVar('--accent')
  const shootColor = getVar('--primary')
  const font = getVar('--font')

  user = login
  socket = io({ query: { user } })
  socket
    .on('hello', (hello: Hello) => {
      users.set(hello.users)
      score.set(hello.score)
      running.set(hello.running)
      messages.set(hello.messages)
      updateOptions(hello.options)
    })
    .on('message', (message: Message) => {
      messages.update($messages => [...$messages, message])
    })
    .on('options', (options: Options) => {
      updateOptions(options)
    })
    .on('user changed', (newUsers: User[]) => {
      users.set(newUsers)
    })
    .on('game pick player', (newUsers: User[]) => {
      users.set(newUsers)
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
      if (!ground.options) return
      const { ballRadius, playerRadius } = ground.options
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
      ground.players = newPositions.reduce((result, value, index, array) => {
        if (index % 4 === 0) {
          const [x, y, shoot, i] = array.slice(index, index + 4)
          const color = i % 2 === 0 ? team1Color : team2Color
          const player = get(users).find((user: User) => user.index === i)
          let text = ''
          if (player) text = player.user
          const stroke = shoot ? shootColor : '#000'
          const block: Block = {
            circle: { x, y, r: playerRadius },
            render: {
              color,
              stroke,
              font,
              text,
            },
          }
          if (text === user) {
            ground.camera = { x, y }
          }
          result.push(block)
        }
        return result
      }, base)
    })
    .on('game winner', (team: string) => {
      stopEngine()
      winner.set(team)
    })

  function updateOptions(options: Options) {
    const newGround = generateGround(options)
    const borders = [
      ...newGround.borders.map(border => ({
        ...border,
        render: { color: borderColor },
      })),
      { ...newGround.goal1, render: { color: team1Color } },
      { ...newGround.goal2, render: { color: team2Color } },
    ]
    ground.borders = borders
    ground.options = options
    playerPerTeam.set(options.playerPerTeam)
  }

  return new Promise((resolve, reject) => {
    if (!socket) {
      reject()
      return
    }
    socket.on('hello', () => {
      resolve()
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

export function saveOptions(options: Options) {
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
