import { useState } from "react"

const Note = ({ note , handleImportanceChange }) => {

    const handleChange = (event) => {
        console.log('changing importance of', note.id, 'from', note.important, 'to', !note.important)
        const newNote = { ...note, important: event.target.checked } // DO NOT MUTATE ORIGINAL NOTE
        handleImportanceChange(newNote)
    }

    return (
        <li className="note">
            {note.content}
            &emsp;
            &emsp;
            &emsp;
            Important:
            <input type="checkbox" name="isNoteImportant" id="isNoteImportant" onChange={handleChange} defaultChecked={note.important}/>
        </li>
    )
}

const CreateNote = (props) => {
    const [newNote, setNewNote] = useState('New note...')

    const handleNewNote = async (event) => {
        event.preventDefault()

        const note = {
            content: newNote,
            important: Math.random() < 0.5
        }

        const result = await props.addNote(note)

        if (!result) {
            setNewNote('')
        }
    }

    return (
        <form onSubmit={handleNewNote}>
            <input value={newNote} onChange={(event) => { setNewNote(event.target.value) } } />
            <button type="submit">Save</button>
        </form>
    )
}

// eslint-disable-next-line import/no-anonymous-default-export
export default { Note, CreateNote }