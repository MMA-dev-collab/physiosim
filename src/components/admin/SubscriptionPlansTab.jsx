import React, { useEffect, useState } from 'react'
import { API_BASE_URL } from '../../config'
import './CasesTab.css' // Reuse table styles

export default function SubscriptionPlansTab({ auth }) {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPlan, setEditingPlan] = useState(null)
  const [toast, setToast] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    durationYears: '',
    durationDays: '',
    durationHours: '',
    maxFreeCases: '0',
    description: '',
    features: [],
    isActive: true,
    newFeature: ''
  })

  useEffect(() => {
    loadPlans()
  }, [auth])

  const loadPlans = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/subscription-plans`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
          'ngrok-skip-browser-warning': 'true'
        }
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || `HTTP ${res.status}`)
      }

      const data = await res.json()
      console.log('Loaded plans:', data) // Debug log
      setPlans(data || [])
      setLoading(false)
    } catch (err) {
      console.error('Error loading plans:', err)
      showToast('error', `Failed to load plans: ${err.message}`)
      setPlans([])
      setLoading(false)
    }
  }

  const showToast = (type, message) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }

  const handleOpenModal = (plan = null) => {
    console.log('Opening modal, plan:', plan)
    try {
      if (plan) {
        setEditingPlan(plan)
        // Parse existing duration into years, days, hours
        const totalDays = plan.durationDays || 0
        const years = Math.floor(totalDays / 365)
        const remainingDays = totalDays % 365

        setFormData({
          name: plan.name || '',
          price: plan.price || '',
          durationYears: years > 0 ? years.toString() : '',
          durationDays: remainingDays > 0 ? remainingDays.toString() : '',
          durationHours: '',
          maxFreeCases: plan.maxFreeCases === null || plan.maxFreeCases === undefined ? '' : plan.maxFreeCases.toString(),
          description: plan.description || '',
          features: Array.isArray(plan.features) ? plan.features : [],
          isActive: plan.isActive !== undefined ? !!plan.isActive : true,
          newFeature: ''
        })
      } else {
        setEditingPlan(null)
        setFormData({
          name: '',
          price: '',
          durationYears: '',
          durationDays: '',
          durationHours: '',
          maxFreeCases: '0',
          description: '',
          features: [],
          isActive: true,
          newFeature: ''
        })
      }
      setShowModal(true)
      console.log('Modal should be visible now')
    } catch (err) {
      console.error('Error opening modal:', err)
      alert(`Error opening form: ${err.message}`)
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingPlan(null)
    setFormData({
      name: '',
      price: '',
      durationYears: '',
      durationDays: '',
      durationHours: '',
      maxFreeCases: '0',
      description: '',
      features: [],
      isActive: true,
      newFeature: ''
    })
  }

  const handleAddFeature = () => {
    if (formData.newFeature.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, formData.newFeature.trim()],
        newFeature: ''
      })
    }
  }

  const handleRemoveFeature = (index) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index)
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (loading) {
      console.log('Already submitting, ignoring...')
      return
    }

    setLoading(true)
    console.log('Form submitted with data:', formData) // Debug

    // Validation
    if (!formData.name || formData.name.trim() === '') {
      showToast('error', 'Plan name is required')
      setLoading(false)
      return
    }

    if (!formData.price || formData.price === '') {
      showToast('error', 'Price is required')
      setLoading(false)
      return
    }

    // Validate that at least one duration field is filled
    const years = parseInt(formData.durationYears) || 0
    const days = parseInt(formData.durationDays) || 0
    const hours = parseInt(formData.durationHours) || 0

    if (years === 0 && days === 0 && hours === 0) {
      showToast('error', 'Please specify at least one duration (years, days, or hours)')
      setLoading(false)
      return
    }

    // Validate numeric fields
    const price = parseFloat(formData.price)
    if (isNaN(price) || price < 0) {
      showToast('error', 'Price must be a valid number (0 or greater)')
      setLoading(false)
      return
    }

    // Calculate total duration in days
    const totalDays = (years * 365) + days + Math.ceil(hours / 24)

    // Validate maxFreeCases - allow null/empty for unlimited, or a valid number >= 0
    let maxCases = null;
    if (formData.maxFreeCases && formData.maxFreeCases.trim() !== '') {
      const parsed = parseInt(formData.maxFreeCases);
      if (isNaN(parsed) || parsed < 0) {
        showToast('error', 'Max Free Cases must be empty (unlimited) or a number >= 0')
        setLoading(false)
        return
      }
      maxCases = parsed;
    } else {
      // Empty string means unlimited (null)
      maxCases = null;
    }

    try {
      const url = editingPlan
        ? `${API_BASE_URL}/api/admin/subscription-plans/${editingPlan.id}`
        : `${API_BASE_URL}/api/admin/subscription-plans`

      const method = editingPlan ? 'PUT' : 'POST'

      // Build request body with combined duration
      const requestBody = {
        name: formData.name.trim(),
        price: price,
        durationDays: totalDays,
        duration_value: totalDays,
        duration_unit: 'day',
        maxFreeCases: maxCases
      }

      // Add optional fields if they exist
      if (formData.description && formData.description.trim()) {
        requestBody.description = formData.description.trim()
      }
      if (formData.features && Array.isArray(formData.features) && formData.features.length > 0) {
        requestBody.features = formData.features
      }
      if (formData.isActive !== undefined) {
        requestBody.isActive = formData.isActive
      }

      console.log('Sending request to:', url)
      console.log('Request method:', method)
      console.log('Request body:', requestBody)
      console.log('Auth token exists:', !!auth.token)

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(requestBody)
      })

      console.log('Response status:', res.status)
      const responseData = await res.json()
      console.log('Response data:', responseData)

      if (res.ok) {
        showToast('success', editingPlan ? 'Plan updated successfully' : 'Plan created successfully')
        setTimeout(() => {
          handleCloseModal()
          loadPlans()
          setLoading(false)
        }, 500)
      } else {
        console.error('Error response:', responseData)
        const errorMsg = responseData.message || responseData.error || `HTTP ${res.status}: Failed to save plan`
        showToast('error', errorMsg)
        setLoading(false)
        // Show alert for critical errors
        if (res.status === 401 || res.status === 403) {
          alert(`Authentication Error: ${errorMsg}\n\nPlease refresh the page and log in again.`)
        } else if (res.status >= 500) {
          alert(`Server Error: ${errorMsg}\n\nPlease try again later or contact support.`)
        }
      }
    } catch (err) {
      console.error('Create plan error:', err)
      const errorMsg = err.message || 'Network error. Please check your connection.'
      showToast('error', `Failed to save plan: ${errorMsg}`)
      setLoading(false)
      alert(`Network Error: ${errorMsg}\n\nPlease check your internet connection and try again.`)
    }
  }

  const handleDelete = async (planId, plan) => {
    // Prevent deletion of core plans (normal/premium role)
    const planRole = plan?.role || (plan?.name === 'Normal' ? 'normal' : plan?.name === 'Premium' ? 'premium' : 'custom');
    if (planRole === 'normal' || planRole === 'premium') {
      showToast('error', 'Cannot delete core plans. Deactivate instead.')
      return
    }

    const planName = plan?.name || 'Unknown';

    if (!window.confirm(`Are you sure you want to delete the plan "${planName}"? This action cannot be undone.`)) {
      return
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/subscription-plans/${planId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${auth.token}`,
          'ngrok-skip-browser-warning': 'true'
        }
      })

      if (res.ok) {
        showToast('success', 'Plan deleted successfully')
        loadPlans()
      } else {
        const error = await res.json()
        showToast('error', error.message || 'Failed to delete plan')
      }
    } catch (err) {
      showToast('error', 'Failed to delete plan')
    }
  }

  const handleToggleActive = async (plan) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/subscription-plans/${plan.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          isActive: !plan.isActive
        })
      })

      if (res.ok) {
        showToast('success', `Plan ${!plan.isActive ? 'activated' : 'deactivated'} successfully`)
        loadPlans()
      } else {
        showToast('error', 'Failed to update plan')
      }
    } catch (err) {
      showToast('error', 'Failed to update plan')
    }
  }

  if (loading) return <div>Loading subscription plans...</div>

  if (plans.length === 0) {
    return (
      <div className="admin-subscriptions">
        <div className="section-header" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0 }}>Subscription Plans Management</h2>
          <p style={{ color: '#6b7280', margin: '0.5rem 0 0 0' }}>
            Create and manage subscription plans that users can subscribe to
          </p>
        </div>

        <div style={{
          background: '#fef3c7',
          border: '1px solid #fde68a',
          borderRadius: '8px',
          padding: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{ marginTop: 0, color: '#d97706' }}>⚠️ No Plans Found</h3>
          <p style={{ color: '#92400e', marginBottom: '1rem' }}>
            No subscription plans found in the database. This usually means the database migration hasn't been run yet.
          </p>
          <div style={{ marginBottom: '1rem' }}>
            <strong>To fix this:</strong>
            <ol style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
              <li>Run the database migration: <code>backend/migrations/001_subscription_system.sql</code></li>
              <li>Or click "Create Plan" below to manually create the Normal and Premium plans</li>
            </ol>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              console.log('Create Plan button clicked (empty state)')
              handleOpenModal()
            }}
            type="button"
            style={{
              padding: '0.5rem 1rem',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500',
              marginRight: '0.5rem'
            }}
          >
            + Create Plan
          </button>
          <button
            onClick={loadPlans}
            style={{
              padding: '0.5rem 1rem',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            🔄 Retry Loading
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-subscriptions">
      <div className="section-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0 }}>Subscription Plans Management</h2>
          <p style={{ color: '#6b7280', margin: '0.5rem 0 0 0' }}>
            Create and manage subscription plans that users can subscribe to
          </p>
        </div>
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            console.log('Create Plan button clicked')
            handleOpenModal()
          }}
          type="button"
          style={{
            padding: '0.5rem 1rem',
            background: 'var(--primary-color, #2563eb)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          + Create Plan
        </button>
      </div>

      <div className="cases-table-container">
        <table className="cases-table">
          <thead>
            <tr>
              <th>Plan Name</th>
              <th>Price</th>
              <th>Duration</th>
              <th>Max Free Cases</th>
              <th>Access Level</th>
              <th>Features</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((plan) => (
              <tr key={plan.id}>
                <td>
                  <div style={{ fontWeight: '500' }}>{plan.name}</div>
                  {plan.description && (
                    <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.25rem' }}>
                      {plan.description}
                    </div>
                  )}
                </td>
                <td>
                  <span style={{ fontWeight: '600', color: '#2563eb' }}>
                    ${parseFloat(plan.price).toFixed(2)}
                  </span>
                </td>
                <td>
                  <span className="badge">
                    {(() => {
                      const totalDays = plan.durationDays || 0
                      const years = Math.floor(totalDays / 365)
                      const days = totalDays % 365
                      const parts = []
                      if (years > 0) parts.push(`${years}y`)
                      if (days > 0) parts.push(`${days}d`)
                      return parts.length > 0 ? parts.join(' + ') : `${totalDays}d`
                    })()}
                  </span>
                </td>
                <td>
                  {plan.maxFreeCases === null || plan.maxFreeCases === undefined ? (
                    <span className="badge" style={{ background: '#eff6ff', color: '#2563eb' }}>
                      Unlimited
                    </span>
                  ) : (
                    <span className="badge">{plan.maxFreeCases} cases</span>
                  )}
                </td>
                <td>
                  {plan.role === 'premium' ? (
                    <span className="badge" style={{ background: '#eff6ff', color: '#2563eb', fontWeight: '600' }}>
                      🔒 Premium Access
                    </span>
                  ) : plan.role === 'normal' ? (
                    <span className="badge" style={{ background: '#fef3c7', color: '#d97706', fontWeight: '600' }}>
                      🆓 Free Access
                    </span>
                  ) : (
                    <span className="badge" style={{ background: '#f3f4f6', color: '#6b7280' }}>
                      Custom ({plan.role || 'custom'})
                    </span>
                  )}
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                    {plan.role === 'premium'
                      ? 'Can access premium cases'
                      : plan.role === 'normal'
                        ? 'Can access free cases (limited)'
                        : 'Access depends on plan settings'}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', maxWidth: '300px' }}>
                    {Array.isArray(plan.features) && plan.features.length > 0 ? (
                      plan.features.slice(0, 3).map((feature, idx) => (
                        <span key={idx} style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                          • {feature}
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>No features</span>
                    )}
                    {Array.isArray(plan.features) && plan.features.length > 3 && (
                      <span style={{ fontSize: '0.75rem', color: '#6b7280', fontStyle: 'italic' }}>
                        +{plan.features.length - 3} more
                      </span>
                    )}
                  </div>
                </td>
                <td>
                  <span className="badge" style={{
                    background: plan.isActive ? '#10b98120' : '#ef444420',
                    color: plan.isActive ? '#10b981' : '#ef4444'
                  }}>
                    {plan.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => handleOpenModal(plan)}
                      style={{
                        padding: '0.25rem 0.5rem',
                        background: '#2563eb',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.75rem'
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleActive(plan)}
                      style={{
                        padding: '0.25rem 0.5rem',
                        background: plan.isActive ? '#f59e0b' : '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.75rem'
                      }}
                    >
                      {plan.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    {plan.role !== 'normal' && plan.role !== 'premium' && (
                      <button
                        onClick={() => handleDelete(plan.id, plan)}
                        style={{
                          padding: '0.25rem 0.5rem',
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.75rem'
                        }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h3 style={{ marginTop: 0 }}>
              {editingPlan ? 'Edit Subscription Plan' : 'Create New Subscription Plan'}
            </h3>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Plan Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={editingPlan && (editingPlan.role === 'normal' || editingPlan.role === 'premium')}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    border: '1px solid #e2e8f0'
                  }}
                  placeholder="e.g., Premium, Enterprise"
                />
                {editingPlan && (editingPlan.role === 'normal' || editingPlan.role === 'premium') && (
                  <small style={{ color: '#6b7280', display: 'block', marginTop: '0.25rem' }}>
                    Core plan names cannot be changed (role: {editingPlan.role})
                  </small>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Price ($) <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      border: '1px solid #e2e8f0'
                    }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Years
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.durationYears}
                      onChange={(e) => setFormData({ ...formData, durationYears: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        borderRadius: '4px',
                        border: '1px solid #e2e8f0'
                      }}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Days
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.durationDays}
                      onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        borderRadius: '4px',
                        border: '1px solid #e2e8f0'
                      }}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Hours
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.durationHours}
                      onChange={(e) => setFormData({ ...formData, durationHours: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        borderRadius: '4px',
                        border: '1px solid #e2e8f0'
                      }}
                      placeholder="0"
                    />
                  </div>
                </div>
                <small style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                  Specify at least one duration. Example: 1 year + 30 days + 12 hours
                </small>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Max Free Cases
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.maxFreeCases}
                  onChange={(e) => setFormData({ ...formData, maxFreeCases: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    border: '1px solid #e2e8f0'
                  }}
                  placeholder="Leave empty for unlimited"
                />
                <small style={{ color: '#6b7280', display: 'block', marginTop: '0.25rem' }}>
                  Maximum number of free cases allowed. Leave empty for unlimited access (null = unlimited). Used for Premium plans.
                </small>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    border: '1px solid #e2e8f0',
                    resize: 'vertical'
                  }}
                  placeholder="Describe what this plan offers..."
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Features
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input
                    type="text"
                    value={formData.newFeature}
                    onChange={(e) => setFormData({ ...formData, newFeature: e.target.value })}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddFeature()
                      }
                    }}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      borderRadius: '4px',
                      border: '1px solid #e2e8f0'
                    }}
                    placeholder="Add a feature..."
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    style={{
                      padding: '0.5rem 1rem',
                      background: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Add
                  </button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {formData.features.map((feature, index) => (
                    <span
                      key={index}
                      style={{
                        padding: '0.25rem 0.5rem',
                        background: '#eff6ff',
                        color: '#2563eb',
                        borderRadius: '4px',
                        fontSize: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      {feature}
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(index)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ef4444',
                          cursor: 'pointer',
                          fontSize: '1rem',
                          padding: 0,
                          lineHeight: 1
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  <span>Active (plan is available for subscription)</span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#f3f4f6',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '0.5rem 1rem',
                    background: loading ? '#9ca3af' : 'var(--primary-color, #2563eb)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: '500',
                    opacity: loading ? 0.6 : 1
                  }}
                >
                  {loading ? 'Saving...' : (editingPlan ? 'Update Plan' : 'Create Plan')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>
            <span>{toast.type === 'success' ? '✅' : '❌'}</span>
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  )
}
