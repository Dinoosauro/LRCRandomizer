<script lang="ts">
    export let type = 0;
</script>

<div class="card" style={type === 1 ? `background-color: var(--input)` : ""}>
    <slot></slot><br />
</div>

<style>
    .card {
        padding: 10px 15px;
        margin: 0px 10px;
        background-color: var(--struct);
        border-radius: 8px;
        width: 100%;
        width: -moz-available;
        width: -webkit-fill-available;
        z-index: 1;
    }
    @media (min-width: 500px) {
        .card {
            flex: 1 0 400px;
        }
    }
</style>
