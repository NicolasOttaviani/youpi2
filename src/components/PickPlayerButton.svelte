<div class="block" class:empty={!player || player=== ''} class:team1 on:click>
    <span>{player || 'Click!'}</span>
</div>

<script>
export let player = undefined
export let team1
</script>

<style lang="scss">
//variables
$basic-dark-color: #212121; //color of the spinner
$border-width: 4px; //width of spinners border
$basic-spinner-dimensions: 125px; //width and height of spinner
$main-spinner-dimensions: $basic-spinner-dimensions - $border-width * 2; //width and height of bigger circle

.block {
    position: relative;
    width: $basic-spinner-dimensions;
    height: $basic-spinner-dimensions;
    margin: 0 auto;
    cursor: pointer;

    &.team1 {
        &::before, &::after {
            border-color: var(--team1);
        }
    }

    &:not(team1) {
        &::before, &::after {
            border-color: var(--team2);
        }
    }

    &:not(.empty) {
        border-radius: 50%;
        &.team1 {
            background: var(--team1)
        }
        &:not(team1) {
            background: var(--team2)
        }
        span {
            color: #fff;
            font-size: 30px;
        }
    }

    &.empty {
        &:before,
        &:after {
            content: "";
            display: block;
            position: absolute;
            border-width: 4px;
            border-style: solid;
            border-radius: 50%;
        }
        
        @keyframes scale-2 {
            0% {
            transform: scale(0);
            opacity: 0;
            }
            
            50% {
            transform: scale(0.7);
            opacity: 1;
            }
            
            100% {
            transform: scale(1);
            opacity: 0;
            }
        }
        
        &:before {
            width: $main-spinner-dimensions;
            height: $main-spinner-dimensions;
            top: 0px;
            left: 0px;
            animation: scale-2 1s linear 0s infinite;
        }
        
        &:after {
            width: $main-spinner-dimensions;
            height: $main-spinner-dimensions;
            top: 0;
            left: 0;
            opacity: 0;
            animation: scale-2 1s linear 0.5s infinite;
        }
    }
    span {
        width: 100%;
        display: inline-block;
        height: 100%;
        text-align: center;
        font-family: var(--font);
        font-size: 22px;
        line-height: $basic-spinner-dimensions;
    }
  }
</style>