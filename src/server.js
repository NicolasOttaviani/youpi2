import * as http from 'http'
import sirv from 'sirv'
import polka from 'polka'
import compression from 'compression'
import * as sapper from '@sapper/server'
import io from 'socket.io'
import bodyParser from 'body-parser'
import { game } from './services/game'
const { PORT, NODE_ENV } = process.env
const dev = NODE_ENV === 'development'
const server = http.createServer()

global.window = {}

polka({ server })
  .use(bodyParser.json())
  .use(
    compression({ threshold: 0 }),
    sirv('static', { dev }),
    sapper.middleware(),
  )
  .listen(PORT, err => {
    if (err) console.log('error', err)
  })
game(io(server))
