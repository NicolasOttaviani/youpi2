  <div class="left" style={`transform: translateX(-${$tranform}px);`}>
  </div>
  <div class="right" style={`transform: translateX(${$tranform}px)`}>
    <div class="login">
      <h1>Youpi2</h1>
      <form on:submit|preventDefault={submit}>
        <input type="text" placeholder="Login " bind:value={user} bind:this={ref} />
        <button type="submit" disabled={!user}>Enter</button>
      </form>
    </div>
  </div>
<script lang="ts">
  import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';

  import { connect } from './stores'
  import { createEventDispatcher, onMount } from 'svelte'
  const dispatch = createEventDispatcher()
  let ref
  let user = ''

  const tranform = tweened(0, {
		duration: 2000,
		easing: cubicOut
  });
  onMount(() => {
    setTimeout(() => ref.focus())
    const login = getParameterByName('login')
    if (login) {
      user = login
      submit()
    }
  })

  async function submit() {
    if (user !== '') {
      await connect(user)
      await tranform.set(1400)
      dispatch('login', user)
    }
  }

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
    position: absolute;
    width: 540px;
    padding: 40px;
    background: var(--secondary);
    border-radius: 4px;
    margin-left: -270px;
    margin-top: 20%;
    input {
      width: 360px;
      background: var(--primary);
      color: var(--accent);
      font: inherit;
      box-shadow: 0 6px 10px 0 rgba(0, 0, 0, 0.1);
      border: 0;
      outline: 0;
      padding: 22px 18px;
      margin-left: 50px;
    }

    button {
      margin-left: -96px;
      background: var(--accent);
      opacity: 0.8;
      color: #fff;
      box-shadow: 0 0 10px 2px rgba(0, 0, 0, 0.1);
      border-radius: 2px;
      padding: 12px 36px;
      display: inline-block;
      border: 0;
      outline: 0;
      cursor: pointer;

      &:hover {
        opacity: 1;
      }

      &:disabled,
      &[disabled] {
        background-color: #cccccc;
        color: #666666;
      }
    }
    
  }
  .left, .right {
    position: absolute;
    z-index: 10;
    height: 100vh;
    width: 50%;
    &::after {
      content: '';
      display: block;
      height: 80%;
    }
  }
  .left{
    margin-top: -10px;
    background-color:  var(--accent);
    left: 0px;
    &::after{
      background-color: var(--primary);
      margin-top: 40px;
      margin-left: -20px;
    }
  }

  .right {
    right: 0px;
    margin-top: -10px;
    background-color:  var(--secondary);
    &::after {
      background-color: var(--primary);
      margin-top: 40px;
      margin-left: 20px;
    }
  }
</style>