<script lang="ts">
  import { ground, playerPerTeam, running } from './stores'
  import { base } from '../services/default-options'
  import { createEventDispatcher } from 'svelte'
  import Arrow from './Arrow.svelte'
  import StartButton from './StartButton.svelte'
  import BackButton from './BackButton.svelte'
  export let hidden: boolean = false
  const dispatch = createEventDispatcher()
  function configurePerTeam(playerPerTeam: number) {
    if ($running) return
    dispatch('saveConfig', { ...ground.options, ...base(playerPerTeam) })
  }
</script>

<style lang="scss">
  .actions {
    width: 550px;
    color: var(--on-accent);
    height: 100vh;
    margin: 0 auto;
    position: relative;
    z-index: 8;
    opacity: 1;
    transition: opacity 0.5s;

    &.hidden {
      opacity: 0;
      transition: opacity 0.5s;
    }
    h2 {
      margin: 20px 0 0 -180px;
    }
    .button-left,
    .button-right {
      position: absolute;
      top: 260px;
    }
    .button-right {
      right: 80px;
    }
    .button-left {
      left: 150px;
    }

    .description {
      position: absolute;
      top: 130px;
      left: 85px;
      width: 330px;
      display: flex;
      justify-content: center;
      align-content: center;
      & > img {
        max-width: 100px;
        max-height: 75px;
      }
      & > p {
        margin: 0;
        flex: 1;
      }
    }
    .config {
      display: flex;
      justify-content: space-between;
      width: 180px;
      margin: 35px 0 0 100px;
      button {
        font-family: var(--font);
        &.active {
          box-shadow: 0 0 10px 2px var(--primary);
        }
      }
    }

    button.link {
      color: var(--primary);
      &:hover {
        box-shadow: none;
      }
    }
    .last {
      margin-top: 335px;
      margin-left: 185px;
    }
  }
</style>

<div class="actions" class:hidden>
  <h2>Choose your Team</h2>
  <Arrow top={55} left={335} />
  <Arrow top={55} left={30} reverse={true} />

  <div class="config">
    <button
      class:active={$playerPerTeam === 1}
      on:click={() => configurePerTeam(1)}
      disabled={$running}>
      1v1
    </button>
    <button
      class:active={$playerPerTeam === 2}
      on:click={() => configurePerTeam(2)}
      disabled={$running}>
      2v2
    </button>
    {#if $playerPerTeam <= 3}
      <button
        class:active={$playerPerTeam === 3}
        on:click={() => configurePerTeam(3)}
        disabled={$running}>
        3v3
      </button>
    {:else}
      <button disabled={true}>Custom</button>
    {/if}
  </div>

  <div class="description">
    <p>Use the arrow keys to move the player and use the spacebar to shoot</p>
    <img src="arrow-keys.png" alt="keyboard-arrows-example" />
  </div>

  <div class:button-left={!$running} class:button-right={$running}>
    <StartButton on:start on:stop />
  </div>

  <div class:button-left={$running} class:button-right={!$running}>
    <BackButton on:back />
  </div>
  <p class="last">
    You can
    <button class="link" on:click={() => dispatch('showConfig')}>
      configure
    </button>
    the game (at your own risk)
  </p>
</div>
