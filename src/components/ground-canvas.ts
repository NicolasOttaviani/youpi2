import { Block } from '../types'
import { lastInfo } from './stores'

interface Options {
  x?: number
  y?: number
}

export function startRender(ctx: CanvasRenderingContext2D) {
  let frame: number
  const draw = () => {
    const { ground, positions, options } = lastInfo
    if (!ground || !options) {
      return
    }
    ctx.save()
    ctx.clearRect(0, 0, options.width, options.height)
    ground.borders.forEach(block => drawBlock(ctx, block))
    drawBlock(ctx, ground.goal1)
    drawBlock(ctx, ground.goal2)
    drawBlock(ctx, ground.ball, positions.length === 3 ? positions[0] : {})
    ground.players.forEach((block, index) =>
      drawBlock(ctx, block, positions.length === 3 ? positions[index + 1] : {}),
    )
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
  if (rect) {
    const { x, y, w, h } = { ...rect, ...options }
    ctx.beginPath()
    ctx.rect(x, y, w, h)
    ctx.stroke()
  }
  if (circle) {
    const { x, y, r } = { ...circle, ...options }
    ctx.beginPath()
    ctx.arc(x, y, r, 0, 2 * Math.PI)
    ctx.stroke()
  }
}
