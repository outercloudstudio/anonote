<script>
    import { notes, deleteNote, getDefaultNote } from "$lib/fileSystem";
    import Note from "$lib/Note.svelte";
    import CreateNoteButton from "$lib/CreateNoteButton.svelte";

    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    let menuOpen = false;

    function menuButtonClick() {
        menuOpen = !menuOpen;

        if (!menuOpen) dispatch("close");
    }

    async function open(note) {
        menuOpen = false;

        dispatch("open", note.name);
    }

    function deleteNoteAndOpenDefault(name) {
        deleteNote(name)

        open(getDefaultNote())
    }
</script>

<div id="menu" class:open={menuOpen}>
    {#each $notes as note}
        <Note
            name={note.name}
            on:click={() => open(note)}
            on:delete={(event) => deleteNoteAndOpenDefault(event.detail)}
        />
    {/each}

    <CreateNoteButton on:create={event => open({ name: event.detail })} />
</div>

<span
    id="menu-button"
    class="material-symbols-rounded"
    class:open={menuOpen}
    on:click={menuButtonClick}
>
    {menuOpen ? "close" : "menu"}
</span>

<style>
    #menu {
        background: #fffbf5;

        position: absolute;
        top: 0rem;
        left: 0;

        height: calc(100vh - 50px);
        width: 200px;

        box-shadow: 0 0 8px rgba(0, 0, 0, 0.2);

        border-radius: 0 8px 8px 0;

        translate: calc(-100%) 0;

        transition: left 0.2s ease-out;

        padding: 20px;
        padding-top: 30px;
    }

    #menu.open {
        left: 240px;
    }

    #menu-button {
        left: 5px;
        top: 2px;

        scale: 1;
        rotate: 0;

        cursor: pointer;

        position: relative;

        transition: left 0.2s ease-out, background 0.05s ease, color 0.05s ease,
            rotate 0.1s ease-out;

        border-radius: 50%;

        padding: 3px;

        user-select: none;
    }

    #menu-button:hover {
        background: #373738;
        color: white;
        rotate: 90deg;
    }

    #menu-button.open {
        left: 210px;
    }
</style>
