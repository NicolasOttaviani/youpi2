import { Socket } from 'socket.io'
import { EventEmitter } from 'events'

export function gameUsers() {
  const users: User[] = []
  const emitter = new EventEmitter()
  function findPlayerByName(login: string) {
    return users.find(user => user.user === login)
  }
  function findPlayerByIndex(index: number) {
    return users.find(user => user.index === index)
  }
  return {
    on: (event: string, callback: (...data: any) => void) => {
      emitter.on(event, callback)
    },
    register(user: string, socket: Socket) {
      if (users.find(u => u.user === user) !== undefined) {
        return false
      }
      users.push(createUser(user, socket, emitter))
      return true
    },
    unregister(user: string) {
      const index = users.findIndex(player => player.user === user)
      if (index != -1) {
        const player = users[index]
        player.unregister()
        users.splice(index, 1)
      }
    },
    haveUser: (index: number) => findPlayerByIndex(index),
    users: () => users.map(({ user, index }) => ({ user, index })),
    pick(index: number, user: string) {
      const playerInPlace = findPlayerByIndex(index)
      const me = findPlayerByName(user)
      if (!me) throw new Error('Could not find me ?!')
      if (playerInPlace && playerInPlace.user === user) {
        playerInPlace.unregister()
      } else if (me.playing()) {
        if (playerInPlace) {
          playerInPlace.register(me.index)
        }
        me.register(index)
      } else if (!playerInPlace) {
        me.register(index)
      } else {
        playerInPlace.unregister()
        me.register(index)
      }
    },
    playerPerTeam(count: number) {
      users.forEach(user => {
        if (user.index > count) {
          user.unregister()
        }
      })
    },
  }
}

interface User {
  user: string
  socket: Socket
  index: number
  emitter: EventEmitter
  register(index: number): void
  unregister(): void
  playing(): boolean
  callbackPress: ((key: number) => void) | undefined
  callbackRelease: ((key: number) => void) | undefined
}

function createUser(user: string, socket: Socket, emitter: EventEmitter): User {
  return {
    emitter,
    user,
    socket,
    index: -1,
    callbackPress: undefined,
    callbackRelease: undefined,
    playing() {
      return this.index > -1
    },
    register(index: number) {
      if (this.index > -1) {
        this.unregister()
      }
      emitter.emit('register', index)
      this.index = index
      this.callbackPress = code => {
        this.emitter.emit('keypress', this.index, code)
      }
      this.callbackRelease = code => {
        this.emitter.emit('keyrelease', this.index, code)
      }
      socket.on('game keypress', this.callbackPress)
      socket.on('game keyrelease', this.callbackRelease)
    },
    unregister() {
      if (this.index === -1) return
      if (this.callbackPress) {
        socket.removeListener('game keypress', this.callbackPress)
      }
      if (this.callbackRelease) {
        socket.removeListener('game keyrelease', this.callbackRelease)
      }
      emitter.emit('unregister', this.index)
      this.index = -1
    },
  }
}
