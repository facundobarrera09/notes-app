const jwt = require('jsonwebtoken')
const config = require('../utils/config')
const Note = require('../models/note')
const User = require('../models/user')

const initialNotes = [
    {
        content: 'HTML is easy',
        important: false
    },
    {
        content: 'Browser can execute only JavaScript',
        important: true
    }
]

const nonExistingId = async () => {
    const note = new Note({ content: 'willremovethissoon' })
    await note.save()
    await note.deleteOne()

    return note._id.toString()
}

const notesInDb = async () => {
    const notes = await Note.find({})
    return notes.map(note => note.toJSON())
}

const usersInDb = async () => {
    const users = await User.find({})
    return users.map(user => user.toJSON())
}

const getRandomUserToken = async () => {
    const users = await usersInDb()
    const randomNumber = Math.floor(Math.random() * users.length)

    const user = await User.findOne({
        username: users[randomNumber].username
    })

    const userForToken = {
        username: user.username,
        id: user._id
    }

    const token = jwt.sign(
        userForToken,
        config.SECRET,
        { expiresIn: 2*60 }
    )

    return token.toString()
}

const getRandomUserId = async () => {
    const users = await usersInDb()
    const randomNumber = Math.floor(Math.random() * users.length)

    const user = await User.findOne({
        username: users[randomNumber].username
    })

    return user.id
}

module.exports = {
    initialNotes, nonExistingId, notesInDb, usersInDb, getRandomUserToken, getRandomUserId
}