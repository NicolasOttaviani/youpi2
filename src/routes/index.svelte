<script lang="ts">
  import { setContext } from 'svelte'
  import Chat from '../components/Chat.svelte'
  import Ground from '../components/Ground.svelte'
  import GameSelect from '../components/GameSelect.svelte'
  import { running, ready } from '../components/stores'
  import Login from '../components/Login.svelte'
  let logged = false
  let config = false
  const lock = {}
  setContext('lock', lock)

  async function login(user) {
      logged = true
  }

  function showConfig() {
    config = true
  }

  function closeConfig() {
    config = false
  }
  
</script>

<svelte:head>
  <title>Youpi 2</title>
</svelte:head>

{#if !logged}
  <Login on:login={({detail}) => login(detail)} />
{/if}
{#if $ready}
  {#if !$running || config}
    <div class="modal main">
      <GameSelect on:close={closeConfig} />
      <Chat />
    </div>
  {/if}
  <div>
    <Ground on:close={showConfig} />
  </div>
{/if}

<style lang="scss">
  .modal {
    position: fixed;
    width: 10Ovw;
    height: 100vh;
    background: white;
  }

  .main {
    display: grid;
    width: 100vw;
    height: 100vh;
    min-width: 0;
    min-height: 0;
    grid-template-rows: 420px auto;
  }
</style>