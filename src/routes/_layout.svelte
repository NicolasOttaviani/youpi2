<script>
  import Login from '../components/Login.svelte'
  let logged = false
</script>

<svelte:head>
  <title>Youpi 2 - Login</title>
</svelte:head>

{#if !logged}
  <Login on:login={() => (logged = true)} />
{:else}
  <slot />
{/if}
