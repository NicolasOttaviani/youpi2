<script>
    export let reverse = false
    export let top
    export let left
</script>

<div class='curved-arrow' class:reverse style={`top: ${top}px; left: ${left}px;`}></div>
<style>

.curved-arrow{
	position: absolute;
	width: 0;
	height: 0;
	border-right: 12px solid var(--on-accent);
	border-top: 12px solid transparent;
	transform: rotate(5deg) scale(2);
}
.curved-arrow:after{
	content: '';
	position: absolute;
	width: 20px;
	height: 20px;
	border-right: 3px solid var(--on-accent);
	border-radius: 0 30px 0 0;
	left: -18px;
	top: -15px;
	transform: rotate(-45deg);
}
.reverse{
	transform: rotate(-5deg) scaleX(-2) scaleY(2);
}
</style>