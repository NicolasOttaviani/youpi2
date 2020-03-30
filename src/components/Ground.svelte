<script lang="ts">
  import { get } from 'svelte/store'
  import { getContext, createEventDispatcher } from 'svelte'
  import { startRender } from './ground-canvas'
  import { isPlaying, keyPress, keyRelease, players, score } from './stores'
  const lock = getContext('lock')
  let width
  let height

  const dispatch = createEventDispatcher()
  function init(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d', {})
    let canMove = false
    const render = startRender(ctx)

    function onKeyPress({ keyCode }: KeyboardEvent) {
      if (canMove && get(isPlaying)) {
        keyPress(keyCode)
      }
    }

    function onKeyRelease({ keyCode }: KeyboardEvent) {
      if (canMove && get(isPlaying)) {
        keyRelease(keyCode)
      }
    }

    function unlock() {
      canMove = document.pointerLockElement === canvas ? true : false
      if (!canMove) dispatch('close')
    }
    lock.requestPointerLock = () => canvas.requestPointerLock()
    lock.exitPointerLock = () => document.exitPointerLock()
    document.addEventListener('pointerlockchange', unlock)
    document.addEventListener('keydown', onKeyPress)
    document.addEventListener('keyup', onKeyRelease)
    canvas.addEventListener('click', lock.requestPointerLock)
    return {
      destroy() {
        render.destroy()
        document.removeEventListener('keydown', onKeyPress)
        document.removeEventListener('keyup', onKeyRelease)
        document.removeEventListener('pointerlockchange', unlock)
        canvas.removeEventListener('click', lock.requestPointerLock)
      },
    }
  }
</script>

<style lang="scss">
  section {
    background: var(--secondary);
    height: 100vh;
    width: 100vw;
    position: absolute;
    top: 0;
    p {
      font-family: var(--font);
      text-align: center;
      font-size: 25px;
      margin: 0 0 10px 0;
    }
    canvas {
      display: block;
      margin: 0px auto;
      margin: 10px;
    }
  }
</style>

<svelte:window bind:innerHeight={height} bind:innerWidth={width} />

<section>
  <main>
    <p>
      {$players[0] || 'Nobody'}: {$score.team1} / {$players[1] || 'Nobody'}: {$score.team2}
    </p>
    <canvas
      use:init
      {width}
      {height}
      style={`width: ${width}px; height: ${height}px;`} />
  </main>
</section>
