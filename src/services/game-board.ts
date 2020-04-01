import { Options } from '../types'
import { GameEngine, gameEngine } from './game-engine'
import { defaultOptions } from './default-options'

import { EventEmitter } from 'events'
export interface Score {
  team1: number
  team2: number
}

export function gameBoard() {
  let options = defaultOptions()
  let pendingOptions = false
  const emitter = new EventEmitter()
  const score = teamScore()
  let engine: GameEngine | undefined

  function stop() {
    if (engine === undefined) return
    engine.destroy()
    engine = undefined
    if (pendingOptions) {
      emitter.emit('applyOptions', options)
      pendingOptions = false
    }
  }

  emitter.on('goal', () => {
    if (engine === undefined) return
    engine.resetPositions()
  })
  emitter.on('winner', () => {
    stop()
  })
  return {
    on: (event: string, callback: (...data: any) => void) => {
      emitter.on(event, callback)
    },
    running: () => engine !== undefined,
    updateOptions(newOptions: Options) {
      options = newOptions
      if (this.running()) {
        pendingOptions = true
      } else {
        emitter.emit('applyOptions', options)
      }
    },
    start() {
      if (this.running()) return
      engine = gameEngine(options, {
        goal: team => score.goal(team),
        refresh: (ball, players) => {
          emitter.emit('refresh', ball, players)
        },
      })
      return engine
    },
    stop,
    engine: () => engine,
    score: () => score.get(),
    options: () => options,
  }

  function teamScore() {
    const team1 = aTeamScore('team1')
    const team2 = aTeamScore('team2')
    return {
      goal(team: string) {
        team1.goal(team)
        team2.goal(team)
        setTimeout(() => {
          emitter.emit('goal', this.get())
        }, 1000)
      },
      reset() {
        team1.reset()
        team2.reset()
      },
      get() {
        return { team1: team1.score(), team2: team2.score() }
      },
    }
  }

  function aTeamScore(team: string) {
    let score = 0
    return {
      reset() {
        score = 0
      },
      score: () => score,
      goal(goalTeam: string) {
        if (goalTeam !== team) return
        ++score
        if (score > options.maxGoal) {
          setTimeout(() => {
            emitter.emit('winner', team)
          }, 1000)
        }
      },
    }
  }
}
