import axios from 'axios'
const baseUrl = 'http://localhost:3001/api/notes'

let token = ''
const setToken = (newToken) => {
    token = 'Bearer ' + newToken
}

const getAll = () => {
    const request = axios.get(baseUrl)
    return request.then(response => response.data)
}

const create = (newObject) => {
    console.log(token)
    const request = axios.post(baseUrl, newObject, { headers: { Authorization: token } })
    return request.then(response => response.data)
}

const update = (id, newObject) => {
    const request = axios.put(`${baseUrl}/${id}`, newObject)
    return request.then(response => response.data)
}

export default {
    getAll,
    create,
    update,
    setToken
}