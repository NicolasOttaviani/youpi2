import { Block } from '../types'
import { lastInfo } from './stores'

interface Options {
  x?: number
  y?: number
  color?: string
  forceStroke?: boolean
}

export function startRender(ctx: CanvasRenderingContext2D) {
  const borderColor = getVar('--accent')
  const team1Color = getVar('--team1')
  const team2Color = getVar('--team2')
  let frame: number
  const draw = () => {
    const { ground, positions, options } = lastInfo
    if (!ground || !options) {
      return
    }
    ctx.save()
    ctx.clearRect(0, 0, options.width, options.height)
    ground.borders.forEach(block =>
      drawBlock(ctx, block, { color: borderColor }),
    )
    drawBlock(ctx, ground.goal1, { color: team1Color })
    drawBlock(ctx, ground.goal2, { color: team2Color })
    const ballOpts = positions.length === 3 ? positions[0] : {}
    drawBlock(ctx, ground.ball, {
      ...ballOpts,
      color: borderColor,
      forceStroke: true,
    })
    ground.players.forEach((block, index) => {
      const playerOpt = positions.length === 3 ? positions[index + 1] : {}
      drawBlock(ctx, block, {
        ...playerOpt,
        forceStroke: true,
        color: index % 2 === 0 ? team1Color : team2Color,
      })
    })
    ctx.restore()

    frame = window.requestAnimationFrame(draw)
  }
  frame = window.requestAnimationFrame(draw)
  return {
    destroy() {
      window.cancelAnimationFrame(frame)
    },
  }
}

function drawBlock(
  ctx: CanvasRenderingContext2D,
  { rect, circle }: Block,
  options: Options = {},
) {
  const { color, forceStroke } = options
  let stroke = forceStroke
  if (rect) {
    const { x, y, w, h } = { ...rect, ...options }
    ctx.beginPath()
    ctx.rect(x, y, w, h)
  }
  if (circle) {
    const { x, y, r } = { ...circle, ...options }
    ctx.beginPath()
    ctx.arc(x, y, r, 0, 2 * Math.PI)
  }

  if (color) {
    ctx.fillStyle = color
    ctx.fill()
  } else {
    stroke = true
  }
  if (stroke) {
    ctx.stroke()
  }
}

function getVar(name: string) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(
    name,
  )
  if (!value) throw new Error(`oh no, i could not find css var ${name}`)
  return value
}
