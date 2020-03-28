<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { running } from './stores'
  const dispatch = createEventDispatcher()

  function click(running) {
    if (!running) return
    dispatch('back')
  }
</script>

<style lang="scss">
  .button {
    height: 80px;
    width: 80px;
    border-radius: 100%;
    background: var(--disabled);
    line-height: 75px;
    text-align: center;
    display: inline-block;
    margin: 0;
    box-shadow: 0;

    &.running {
      background: var(--secondary);
      .arrow::before,
      .arrow::after {
        background: var(--accent);
        transition: opacity 0.2s;
        opacity: 1;
      }
    }

    &.running:hover {
      box-shadow: 0px 8px 6px -4px #000000;
      cursor: pointer;
      .arrow::before,
      .arrow::after {
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

  .arrow {
    position: relative;
    width: 28px;
    height: 5px;
    display: inline-block;
    &.right::before,
    &.right::after {
      height: 12px;
      width: 30px;
    }
    &::before,
    &::after {
      content: '';
      position: absolute;
      background: #ccc7ce;
      border-radius: 0.2rem;
      display: block;
    }
    &::before {
      transform: rotate(-45deg);
      transform: rotate(-45deg);
      left: -5%;
      height: 25%;
      width: 110%;
      top: 52%;
    }
    &::after {
      transform: rotate(45deg);
      left: -5%;
      height: 25%;
      width: 110%;
      bottom: 55%;
    }
  }
</style>

<div class="button" class:running={$running} on:click={() => click($running)}>
  <div class="arrow right" />
  <div class="text">BACK</div>
</div>
