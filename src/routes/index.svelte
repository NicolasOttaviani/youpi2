<script lang="ts">
  import { setContext } from 'svelte'
  import Ground from '../components/Ground.svelte'
  import GameBoard from '../components/GameBoard.svelte'
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
    <GameBoard on:close={closeConfig} />
  {/if}
  <Ground on:close={showConfig} />
{/if}

<style lang="scss">
</style>