<script>
    import { onMount, onDestroy, tick } from "svelte";
    import SideMenu from "$lib/SideMenu.svelte";

    import { getNote, getDefaultNote, updateNote } from "$lib/fileSystem";

    let noteTextArea;
    let noteArea;

    let currentNoteName;
    let rawNoteText = "";

    $: if (rawNoteText !== undefined && currentNoteName !== undefined) {
        updateNote(currentNoteName, rawNoteText);
    }
    
    function styleNote(rawText) {
        let style = []
        let parsedText = ""
        let mappings = []

        let startOfLine = true
        let title = false
        let titleStart = -1
        let subtitle = false
        let subtitleStart = -1

        let characterIndex = 0
        for(; characterIndex < rawText.length; characterIndex++) {
            const character = rawText[characterIndex]
            const nextCharacter = rawText[characterIndex + 1]
            const secondNextCharacter = rawText[characterIndex + 2]
            const thirdNextCharacter = rawText[characterIndex + 3]

            let hidden = false
            
            if (startOfLine && character === "#" && nextCharacter === " " && secondNextCharacter !== "\n" && secondNextCharacter !== undefined) {
                title = true
                titleStart = characterIndex
                hidden = true
            }

            if(title && character === " " && characterIndex - titleStart === 1) hidden = true

            if (startOfLine && character === "#" && nextCharacter === "#" && secondNextCharacter === " " && thirdNextCharacter !== "\n" && thirdNextCharacter !== undefined) {
                subtitle = true
                subtitleStart = characterIndex
                hidden = true
            }

            if(subtitle && character === "#" && characterIndex - subtitleStart === 1) hidden = true
            if(subtitle && character === " " && characterIndex - subtitleStart === 2) hidden = true
            
            if (character === "\n") {
                title = false
                subtitle = false
            }

            startOfLine = character === "\n"

            if(hidden) continue;
            
            style.push({
                title,
                subtitle,
                newLine: character === '\n',
                fullLine: character === '\n' && nextCharacter === "\n",
            })
            
            parsedText += character
            mappings.push(characterIndex)
        }

        mappings.push(characterIndex)
        
        return {
            parsedText,
            style,
            mappings
        }
    }

    $: styledNote = {
        parsedText: "",
        style: [],
        mappings: [],
    };
    
    let focused = false;

    let cursorPosition = 0;
    let cursorX = -100;
    let cursorY = -100;

    async function open(noteName) {
        const note = getNote(noteName);

        rawNoteText = note.content;
        
        styledNote = styleNote(rawNoteText);
        cursorPosition = styledNote.parsedText.length;
        
        currentNoteName = noteName;

        await tick();

        updateCursor();
    }

    function updateCursor() {
        if (rawNoteText.length === 0) {
            const bounds = noteTextArea.getBoundingClientRect();

            cursorX = bounds.left;

            return;
        }

        if (cursorPosition === 0) {
            const bounds = noteTextArea.children
                .item(0)
                .getBoundingClientRect();

            cursorX = bounds.left;
            cursorY = bounds.bottom;

            return;
        }

        const character = styledNote.parsedText[cursorPosition - 1]
        const style = styledNote.style[cursorPosition - 1]

        if (character === "\n") {
            const bounds = noteTextArea.children
                .item(cursorPosition)
                .getBoundingClientRect();

            cursorX = bounds.left;
            cursorY = bounds.bottom;

            return;
        }

        const bounds = noteTextArea.children
            .item(cursorPosition - 1)
            .getBoundingClientRect();

        cursorX = bounds.right;
        cursorY = bounds.bottom;
    }

    function isDescendant(parent, child) {
        let node = child.parentNode;

        while (node != null) {
            if (node == parent) {
                return true;
            }

            node = node.parentNode;
        }

        return false;
    }

    function click(event) {
        focused =
            isDescendant(noteArea, event.target) || event.target === noteArea;

        if(noteTextArea.contains(event.target) && noteTextArea !== event.target && event.target.id !== "hidden-character") {
            cursorPosition = Array.from(noteTextArea.children).indexOf(event.target);

            const bounds = event.target.getBoundingClientRect()
            
            if(event.clientX > bounds.left + bounds.width / 2) cursorPosition++

            updateCursor()
        } else if(event.target === noteArea || event.target === noteTextArea || event.target.id === "hidden-character") {
            const clickX = event.clientX;
            const clickY = event.clientY;

            for(cursorPosition = 0; cursorPosition < styledNote.parsedText.length; cursorPosition++) {
                const child = noteTextArea.children[cursorPosition]
                const bounds = child.getBoundingClientRect()
                
                if(clickY < bounds.top) break;

                if(clickY < bounds.bottom && clickX < bounds.right) break;
            }

            updateCursor()
        }
    }

    function setCursorPositionToRaw(position) { 
        let newPosition = 0
        for(; styledNote.mappings[newPosition] < position; newPosition++) {
            
        }
        
        cursorPosition = newPosition
    }
    
    async function keyDown(event) {
        if (!focused) return;

        if (event.key === "ArrowRight") {
            if (cursorPosition === styledNote.parsedText.length) return;

            cursorPosition++;

            await tick();

            updateCursor();
        } else if (event.key === "ArrowLeft") {
            if (cursorPosition === 0) return;

            cursorPosition--;

            await tick();

            updateCursor();
        } else if (event.key === "Backspace") {
            if (styledNote.mappings[cursorPosition] === 0) return;

            const rawCursorPosition = styledNote.mappings[cursorPosition]

            rawNoteText =
                rawNoteText.slice(0, rawCursorPosition - 1) +
                rawNoteText.slice(rawCursorPosition, rawNoteText.length);

            styledNote = styleNote(rawNoteText)

            setCursorPositionToRaw(rawCursorPosition - 1);
            
            await tick();

            updateCursor();
        } else if (event.key !== "Enter" && event.key.length > 1) {
        } else {
            let key = event.key;

            if (key === "Enter") key = "\n";

            const rawCursorPosition = styledNote.mappings[cursorPosition]

            rawNoteText =
                rawNoteText.slice(0, rawCursorPosition) +
                key +
                rawNoteText.slice(rawCursorPosition, rawNoteText.length);

            styledNote = styleNote(rawNoteText)

            setCursorPositionToRaw(rawCursorPosition + 1)

            await tick();

            updateCursor();
        }
    }

    async function menuClosed() {
        setTimeout(() => (focused = true), 0);
    }

    function cursorStyle(styledNote, position) {
        if(rawNoteText.length === 0) return {}
        
        if(styledNote.parsedText[position] === "\n") return styledNote.style[position - 1]
        if(position === styledNote.parsedText.length) return styledNote.style[position - 1]
            
        return styledNote.style[position]
    }
    
    onMount(async () => {
        window.addEventListener("keydown", keyDown);
        window.addEventListener("click", click);

        const note = getDefaultNote();

        open(note.name)

        return () => {
            window.removeEventListener("keyDown", keyDown);
            window.removeEventListener("click", click);
        };
    });
</script>

<main>
    <div bind:this={noteArea} id="note-area">
        <div bind:this={noteTextArea} id="note-text-area">
            {#each styledNote.parsedText as character, index}
                <p 
                    class:title={styledNote.style[index].title}
                    class:subtitle={styledNote.style[index].subtitle}
                    style:flex-basis={styledNote.style[index].newLine ? "100%" : "auto"}
                    style:flex-shrink={character === ' ' ? '0' : '1'}
                    class:empty-line={styledNote.style[index].newLine && !styledNote.style[index].fullLine}
                >
                    {character}
                </p>
            {/each}
            <p id="hidden-character">a</p>
        </div>
    </div>

    {#if focused}
        <p
            id="cursor"
            
            style:left={cursorX + "px"}
            style:top={cursorY + "px"}
            
            class:title={cursorStyle(styledNote, cursorPosition).title}
            class:subtitle={cursorStyle(styledNote, cursorPosition).subtitle}
        >
        |
        </p>
    {/if}

    <SideMenu on:open={(event) => open(event.detail)} on:close={menuClosed} />
</main>

<style>
    #note-area {
        position: absolute;

        top: 0;
        left: 0;

        width: 100vw;
        height: 100vh;
    }

    @keyframes blink {
        0% {
            opacity: 0;
        }
        50% {
            opacity: 1;
        }
        100% {
            opacity: 0;
        }
    }

    #cursor {
        position: absolute;
        display: table;

        margin: 0;
        padding: 0;

        animation: blink 1s 0.5s infinite;

        translate: calc(-100% + 0.2rem) calc(-100% - 0.05rem);

        user-select: none;
    }

    #note-text-area {
        width: calc(100vw - 100px);
        max-width: 600px;

        position: absolute;

        left: 50vw;

        translate: -50% 0;

        top: 100px;

        white-space: break-spaces;

        display: flex;
        flex-wrap: wrap;

        max-height: calc(100vh - 100px);

        overflow: auto;

        scrollbar-width: none;
    }

    #note-text-area > p {
        user-select: none;

        display: inline-block;
        
        font-weight: 400;
    }

    .title {
        font-size: 2.0rem;
        font-weight: 900 !important;
    }

    .subtitle {
        font-size: 1.5rem;
        font-weight: 500 !important;
        margin-bottom: 0.2rem;
    }

    .empty-line {
        height: 0;
    }
        
    #hidden-character {
        opacity: 0;
    }

    main {
        width: 100vw;
        height: 100vh;

        margin: 0;

        background-color: var(--background-color);

        position: relative;

        overflow: hidden;
    }
</style>
