const mongoose = require('mongoose')
const supertest = require('supertest')
const config = require('../utils/config')
const app = require('../app')
const helper = require('./helper')
const api = supertest(app)
const Note = require('../models/note')

const jwt = require('jsonwebtoken')

describe('when there is initially some notes saved', () => {
    beforeEach(async () => {
        await Note.deleteMany({})

        const noteObjects = helper.initialNotes
            .map(note => new Note(note))
        const promiseArray = noteObjects.map(note => note.save())
        await Promise.all(promiseArray)
    })

    test('notes are returned as json', async () => {
        await api
            .get('/api/notes')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })

    test('all notes are returned', async () => {
        const response = await api.get('/api/notes')

        expect(response.body).toHaveLength(helper.initialNotes.length)
    })

    test('a specific note is within the returned notes', async () => {
        const response = await api.get('/api/notes')

        const contents = response.body.map(r => r.content)
        expect(contents).toContain('Browser can execute only JavaScript')
    })

    describe('viewing a specific note', () => {
        test('succeeds with a valid id', async () => {
            const notes = await helper.notesInDb()

            const noteToView = notes[0]

            const result = await api
                .get(`/api/notes/${noteToView.id}`)
                .expect(200)
                .expect('Content-Type', /application\/json/)

            expect(result.body).toEqual(noteToView)
        })

        test('fails with statuscode 404 if note does not exist', async () => {
            const notes = await helper.notesInDb()

            const nonExistentNoteId = await helper.nonExistingId()

            await api
                .get(`/api/notes/${nonExistentNoteId}`)
                .expect(404)

            const notesIds = notes.map(note => note.id)
            expect(notesIds).not.toContain(nonExistentNoteId)
        })

        test('fails with statuscode 400 if id is invalid', async () => {
            const invalidId = 'id'

            await api
                .get(`/api/notes/${invalidId}`)
                .expect(400)
        })
    })

    describe('addition of a new note', () => {
        test('succeeds with valid data', async () => {
            const userToken = await helper.getRandomUserToken()
            const user = jwt.verify(userToken, config.SECRET)

            const newNote = {
                content: 'This is a new valid note',
                user: user.id,
                important: false
            }

            await api
                .post('/api/notes')
                .send(newNote)
                .set('authorization', 'Bearer ' + userToken)
                .expect(201)
                .expect('Content-Type', /application\/json/)

            const notesAtEnd = await helper.notesInDb()

            const contents = notesAtEnd.map(r => r.content)

            expect(notesAtEnd).toHaveLength(helper.initialNotes.length + 1)
            expect(contents).toContain('This is a new valid note')
        })

        test('fails with statuscode 400 if user is not authenticated', async () => {
            const notesAtStart = await helper.notesInDb()

            const newNote = {
                content: 'This is a new valid note',
                user: await helper.getRandomUserId(),
                important: false
            }

            const result = await api
                .post('/api/notes')
                .send(newNote)
                .expect(400)

            expect(result.text).toContain('jwt must be provided')

            const notesAtEnd = await helper.notesInDb()
            expect(notesAtEnd).toEqual(notesAtStart)
        })

        test('fails with statuscode 400 if token is valid but data is not', async () => {
            const userToken = await helper.getRandomUserToken()

            const newNote = {
                important: false
            }

            const result = await api
                .post('/api/notes')
                .set('authorization', 'Bearer ' + userToken)
                .send(newNote)
                .expect(400)

            expect(result.text).toContain('Path `content` is required')

            const response = await helper.notesInDb()

            expect(response).toHaveLength(helper.initialNotes.length)
        })
    })

    describe('deletion of a note', () => {
        test('succeeds if note is deleted', async () => {
            const notesAtStart = await helper.notesInDb()

            const noteToDelete = notesAtStart[0]

            await api
                .delete(`/api/notes/${noteToDelete.id}`)
                .expect(204)

            const notesAtEnd = await helper.notesInDb()
            expect(notesAtEnd).toHaveLength(helper.initialNotes.length - 1)

            const contents = notesAtEnd.map(note => note.content)
            expect(contents).not.toContain(noteToDelete.content)
        })

        test('fails with statuscode 404 if note is does not exist', async () => {
            const notesAtStart = await helper.notesInDb()
            const nonExistentNoteId = await helper.nonExistingId()

            await api
                .delete(`/api/notes/${nonExistentNoteId}`)
                .expect(404)

            const notesAtEnd = await helper.notesInDb()

            expect(notesAtEnd).toEqual(notesAtStart)
        })

        test('fails with statuscode 400 if id is invalid', async () => {
            const notesAtStart = await helper.notesInDb()
            const nonExistentNoteId = 'id'

            await api
                .delete(`/api/notes/${nonExistentNoteId}`)
                .expect(400)

            const notesAtEnd = await helper.notesInDb()

            expect(notesAtEnd).toEqual(notesAtStart)
        })
    })
})

afterAll(async () => {
    await mongoose.connection.close()
})