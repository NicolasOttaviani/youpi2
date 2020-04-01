<script lang="ts">
  import { createEventDispatcher, getContext, onMount } from 'svelte'
  import { tweened } from 'svelte/motion'
  import { cubicOut } from 'svelte/easing'
  import { get } from 'svelte/store'
  import {
    running,
    pickPlayer,
    start,
    stop,
    winner,
    saveOptions,
    team1,
    team2,
  } from './stores'
  import Chat from './Chat.svelte'
  import PickPlayerButton from './PickPlayerButton.svelte'
  import Configuration from './Configuration.svelte'
  import GameBoardActions from './GameBoardActions.svelte'

  const dispatch = createEventDispatcher()
  const lock = getContext('lock')
  const transform = tweened(1400, {
    duration: 1500,
    easing: cubicOut,
  })

  if (lock.exitPointerLock) lock.exitPointerLock()
  let player1, player2
  let hidden = true
  let configPage = false

  function pick(index: number) {
    pickPlayer(index)
  }

  function stopGame() {
    if (!get(running)) return
    stop()
  }

  function startGame() {
    if (get(running)) return
    start()
    back()
  }

  function backGame() {
    if (!get(running)) return
    back()
  }

  function showConfig() {
    configPage = true
  }

  function hideConfig() {
    configPage = false
  }

  async function back() {
    hidden = true
    lock.requestPointerLock()
    await transform.set(1400)
    dispatch('close')
  }

  onMount(async () => {
    await transform.set(0)
    hidden = false
  })
</script>

<style lang="scss">
  $bottom: 300px;
  .left,
  .right,
  .bottom {
    position: absolute;
    z-index: 7;
  }
  .bottom {
    bottom: 0px;
    width: 100vw;
    height: $bottom;
  }
  .left,
  .right {
    width: 50%;
    bottom: $bottom;
    top: 0px;
    &::before {
      content: '';
      position: absolute;
      display: block;
      width: 400px;
      height: 2000px;
      top: 0px;
      background: var(--accent);
      transform: rotate(-25deg) scaleY(2);
    }
  }

  .left {
    left: 0;
    background: var(--secondary);
    &::before {
      content: '';
      right: -550px;
    }
  }

  .right {
    right: 0;
    background: var(--primary);
    &::before {
      content: '';
      left: 150px;
    }
  }

  .team {
    &.team1 {
      color: var(--team1);
    }
    &.team2 {
      color: var(--team2);
    }

    h3.winner {
      background-image: url('/winner.png');
      background-repeat: no-repeat;
      background-position: center;
    }
  }

  :global(h3, h2) {
    font-size: 2em;
    font-family: var(--font);
    text-align: center;
  }
  h3 {
    margin-top: 20px;
    padding: 30px 0 30px 0;
  }

  @media (max-height: 700px) {
    .left,
    .right {
      bottom: 0px;
    }
    .bottom {
      display: none;
    }
  }
</style>

{#if configPage}
  <Configuration
    on:close={hideConfig}
    on:save={({ detail }) => saveOptions(detail)} />
{/if}

<div class="left" style={`transform: translateX(-${$transform}px);`}>
  <div class="team team1">
    <h3 class:winner={$winner === 'team1'}>Team 1</h3>
    {#each $team1 as user, index}
      <PickPlayerButton
        team1={true}
        on:click={() => pick(index * 2)}
        player={user} />
    {/each}
  </div>
</div>
<div class="right" style={`transform: translateX(${$transform}px)`}>
  <div class="team team2">
    <h3 class:winner={$winner === 'team2'}>Team 2</h3>
    {#each $team2 as user, index}
      <PickPlayerButton
        team1={false}
        on:click={() => pick(index * 2 + 1)}
        player={user} />
    {/each}
  </div>
</div>

<GameBoardActions
  bind:hidden
  on:back={backGame}
  on:start={startGame}
  on:stop={stopGame}
  on:saveConfig={({ detail }) => saveOptions(detail)} />

<div class="bottom" style={`transform: translateY(${$transform}px)`}>
  <Chat />
</div>
