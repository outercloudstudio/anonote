<script>
    import { createEventDispatcher, onMount } from "svelte";
    import { getNote } from "$lib/fileSystem";

    const dispatch = createEventDispatcher();

    let inputElement;
    let noteName = "";

    $: invalidName = getNote(noteName) !== undefined || noteName === "";

    function keyDown(event) {
        if (event.key === "Enter" && !invalidName) {
            dispatch("confirm", noteName);
        }

        if (event.key === "Escape") {
            dispatch("cancel");
        }
    }

    onMount(() => {
        inputElement.focus();
    });
</script>

<input bind:this={inputElement} bind:value={noteName} on:keydown={keyDown} />

<style>
    input {
        outline: none;
        border: none;

        border: #ebe5dd 2px solid;
        background: #fffbf5;

        margin-bottom: 5px;

        min-width: 0;

        display: block;
        width: calc(100% - 12px);

        padding: 2px;
        padding-left: 6px;
        padding-right: 6px;

        border-radius: 5px;

        user-select: none;

        justify-content: center;

        height: 20px;

        font-weight: 400;
        font-family: 'Satoshi';
        font-size: 1rem;
    }
</style>
