import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { API_BASE_URL } from '../config'
import './Auth.css'
import OTPInput from '../components/ui/otp-input'

function VerifyEmailPage({ setAuth }) {
    const navigate = useNavigate()
    const location = useLocation()
    const userId = location.state?.userId
    const email = location.state?.email

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

    const handleVerify = async (codeValue) => {
        setError(null)
        setLoading(true)

        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/verify-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify({ userId, code: codeValue }),
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
                <OTPInput
                    email={email || 'your email'}
                    onVerify={handleVerify}
                    onResend={handleResend}
                    loading={loading}
                    resendLoading={resendLoading}
                    error={error}
                    message={message}
                />
            </div>
        </div>
    )
}

export default VerifyEmailPage
