<script lang="ts">
  import { createEventDispatcher, getContext, onMount } from 'svelte'
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
  import Arrow from './Arrow.svelte'
  import StartButton from './StartButton.svelte'
  import BackButton from './BackButton.svelte'
  import PickPlayerButton from './PickPlayerButton.svelte'
  import Configuration from './Configuration.svelte'
  import { tweened } from 'svelte/motion'
  import { cubicOut } from 'svelte/easing'

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

  h3,
  h2 {
    font-size: 2em;
    font-family: var(--font);
    text-align: center;
  }
  h3 {
    margin-top: 20px;
    padding: 30px 0 30px 0;
  }

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
    .start,
    .back {
      position: absolute;
      top: 260px;
    }
    .start {
      left: 150px;
    }
    .back {
      right: 80px;
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

    .last {
      margin-top: 335px;
      margin-left: 185px;
    }
  }
  /*
  button.link {
      color: var(--primary);
  }
*/
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
<div class="actions" class:hidden>
  <h2>Choose your Team</h2>
  <Arrow top={55} left={335} />
  <Arrow top={55} left={30} reverse={true} />

  <div class="description">
    <p>Use the arrow keys to move the player and use the spacebar to shoot</p>
    <img src="arrow-keys.png" alt="keyboard-arrows-example" />
  </div>

  <div class="start">
    <StartButton on:start={startGame} on:stop={stopGame} />
  </div>

  <div class="back" on:click={backGame}>
    <BackButton on:back={backGame} />
  </div>
  <p class="last">
    <!--  You can <button class="link" on:click={showConfig}>configure</button> the game (at your own risk) -->
  </p>
</div>
<div class="bottom" style={`transform: translateY(${$transform}px)`}>
  <Chat />
</div>
