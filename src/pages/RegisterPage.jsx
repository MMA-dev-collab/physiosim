import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { API_BASE_URL } from '../config'
import './Auth.css'

function RegisterPage({ setAuth }) {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        profileImage: ''
    })
    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)
    const [serverError, setServerError] = useState(null)

    const validateName = (name) => {
        const nameRegex = /^[A-Za-z\s]{1,20}$/
        if (!name) return 'Name is required'
        if (!nameRegex.test(name)) return 'Name must contain only English letters (max 20 characters)'
        return null
    }

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!email) return 'Email is required'
        if (!emailRegex.test(email)) return 'Invalid email format'

        // Basic domain validation
        const domain = email.split('@')[1]
        if (!domain || domain.split('.').length < 2) return 'Invalid email domain'

        return null
    }

    const validatePhone = (phone) => {
        const phoneRegex = /^\d{10,15}$/
        if (!phone) return 'Phone number is required'
        if (!phoneRegex.test(phone)) return 'Phone must contain only digits (10-15 digits)'
        return null
    }

    const validatePassword = (password) => {
        if (!password) return 'Password is required'
        if (password.length < 8) return 'Password must be at least 8 characters'
        return null
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))

        // Clear error for this field
        setErrors(prev => ({ ...prev, [name]: null }))
        setServerError(null)
    }

    const handleImageUpload = (e) => {
        const file = e.target.files[0]
        if (!file) return

        // Validate file type
        if (!['image/jpeg', 'image/png'].includes(file.type)) {
            setErrors(prev => ({ ...prev, profileImage: 'Only JPG and PNG files are allowed' }))
            return
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            setErrors(prev => ({ ...prev, profileImage: 'File size must be less than 5MB' }))
            return
        }

        // Convert to base64
        const reader = new FileReader()
        reader.onloadend = () => {
            setFormData(prev => ({ ...prev, profileImage: reader.result }))
            setErrors(prev => ({ ...prev, profileImage: null }))
        }
        reader.readAsDataURL(file)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setServerError(null)

        // Validate all fields
        const newErrors = {
            name: validateName(formData.name),
            email: validateEmail(formData.email),
            phone: validatePhone(formData.phone),
            password: validatePassword(formData.password)
        }

        // Check password confirmation
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match'
        }

        setErrors(newErrors)

        // If any errors, don't submit
        if (Object.values(newErrors).some(error => error !== null)) {
            return
        }

        setLoading(true)

        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    password: formData.password,
                    profileImage: formData.profileImage
                }),
            })

            if (!res.ok) {
                const data = await res.json().catch(() => ({}))
                throw new Error(data.message || 'Registration failed')
            }

            const data = await res.json()
            setAuth(data)
            navigate('/cases')
        } catch (err) {
            setServerError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-card register-card">
                    <div className="auth-header">
                        <h1 className="auth-title">Create Account</h1>
                        <p className="auth-subtitle">Join us and start your learning journey</p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form-container">
                        <div className="form-group">
                            <label htmlFor="name" className="form-label">
                                Full Name <span className="required">*</span>
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                className={`form-input ${errors.name ? 'input-error' : ''}`}
                                placeholder="Enter your full name (English only)"
                                value={formData.name}
                                onChange={handleInputChange}
                                maxLength={20}
                            />
                            {errors.name && <span className="field-error">{errors.name}</span>}
                            <span className="field-hint">Max 20 characters, English letters only</span>
                        </div>

                        <div className="form-group">
                            <label htmlFor="email" className="form-label">
                                Email <span className="required">*</span>
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                className={`form-input ${errors.email ? 'input-error' : ''}`}
                                placeholder="Enter your email address"
                                value={formData.email}
                                onChange={handleInputChange}
                            />
                            {errors.email && <span className="field-error">{errors.email}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="phone" className="form-label">
                                Phone Number <span className="required">*</span>
                            </label>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                className={`form-input ${errors.phone ? 'input-error' : ''}`}
                                placeholder="Enter your phone number (digits only)"
                                value={formData.phone}
                                onChange={handleInputChange}
                            />
                            {errors.phone && <span className="field-error">{errors.phone}</span>}
                            <span className="field-hint">10-15 digits, no spaces or special characters</span>
                        </div>

                        <div className="form-group">
                            <label htmlFor="password" className="form-label">
                                Password <span className="required">*</span>
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                className={`form-input ${errors.password ? 'input-error' : ''}`}
                                placeholder="Create a password"
                                value={formData.password}
                                onChange={handleInputChange}
                            />
                            {errors.password && <span className="field-error">{errors.password}</span>}
                            <span className="field-hint">Minimum 8 characters</span>
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword" className="form-label">
                                Confirm Password <span className="required">*</span>
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                className={`form-input ${errors.confirmPassword ? 'input-error' : ''}`}
                                placeholder="Confirm your password"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                            />
                            {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="profileImage" className="form-label">
                                Profile Image (Optional)
                            </label>
                            <input
                                id="profileImage"
                                name="profileImage"
                                type="file"
                                className="form-input-file"
                                accept="image/jpeg,image/png"
                                onChange={handleImageUpload}
                            />
                            {errors.profileImage && <span className="field-error">{errors.profileImage}</span>}
                            <span className="field-hint">JPG or PNG, max 5MB</span>
                            {formData.profileImage && (
                                <div className="image-preview">
                                    <img src={formData.profileImage} alt="Profile preview" />
                                </div>
                            )}
                        </div>

                        {serverError && <div className="auth-error">{serverError}</div>}

                        <button
                            type="submit"
                            className="auth-submit-btn"
                            disabled={loading}
                        >
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p className="auth-footer-text">
                            Already have an account?{' '}
                            <Link to="/login" className="auth-link">Sign in here</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RegisterPage
