<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { emit, lastInfo, messages } from './stores'
  import dayjs from 'dayjs'
  import relativeTime from 'dayjs/plugin/relativeTime'
  import 'dayjs/locale/fr'

  const dispatch = createEventDispatcher()
  let toSend = ''

  dayjs.locale('fr')
  dayjs.extend(relativeTime)

  function fromNow(timestamp: number) {
    return dayjs(timestamp).fromNow()
  }

  function send() {
    if (toSend) {
      emit(toSend)
      toSend = ''
    }
  }

  function config() {
    dispatch('config')
  }
</script>

<style lang="scss">
  :root {
    --body-bg: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    --msger-bg: #fff;
    --border: 2px solid #ddd;
    --left-msg-bg: #ececec;
    --right-msg-bg: #579ffb;
  }

  section {
    display: flex;
    flex-flow: column wrap;
    justify-content: space-between;
    margin: 0px;
    border-top: var(--border);
    border-radius: 5px;
    background-color: #fcfcfe;
    header {
      display: grid;
      grid-template-columns: 50px auto;
      padding: 2px;
      border-bottom: var(--border);
      background: #eee;
      color: #666;
      h3 {
        margin: 0 0 0 10px;
        padding: 0;
      }
    }
    main {
      flex: 1;
      overflow-y: auto;
      padding: 10px;
      justify-content: space-between;
      align-items: center;

      &::-webkit-scrollbar {
        width: 6px;
      }
      &::-webkit-scrollbar-track {
        background: #ddd;
      }
      &::-webkit-scrollbar-thumb {
        background: #bdbdbd;
      }
    }

    form {
      display: flex;
      padding: 10px;
      border-top: var(--border);
      background: #eee;
      * {
        padding: 10px;
        border: none;
        border-radius: 3px;
        font-size: 1em;
      }
      input {
        flex: 1;
        background: #ddd;
      }
      button {
        margin-left: 10px;
        background: rgb(0, 196, 65);
        color: #fff;
        font-weight: bold;
        cursor: pointer;
        &:hover {
          background: rgb(0, 180, 50);
        }
        &:disabled,
        &[disabled] {
          background-color: #cccccc;
          color: #666666;
        }
      }
    }
  }
</style>

<section>
  <header>
    <i class="gg-dribbble" />
    <h3>Welcome {lastInfo.user}</h3>
  </header>
  <main>
    <ul>
      {#each $messages as { timestamp, user, message }}
        <li>
          <b>@{user}</b>
          : {message}
          <time>({fromNow(timestamp)})</time>
        </li>
      {/each}
    </ul>
  </main>
  <form on:submit|preventDefault={send}>
    <input
      type="text"
      placeholder="Enter your message..."
      bind:value={toSend} />
    <button type="submit" disabled={!toSend}>Send</button>
  </form>
</section>
