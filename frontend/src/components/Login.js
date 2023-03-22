import { useState } from "react"
import login from '../services/login'

const Login = (props) => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    const handleLogin = (event) => {
        event.preventDefault()

        const user = {
            username,
            password
        }

        login(user)
            .then((response) => {
                props.onSuccessfulConnection(response)
            })
            .catch((error) => {
                props.handleError(error.response.data.error)
            })
    }

    const handleUsernameChange = (event) => {
        setUsername(event.target.value)
    }
    const handlePasswordChange = (event) => {
        setPassword(event.target.value)
    }

    if (props.username === '') {
        return (
            <div>
                <form onSubmit={handleLogin}>
                    Username: <input type="text" onChange={handleUsernameChange} /><br />
                    Password: <input type="password" onChange={handlePasswordChange} /><br />
                    <button type="submit">Login</button>
                </form>
            </div>
        )
    }
    else {
        return (
            <div>
                Logged in as {props.username}
            </div>
        )
    }
}

export default Login