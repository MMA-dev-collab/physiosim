import React, { useEffect, useState } from 'react'
import { API_BASE_URL } from '../../config'
import './CasesTab.css' // Reuse table styles
import { useToast } from '../../context/ToastContext'
import ConfirmationModal from '../common/ConfirmationModal'
import InputModal from '../common/InputModal'

export default function SubscriptionsTab({ auth }) {
  const { toast } = useToast()
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

  // Modal states
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
    isDanger: false
  })
  const [inputModal, setInputModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    placeholder: '',
    onSubmit: () => { }
  })

  // Form validation state
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false)

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
    setHasAttemptedSubmit(true)
    try {
      // Validate user selection
      if (!formData.userId || formData.userId === '') {
        toast.warning('Please select a user')
        return
      }

      // Validate plan selection
      if (!formData.planId || formData.planId === '') {
        toast.warning('Please select a plan')
        return
      }

      const selectedPlan = plans.find(p => p.id === parseInt(formData.planId))
      if (!selectedPlan) {
        toast.error('Selected plan not found. Please refresh and try again.')
        return
      }

      // Validate start date
      if (!formData.startDate) {
        toast.warning('Please select a start date')
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
        toast.warning('Please provide an end date')
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
        toast.success(`Subscription created successfully! User now has ${newSubscription.planName} plan.`)
        setShowModal(false)
        setFormData({
          userId: '',
          planId: '',
          startDate: new Date().toISOString().split('T')[0],
          endDate: '',
          daysToAdd: ''
        })
        setHasAttemptedSubmit(false)
        loadData()
      } else {
        const error = await res.json()
        toast.error(error.message || 'Failed to create subscription')
      }
    } catch (err) {
      console.error('Create subscription error:', err)
      toast.error('Failed to create subscription: ' + err.message)
    }
  }

  const openExtendModal = (subscriptionId) => {
    setInputModal({
      isOpen: true,
      title: 'Extend Subscription',
      message: 'Enter number of days to extend:',
      placeholder: 'e.g. 30',
      onSubmit: (value) => {
        handleExtend(subscriptionId, parseInt(value))
        setInputModal(prev => ({ ...prev, isOpen: false }))
      }
    })
  }

  const handleExtend = async (subscriptionId, daysToAdd) => {
    if (!daysToAdd || isNaN(daysToAdd) || daysToAdd <= 0) {
      toast.warning('Please enter a valid number of days')
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
        toast.success('Subscription extended successfully')
      } else {
        toast.error('Failed to extend subscription')
      }
    } catch (err) {
      toast.error('Failed to extend subscription')
    }
  }

  const confirmDeactivate = (subscriptionId, currentPlanName) => {
    if (currentPlanName === 'Normal') {
      toast.info('This user is already on the Normal plan.')
      return
    }

    setConfirmModal({
      isOpen: true,
      title: 'Deactivate Subscription?',
      message: `Are you sure you want to deactivate this subscription? The user will be downgraded to the Normal plan immediately.`,
      isDanger: true,
      onConfirm: () => {
        handleDeactivate(subscriptionId)
        setConfirmModal(prev => ({ ...prev, isOpen: false }))
      }
    })
  }

  const handleDeactivate = async (subscriptionId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/subscriptions/${subscriptionId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ reason: 'Deactivated by admin - downgraded to Normal' })
      })

      if (res.ok) {
        toast.success('Subscription deactivated. User downgraded to Normal plan.')
        loadData()
      } else {
        toast.error('Failed to deactivate subscription')
      }
    } catch (err) {
      toast.error('Failed to deactivate subscription')
    }
  }

  const confirmChangePlan = (subscriptionId, newPlanId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Change Subscription Plan',
      message: 'Are you sure you want to change this subscription plan?',
      isDanger: false,
      onConfirm: () => {
        handleChangePlan(subscriptionId, newPlanId)
        setConfirmModal(prev => ({ ...prev, isOpen: false }))
      }
    })
  }

  const handleChangePlan = async (subscriptionId, newPlanId) => {
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
        toast.success('Plan changed successfully')
      } else {
        toast.error('Failed to change plan')
      }
    } catch (err) {
      toast.error('Failed to change plan')
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
              toast.warning('No users found. Please ensure users exist in the system.')
              return
            }
            if (plans.length === 0) {
              toast.warning('No subscription plans found. Please run the database migration.')
              return
            }
            setHasAttemptedSubmit(false)
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
                          onClick={() => openExtendModal(sub.id)}
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
                              confirmChangePlan(sub.id, e.target.value)
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
                        {sub.planName !== 'Normal' && (
                          <button
                            onClick={() => confirmDeactivate(sub.id, sub.planName)}
                            style={{
                              padding: '0.25rem 0.5rem',
                              background: '#f59e0b',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.75rem'
                            }}
                          >
                            Deactivate
                          </button>
                        )}
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
                    const today = new Date()
                    const startDate = today.toISOString().split('T')[0]
                    const end = new Date(today)
                    end.setDate(end.getDate() + plan.durationDays)
                    const calculatedEndDate = end.toISOString().split('T')[0]
                    setFormData({
                      ...formData,
                      planId: e.target.value,
                      startDate: startDate,
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
                  border: hasAttemptedSubmit && !formData.planId ? '1px solid #ef4444' : '1px solid #e2e8f0'
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
              {hasAttemptedSubmit && !formData.planId && (
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
                disabled
                readOnly
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '4px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#f3f4f6',
                  cursor: 'not-allowed'
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
                disabled
                readOnly
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '4px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#f3f4f6',
                  cursor: 'not-allowed'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowModal(false)
                  setHasAttemptedSubmit(false)
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

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        isDanger={confirmModal.isDanger}
      />

      <InputModal
        isOpen={inputModal.isOpen}
        title={inputModal.title}
        message={inputModal.message}
        placeholder={inputModal.placeholder}
        onSubmit={inputModal.onSubmit}
        onCancel={() => setInputModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  )
}
