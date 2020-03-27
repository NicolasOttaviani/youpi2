<script lang="ts">
  import { setContext } from 'svelte'
  import Chat from '../components/Chat.svelte'
  import Ground from '../components/Ground.svelte'
  import GameSelect from '../components/GameSelect.svelte'
  import { running, configure } from '../components/stores'
  let showConfig = false
  setContext('lock', {})
  configure()
</script>

<style lang="scss">
  .modal {
    position: fixed;
    width: 10Ovw;
    height: 100vh;
    background: white;
    .container {
      position: Z;
      display: grid;
      width: 100vw;
      height: 100vh;
      min-width: 0;
      min-height: 0;
      grid-template-rows: 420px auto;
    }
  }
</style>

<svelte:head>
  <title>Youpi 2</title>
</svelte:head>

{#if !$running || showConfig}
  <div class="modal">
    <div class="container">
      <GameSelect on:back={() => (showConfig = false)} />
      <Chat />
      </div>
  </div>
{/if}

<div>
  <Ground on:config={() => (showConfig = true)} />
</div>
