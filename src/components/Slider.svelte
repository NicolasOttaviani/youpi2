<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  export let value
  export let min = 0
  export let max = 1
  export let step = 0.01
  const dispatch = createEventDispatcher()
</script>

<style lang="scss">
  // Base Colors
  $shade-10: var(--color) !default;
  $shade-1: #d7dcdf !default;
  $shade-0: var(--primary) !default;
  $teal: var(--secondary) !default;

  // Range Slider
  $range-width: 100% !default;
  $range-handle-color: $shade-10 !default;
  $range-handle-color-hover: $teal !default;
  $range-handle-size: 20px !default;
  $range-track-color: $shade-1 !default;
  $range-track-height: 10px !default;
  $range-label-color: $shade-10 !default;
  $range-label-width: 60px !default;

  .range-slider {
    width: $range-width;
  }

  .range-slider__range {
    -webkit-appearance: none;
    width: calc(100% - (#{$range-label-width + 13px}));
    height: $range-track-height;
    border-radius: 5px;
    background: $range-track-color;
    outline: none;
    padding: 0;
    margin: 0;

    // Range Handle
    &::-webkit-slider-thumb {
      appearance: none;
      width: $range-handle-size;
      height: $range-handle-size;
      border-radius: 50%;
      background: $range-handle-color;
      cursor: pointer;
      transition: background 0.15s ease-in-out;

      &:hover {
        background: $range-handle-color-hover;
      }
    }

    &:active::-webkit-slider-thumb {
      background: $range-handle-color-hover;
    }

    &::-moz-range-thumb {
      width: $range-handle-size;
      height: $range-handle-size;
      border: 0;
      border-radius: 50%;
      background: $range-handle-color;
      cursor: pointer;
      transition: background 0.15s ease-in-out;

      &:hover {
        background: $range-handle-color-hover;
      }
    }

    &:active::-moz-range-thumb {
      background: $range-handle-color-hover;
    }

    // Focus state
    &:focus {
      &::-webkit-slider-thumb {
        box-shadow: 0 0 0 3px $shade-0, 0 0 0 6px $teal;
      }
    }
  }

  // Range Label
  .range-slider__value {
    display: inline-block;
    position: relative;
    width: $range-label-width;
    color: $shade-0;
    line-height: 20px;
    text-align: center;
    border-radius: 3px;
    background: $range-label-color;
    padding: 5px 10px;
    margin-left: 8px;

    &:after {
      position: absolute;
      top: 8px;
      right: -7px;
      width: 0;
      height: 0;
      border-top: 7px solid transparent;
      border-left: 7px solid $range-label-color;
      border-bottom: 7px solid transparent;
      content: '';
    }
  }

  // Firefox Overrides
  ::-moz-range-track {
    background: $range-track-color;
    border: 0;
  }

  input::-moz-focus-inner,
  input::-moz-focus-outer {
    border: 0;
  }
</style>

<div class="range-slider">
  <span class="range-slider__value">{value}</span>
  <input
    class="range-slider__range"
    type="range"
    bind:value
    {min}
    {max}
    {step}
    on:focus
    on:click={() => dispatch('focus')} />
</div>
