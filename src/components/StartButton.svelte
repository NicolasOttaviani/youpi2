<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { running, isPlaying } from './stores'
  const dispatch = createEventDispatcher()

  function click(running, isPlaying) {
    if (!isPlaying) return
    if (running) {
      dispatch('stop')
    } else {
      dispatch('start')
    }
  }
</script>

<style lang="scss">
  .button {
    height: 80px;
    width: 80px;
    border-radius: 100%;
    background: var(--disabled);
    transition: height 0.5s;
    transition: width 0.5s;
    transition: border-radius 1s, box-shadow 1s, background 1s;
    line-height: 75px;
    text-align: center;
    display: inline-block;
    margin: 0;
    box-shadow: 0;

    &.playing:not(.running):hover,
    &.running {
      background: var(--secondary);
      .triangle {
        background: var(--accent);
      }
    }

    &.playing:not(.running):hover {
      box-shadow: 0px 8px 6px -4px #000000;
      transition: border-radius 0.2s, box-shadow 0.2s, background 0.2s;
      cursor: pointer;
    }

    &.playing.running:hover {
      border-radius: 0%;
      box-shadow: 0px 8px 6px -4px #000000;
      background: red;
      transition: border-radius 0.2s, box-shadow 0.2s, background 0.2s;
      cursor: pointer;
      .triangle {
        transition: opacity 0.2s;
        opacity: 0;
      }
      .text {
        transition: opacity 0.2s;
        opacity: 1;
      }
    }
  }

  .text {
    color: #fff;
    transition: opacity 0.2s;
    opacity: 0;
    position: absolute;
    font-family: var(--font);
    top: 4px;
    left: 22px;
  }

  .triangle {
    transition: opacity 0.2s;
    opacity: 1;
    line-height: 1;
    width: 20px;
    height: 20px;
    border-top-right-radius: 20%;
    background-color: #ccc7ce;
    text-align: left;
    display: inline-block;
    margin: -4px;
    transition: background-color 0.45s ease;
    &.right {
      transform: rotate(30deg) skewX(-30deg) scale(1, 0.866);
      transform-origin: 45% 75%;
    }

    &::after,
    &::before {
      content: '';
      position: absolute;
      background-color: inherit;
      width: 100%;
      height: 100%;
      border-top-right-radius: 20%;
    }

    &::before {
      transform: rotate(-135deg) skewX(-45deg) scale(1.414, 0.707)
        translate(0, -50%);
    }

    &::after {
      transform: rotate(135deg) skewY(-45deg) scale(0.707, 1.414) translate(50%);
    }
  }
</style>

<div
  class="button"
  class:running={$running}
  class:playing={$isPlaying}
  on:click={() => click($running, $isPlaying)}>
  <div class="triangle right" />
  <div class="text">STOP</div>
</div>
