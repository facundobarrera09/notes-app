import { useState, useEffect } from 'react'
import Login from './components/Login'
import noteComponents from './components/Note'
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
    const [showAll, setShowAll] = useState(true)
    const [errorMessage, setErrorMessage] = useState(null)
    const [user, setUser] = useState(null)
    
    useEffect(() => {
        noteService
            .getAll()
            .then(initialNotes => {
                setNotes(initialNotes)
            })
    }, [])

    useEffect(() => {
        const loggedUserJSON = window.localStorage.getItem('loggedNoteappUser')

        if (loggedUserJSON) {
            const user = JSON.parse(loggedUserJSON)
            setUser(user)
            noteService.setToken(user.token)
        }
    }, [])

    const setLoginData = (data) => {
        window.localStorage.setItem('loggedNoteappUser', JSON.stringify(data))
        setUser(data)
        noteService.setToken(data.token)
    }

    const removeLoginData = () => {
        console.log('Logging out')
        window.localStorage.removeItem('loggedNoteappUser')
        setUser(null)
        noteService.setToken('')
    }

    const addNote = async (newNote) => {
        try {
            const result = await noteService.create(newNote)
            setNotes(notes.concat(newNote))
        }
        catch (exception) {
            notifyError('Need to log in before creating a note')
            return exception
        }
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

    const handleVisibilityChange = (event) => {
        console.log('Clicked on visibility change: ',event.target.checked)
        setShowAll(!event.target.checked)
    }

    const notesToShow = showAll ? notes : notes.filter(note => note.important)

    return (
        <div>
            <h1>Notes</h1>
            <Login username={(user) ? user.name : null} onSuccessfulConnection={setLoginData} onDisconnect={removeLoginData} handleError={notifyError} />
            <br />
            <Notification message={errorMessage} />
            {(user) ? (<><noteComponents.CreateNote addNote={addNote} /> <br /></>) : null}
            Only show important notes<input type="checkbox" name="showImportantOnly" id="showImportantOnly" onChange={handleVisibilityChange} />
            <ul>
                {notesToShow.map(note =>
                    <noteComponents.Note key={note.id} note={note} handleImportanceChange={handleImportaceChange} />
                )}
            </ul>
            <Footer />
        </div>
    )
}

export default App
