const jwt = require('jsonwebtoken')
const config = require('../utils/config')
const notesRouter = require('express').Router()
const Note = require('../models/note')
const User = require('../models/user')

const getTokenFrom = request => {
    const authorization = request.get('authorization')
    if (authorization && authorization.startsWith('Bearer ')) {
        return authorization.replace('Bearer ', '')
    }

    return null
}

notesRouter.get('/', async (request, response) => {
    const notes = await Note
        .find({})
        .populate('user', { username:1, name: 1 })

    response.json(notes)
})

notesRouter.get('/:id', async (request, response) => {
    const foundNote = await Note
        .findById(request.params.id)
        .populate('user', { username: 1, name: 1 })
    if (foundNote) {
        response.status(200).json(foundNote)
    }
    else {
        response.status(404).end()
    }
})

notesRouter.post('/', async (request, response) => {
    const body = request.body

    const decodedToken = jwt.verify(getTokenFrom(request), config.SECRET)

    if (!decodedToken.id) {
        return response.status(401).json({ error: 'invalid token' })
    }

    const user = await User.findById(decodedToken.id)

    const note = new Note({
        content: body.content,
        important: body.important || false,
        user: user.id
    })

    const savedNote = await note.save()
    user.notes = user.notes.concat(savedNote._id)
    await user.save()

    response.status(201).json(savedNote)
})

notesRouter.delete('/:id', async (request, response) => {
    const deletedNote = await Note.findByIdAndRemove(request.params.id)

    if (deletedNote) {
        response.status(204).end()
    }
    else {
        response.status(404).end()
    }
})

notesRouter.put('/:id', (request, response, next) => {
    const body = request.body

    const note = {
        content: body.content,
        important: body.important,
    }

    Note.findByIdAndUpdate(request.params.id, note, { new: true })
        .then(updatedNote => {
            response.json(updatedNote)
        })
        .catch(error => next(error))
})

module.exports = notesRouter