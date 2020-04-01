<script lang="ts">
  import { derived } from 'svelte/store'
  import { score, team1, team2 } from './stores'

  function deriv(team: { user: string }[]) {
    team = team.filter(t => t !== undefined)
    if (team.length === 0) {
      return 'No Team'
    }
    return team.join(',')
  }

  const team1Players = derived(team1, deriv)
  const team2Players = derived(team2, deriv)
</script>

<style lang="scss">
  p {
    font-family: var(--font);
    text-align: center;
    font-size: 25px;
    margin: 0 0 10px 0;
  }
</style>

<p>{$team1Players} : {$score.team1} / {$score.team2} : {$team2Players}</p>
