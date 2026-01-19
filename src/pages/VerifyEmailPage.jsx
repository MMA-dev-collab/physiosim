import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { API_BASE_URL } from '../config'
import './Auth.css'

function VerifyEmailPage({ setAuth }) {
    const navigate = useNavigate()
    const location = useLocation()
    const userId = location.state?.userId
    const email = location.state?.email

    const [code, setCode] = useState('')
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const [resendLoading, setResendLoading] = useState(false)
    const [message, setMessage] = useState(null)

    if (!userId) {
        return (
            <div className="auth-page">
                <div className="auth-container">
                    <div className="auth-card">
                        <div className="auth-error">Error: User ID missing. Please register again.</div>
                        <button onClick={() => navigate('/register')} className="auth-submit-btn">
                            Go to Registration
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/verify-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify({ userId, code }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || 'Verification failed')
            }

            // On success, backend returns token + user
            setAuth(data)
            navigate('/cases')
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleResend = async () => {
        setResendLoading(true)
        setError(null)
        setMessage(null)

        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/resend-code`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify({ userId }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || 'Failed to resend code')
            }

            setMessage('New verification code sent to your email.')
        } catch (err) {
            setError(err.message)
        } finally {
            setResendLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-header">
                        <h1 className="auth-title">Verify Email</h1>
                        <p className="auth-subtitle">
                            Please enter the 6-digit code sent to <strong>{email || 'your email'}</strong>
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form-container">
                        <div className="form-group">
                            <label htmlFor="code" className="form-label">
                                Verification Code
                            </label>
                            <input
                                id="code"
                                type="text"
                                className="form-input"
                                placeholder="123456"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                maxLength={6}
                                style={{ letterSpacing: '5px', textAlign: 'center', fontSize: '1.2rem' }}
                            />
                        </div>

                        {error && <div className="auth-error">{error}</div>}
                        {message && <div className="auth-success" style={{ color: 'green', marginBottom: '1rem', textAlign: 'center' }}>{message}</div>}

                        <button
                            type="submit"
                            className="auth-submit-btn"
                            disabled={loading || code.length !== 6}
                        >
                            {loading ? 'Verifying...' : 'Verify Email'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p className="auth-footer-text">
                            Didn't receive the code?{' '}
                            <button
                                onClick={handleResend}
                                className="auth-link"
                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 'inherit' }}
                                disabled={resendLoading}
                            >
                                {resendLoading ? 'Sending...' : 'Resend Code'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VerifyEmailPage
