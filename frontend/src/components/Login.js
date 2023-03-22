import { useState } from "react"
import loginServices from '../services/login'

const Login = (props) => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    const handleLogin = async (event) => {
        event.preventDefault()

        const user = {
            username,
            password
        }

        try {
            const response = await loginServices.login(user)
            props.onSuccessfulConnection(response)
        }
        catch (exception) {
            props.handleError('Wrong credentials')
        }
    }

    const handleUsernameChange = (event) => {
        setUsername(event.target.value)
    }
    const handlePasswordChange = (event) => {
        setPassword(event.target.value)
    }


    if (!props.username) {
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
                Logged in as {props.username} &emsp;
                <button onClick={props.onDisconnect}>Log out</button>
            </div>
        )
    }
}

export default Login