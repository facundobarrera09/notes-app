const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (request, response) => {
    const users = await User
        .find({})
        .populate('notes', { content: 1, important: 1 })

    response.status(200).json(users)
})

usersRouter.post('/', async (request, response) => {
    const { username, name, password } = request.body

    const passwordHash = await bcrypt.hash(password, 10)

    const newUser = new User({
        username,
        name,
        passwordHash
    })

    const savedUser = await newUser.save()
    response.status(201).json(savedUser)
})

module.exports = usersRouter