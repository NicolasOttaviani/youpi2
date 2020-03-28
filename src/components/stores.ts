import io from 'socket.io-client'
import { Writable, writable, derived, get } from 'svelte/store'
import {
  Message,
  Score,
  Hello,
  Players,
  Ground,
  Position,
  Options,
  IS_A_KEYS,
} from '../types'
import { onDestroy } from 'svelte'

export interface LastInfo {
  user: string
  ground: Ground | undefined
  options: Options | undefined
  positions: Position[]
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
  ground: undefined,
  options: undefined,
  positions: [],
}

function stopEngine() {
  running.set(false)
}

export function connect(user: string) {
  lastInfo.user = user
  socket = io({ query: { user } })
  socket
    .on('hello', (hello: Hello) => {
      users.set(hello.users)
      score.set(hello.score)
      players.set(hello.players)
      running.set(hello.running)
      messages.set(hello.messages)
      lastInfo.options = hello.options
      lastInfo.ground = hello.ground
      lastInfo.positions = []
    })
    .on('message', (message: Message) => {
      messages.update($messages => [...$messages, message])
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
      lastInfo.positions.splice(0, lastInfo.positions.length)
    })
    .on('game goal', (newScore: Score) => {
      score.set(newScore)
    })
    .on('game stop', () => {
      stopEngine()
    })
    .on('r', (newPositions: number[]) => {
      lastInfo.positions.splice(0, lastInfo.positions.length)
      const base: Position[] = []
      lastInfo.positions = newPositions.reduce(
        (result, value, index, array) => {
          if (index % 2 === 0) {
            const [x, y] = array.slice(index, index + 2)
            result.push({ x, y })
          }
          return result
        },
        base,
      )
    })
    .on('game winner', (team: string) => {
      stopEngine()
      winner.set(team)
    })
  return new Promise((resolve, reject) => {
    if (!socket) {
      reject()
      return
    }
    socket.on('hello', ({ ground }: Hello) => {
      resolve(ground)
      ready.set(true)
    })
  })
}

export function emit(message: string) {
  if (!socket) return
  socket.emit('message', message)
}

export function keyPress(code: number) {
  if (!socket || !get(isPlaying)) return
  if (!IS_A_KEYS(code)) return
  socket.emit('game keypress', code)
}

export function keyRelease(code: number) {
  if (!socket || !get(isPlaying)) return
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

export function configureClose() {
  onDestroy(() => {
    if (!socket) return
    socket.close()
  })
}
