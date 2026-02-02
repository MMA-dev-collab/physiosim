import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../config'
import { LoginPageComponent } from '../components/ui/animated-characters-login-page'

function LoginPage({ setAuth }) {
    const navigate = useNavigate()
    const [identifier, setIdentifier] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [showPassword, setShowPassword] = useState(false)
    const [isTyping, setIsTyping] = useState(false)

    const handleSubmit = async (e) => {
        if (e) e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify({ identifier, password }),
            })

            if (!res.ok) {
                const data = await res.json().catch(() => ({}))
                throw new Error(data.message || 'Login failed')
            }

            const data = await res.json()
            setAuth(data)
            navigate('/cases')
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <LoginPageComponent
            email={identifier}
            setEmail={setIdentifier}
            password={password}
            setPassword={setPassword}
            error={error}
            isLoading={loading}
            handleSubmit={handleSubmit}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            onTypingStart={() => setIsTyping(true)}
            onTypingEnd={() => setIsTyping(false)}
        />
    )
}

export default LoginPage
