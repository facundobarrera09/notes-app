const bcrypt = require('bcrypt')
const User = require('../models/user')
const helper = require('./helper')

const app = require('../app')
const supertest = require('supertest')

const api = supertest(app)

describe('when there is initially one user in the database', () => {

    beforeEach(async () => {
        await User.deleteMany({})

        const passwordHash = await bcrypt.hash('password', 10)
        const user = new User({ username: 'root', passwordHash })

        await user.save()
    })

    describe('creation of a new user', () => {
        test('succeeds with statuscode 201 if fresh username', async () => {
            const usersAtStart = await helper.usersInDb()

            const newUser = {
                username: 'facundobarrera',
                name: 'Facundo Barrera',
                password: 'password'
            }

            await api
                .post('/api/users')
                .send(newUser)
                .expect(201)
                .expect('Content-Type', /application\/json/)

            const usersAtEnd = await helper.usersInDb()

            expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

            const usernames = usersAtEnd.map(user => user.username)

            expect(usernames).toContain(newUser.username)
        })

        test('fails with statuscode 400 if username already exists', async () => {
            const usersAtStart = await helper.usersInDb()

            const newUser = {
                username: 'root',
                password: 'password'
            }

            const result = await api
                .post('/api/users')
                .send(newUser)
                .expect(400)

            expect(result.body.error).toContain('expected `username` to be unique')

            const usersAtEnd = await helper.usersInDb()
            expect(usersAtEnd).toEqual(usersAtStart)
        })
    })


})