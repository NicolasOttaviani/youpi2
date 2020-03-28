<div class="left">
  <div class="team">
    <h3>Team 1</h3>
    <div class="player" on:click={() => pick(0)}>
      <p>{player1 || 'Click!'}</p>
    </div>
  </div>
  
</div>
<div class="right">
  <div class="team">
    <h3>Team 2</h3>
    <div class="player" on:click={() => pick(1)}>
      <p>{player2 || 'Click!'}</p>
    </div>
  </div>
  <div class="actions">
    <h2>Choose your Team</h2>
    {#if $running}
      <div class="stop" on:click={stop}>
        <p>Stop</p>
      </div>  
    {:else}
      <div class="start" on:click={startGame}>
        <p>Start</p>
      </div>
    {/if}
    <div class="back" on:click={back}>
        <p>Back</p>
    </div>
  </div>
</div>
<div class="bottom">
  <Chat />
</div>

<script lang="ts">
  import { createEventDispatcher, getContext } from 'svelte'
  import {
    running,
    players,
    pickPlayer,
    start,
    stop,
    isPlaying,
  } from './stores'
  import Chat from '../components/Chat.svelte'
  
  const dispatch = createEventDispatcher()
  const lock = getContext('lock')
  if (lock.exitPointerLock) lock.exitPointerLock()
  let player1, player2

  $: player1 = $players[0]
  $: player2 = $players[1]

  function pick(index: number) {
    pickPlayer(index)
  }

  function startGame() {
    start()
    back()
  }

  function back() {
    dispatch('close')
    lock.requestPointerLock()
  }
</script>

<style lang="scss">
    $bottom: 300px;

    .left, .right, .bottom {
      position: absolute;
      z-index: 7;
    }
    .bottom {
      bottom: 0px;
      width: 100vw;
      height: $bottom;
    }
    .left, .right {
      width: 50%;
      bottom: $bottom;
      top: 0px;

    }

    .left {
      left: 0;
      background: var(--secondary);
    }


    .right {
      right: 0;
      background: var(--primary);
      &::before {
        content: '';
        position: absolute;
        display: block;
        width: 400px;
        height: 2000px;
        top: 0px;
        left: 150px;
        background: var(--accent);
        transform: rotate(-25deg) scaleY(2);
      }  
    }

    .team {
      color: var(--accent);
    }

    h3, h2  {
      font-size: 2em;
      font-family: var(--font);
      text-align: center;
    }
    h3 {
      margin-top: 50px;
    }

    .player, .back, .start, .stop {
      cursor: pointer;
      margin: 60px auto;
      width: 100px;
      height: 100px;
      border: 1px solid black;
      border-radius: 50px;
      p {
        margin: 0;
        line-height: 100px;
        text-align: center;
      }
    }

    .actions {
      top: 50px;
      position: absolute;
      width: 425px;
      height: 350px;
      left: -225px;
      h2 {
        margin-left: -120px;
      }
      .start, .stop {
        margin-left: 140px;
      }
      .back {
        margin-left: 215px;
      }
    }

    @media (max-height: 680px) {
    .left, .right {
      bottom: 0px;
    }
    .bottom {
        display: none;
      }
    }
</style>