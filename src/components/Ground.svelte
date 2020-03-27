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
    lock.exitPointerLock = ()  => document.exitPointerLock()
    document.addEventListener('pointerlockchange', unlock)
    document.addEventListener('keydown', onKeyPress)
    document.addEventListener('keyup', onKeyRelease)
    return {
      destroy() {
        render.destroy()
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
