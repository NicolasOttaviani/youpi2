<script lang="ts">
  import { setContext, onMount } from 'svelte'
  import Chat from '../components/Chat.svelte'
  import Ground from '../components/Ground.svelte'
  import GameSelect from '../components/GameSelect.svelte'
  import { running, connect } from '../components/stores'
  import Login from '../components/Login.svelte'
  let logged = false
  let config = false
  const lock = {}
  setContext('lock', lock)

  async function login(user) {
      await connect(user)
      logged = true
  }

  function showConfig() {
    config = true
  }

  function closeConfig() {
    config = false
  }

  onMount(() => {
    const login = getParameterByName('login')
    if (login) {
      user = login
      submit()
    }
  })

  function getParameterByName(name, url) {
    if (!url) url = window.location.href
    name = name.replace(/[\[\]]/g, '\\$&')
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url)
    if (!results) return null
    if (!results[2]) return ''
    return decodeURIComponent(results[2].replace(/\+/g, ' '))
  }
</script>

<svelte:head>
  <title>Youpi 2</title>
</svelte:head>

{#if !logged}
  <div class="modal">
    <Login on:login={({detail}) => login(detail)} />
  </div>
{:else}
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