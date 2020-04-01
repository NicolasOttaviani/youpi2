<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { emit, messages, users } from './stores'
  import dayjs from 'dayjs'
  import relativeTime from 'dayjs/plugin/relativeTime'
  import 'dayjs/locale/fr'
  let chatWindow

  const dispatch = createEventDispatcher()
  let toSend = ''

  dayjs.locale('fr')
  dayjs.extend(relativeTime)

  messages.subscribe(() => {
    if (!chatWindow) return
    setTimeout(() => {
      chatWindow.scrollTop = chatWindow.scrollHeight
    }, 0)
  })

  function fromNow(timestamp: number) {
    return dayjs(timestamp).fromNow()
  }

  function send() {
    if (toSend) {
      emit(toSend)
      toSend = ''
    }
  }
</script>

<style lang="scss">
  ul,
  li {
    list-style-type: none;
    margin: 0;
    padding: 0;
  }
  :root {
    --border: 2px solid var(--accent);
  }

  section {
    height: 100%;
    widows: 100%;
    min-width: 0;
    min-height: 0;
    display: grid;
    grid-template-columns: 200px auto;
    grid-template-rows: auto 60px;
    grid-template-areas:
      'sidebar main'
      'sidebar footer';
    margin: 0px;
    border-top: var(--border);
    background: var(--secondary);

    main {
      grid-area: main;
      overflow: auto;
      padding: 10px;
      justify-content: space-between;
      align-items: center;

      &::-webkit-scrollbar {
        width: 6px;
      }
    }
    aside {
      grid-area: sidebar;
      padding: 10px;
      border-right: var(--border);
      background-color: var(--accent);
      color: var(--on-accent);
    }
    footer {
      grid-area: footer;
      padding: 10px;
      form {
        display: grid;
        grid-template-columns: 1fr 100px;
        * {
          padding: 10px;
          border: none;
          border-radius: 3px;
          font-size: 1em;
        }
        button {
          margin-left: 10px;
        }
      }
    }
  }
</style>

<section>
  <aside>
    <ul>
      {#each $users as { user }}
        <li>{user}</li>
      {/each}
    </ul>
  </aside>
  <main bind:this={chatWindow}>
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
