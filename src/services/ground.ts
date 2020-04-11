import { GroundOptions, Ground } from '../types'

export function generateGround({
  width,
  height,
  ballRadius,
  playerRadius,
  goalSize,
  borderSize,
  playerPerTeam,
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
  return {
    borders,
    goal1,
    goal2,
    getBallDefaultPosition: () => ({
      x: width / 2,
      y: height / 2,
    }),
    getBall: ({ x, y }) => ({
      circle: { x, y, r: ballRadius },
    }),
    getPlayerDefaultPosition(index) {
      if (index % 2 === 0) {
        return { x: 0 + 4 * borderSize, y: height / 2 }
      }
      return { x: width - 4 * borderSize, y: height / 2 }
    },
    getPlayer: ({ x, y }) => ({
      circle: { x, y, r: playerRadius },
    }),
  }
}
