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
    <Arrow  top={75} left={290}/>
    <Arrow reverse={true} top={75} left={35}/>

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
</div>
<div class="bottom">
  <Chat />
</div>

<script lang="ts">
  import { createEventDispatcher, getContext } from 'svelte'
  import { get } from 'svelte/store'
  import {
    running,
    players,
    pickPlayer,
    start,
    stop,
    isPlaying,
  } from './stores'
  import Chat from './Chat.svelte'
  import Arrow from './Arrow.svelte'
  import StartButton from './StartButton.svelte'
  import BackButton from './BackButton.svelte'

  const dispatch = createEventDispatcher()
  const lock = getContext('lock')
  if (lock.exitPointerLock) lock.exitPointerLock()
  let player1, player2

  $: player1 = $players[0]
  $: player2 = $players[1]

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

    .player {
      cursor: pointer;
      margin: 60px auto;
      width: 100px;
      height: 100px;
      border: 1px solid var(--color);
      border-radius: 50px;
      p {
        margin: 0;
        line-height: 100px;
        text-align: center;
      }
    }

    .actions {
      top: 30px;
      position: absolute;
      width: 500px;
      bottom: 0px;
      left: -225px;
      color: var(--on-accent);
      h2 {
        margin-left: -120px;
      }
      .start, .back {
        position: absolute;
      }
      .start {
        left: 120px;
        top: 350px;
      }
      .back {
        right: 20px;
        top: 350px;
      }

      .description {
        position: absolute;
        top: 150px;
        left: 55px;
        width: 330px;
        display: flex;
        justify-content: center;
        align-content: center;
        &>img {
          max-width: 100px;
          max-height: 75px;
        }
        &>p {
          margin: 0;
          flex: 1;
        }
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