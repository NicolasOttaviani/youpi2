<script lang="ts">
  import { get } from 'svelte/store'
  import { getContext, createEventDispatcher } from 'svelte'
  import { startRender } from './ground-canvas'
  import { lastInfo, isPlaying, keyPress, keyRelease } from './stores'
  const { width, height } = lastInfo.options
  const lock = getContext('lock')
  const dispatch = createEventDispatcher()
  function init(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d', {})
    let canMove = false
    const render = startRender(ctx)

    function requestPointerLock() {
        canvas.requestPointerLock()
    }

    function exitPointerLock() {
      document.exitPointerLock()
    }

    lock.requestPointerLock = requestPointerLock
    lock.exitPointerLock = exitPointerLock

    function onKeyPress({ keyCode }: KeyboardEvent) {
      if (canMove) {
        keyPress(keyCode)
      }
    }

    function onKeyRelease({ keyCode }: KeyboardEvent) {
      if (canMove) {
        keyRelease(keyCode)
      }
    }

    function unlock() {
      canMove = document.pointerLockElement === canvas ? true : false
      if (!canMove) dispatch('config')
    }
    document.addEventListener('pointerlockchange', unlock)
    canvas.addEventListener('click', requestPointerLock)
    document.addEventListener('keydown', onKeyPress)
    document.addEventListener('keyup', onKeyRelease)
    return {
      destroy() {
        render.destroy()
        canvas.removeEventListener('click', requestPointerLock)
        document.removeEventListener('keydown', onKeyPress)
        document.removeEventListener('keyup', onKeyRelease)
        document.removeEventListener('pointerlockchange', unlock)
      },
    }
  }
</script>

<section>
  <main>
    <canvas
      use:init
      {width}
      {height}
      style={`width: ${width}px; height: ${height}px; border: 1px black solid;`} />
  </main>
</section>
