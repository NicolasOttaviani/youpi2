import { Block, Options, Position } from '../types'
import { lastInfo, ground } from './stores'

export function startRender(ctx: CanvasRenderingContext2D) {
  let frame: number
  const draw = () => {
    const { options } = lastInfo
    if (!options) return
    const offset = buildOffsetCamera(ctx)
    ctx.save()
    ctx.clearRect(0, 0, 3000, 3000)
    ground.borders.forEach(block => drawBlock(ctx, block, offset))
    if (ground.ball) {
      drawBlock(ctx, ground.ball, offset)
    }
    ground.players.forEach((block, index) => {
      drawBlock(ctx, block, offset)
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
  block: Block,
  offset: Position,
) {
  const { rect, circle } = block
  let { x, y } = { ...rect, ...circle }
  if (x === undefined || y === undefined)
    throw new Error('Could not find block position ?!')
  x -= offset.x
  y -= offset.y
  if (rect) {
    const { w, h } = rect
    ctx.beginPath()
    ctx.rect(x, y, w, h)
  }
  if (circle) {
    const { r } = circle
    ctx.beginPath()
    ctx.arc(x, y, r, 0, 2 * Math.PI)
  }
  if (block.render) {
    const { color, stroke, text, font } = block.render
    if (color) {
      ctx.fillStyle = color
      ctx.fill()
    }

    if (stroke) {
      ctx.lineWidth = 2
      ctx.strokeStyle = stroke
      ctx.stroke()
    }

    if (circle && text) {
      const { r } = circle
      if (font) {
        ctx.font = '30px ' + font
      }
      ctx.fillText(text, x - r, y + 2 * r + 20)
    }
  }
}

function buildOffsetCamera(ctx: CanvasRenderingContext2D) {
  const { width, height } = lastInfo.options as Options
  const { canvas } = ctx
  const camera = ground.camera || { x: 0, y: 0 }
  let x = 0
  let y = 0
  if (width > canvas.width) {
    x = camera.x < canvas.width / 2 ? 0 : camera.x - canvas.width / 2
    x = x > width ? width : x
  }
  if (height > canvas.height) {
    y = camera.y < canvas.height / 2 ? 0 : camera.y - canvas.height
    y = y > height ? height : y
  }
  return { x, y }
}
