<script lang="ts">
  import { get } from 'svelte/store'
  import { getContext, createEventDispatcher } from 'svelte'
  import { startRender } from './ground-canvas'
  import { move, lastInfo, isPlaying } from './stores'
  const { width, height } = lastInfo.options
  const lock = getContext('lock')
  const dispatch = createEventDispatcher()
  function init(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d', {})
    let canMove = false
    const render = startRender(ctx)

    function requestPointerLock() {
      if (get(isPlaying)) {
        canvas.requestPointerLock()
      }
    }

    function exitPointerLock() {
      document.exitPointerLock()
    }

    lock.requestPointerLock = requestPointerLock
    lock.exitPointerLock = exitPointerLock

    function mousemove({ movementX, movementY }: MouseEvent) {
      if (canMove) {
        move(movementX, movementY)
      }
    }

    function unlock() {
      canMove = document.pointerLockElement === canvas ? true : false
    }
    document.addEventListener('pointerlockchange', unlock)
    canvas.addEventListener('click', requestPointerLock)
    canvas.addEventListener('mousemove', mousemove)
    return {
      destroy() {
        render.destroy()
        canvas.removeEventListener('click', requestPointerLock)
        canvas.removeEventListener('mousemove', mousemove)
        document.removeEventListener('pointerlockchange', unlock)
      },
    }
  }
</script>

<section>
  <header>
    <button on:click={() => dispatch('config')}>Config</button>
  </header>
  <main>
    <canvas
      use:init
      {width}
      {height}
      style={`width: ${width}px; height: ${height}px; border: 1px black solid;`} />
  </main>
</section>
