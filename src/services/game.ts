import { Options, Hello, Message, Score, Position } from '../types'
import { Server } from 'socket.io'
import { gameBoard } from './game-board'
import { gameUsers } from './game-users'
import { PlayerPosition } from './game-engine'

const CHAT_FILO_SIZE = 10

export function game(io: Server) {
  const messages: Message[] = []
  const frameCount = 0
  const users = gameUsers()
  const board = gameBoard()
  board.on('goal', (score: Score) => io.emit('game goal', score))
  board.on('winner', (team: string) => io.emit('game winner', team))
  board.on('refresh', (ball: Position, players: PlayerPosition[]) => {
    const { x, y } = ball
    const rest = players
      .map(({ x, y, shoot, index }) => [x, y, shoot ? 1 : 0, index])
      .flat()
    io.emit('r', [x, y, ...rest])
  })
  board.on('applyOptions', (options: Options) => {
    users.playerPerTeam(options.playerPerTeam)
    io.emit('options', options)
  })
  users.on('keypress', (index: number, key: number) => {
    const engine = board.engine()
    if (!engine) return
    engine.keyPress(index, key)
  })
  users.on('keyrelease', (index: number, key: number) => {
    const engine = board.engine()
    if (!engine) return
    engine.keyRelease(index, key)
  })
  users.on('register', (index: number) => {
    const engine = board.engine()
    if (!engine) return
    engine.addPlayer(index)
  })
  users.on('unregister', (index: number) => {
    const engine = board.engine()
    if (!engine) return
    engine.removePlayer(index)
  })
  let rejected = false
  io.on('connection', socket => {
    const user: string = socket.handshake.query.user
    if (!users.register(user, socket)) {
      rejected = true
      socket.emit('reject')
      return
    }
    socket.emit('hello', mapHello())
    socket.broadcast.emit('user changed', users.users())
    socket.on('options', (options: Options) => {
      board.updateOptions(options)
    })

    socket.on('message', message => {
      const data = {
        message,
        user,
        timestamp: currentTimestamp(),
      }
      messages.push(data)
      if (messages.length > CHAT_FILO_SIZE) {
        messages.shift()
      }
      io.emit('message', data)
    })
    socket.on('game pick player', (index: number) => {
      if (board.running() && users.haveUser(index)) {
        return
      }
      users.pick(index, user)
      io.emit('game pick player', users.users())
    })
    socket.on('game start', () => {
      const engine = board.start()
      if (!engine) return
      users.users().forEach(({ index }) => {
        if (index > -1) {
          engine.addPlayer(index)
        }
      })
      io.emit('game start')
    })
    socket.on('game stop', () => {
      if (!board.running()) return
      board.stop()
      io.emit('game stop')
    })

    socket.on('disconnect', () => {
      if (rejected) return
      users.unregister(user)
      socket.broadcast.emit('user changed', users.users())
    })

    function mapHello(): Hello {
      return {
        messages,
        users: users.users(),
        running: board.running(),
        score: board.score(),
        options: board.options(),
      }
    }
  })
}

function currentTimestamp() {
  return new Date().getTime()
}
