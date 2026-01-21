import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../../config'
import ConfirmationModal from '../common/ConfirmationModal'
import './CasesTab.css'

export default function CasesTab({ auth }) {
  const navigate = useNavigate()
  const [cases, setCases] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [caseToDelete, setCaseToDelete] = useState(null)

  // Filters
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

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

  useEffect(() => {
    loadCases()
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

  const handleDelete = (c) => {
    setCaseToDelete(c)
  }

  const confirmDelete = async () => {
    if (!caseToDelete) return

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/cases/${caseToDelete.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${auth.token}`,
          'ngrok-skip-browser-warning': 'true'
        },
      })
      if (!res.ok) throw new Error('Failed to delete')
      showToast('success', 'Case deleted')
      loadCases()
      setCaseToDelete(null)
    } catch (e) {
      showToast('error', e.message)
    }
  }


  // Filter Logic
  const filteredCases = cases.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = categoryFilter === 'all' ||
      (c.categoryId && c.categoryId.toString() === categoryFilter) ||
      (!c.categoryId && c.category === categoryFilter)
    return matchesSearch && matchesCategory
  })

  return (
    <div className="admin-cases">
      {/* Header Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0 }}>Case Management</h2>
        <button className="btn-primary" onClick={() => navigate('/admin/cases/new')}>+ New Case</button>
      </div>

      {/* Filters */}
      <div className="filters-bar" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
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
      </div>

      {/* Table */}
      <div className="cases-table-container">
        <table className="cases-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Difficulty</th>
              <th>Duration</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCases.map(c => (
              <tr key={c.id}>
                <td>
                  <div style={{ fontWeight: '500' }}>{c.title}</div>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                    {c.difficulty} • {c.duration} min • {c.stepCount || 0} steps
                  </div>
                </td>
                <td>
                  <span className="badge badge-category">
                    {c.categoryIcon} {c.categoryName || c.category}
                  </span>
                </td>
                <td>
                  <span className={`badge badge-difficulty-${c.difficulty?.toLowerCase()}`}>
                    {c.difficulty}
                  </span>
                </td>
                <td>{c.duration} min</td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-icon btn-edit" onClick={() => navigate(`/admin/cases/${c.id}/edit`)} title="Edit">✎</button>
                    <button className="btn-icon btn-delete" onClick={() => handleDelete(c)} title="Delete">🗑</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredCases.length === 0 && !loading && (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>No cases found matching your filters.</div>
        )}
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>
            <span>{toast.type === 'success' ? '✅' : '❌'}</span>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={!!caseToDelete}
        title="Delete Case?"
        message="Are you sure you want to permanently delete this case? This action cannot be undone."
        confirmText="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setCaseToDelete(null)}
        isDanger={true}
      />
    </div>
  )
}
