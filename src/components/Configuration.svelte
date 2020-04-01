<script lang="ts">
  import { onMount, createEventDispatcher, tick } from 'svelte'
  import { tweened } from 'svelte/motion'
  import { cubicOut } from 'svelte/easing'
  import { ground } from './stores'
  import Slider from './Slider.svelte'
  import ConfigurationBody from './ConfigurationBody.svelte'
  import Help from './ConfigurationHelp.svelte'
  import { defaultOptions } from '../services/default-options'
  let config = (config = JSON.parse(JSON.stringify(ground.options)))
  const dispatch = createEventDispatcher()
  const transform = tweened(1400, {
    duration: 1500,
    easing: cubicOut,
  })
  let helpType = false

  async function back() {
    await transform.set(1400)
    dispatch('close')
  }

  async function save() {
    dispatch('save', config)
    back()
  }

  function reset() {
    config = JSON.parse(JSON.stringify(ground.options))
  }

  function restore() {
    config = defaultOptions()
  }

  async function help(type) {
    helpType = type
  }

  onMount(() => {
    transform.set(0)
  })
</script>

<style lang="scss">
  .configuration {
    position: absolute;
    z-index: 10;
    width: 100vw;
    height: 100vh;
    background: var(--accent);
    color: var(--on-accent);
    display: flex;

    fieldset {
      border: 0;
      border-top: 5px solid var(--primary);
      border-radius: 5px;
      padding: 15px;
      legend {
        background: var(--primary);
        color: var(--color);
        padding: 5px 10px;
        font-size: 32px;
        border-radius: 5px;
        margin-left: 20px;
      }
      button {
        background: var(--primary);
        color: var(--color);
        padding: 0.5em;
      }
    }
    .help {
      flex: 2;
    }
  }

  :global(label) {
    display: block;
    position: relative;
    margin-top: 1em;
  }
  :global(label span) {
    display: inline-block;
    margin-bottom: 0.2em;
    padding-left: 0.5em;
  }
</style>

<div class="configuration" style={`transform: translateY(-${$transform}px)`}>
  <fieldset>
    <legend>Player</legend>
    <label>
      <span>Radius</span>
      <Slider bind:value={config.playerRadius} min={0} max={200} step={1} />
    </label>
    <label>
      <span>Move force</span>
      <Slider bind:value={config.moveForce} />
    </label>
    <label>
      <span>Shoot force</span>
      <Slider bind:value={config.shootForce} />
    </label>
    <ConfigurationBody
      bind:value={config.player}
      on:help={({ detail }) => help(detail)} />
  </fieldset>
  <fieldset>
    <legend>Ball</legend>
    <label>
      <span>Radius</span>
      <Slider bind:value={config.ballRadius} min={0} max={200} step={1} />
    </label>
    <ConfigurationBody
      bind:value={config.ball}
      on:help={({ detail }) => help(detail)} />
  </fieldset>
  <fieldset>
    <legend>Playground</legend>
    <label>
      <span>Width</span>
      <Slider bind:value={config.width} min={0} max={2000} step={1} />
    </label>
    <label>
      <span>Height</span>
      <Slider bind:value={config.height} min={0} max={1000} step={1} />
    </label>
    <label>
      <span>Goal size</span>
      <Slider bind:value={config.goalSize} min={0} max={1000} step={1} />
    </label>
    <label>
      <span>Border size</span>
      <Slider bind:value={config.borderSize} min={0} max={1000} step={1} />
    </label>
    <ConfigurationBody
      bind:value={config.border}
      on:help={({ detail }) => help(detail)}
      staticBody={true} />
  </fieldset>
  <fieldset>
    <legend>Rules</legend>
    <label>
      <span>Max goal to win</span>
      <Slider bind:value={config.maxGoal} min={1} max={10} step={1} />
    </label>
    <p>The changes will be applied to the next game.</p>
    <div>
      <button on:click={back}>Back</button>
      <button on:click={reset}>Reset</button>
      <button on:click={save}>Save</button>
      <button on:click={restore}>Restore default</button>
    </div>
  </fieldset>
  <div class="help">
    <Help bind:type={helpType} />
  </div>
</div>
