import { Options, Movement, Hello } from '../types'
import { Server } from 'socket.io'
import { GameEngine, gameEngine } from './game-engine'
import { ground } from './ground'

const defaultOpts: Options = {
  maxGoal: 2,
  force: 0.01,
  height: 600,
  width: 1800,
  ballRadius: 20,
  playerRadius: 30,
  goalSize: 200,
  margin: 50,
}

interface Player {
  user: string
  destroy(): void
}

export function game(io: Server) {
  const users: string[] = []
  const players: Player[] = []
  let engine: GameEngine | undefined
  const currentGround = ground(defaultOpts)
  io.on('connection', socket => {
    const user: string = socket.handshake.query.user
    users.push(user)
    socket.emit('hello', mapHello())
    socket.broadcast.emit('user changed', users)
    socket.on('message', message => {
      io.emit('message', {
        message,
        user,
        timestamp: currentTimestamp(),
      })
    })
    socket.on('game pick player', (index: number) => {
      if (pickPlayer(index)) {
        io.emit('game pick player', mapPlayers())
      }
    })
    socket.on('game start', () => {
      if (engine) return
      engine = gameEngine(
        currentGround,
        {
          goal() {
            io.emit('game goal', mapScore())
          },
          winner() {
            io.emit('game winner', mapScore())
            if (!engine) return
            engine.destroy()
            engine = undefined
          },
          refresh(positions) {
            io.emit('game refresh', positions)
          },
        },
        defaultOpts,
      )
      io.emit('game start')
    })
    socket.on('game stop', () => {
      if (!engine) return
      engine.destroy()
      engine = undefined
      io.emit('game stop')
    })

    socket.on('disconnect', () => {
      logout()
      socket.broadcast.emit('user changed', users)
    })

    function logout() {
      const indexUser = users.indexOf(user)
      if (indexUser != -1) {
        users.splice(indexUser, 1)
      }
      const indexPlayer = findPlayerIndex(user)
      if (indexPlayer !== -1) {
        const player = players[indexPlayer]
        player.destroy()
        players.splice(indexPlayer, 1)
      }
    }

    function pickPlayer(index: number) {
      const currentPlayer = players[index]
      const lastIndex = findPlayerIndex(user)
      if (currentPlayer && currentPlayer.user === user) {
        currentPlayer.destroy()
        delete players[index]
      } else if (lastIndex !== -1) {
        if (currentPlayer) {
          currentPlayer.destroy()
          players[lastIndex].destroy()
          players[index] = createPlayer(index)
          players[lastIndex] = createPlayer(lastIndex)
        } else {
          players[lastIndex].destroy()
          delete players[lastIndex]
          players[index] = createPlayer(index)
        }
      } else if (currentPlayer && engine !== undefined) {
        currentPlayer.destroy()
        players[index] = createPlayer(index)
      } else if (!currentPlayer) {
        players[index] = createPlayer(index)
      } else {
        return false
      }
      return true
    }

    function mapPlayers() {
      return players.map(p => (p ? p.user : undefined))
    }

    function mapScore() {
      return engine ? engine.getScore() : { team1: 0, team2: 0 }
    }

    function mapHello(): Hello {
      return {
        ground: currentGround,
        users,
        running: engine !== undefined,
        players: mapPlayers(),
        score: mapScore(),
        options: defaultOpts,
      }
    }

    function findPlayerIndex(user: string) {
      return players.findIndex(player => player && player.user === user)
    }

    function createPlayer(index: number) {
      const callback = ({ movementX, movementY }: Movement) => {
        if (engine) {
          engine.move(index, movementX, movementY)
        }
      }
      socket.on('game move', callback)
      return {
        user,
        destroy() {
          socket.removeListener('game move', callback)
        },
      }
    }
  })
}

function currentTimestamp() {
  return new Date().getTime()
}
