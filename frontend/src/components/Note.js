const Importance = ({ important, handleChange }) => {
    return (
        <>
            &emsp;
            &emsp;
            &emsp;
            Important:
            <input type="checkbox" name="isNoteImportant" id="isNoteImportant" onChange={handleChange} defaultChecked={important}/>
        </>
    )
}

const Note = ({ note , handleImportanceChange }) => {

    const handleChange = (event) => {
        console.log('changing importance of', note.id, 'from', note.important, 'to', !note.important)
        const newNote = { ...note, important: event.target.checked } // DO NOT MUTATE ORIGINAL NOTE
        handleImportanceChange(newNote)
    }

    return (
        <li className="note">
            {note.content}
            <Importance important={note.important} handleChange={handleChange} />
        </li>
    )
}

export default Note