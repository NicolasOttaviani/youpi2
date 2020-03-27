<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { emit, lastInfo, messages, users } from './stores'
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
  ul, li {
    list-style-type: none;
    margin: 0;
    padding: 0;
  }
  h3 {
    margin: 0;
    padding: 0;
  }
  :root {
    --border: 2px solid #ddd;
    --left-msg-bg: #ececec;
    --right-msg-bg: #579ffb;
  }

  section {
    height: 100%;
    widows: 100%;
    min-width: 0;
    min-height: 0;
    display: grid;
    grid-template-columns: 200px auto;
    grid-template-rows: 30px auto 60px;
    grid-template-areas: "sidehead header"
                       "sidebar main"
                       "sidebar footer";
    margin: 0px;
    border-top: var(--border);
    border-radius: 5px;
    background-color: #fcfcfe;
    header.main {
      grid-area: header;
      border-bottom: var(--border);
      padding-left: 10px;
    }

    main {
      grid-area: main;
      overflow: auto;
      padding: 10px;
      justify-content: space-between;
      align-items: center;
      border-bottom: var(--border);
      background: #eee;
      color: #666;

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
    header.aside {
      padding-left: 10px;
      grid-area: sidehead;
      border-bottom: var(--border);
    }
    aside {
      grid-area: sidebar;
      padding: 10px;
      border-right: var(--border);
    }
    footer {
      grid-area: footer;
      padding: 10px;
      border-top: var(--border);
      background: #eee;
      form {
        display: grid;
        grid-template-columns: 1fr 100px;
        * {
          padding: 10px;
          border: none;
          border-radius: 3px;
          font-size: 1em;
        }
        input {
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
  }

</style>

<section>
  <header class="main">
    <h3>
      Welcome {lastInfo.user}
    </h3>
  </header>
  <header class="aside">
    Users
  </header>
  <aside>
    <ul>
      {#each $users as user}
        <li>{user}</li>
      {/each}
    </ul>
  </aside>
  <main>
    <ul>
      {#each $messages as { timestamp, user, message }}
        <li>
          <b>{user}</b>
          : {message}
          <time>({fromNow(timestamp)})</time>
        </li>
      {/each}
    </ul>
  </main>
  <footer>
    <form on:submit|preventDefault={send}>
      <input
        type="text"
        placeholder="Enter your message..."
        bind:value={toSend} />
      <button type="submit" disabled={!toSend}>Send</button>
    </form>
  </footer>
</section>
