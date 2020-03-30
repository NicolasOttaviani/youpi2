<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import Slider from './Slider.svelte'
  export let value
  export let staticBody = false
  const dispatch = createEventDispatcher()
</script>

{#if !staticBody}
  <label>
    <span>Mass</span>
    <Slider
      bind:value={value.mass}
      min={1}
      max={200}
      step={1}
      on:focus={() => dispatch('help', 'mass')} />
  </label>
  <label>
    <span>Friction</span>
    <Slider
      bind:value={value.friction}
      on:focus={() => dispatch('help', 'friction')} />
  </label>
  <label>
    <span>Air friction</span>
    <Slider
      bind:value={value.frictionAir}
      on:focus={() => dispatch('help', 'frictionAir')} />
  </label>
{/if}
<label>
  <span>Restitution</span>
  <Slider
    bind:value={value.restitution}
    on:focus={() => dispatch('help', 'restitution')} />
</label>
<label>
  <span>Slop</span>
  <Slider bind:value={value.slop} on:focus={() => dispatch('help', 'slop')} />
</label>
