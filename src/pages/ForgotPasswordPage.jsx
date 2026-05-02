import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { API_BASE_URL } from '../config'

function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1=email, 2=code, 3=newPassword, 4=success
  const [email, setEmail] = useState('')
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [resetToken, setResetToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [countdown, setCountdown] = useState(0)

  const codeInputs = useRef([])

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  // Auto-redirect after success
  useEffect(() => {
    if (step === 4) {
      const timer = setTimeout(() => navigate('/login'), 3000)
      return () => clearTimeout(timer)
    }
  }, [step, navigate])

  // Password validation rules
  const passwordChecks = {
    length: newPassword.length >= 8,
    uppercase: /[A-Z]/.test(newPassword),
    number: /\d/.test(newPassword),
    match: newPassword && confirmPassword && newPassword === confirmPassword,
  }
  const passwordValid = passwordChecks.length && passwordChecks.uppercase && passwordChecks.number && passwordChecks.match

  // Step 1: Send reset code
  const handleSendCode = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to send reset code')

      setSuccessMessage(data.message)
      setCountdown(60)
      setStep(2)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify code
  const handleVerifyCode = async (codeString) => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/verify-reset-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), code: codeString }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Invalid code')

      setResetToken(data.resetToken)
      setStep(3)
    } catch (err) {
      setError(err.message)
      // Clear the code inputs on error
      setCode(['', '', '', '', '', ''])
      codeInputs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  // Step 3: Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (!passwordValid) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetToken, newPassword }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to reset password')

      setStep(4)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Resend code
  const handleResendCode = async () => {
    if (countdown > 0) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to resend code')

      setSuccessMessage('A new code has been sent to your email.')
      setCountdown(60)
      setCode(['', '', '', '', '', ''])
      codeInputs.current[0]?.focus()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Code input handlers
  const handleCodeChange = (index, value) => {
    // Strip non-digits
    const digits = value.replace(/\D/g, '')
    if (!digits && value !== '') return // If they typed non-digits, ignore. Allow empty strings (clearing).

    const newCode = [...code]

    // Handle multi-digit input (paste or autofill via onChange)
    if (digits.length > 1) {
      let k = index;
      for (let i = 0; i < digits.length && k < 6; i++) {
        newCode[k] = digits[i]
        k++
      }
      setCode(newCode)
      setError(null)

      const focusIndex = Math.min(index + digits.length, 5)
      codeInputs.current[focusIndex]?.focus()

      const fullCode = newCode.join('')
      if (fullCode.length === 6) {
        handleVerifyCode(fullCode)
      }
      return
    }

    // Normal single-digit typing
    newCode[index] = digits // Since length is 0 or 1 now
    setCode(newCode)
    setError(null)

    // Auto-focus next input if a digit was typed
    if (digits && index < 5) {
      codeInputs.current[index + 1]?.focus()
    }

    // Auto-submit when all 6 digits entered
    const fullCode = newCode.join('')
    if (fullCode.length === 6) {
      handleVerifyCode(fullCode)
    }
  }

  const handleCodeKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      // If current field is empty and user hits backspace, move focus to prior field
      codeInputs.current[index - 1]?.focus()
    }
  }

  const handleCodePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '')
    if (!pasted) return

    const newCode = [...code]
    for (let i = 0; i < Math.min(pasted.length, 6); i++) {
      newCode[i] = pasted[i]
    }
    setCode(newCode)
    setError(null)

    const focusIndex = Math.min(pasted.length, 5)
    codeInputs.current[focusIndex]?.focus()

    const fullCode = newCode.join('')
    if (fullCode.length === 6) {
      handleVerifyCode(fullCode)
    }
  }

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        {/* Logo */}
        <div className="forgot-password-logo">
          <img
            src="https://res.cloudinary.com/dhicz31vg/image/upload/v1770665363/WhatsApp_Image_2026-02-07_at_12.41.01_AM-removebg-preview_cwfaaa.png"
            alt="PhysioSim Logo"
            className="forgot-password-logo-img"
          />
        </div>

        {/* Step indicator */}
        {step < 4 && (
          <div className="forgot-password-steps">
            {[1, 2, 3].map(s => (
              <div key={s} className={`forgot-password-step-dot ${step >= s ? 'active' : ''} ${step === s ? 'current' : ''}`} />
            ))}
          </div>
        )}

        {/* Step 1: Enter Email */}
        {step === 1 && (
          <div className="forgot-password-step">
            <div className="forgot-password-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <polyline points="3,5 12,13 21,5" />
              </svg>
            </div>
            <h1 className="forgot-password-title">Forgot your password?</h1>
            <p className="forgot-password-subtitle">
              No worries! Enter your email address and we'll send you a verification code to reset your password.
            </p>

            <form onSubmit={handleSendCode} className="forgot-password-form">
              <div className="forgot-password-field">
                <label htmlFor="reset-email">Email Address</label>
                <input
                  id="reset-email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(null) }}
                  required
                  autoFocus
                  autoComplete="email"
                />
              </div>

              {error && <div className="forgot-password-error">{error}</div>}

              <button
                type="submit"
                className="forgot-password-btn primary"
                disabled={loading || !email}
              >
                {loading ? (
                  <span className="forgot-password-spinner" />
                ) : 'Send Reset Code'}
              </button>
            </form>

            <Link to="/login" className="forgot-password-back-link">
              ← Back to Login
            </Link>
          </div>
        )}

        {/* Step 2: Enter Code */}
        {step === 2 && (
          <div className="forgot-password-step">
            <div className="forgot-password-icon success">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
            </div>
            <h1 className="forgot-password-title">Check your email</h1>
            <p className="forgot-password-subtitle">
              We've sent a 6-digit code to <strong>{email}</strong>
            </p>

            <div className="forgot-password-code-inputs" onPaste={handleCodePaste}>
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={el => codeInputs.current[index] = el}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleCodeKeyDown(index, e)}
                  className={`forgot-password-code-box ${error ? 'error' : ''}`}
                  autoFocus={index === 0}
                />
              ))}
            </div>

            {error && <div className="forgot-password-error">{error}</div>}

            {loading && (
              <div className="forgot-password-verifying">
                <span className="forgot-password-spinner" /> Verifying...
              </div>
            )}

            <div className="forgot-password-resend">
              {countdown > 0 ? (
                <span className="forgot-password-countdown">Resend code in {countdown}s</span>
              ) : (
                <button
                  type="button"
                  className="forgot-password-resend-btn"
                  onClick={handleResendCode}
                  disabled={loading}
                >
                  Didn't receive the code? Resend
                </button>
              )}
            </div>

            <button
              type="button"
              className="forgot-password-back-link"
              onClick={() => { setStep(1); setError(null); setCode(['', '', '', '', '', '']) }}
            >
              ← Back
            </button>
          </div>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <div className="forgot-password-step">
            <div className="forgot-password-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h1 className="forgot-password-title">Set new password</h1>
            <p className="forgot-password-subtitle">
              Your identity has been verified. Choose a strong new password.
            </p>

            <form onSubmit={handleResetPassword} className="forgot-password-form">
              <div className="forgot-password-field">
                <label htmlFor="new-password">New Password</label>
                <div className="forgot-password-input-wrapper">
                  <input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setError(null) }}
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    className="forgot-password-eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <div className="forgot-password-field">
                <label htmlFor="confirm-password">Confirm Password</label>
                <div className="forgot-password-input-wrapper">
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setError(null) }}
                    required
                  />
                  <button
                    type="button"
                    className="forgot-password-eye-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {/* Password strength checklist */}
              <div className="forgot-password-checks">
                <div className={`forgot-password-check ${passwordChecks.length ? 'pass' : ''}`}>
                  {passwordChecks.length ? '✓' : '○'} At least 8 characters
                </div>
                <div className={`forgot-password-check ${passwordChecks.uppercase ? 'pass' : ''}`}>
                  {passwordChecks.uppercase ? '✓' : '○'} At least 1 uppercase letter
                </div>
                <div className={`forgot-password-check ${passwordChecks.number ? 'pass' : ''}`}>
                  {passwordChecks.number ? '✓' : '○'} At least 1 number
                </div>
                <div className={`forgot-password-check ${passwordChecks.match ? 'pass' : ''}`}>
                  {passwordChecks.match ? '✓' : '○'} Passwords match
                </div>
              </div>

              {error && <div className="forgot-password-error">{error}</div>}

              <button
                type="submit"
                className="forgot-password-btn primary"
                disabled={loading || !passwordValid}
              >
                {loading ? (
                  <span className="forgot-password-spinner" />
                ) : 'Reset Password'}
              </button>
            </form>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <div className="forgot-password-step">
            <div className="forgot-password-icon success-final">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h1 className="forgot-password-title">Password Reset!</h1>
            <p className="forgot-password-subtitle">
              Your password has been successfully reset. You'll be redirected to the login page shortly.
            </p>
            <Link to="/login" className="forgot-password-btn primary" style={{ textDecoration: 'none', display: 'block', textAlign: 'center' }}>
              Go to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default ForgotPasswordPage
