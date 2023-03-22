import axios from 'axios'
const baseUrl = 'http://localhost:3001/api/login'

const login = (user) => {
    const request = axios.post(baseUrl, user)
    return request.then(response => response.data)
}

export default login