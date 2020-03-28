<script lang="ts">
  import { createEventDispatcher, getContext, onMount } from 'svelte'
  import { get } from 'svelte/store'
  import {
    running,
    players,
    pickPlayer,
    start,
    stop,
    isPlaying,
    winner,
  } from './stores'
  import Chat from './Chat.svelte'
  import Arrow from './Arrow.svelte'
  import StartButton from './StartButton.svelte'
  import BackButton from './BackButton.svelte'
  import PickPlayerButton from './PickPlayerButton.svelte'
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

  players.subscribe($players => {
    player1 = $players[0]
    player2 = $players[1]
  })

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
    width: 400px;
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
      margin: 10px 0 0 -180px;
    }
    .start,
    .back {
      position: absolute;
    }
    .start {
      left: 120px;
      top: 350px;
    }
    .back {
      right: -20px;
      top: 350px;
    }

    .description {
      position: absolute;
      top: 150px;
      left: 30px;
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

<div class="left" style={`transform: translateX(-${$transform}px);`}>
  <div class="team team1">
    <h3 class:winner={$winner === 'team1'}>Team 1</h3>
    <PickPlayerButton team1={true} on:click={() => pick(0)} bind:player={player1} />
  </div>

</div>
<div class="right" style={`transform: translateX(${$transform}px)`}>
  <div class="team team2">
    <h3 class:winner={$winner === 'team2'}>Team 2</h3>
    <PickPlayerButton team1={false} on:click={() => pick(1)} bind:player={player2} />
  </div>
</div>
<div class="actions" class:hidden>
  <h2>Choose your Team</h2>
  <Arrow top={55} left={270} />
  <Arrow reverse={true} top={55} left={-35} />

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
</div>
<div class="bottom">
  <Chat />
</div>
