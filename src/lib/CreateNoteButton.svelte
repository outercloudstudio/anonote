<script>
    import NameNoteInput from "$lib/NameNoteInput.svelte";

    import { createEventDispatcher } from "svelte";
    import { createNote } from '$lib/fileSystem'

    const dispatch = createEventDispatcher();
    
    let creating = false

    function create(event) {
        createNote(event.detail)
    
        creating = false

        dispatch('create', event.detail)
    }
</script>

{#if creating}
     <NameNoteInput on:confirm={create} on:cancel={() => creating = false}/>
{:else}
    <div on:click={() => creating = true} id="new-note-button">
        <span class="material-symbols-rounded">add</span>
    </div>
{/if}

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

        justify-content: center;
    }

    div:hover {
        background: #ebe5dd;
    }
</style>