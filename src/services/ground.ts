import { GroundOptions, Ground } from '../types'

export function ground({
  width,
  height,
  ballRadius,
  playerRadius,
  goalSize,
  borderSize,
}: GroundOptions): Ground {
  const borderXSize = width - 2 * borderSize
  const semiBorderYSize = (height - goalSize) / 2
  const borders = [
    //top
    { rect: { x: borderSize, y: 0, w: borderXSize, h: borderSize } },
    // bottom
    {
      rect: {
        x: borderSize,
        y: height - borderSize,
        w: borderXSize,
        h: borderSize,
      },
    },
    //left (in 2 parts)
    { rect: { x: borderSize, y: 0, w: borderSize, h: semiBorderYSize } },
    {
      rect: {
        x: borderSize,
        y: semiBorderYSize + goalSize,
        w: borderSize,
        h: semiBorderYSize,
      },
    },
    //right (in 2 parts)
    {
      rect: {
        x: width - 2 * borderSize,
        y: 0,
        w: borderSize,
        h: semiBorderYSize,
      },
    },
    {
      rect: {
        x: width - 2 * borderSize,
        y: semiBorderYSize + goalSize,
        w: borderSize,
        h: semiBorderYSize,
      },
    },
  ]
  const ball = {
    circle: { x: width / 2 - ballRadius, y: height / 2, r: ballRadius },
  }
  const goal1 = {
    rect: { x: 0, y: semiBorderYSize, w: borderSize, h: goalSize },
  }
  const goal2 = {
    rect: {
      x: width - borderSize,
      y: semiBorderYSize,
      w: borderSize,
      h: goalSize,
    },
  }
  const players = [
    {
      type: 'player',
      circle: { x: 0 + 4 * borderSize, y: height / 2, r: playerRadius },
    },
    {
      type: 'player',
      circle: { x: width - 4 * borderSize, y: height / 2, r: playerRadius },
    },
  ]
  return {
    borders,
    goal1,
    goal2,
    ball,
    players,
  }
}
