import { writable, get } from 'svelte/store';
import { browser } from "$app/environment"

// export const root = writable({
//     name: 'root',
//     type: 'folder',
//     children: [
//         {
//             name: 'Note 1',
//             type: 'file',
//             content: 'This is a note.'
//         },
//         {
//             name: 'Note 2',
//             type: 'file',
//             content: 'This is also a note.'
//         }
//     ]
// })

const defaultNote = {
        name: 'Your Note',
        type: 'file',
        content: "# Welcome!\n## Tutorial\nYou can type '# <Heading Text>' to make a heading.\nType two hashtags like '## <Subheading Text>' to make a subheading.\nNormally type to write everything else.\n## What to do next?\nStart writing ideas. Record notes. Make a todo list. The choice is up to you! :D"
    }

function loadNotes() {
    const data = localStorage.getItem("notes")

    if(data === null) return [ JSON.parse(JSON.stringify(defaultNote)) ]

    try {
        return JSON.parse(data)
    } catch {
        return [ JSON.parse(JSON.stringify(defaultNote)) ]
    }
}

export const notes = writable(browser && loadNotes())

export function deleteNote(name) {
    notes.update(notes => {
        const index = notes.findIndex(note => note.name === name)
        
        notes.splice(index, 1)

        localStorage.setItem("notes", JSON.stringify(notes))
        
        return notes
    })
}

export function createNote(name) {
    notes.update(notes => {
        const note = JSON.parse(JSON.stringify(defaultNote))
        note.name = name
        note.content = "Start creating..."
        
        notes.push(note)

        localStorage.setItem("notes", JSON.stringify(notes))

        return notes
    })
}

export function getDefaultNote() {
    return get(notes)[0]
}

export function getNote(name) {
    return get(notes).find(note => note.name === name)
}

export function updateNote(name, content) {
    notes.update(notes => {
        const index = notes.findIndex(note => note.name === name)

        notes[index].content = content

        localStorage.setItem("notes", JSON.stringify(notes))

        return notes
    })
}