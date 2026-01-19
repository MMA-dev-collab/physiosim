import React, { useEffect, useState } from 'react'
import { API_BASE_URL } from '../../config'
import './CasesTab.css' // Reuse table styles

export default function CaseAccessTab({ auth }) {
  const [cases, setCases] = useState([])
  const [categories, setCategories] = useState([])
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [updating, setUpdating] = useState(null)

  // Filters
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [accessFilter, setAccessFilter] = useState('all') // all, free, premium, allUsers
  const [planFilter, setPlanFilter] = useState('all') // Filter by plan

  // Load Data
  const loadCases = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/cases`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
          'ngrok-skip-browser-warning': 'true'
        },
      })
      const data = await res.json()
      if (res.ok) setCases(data)
    } catch (e) {
      showToast('error', 'Failed to load cases')
    } finally {
      setLoading(false)
    }
  }

  const loadPlans = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/subscription-plans`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
          'ngrok-skip-browser-warning': 'true'
        },
      })
      const data = await res.json()
      if (res.ok) setPlans(data)
    } catch (e) {
      console.error('Failed to load plans:', e)
    }
  }

  useEffect(() => {
    loadCases()
    loadPlans()
    fetch(`${API_BASE_URL}/api/categories`, {
      headers: { 'ngrok-skip-browser-warning': 'true' }
    })
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(e => console.error(e))
  }, [])

  // Toast Helper
  const showToast = (type, message) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }

  // Update case access - Refactored for Plan-based Access
  const handleAccessUpdate = async (caseId, updates) => {
    setUpdating(caseId)
    try {
      const caseData = cases.find(c => c.id === caseId)
      if (!caseData) throw new Error('Case not found')

      const updateData = {
        ...caseData,
        ...updates
      }

      const res = await fetch(`${API_BASE_URL}/api/admin/cases/${caseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(updateData)
      })

      if (res.ok) {
        showToast('success', 'Case access updated successfully')
        setCases(cases.map(c =>
          c.id === caseId ? { ...c, ...updateData } : c
        ))
      } else {
        const error = await res.json()
        throw new Error(error.message || 'Failed to update')
      }
    } catch (e) {
      showToast('error', e.message || 'Failed to update case access')
    } finally {
      setUpdating(null)
    }
  }

  // Bulk update multiple cases
  const handleBulkUpdate = async (caseIds, updates) => {
    if (!window.confirm(`Update access for ${caseIds.length} case(s)?`)) return

    setUpdating('bulk')
    try {
      const promises = caseIds.map(caseId => {
        const caseData = cases.find(c => c.id === caseId)
        const updateData = { ...caseData, ...updates }

        // Sync logic
        if (updates.accessLevel === 'premium') {
          updateData.isPremiumOnly = true
          updateData.isFree = false
        } else if (updates.accessLevel === 'free') {
          updateData.isFree = true
          updateData.isPremiumOnly = false
        } else if (updates.accessLevel === 'all') {
          updateData.isFree = true
          updateData.isPremiumOnly = false
        }

        return fetch(`${API_BASE_URL}/api/admin/cases/${caseId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth.token}`,
            'ngrok-skip-browser-warning': 'true'
          },
          body: JSON.stringify(updateData)
        })
      })

      await Promise.all(promises)
      showToast('success', `Updated ${caseIds.length} case(s)`)
      loadCases()
    } catch (e) {
      showToast('error', 'Failed to update cases')
    } finally {
      setUpdating(null)
    }
  }

  // Filter Logic
  const filteredCases = cases.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = categoryFilter === 'all' ||
      (c.categoryId && c.categoryId.toString() === categoryFilter) ||
      (!c.categoryId && c.category === categoryFilter)

    const matchesAccess = accessFilter === 'all' ||
      (accessFilter === 'free' && (c.accessLevel === 'free' || c.isFree)) ||
      (accessFilter === 'premium' && (c.accessLevel === 'premium' || c.isPremiumOnly)) ||
      (accessFilter === 'allUsers' && c.accessLevel === 'all')

    return matchesSearch && matchesCategory && matchesAccess
  })

  const getAccessBadge = (caseData) => {
    const plan = plans.find(p => p.id === caseData.requiredPlanId);
    if (!plan) return <span className="badge" style={{ background: '#f3f4f6', color: '#6b7280' }}>Unknown</span>;

    if (plan.role === 'premium') return <span className="badge" style={{ background: '#eff6ff', color: '#2563eb' }}>🔒 {plan.name}</span>;
    if (plan.role === 'normal') return <span className="badge" style={{ background: '#f0fdf4', color: '#16a34a' }}>🆓 {plan.name}</span>;
    if (plan.role === 'ultra') return <span className="badge" style={{ background: '#fef3c7', color: '#d97706' }}>⭐ {plan.name}</span>;

    return <span className="badge" style={{ background: '#f3f4f6' }}>{plan.name}</span>
  }

  // Check if a plan can access a case based on accessLevel
  const canPlanAccessCase = (plan, caseData) => {
    // All Users cases - accessible to everyone
    if (caseData.accessLevel === 'all') {
      return true
    }

    // Free cases - accessible to all plans (but may have limits)
    if (caseData.accessLevel === 'free' || caseData.isFree) {
      return true
    }

    // Premium cases - only accessible to premium role plans
    if (caseData.accessLevel === 'premium' || caseData.isPremiumOnly) {
      return plan.role === 'premium'
    }

    return false
  }

  return (
    <div className="admin-cases">
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, marginBottom: '0.5rem' }}>Case Access Management</h2>
        <p style={{ color: '#6b7280', margin: 0 }}>
          Manage which cases are available to free users, premium users, or all users
        </p>
      </div>

      {/* Filters */}
      <div className="filters-bar" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search cases..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '0.5rem 1rem', borderRadius: '100px', border: '1px solid #e2e8f0', width: '300px' }}
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{ padding: '0.5rem 1rem', borderRadius: '100px', border: '1px solid #e2e8f0' }}
        >
          <option value="all">All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
          ))}
        </select>
        <select
          value={accessFilter}
          onChange={(e) => setAccessFilter(e.target.value)}
          style={{ padding: '0.5rem 1rem', borderRadius: '100px', border: '1px solid #e2e8f0' }}
        >
          <option value="all">All Access Levels</option>
          <option value="free">Free Cases</option>
          <option value="premium">Premium Cases</option>
          <option value="allUsers">All Users Cases</option>
        </select>
      </div>

      {/* Plans Overview */}
      {plans.length > 0 && (
        <div style={{
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: '600' }}>
            📋 Available Subscription Plans
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
            {plans.filter(p => p.isActive).map(plan => (
              <div key={plan.id} style={{
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                padding: '1rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <strong style={{ fontSize: '0.95rem' }}>{plan.name}</strong>
                  <span className="badge" style={{
                    background: plan.role === 'premium' ? '#eff6ff' : plan.role === 'normal' ? '#f0fdf4' : '#f3f4f6',
                    color: plan.role === 'premium' ? '#2563eb' : plan.role === 'normal' ? '#16a34a' : '#6b7280',
                    fontSize: '0.75rem'
                  }}>
                    {plan.role === 'premium' ? '🔒 Premium' : plan.role === 'normal' ? '🆓 Normal' : '⚙️ Custom'}
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                  <div>Price: ${parseFloat(plan.price || 0).toFixed(2)}</div>
                  <div>Max Cases: {plan.maxFreeCases === null ? 'Unlimited' : plan.maxFreeCases}</div>
                  <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #e5e7eb' }}>
                    <strong>Can Access:</strong>
                    <div style={{ marginTop: '0.25rem' }}>
                      {(() => {
                        const accessibleCases = cases.filter(c => canPlanAccessCase(plan, c))
                        if (plan.role === 'premium') {
                          return `All cases (${cases.length} total)`
                        } else {
                          const freeCases = cases.filter(c => (c.accessLevel === 'free' || c.isFree) && c.accessLevel !== 'all').length
                          const allCases = cases.filter(c => c.accessLevel === 'all').length
                          return `Free cases (${freeCases}) + All Users (${allCases}) = ${accessibleCases.length} total`
                        }
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div style={{
        background: '#eff6ff',
        border: '1px solid #bfdbfe',
        borderRadius: '8px',
        padding: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <div>
            <strong>🆓 Free:</strong> Available to all plans (Normal/Custom: counts toward case limit)
          </div>
          <div>
            <strong>🔒 Premium:</strong> Only accessible to Premium role plans
          </div>
          <div>
            <strong>🌐 All Users:</strong> Accessible to everyone, no restrictions
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="cases-table-container">
        <table className="cases-table">
          <thead>
            <tr>
              <th style={{ width: '30px' }}>
                <input
                  type="checkbox"
                  onChange={(e) => {
                    // Select all visible cases
                    const allSelected = filteredCases.every(c => c.selected)
                    filteredCases.forEach(c => {
                      setCases(prev => prev.map(caseItem =>
                        caseItem.id === c.id ? { ...caseItem, selected: !allSelected } : caseItem
                      ))
                    })
                  }}
                />
              </th>
              <th>Case Title</th>
              <th>Category</th>
              <th>Current Access</th>
              <th>Access Level</th>
              <th>Quick Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCases.map(c => (
              <tr key={c.id} style={{ opacity: updating === c.id ? 0.5 : 1 }}>
                <td>
                  <input
                    type="checkbox"
                    checked={c.selected || false}
                    onChange={(e) => {
                      setCases(prev => prev.map(caseItem =>
                        caseItem.id === c.id ? { ...caseItem, selected: e.target.checked } : caseItem
                      ))
                    }}
                  />
                </td>
                <td>
                  <div style={{ fontWeight: '500' }}>{c.title}</div>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                    {c.difficulty} • {c.duration} min
                  </div>
                </td>
                <td>
                  <span className="badge badge-category">
                    {c.categoryIcon} {c.categoryName || c.category || 'Uncategorized'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {getAccessBadge(c)}
                    {/* Show which plans can access this case */}
                    {plans.length > 0 && (
                      <div style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '0.25rem' }}>
                        <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>Accessible by:</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                          {plans.filter(p => p.isActive && canPlanAccessCase(p, c)).map(plan => (
                            <span key={plan.id} style={{
                              background: plan.role === 'premium' ? '#eff6ff' : plan.role === 'normal' ? '#f0fdf4' : '#f3f4f6',
                              color: plan.role === 'premium' ? '#2563eb' : plan.role === 'normal' ? '#16a34a' : '#6b7280',
                              padding: '0.125rem 0.375rem',
                              borderRadius: '4px',
                              fontSize: '0.65rem'
                            }}>
                              {plan.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <select
                    value={c.requiredPlanId || ''}
                    onChange={(e) => handleAccessUpdate(c.id, { requiredPlanId: e.target.value ? Number(e.target.value) : null })}
                    disabled={updating === c.id}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '4px',
                      border: '1px solid #e2e8f0',
                      fontSize: '0.875rem',
                      cursor: updating === c.id ? 'not-allowed' : 'pointer',
                      minWidth: '150px',
                      background: updating === c.id ? '#f3f4f6' : 'white'
                    }}
                  >
                    {!c.requiredPlanId && <option value="">Select Plan...</option>}
                    {plans.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.role === 'normal' ? '🆓' : p.role === 'premium' ? '🔒' : '⭐'} {p.name}
                      </option>
                    ))}
                  </select>
                  {updating === c.id && (
                    <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: '#6b7280' }}>
                      ...
                    </span>
                  )}
                </td>
                <td>
                  {/* Actions replaced by direct dropdown */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredCases.length === 0 && !loading && (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
            No cases found matching your filters.
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {filteredCases.some(c => c.selected) && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          background: 'white',
          padding: '1rem',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0',
          zIndex: 100
        }}>
          <div style={{ marginBottom: '0.5rem', fontWeight: '500' }}>
            Bulk Update ({filteredCases.filter(c => c.selected).length} selected)
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => {
                const selectedIds = filteredCases.filter(c => c.selected).map(c => c.id)
                handleBulkUpdate(selectedIds, { accessLevel: 'free' })
              }}
              disabled={updating === 'bulk'}
              style={{
                padding: '0.5rem 1rem',
                background: '#fef3c7',
                color: '#d97706',
                border: '1px solid #fde68a',
                borderRadius: '4px',
                cursor: updating === 'bulk' ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Set All Free
            </button>
            <button
              onClick={() => {
                const selectedIds = filteredCases.filter(c => c.selected).map(c => c.id)
                handleBulkUpdate(selectedIds, { accessLevel: 'premium' })
              }}
              disabled={updating === 'bulk'}
              style={{
                padding: '0.5rem 1rem',
                background: '#eff6ff',
                color: '#2563eb',
                border: '1px solid #bfdbfe',
                borderRadius: '4px',
                cursor: updating === 'bulk' ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Set All Premium
            </button>
            <button
              onClick={() => {
                const selectedIds = filteredCases.filter(c => c.selected).map(c => c.id)
                handleBulkUpdate(selectedIds, { accessLevel: 'all' })
              }}
              disabled={updating === 'bulk'}
              style={{
                padding: '0.5rem 1rem',
                background: '#f0fdf4',
                color: '#16a34a',
                border: '1px solid #bbf7d0',
                borderRadius: '4px',
                cursor: updating === 'bulk' ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Set All Users
            </button>
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
