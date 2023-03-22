import axios from 'axios'
const baseUrl = 'http://localhost:3001/api/login'

const login = async (user) => {
    const response = await axios.post(baseUrl, user)
    return response.data
}

// eslint-disable-next-line import/no-anonymous-default-export
export default { login }