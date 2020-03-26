<script lang="ts">
  import { setContext } from 'svelte'
  import Chat from '../components/Chat.svelte'
  import Ground from '../components/Ground.svelte'
  import GameSelect from '../components/GameSelect.svelte'
  import { running } from '../components/stores'
  let showConfig = false
  setContext('lock', {})
</script>

<style lang="scss">
  .modal {
    position: absolute;
    width: 100%;
    height: 100%;
    background: white;
  }
</style>

<svelte:head>
  <title>Youpi 2</title>
</svelte:head>

{#if !$running || showConfig}
  <div class="modal">
    <GameSelect on:back={() => (showConfig = false)} />
    <Chat />
  </div>
{/if}

<div>
  <Ground on:config={() => (showConfig = true)} />
</div>
