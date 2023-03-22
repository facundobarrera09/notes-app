import { useState, useEffect } from 'react'
import Login from './components/Login'
import Note from './components/Note'
import noteService from './services/notes'

const Notification = ({ message }) => {
    if (message === null) {
        return null
    }
  
    return (
        <div className='error'>
            {message}
        </div>
    )
}

const Footer = () => { 
    const footerStyle = {
        color: 'green',
        fontStyle: 'italic',
        fontSize: 16
    }
    return (
        <div style={footerStyle}>
            <br />
            <em>Note app, Facundo Barrera, 2023</em>
        </div>
    )
}

const App = (props) => {
    const [notes, setNotes] = useState([])
    const [newNote, setNewNote] = useState('New note...')
    const [showAll, setShowAll] = useState(true)
    const [errorMessage, setErrorMessage] = useState(null)
    const [username, setUsername] = useState('')
    const [name, setName] = useState('')
    const [token, setToken] = useState(null)
    
    useEffect(() => {
        noteService
            .getAll()
            .then(initialNotes => {
                setNotes(initialNotes)
            })
    }, [])

    const handleLogin = (data) => {
        setToken(data.token)
        setUsername(data.username)
        setName(data.name)
    }

    const addNote = (event) => {
        event.preventDefault()
        
        const note = {
            content: newNote,
            important: Math.random() < 0.5
        }

        noteService
            .create(note, token)
            .then(newNote => {
                setNotes(notes.concat(newNote))
                setNewNote('')
            })
            .catch(error => {
                notifyError('Need to log in before creating a note')
            })
    }

    const notifyError = (message) => {
        setErrorMessage(message)
        setTimeout(() => {
            setErrorMessage(null)
        }, 5000)
    }

    const handleImportaceChange = (changedNote) => {
        noteService
            .update(changedNote.id, changedNote)
            .then((updatedNote) => {
                setNotes(notes.map(n => n.id !== updatedNote.id ? n : updatedNote))
            })
            .catch((error) => {
                notifyError(`Note '${changedNote.content}' was already removed from server`)
                setNotes(notes.filter(note => note.id !== changedNote.id))
            })
    }

    const handleNewNoteChange = (event) => {
        setNewNote(event.target.value)
    }

    const handleVisibilityChange = (event) => {
        console.log('Clicked on visibility change: ',event.target.checked)
        setShowAll(!event.target.checked)
    }

    const notesToShow = showAll ? notes : notes.filter(note => note.important)

    return (
        <div>
            <h1>Notes</h1>
            <Login username={name} onSuccessfulConnection={handleLogin} handleError={notifyError} />
            <br />
            <Notification message={errorMessage} />
            Only show important notes<input type="checkbox" name="showImportantOnly" id="showImportantOnly" onChange={handleVisibilityChange} />
            <ul>
                {notesToShow.map(note =>
                    <Note key={note.id} note={note} handleImportanceChange={handleImportaceChange} />
                )}
            </ul>
            <form onSubmit={addNote}>
                <input value={newNote} onChange={handleNewNoteChange} />
                <button type="submit">Save</button>
            </form>
            <Footer />
        </div>
    )
}

export default App
