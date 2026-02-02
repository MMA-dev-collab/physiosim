import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { API_BASE_URL } from '../config'
import './Auth.css'
import PasswordInput from '../components/ui/password-input-2'

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

    const [touched, setTouched] = useState({})

    const validateName = (name) => {
        if (!name) return 'Name is required'
        const trimmedName = name.trim()

        // Regex: 3-25 chars, letters (Arabic/English), numbers, spaces
        const nameRegex = /^[A-Za-z\u0600-\u06FF\s]{3,25}$/
        const hasLetter = /[A-Za-z\u0600-\u06FF]/.test(trimmedName)

        if (!nameRegex.test(trimmedName) || !hasLetter) {
            return 'Name must be 3–25 characters and contain only letters (Arabic or English) and spaces'
        }
        return null
    }

    const validateEmail = (email) => {
        if (!email) return 'Email is required'
        const trimmedEmail = email.trim().toLowerCase()

        const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/
        if (!emailRegex.test(trimmedEmail)) return 'Invalid email format'

        // Deny-list check
        const domain = trimmedEmail.split('@')[1]
        const denyList = ["gil.com", "gamil.com", "hotnail.com", "yaho.com", "outlok.com", "icloud.co"]
        if (denyList.includes(domain)) {
            let suggestion = ""
            if (domain === "gamil.com" || domain === "gil.com") suggestion = "gmail.com"
            else if (domain === "hotnail.com") suggestion = "hotmail.com"
            else if (domain === "yaho.com") suggestion = "yahoo.com"
            else if (domain === "outlok.com") suggestion = "outlook.com"
            else if (domain === "icloud.co") suggestion = "icloud.com"

            return `Invalid email. Did you mean ${suggestion}?`
        }

        return null
    }

    const validatePhone = (phone) => {
        if (!phone) return 'Phone number is required'
        const trimmedPhone = phone.trim()

        // Egyptian Phone Regex
        const phoneRegex = /^(?:\+20|0)(10|11|12|15)\d{8}$/
        if (!phoneRegex.test(trimmedPhone)) {
            return 'Please enter a valid Egyptian phone number (010/011/012/015)'
        }
        return null
    }

    const validatePassword = (password) => {
        if (!password) return 'Password is required'
        if (password.length < 8) return 'Password must be at least 8 characters'

        const hasLetter = /[A-Za-z]/.test(password)
        const hasNumber = /\d/.test(password)
        if (!hasLetter || !hasNumber) return 'Password must contain at least one letter and one number'

        return null
    }

    const handleBlur = (e) => {
        const { name, value } = e.target
        setTouched(prev => ({ ...prev, [name]: true }))

        let error = null
        switch (name) {
            case 'name': error = validateName(value); break
            case 'email': error = validateEmail(value); break
            case 'phone': error = validatePhone(value); break
            case 'password': error = validatePassword(value); break
            case 'confirmPassword':
                if (value !== formData.password) error = 'Passwords do not match'
                break
        }

        setErrors(prev => ({ ...prev, [name]: error }))
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))

        // If field was already touched, validate immediately on change for better UX
        if (touched[name]) {
            let error = null
            switch (name) {
                case 'name': error = validateName(value); break
                case 'email': error = validateEmail(value); break
                case 'phone': error = validatePhone(value); break
                case 'password': error = validatePassword(value); break
                case 'confirmPassword':
                    if (value !== formData.password) error = 'Passwords do not match'
                    break
            }
            setErrors(prev => ({ ...prev, [name]: error }))
        }
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

        // Mark all as touched
        setTouched({
            name: true,
            email: true,
            phone: true,
            password: true,
            confirmPassword: true
        })

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
            // Auto-normalize phone for submission
            let phoneToSend = formData.phone.trim()
            if (phoneToSend.startsWith('+20')) {
                phoneToSend = '0' + phoneToSend.substring(3)
            }

            const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    email: formData.email.trim().toLowerCase(),
                    phone: phoneToSend,
                    password: formData.password,
                    profileImage: formData.profileImage
                }),
            })

            if (!res.ok) {
                const data = await res.json().catch(() => ({}))
                throw new Error(data.message || 'Registration failed')
            }

            const data = await res.json()

            // Backend now returns { message, userId } instead of token
            // Navigate to verification page with userId and email
            navigate('/verify-email', {
                state: {
                    userId: data.userId,
                    email: formData.email
                }
            })
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
                                placeholder="Enter your full name"
                                value={formData.name}
                                onChange={handleInputChange}
                                onBlur={handleBlur}
                                maxLength={40}
                            />
                            {errors.name && <span className="field-error">{errors.name}</span>}
                            {!errors.name && <span className="field-hint">3-40 chars, Arabic or English</span>}
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
                                onBlur={handleBlur}
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
                                placeholder="01xxxxxxxxx"
                                value={formData.phone}
                                onChange={handleInputChange}
                                onBlur={handleBlur}
                            />
                            {errors.phone && <span className="field-error">{errors.phone}</span>}
                            {!errors.phone && <span className="field-hint">Egyptian numbers only (010, 011, 012, 015)</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="password" className="form-label">
                                Password <span className="required">*</span>
                            </label>
                            <PasswordInput
                                id="password"
                                name="password"
                                placeholder="Create a password"
                                value={formData.password}
                                onChange={handleInputChange}
                                onBlur={handleBlur}
                                className={errors.password ? 'border-red-500' : ''}
                            />
                            {errors.password && <span className="field-error">{errors.password}</span>}
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
                                onBlur={handleBlur}
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