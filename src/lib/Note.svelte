<script>
    import { createEventDispatcher } from 'svelte'

    const dispatch = createEventDispatcher()
    
    export let name;
</script>

<div>
    <p on:click>{ name }</p>
    
    <span on:click={() => dispatch('delete', name)} class="material-symbols-rounded">delete</span>
</div>

<style>
    div {
        display: flex;

        background: none;

        transition: background 0.1s ease-out;

        margin-bottom: 5px;

        padding: 2px;
        padding-left: 6px;
        padding-right: 6px;

        border-radius: 5px;

        cursor: pointer;

        user-select: none;
    }

    div:hover {
        background: #ebe5dd;
    }
    
    p {
        flex-grow: 1;

        font-weight: 400;
    }

    span {
        opacity: 0;

        color: #a39f98;

        transition: opacity 0.1s ease-out;
    }

    div:hover > span {
        opacity: 1;
    }
</style>