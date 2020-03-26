<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte'
  import { connect } from './stores'
  const dispatch = createEventDispatcher()
  const dev = process.env.NODE_ENV === 'notdevelopment'
  let user = ''

  async function submit() {
    if (user !== '') {
      await connect(user)
      dispatch('login')
    }
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

<style lang="scss">
  .login {
    width: 550px;
    padding: 40px 30px;
    background: #eee;
    border-radius: 4px;
    margin: auto;
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;

    h2 {
      color: #ccc;
      text-align: center;
      font-family: 'Vibur', cursive;
      font-size: 50px;
    }

    input {
      width: 360px;
      background: #fff;
      color: #a3a3a3;
      font: inherit;
      box-shadow: 0 6px 10px 0 rgba(0, 0, 0, 0.1);
      border: 0;
      outline: 0;
      padding: 22px 18px;
      margin-left: 50px;
    }

    button {
      margin-left: -96px;
      background: #7f8ff4;
      color: #fff;
      box-shadow: 0 0 10px 2px rgba(0, 0, 0, 0.1);
      border-radius: 2px;
      padding: 12px 36px;
      display: inline-block;
      border: 0;
      outline: 0;
      cursor: pointer;

      &:hover {
        background: #6c7ff2;
      }

      &:disabled,
      &[disabled] {
        background-color: #cccccc;
        color: #666666;
      }
    }
  }
</style>

<div class="login">
  <h2>Youpi2</h2>
  <form on:submit|preventDefault={submit}>
    <!-- svelte-ignore a11y-autofocus -->
    <input type="text" placeholder="Login " autofocus bind:value={user} />
    <button type="submit" disabled={!user}>Enter</button>
  </form>
</div>
