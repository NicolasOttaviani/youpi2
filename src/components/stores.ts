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
  Movement,
} from '../types'

export interface LastInfo {
  user: string
  ground: Ground | undefined
  options: Options | undefined
  positions: Position[]
}

interface Socket {
  on(event: string, callback: (...data: any) => void): Socket
  emit(event: string, ...data: any): void
  removeListener(event: string, callback: (...data: any) => void): void
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
      console.log('start', !socket, get(running))
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
    .on('game refresh', (newPositions: Position[]) => {
      lastInfo.positions.splice(0, lastInfo.positions.length)
      lastInfo.positions = newPositions
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
    socket.on('hello', ({ ground }: Hello) => resolve(ground))
  })
}

export function emit(message: string) {
  if (!socket) return
  socket.emit('message', message)
}

export function move(movementX: number, movementY: number) {
  if (!socket || !get(isPlaying)) return
  socket.emit('game move', { movementX, movementY })
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
