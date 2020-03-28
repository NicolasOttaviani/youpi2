import { Block } from '../types'
import { lastInfo } from './stores'

interface Options {
  x?: number
  y?: number
  color?: string
  forceStroke?: boolean
}

export function startRender(ctx: CanvasRenderingContext2D) {
  const borderColor = getComputedStyle(
    document.documentElement,
  ).getPropertyValue('--accent')
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
    drawBlock(ctx, ground.goal1, { color: borderColor })
    drawBlock(ctx, ground.goal2, { color: borderColor })
    const ballOpts = positions.length === 3 ? positions[0] : {}
    drawBlock(ctx, ground.ball, {
      ...ballOpts,
      color: borderColor,
      forceStroke: true,
    })
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
