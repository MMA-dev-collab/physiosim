import React, { useEffect, useState } from 'react'
import { API_BASE_URL } from '../../config'
import './CasesTab.css' // Reuse table styles

export default function SubscriptionsTab({ auth }) {
  const [subscriptions, setSubscriptions] = useState([])
  const [plans, setPlans] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingSubscription, setEditingSubscription] = useState(null)
  const [formData, setFormData] = useState({
    userId: '',
    planId: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    daysToAdd: ''
  })

  useEffect(() => {
    loadData()
  }, [auth])

  const loadData = async () => {
    try {
      const [subsRes, plansRes, usersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/admin/subscriptions`, {
          headers: {
            Authorization: `Bearer ${auth.token}`,
            'ngrok-skip-browser-warning': 'true'
          }
        }),
        fetch(`${API_BASE_URL}/api/admin/subscription-plans`, {
          headers: {
            Authorization: `Bearer ${auth.token}`,
            'ngrok-skip-browser-warning': 'true'
          }
        }),
        fetch(`${API_BASE_URL}/api/admin/users`, {
          headers: {
            Authorization: `Bearer ${auth.token}`,
            'ngrok-skip-browser-warning': 'true'
          }
        })
      ])

      const [subs, plansData, usersData] = await Promise.all([
        subsRes.json(),
        plansRes.json(),
        usersRes.json()
      ])

      setSubscriptions(subs)
      setPlans(plansData)
      setUsers(usersData)
      setLoading(false)
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  const handleCreateSubscription = async () => {
    try {
      // Validate user selection
      if (!formData.userId || formData.userId === '') {
        alert('Please select a user')
        return
      }

      // Validate plan selection
      if (!formData.planId || formData.planId === '') {
        alert('Please select a plan')
        return
      }

      const selectedPlan = plans.find(p => p.id === parseInt(formData.planId))
      if (!selectedPlan) {
        alert('Selected plan not found. Please refresh and try again.')
        return
      }

      // Validate start date
      if (!formData.startDate) {
        alert('Please select a start date')
        return
      }

      // Calculate end date if not provided
      let endDate = formData.endDate
      if (!endDate && selectedPlan.durationDays) {
        const start = new Date(formData.startDate)
        start.setDate(start.getDate() + selectedPlan.durationDays)
        endDate = start.toISOString().split('T')[0]
      }

      if (!endDate) {
        alert('Please provide an end date')
        return
      }

      const res = await fetch(`${API_BASE_URL}/api/admin/subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          userId: parseInt(formData.userId),
          planId: parseInt(formData.planId),
          startDate: formData.startDate,
          endDate: endDate
        })
      })

      if (res.ok) {
        const newSubscription = await res.json()
        alert(`Subscription created successfully! User now has ${newSubscription.planName} plan.`)
        setShowModal(false)
        setFormData({
          userId: '',
          planId: '',
          startDate: new Date().toISOString().split('T')[0],
          endDate: '',
          daysToAdd: ''
        })
        loadData()
      } else {
        const error = await res.json()
        alert(error.message || 'Failed to create subscription')
      }
    } catch (err) {
      console.error('Create subscription error:', err)
      alert('Failed to create subscription: ' + err.message)
    }
  }

  const handleExtend = async (subscriptionId, daysToAdd) => {
    if (!daysToAdd || daysToAdd <= 0) {
      alert('Please enter a valid number of days')
      return
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/subscriptions/${subscriptionId}/extend`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ daysToAdd: parseInt(daysToAdd) })
      })

      if (res.ok) {
        loadData()
      } else {
        alert('Failed to extend subscription')
      }
    } catch (err) {
      alert('Failed to extend subscription')
    }
  }

  const handleCancel = async (subscriptionId) => {
    if (!confirm('Are you sure you want to cancel this subscription? This will downgrade Premium users to Normal.')) {
      return
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/subscriptions/${subscriptionId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ reason: 'Cancelled by admin' })
      })

      if (res.ok) {
        loadData()
      } else {
        alert('Failed to cancel subscription')
      }
    } catch (err) {
      alert('Failed to cancel subscription')
    }
  }

  const handleChangePlan = async (subscriptionId, newPlanId) => {
    if (!confirm('Are you sure you want to change this subscription plan?')) {
      return
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/subscriptions/${subscriptionId}/change-plan`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ newPlanId: parseInt(newPlanId) })
      })

      if (res.ok) {
        loadData()
      } else {
        alert('Failed to change plan')
      }
    } catch (err) {
      alert('Failed to change plan')
    }
  }

  const getHealthColor = (health) => {
    if (health === 'expired') return '#ef4444'
    if (health === 'expiring_soon') return '#f59e0b'
    return '#10b981'
  }

  const getStatusColor = (status) => {
    if (status === 'active') return '#10b981'
    if (status === 'expired') return '#ef4444'
    return '#6b7280'
  }

  if (loading) return <div>Loading subscriptions...</div>

  if (plans.length === 0) {
    return (
      <div>
        <p style={{ color: '#ef4444', marginBottom: '1rem' }}>
          ⚠️ No subscription plans found. Please ensure the database migration has been run.
        </p>
        <button onClick={loadData} style={{
          padding: '0.5rem 1rem',
          background: '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}>
          Retry Loading
        </button>
      </div>
    )
  }

  return (
    <div className="admin-subscriptions">
      <div className="section-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Subscription Management</h2>
        <button
          onClick={() => {
            if (users.length === 0) {
              alert('No users found. Please ensure users exist in the system.')
              return
            }
            if (plans.length === 0) {
              alert('No subscription plans found. Please run the database migration.')
              return
            }
            setShowModal(true)
          }}
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
          + Create Subscription
        </button>
      </div>

      <div className="cases-table-container">
        <table className="cases-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Plan</th>
              <th>Status</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Days Remaining</th>
              <th>Health</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((sub) => (
              <tr key={sub.id}>
                <td>
                  <div style={{ fontWeight: '500' }}>{sub.email || sub.name || `User #${sub.userId}`}</div>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>ID: {sub.userId}</div>
                </td>
                <td>
                  <span className="badge" style={{ 
                    background: sub.planName === 'Premium' ? '#eff6ff' : '#f3f4f6',
                    color: sub.planName === 'Premium' ? '#2563eb' : '#374151'
                  }}>
                    {sub.planName}
                  </span>
                </td>
                <td>
                  <span className="badge" style={{ 
                    background: getStatusColor(sub.status) + '20',
                    color: getStatusColor(sub.status)
                  }}>
                    {sub.status}
                  </span>
                </td>
                <td>{new Date(sub.startDate).toLocaleDateString()}</td>
                <td>{new Date(sub.endDate).toLocaleDateString()}</td>
                <td>
                  <span style={{ 
                    color: sub.daysRemaining < 0 ? '#ef4444' : sub.daysRemaining <= 7 ? '#f59e0b' : '#10b981',
                    fontWeight: '500'
                  }}>
                    {sub.daysRemaining || 0}
                  </span>
                </td>
                <td>
                  <span className="badge" style={{ 
                    background: getHealthColor(sub.health) + '20',
                    color: getHealthColor(sub.health)
                  }}>
                    {sub.health || 'active'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {sub.status === 'active' && (
                      <>
                        <button
                          onClick={() => {
                            const days = prompt('Enter days to extend:')
                            if (days) handleExtend(sub.id, days)
                          }}
                          style={{
                            padding: '0.25rem 0.5rem',
                            background: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.75rem'
                          }}
                        >
                          Extend
                        </button>
                        <select
                          onChange={(e) => {
                            if (e.target.value && e.target.value !== sub.planId) {
                              handleChangePlan(sub.id, e.target.value)
                            }
                          }}
                          value={sub.planId}
                          style={{
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            border: '1px solid #e2e8f0',
                            fontSize: '0.75rem',
                            cursor: 'pointer'
                          }}
                        >
                          {plans.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleCancel(sub.id)}
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
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h3 style={{ marginTop: 0 }}>Create New Subscription</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                User
              </label>
              <select
                value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '4px',
                  border: '1px solid #e2e8f0'
                }}
              >
                <option value="">Select user...</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.email} ({u.name || 'No name'})</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Plan <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={formData.planId}
                onChange={(e) => {
                  if (!e.target.value) {
                    setFormData({ ...formData, planId: '', endDate: '' })
                    return
                  }
                  const plan = plans.find(p => p.id === parseInt(e.target.value))
                  if (plan) {
                    const start = new Date(formData.startDate)
                    start.setDate(start.getDate() + plan.durationDays)
                    const calculatedEndDate = start.toISOString().split('T')[0]
                    setFormData({ 
                      ...formData, 
                      planId: e.target.value,
                      endDate: calculatedEndDate
                    })
                  } else {
                    setFormData({ ...formData, planId: e.target.value })
                  }
                }}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '4px',
                  border: formData.planId ? '1px solid #e2e8f0' : '1px solid #ef4444'
                }}
                required
              >
                <option value="">-- Select plan (required) --</option>
                {plans.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} - ${p.price} ({p.durationDays} days)
                  </option>
                ))}
              </select>
              {!formData.planId && (
                <small style={{ color: '#ef4444', marginTop: '0.25rem', display: 'block' }}>
                  Please select a plan
                </small>
              )}
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => {
                  const newStart = e.target.value
                  const plan = plans.find(p => p.id === parseInt(formData.planId))
                  setFormData({ 
                    ...formData, 
                    startDate: newStart,
                    endDate: plan ? (() => {
                      const start = new Date(newStart)
                      start.setDate(start.getDate() + plan.durationDays)
                      return start.toISOString().split('T')[0]
                    })() : formData.endDate
                  })
                }}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '4px',
                  border: '1px solid #e2e8f0'
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                End Date
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '4px',
                  border: '1px solid #e2e8f0'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowModal(false)
                  setFormData({
                    userId: '',
                    planId: '',
                    startDate: new Date().toISOString().split('T')[0],
                    endDate: '',
                    daysToAdd: ''
                  })
                }}
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
                onClick={handleCreateSubscription}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'var(--primary-color, #2563eb)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
