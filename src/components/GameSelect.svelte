<section>
  <h3>Choose your Team</h3>
  <div class="players">
    <div>
      <p>Team 1</p>
      <div class="player" on:click={() => pick(0)}>
        <p>{player1 || 'Click!'}</p>
      </div>
    </div>
    <div>
      <p>Team 2</p>
      <div class="player" on:click={() => pick(1)}>
        <p>{player2 || 'Click!'}</p>
      </div>
    </div>
  </div>
  <div class="actions">
    {#if $running}
      {#if $isPlaying}
        <button on:click={stop}>Stop</button>
      {/if}
      <button on:click={back}>Back</button>
    {:else}
      <button on:click={startGame}>Start</button>
    {/if}
  </div>
</section>

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
  section {
    padding: 50px 70px 0 100px;
    h3 {
      text-align: center;
    }

    .players {
      margin-top: 30px;
      display: grid;
      grid-template-columns: 50% 50%;
      & > div {
        align-self: center;
        justify-self: center;
        text-align: center;

        div.player {
          width: 100px;
          height: 100px;
          border: 1px solid black;
          border-radius: 50px;
          p {
            margin: 0;
            line-height: 100px;
          }
        }
      }
    }

    .actions {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
    }
  }
</style>