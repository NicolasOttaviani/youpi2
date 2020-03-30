import { get } from 'svelte/store'
import { Block, Circle } from '../types'
import { lastInfo, ground, players, getVar } from './stores'

export function startRender(ctx: CanvasRenderingContext2D) {
  const font = getVar('--font')
  let frame: number
  const draw = () => {
    const { options } = lastInfo
    if (!options) {
      return
    }
    ctx.save()
    ctx.clearRect(0, 0, options.width, options.height)
    ground.borders.forEach(block => drawBlock(ctx, block))
    if (ground.ball) {
      drawBlock(ctx, ground.ball)
    }
    ground.players.forEach((block, index) => {
      drawBlock(ctx, block)
      const player = get(players)[index]
      if (player && block.circle) {
        drawText(ctx, block.circle, font, player)
      }
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

function drawBlock(ctx: CanvasRenderingContext2D, block: Block) {
  const { rect, circle, color, stroke } = block
  if (rect) {
    const { x, y, w, h } = rect
    ctx.beginPath()
    ctx.rect(x, y, w, h)
  }
  if (circle) {
    const { x, y, r } = circle
    ctx.beginPath()
    ctx.arc(x, y, r, 0, 2 * Math.PI)
  }

  if (color) {
    ctx.fillStyle = color
    ctx.fill()
  }

  if (stroke) {
    ctx.lineWidth = 2
    ctx.strokeStyle = stroke
    ctx.stroke()
  }
}

function drawText(
  ctx: CanvasRenderingContext2D,
  { x, y, r }: Circle,
  font: string,
  text: string,
) {
  ctx.font = '30px ' + font
  ctx.fillText(text, x - r, y + 2 * r + 20)
}
