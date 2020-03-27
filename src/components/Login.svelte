<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  const dispatch = createEventDispatcher()
  let user = ''

  async function submit() {
    if (user !== '') {
      dispatch('login', user)
    }
  }

</script>

<style lang="scss">
  .login {
    position: relative;
    width: 550px;
    padding: 40px 30px;
    background: #eee;
    border-radius: 4px;
    margin: auto;

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
