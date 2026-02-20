import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { API_BASE_URL } from '../config'
import Loader from '@/components/ui/loader-12'

function CasesPage({ auth }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [categories, setCategories] = useState([])

  // Get values from URL or defaults
  const page = parseInt(searchParams.get('page')) || 1
  const search = searchParams.get('search') || ''
  const categoryFilter = searchParams.get('category') || 'all'
  const difficultyFilter = searchParams.get('difficulty') || 'all'
  const durationFilter = searchParams.get('duration') || 'all'

  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 15
  const navigate = useNavigate()

  // Helper to update specific params
  const updateParams = (newParams) => {
    const updated = new URLSearchParams(searchParams)
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === 'all' || value === '') {
        updated.delete(key)
      } else {
        updated.set(key, value)
      }
    })
    // Reset to page 1 if any filter changes
    if (!newParams.page) {
      updated.set('page', '1')
    }
    setSearchParams(updated)
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        // Load cases with pagination and filters
        const headers = {
          'ngrok-skip-browser-warning': 'true'
        }
        if (auth?.token) {
          headers.Authorization = `Bearer ${auth.token}`
        }

        const queryParams = new URLSearchParams({
          page,
          limit,
          search,
          category: categoryFilter,
          difficulty: difficultyFilter,
          duration: durationFilter
        }).toString();

        const res = await fetch(`${API_BASE_URL}/api/cases?${queryParams}`, { headers })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.message || 'Failed to load cases')
        }
        const response = await res.json()
        setCases(response.data || [])
        setTotalPages(response.meta?.totalPages || 1)
        setTotal(response.meta?.total || 0)

        // Load categories only if empty
        if (categories.length === 0) {
          const catRes = await fetch(`${API_BASE_URL}/api/categories`, {
            headers: { 'ngrok-skip-browser-warning': 'true' }
          })
          const catData = await catRes.json()
          if (catRes.ok) setCategories(catData)
        }

      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [auth, page, search, categoryFilter, difficultyFilter, durationFilter])

  // No client-side filtering needed now as it is handled by the API
  const filteredCases = cases;

  return (
    <div className="cases-library-page">
      <div className="cases-library-header">
        <h1 className="cases-library-title">Case Library</h1>
        <div className="cases-library-filters">
          <div className="cases-search-container">
            <input
              className="cases-search-input"
              placeholder="Search cases"
              value={search}
              onChange={(e) => updateParams({ search: e.target.value })}
            />
            <span className="search-icon">🔍</span>
          </div>
          <div className="cases-filter-dropdowns">
            <select
              className="filter-dropdown"
              value={categoryFilter}
              onChange={(e) => updateParams({ category: e.target.value })}
            >
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>
            <select
              className="filter-dropdown"
              value={difficultyFilter}
              onChange={(e) => updateParams({ difficulty: e.target.value })}
            >
              <option value="all">Difficulty</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
            <select
              className="filter-dropdown"
              value={durationFilter}
              onChange={(e) => updateParams({ duration: e.target.value })}
            >
              <option value="all">Duration</option>
              <option value="short">Short (≤10 min)</option>
              <option value="medium">Medium (11-20 min)</option>
              <option value="long">Long ({'>'}20 min)</option>
            </select>
          </div>
        </div>
      </div>


      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh', width: '100%' }}>
          <Loader />
        </div>
      )}
      {error && (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444', fontWeight: 500 }}>{error}</div>
      )}

      {!loading && !error && (
        <div className="cases-grid">
          {filteredCases.map((c) => (
            <div key={c.id} className="case-library-card">
              <div className="case-card-link-icon">↗</div>
              {c.isLocked && !c.isCompleted && (
                <div className="case-card-locked-overlay">
                  <span className="case-card-locked-badge">
                    {c.isLockedByPlan ? `🔒 ${c.requiredPlanName || 'Plan'} Required` : 'Locked'}
                  </span>
                </div>
              )}
              <div className="case-card-thumbnail">
                {c.thumbnailUrl ? (
                  <img src={c.thumbnailUrl} alt={c.title} />
                ) : (
                  <div className="case-card-placeholder">
                    <span>📋</span>
                  </div>
                )}
              </div>
              <div className="case-card-content">
                <h3 className="case-card-title">{c.title}</h3>
                <p className="case-card-description">
                  {c.metadata?.brief || 'Physical Therapy Case'}
                </p>
                {c.categoryName && (
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                    {c.categoryIcon} {c.categoryName}
                  </div>
                )}
                {c.requiredPlanName && (
                  <div style={{ fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                    <span style={{
                      background: '#eff6ff',
                      color: '#2563eb',
                      padding: '0.125rem 0.5rem',
                      borderRadius: '4px',
                      fontWeight: '500'
                    }}>
                      {c.requiredPlanName} Plan
                    </span>
                  </div>
                )}
                <div className="case-card-footer">
                  <span className={`case-card-difficulty difficulty-${c.difficulty?.toLowerCase() || 'intermediate'}`}>
                    {c.difficulty?.toUpperCase() || 'INTERMEDIATE'}
                  </span>
                  <span className="case-card-duration">
                    <span className="duration-icon">🕐</span>
                    {c.duration || 10} min
                  </span>
                </div>
                <button
                  className="case-card-button"
                  disabled={(c.isLocked && !c.isCompleted) || !auth}
                  onClick={() => navigate(`/cases/${c.id}`)}
                >
                  {!auth ? 'Login to Start' : (c.isLocked && !c.isCompleted ? (c.isLockedByPlan ? 'Not Available' : 'Locked') : c.isCompleted ? 'Review Case' : 'Start Case')}
                </button>
              </div>
            </div>
          ))}
          {!filteredCases.length && (
            <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
              No cases match your filters yet.
            </div>
          )}
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && !error && total > limit && filteredCases.length > 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '1rem',
          marginTop: '2rem',
          paddingBottom: '2rem'
        }}>
          <button
            onClick={() => updateParams({ page: Math.max(1, page - 1).toString() })}
            disabled={page === 1}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              background: page === 1 ? '#f3f4f6' : 'white',
              cursor: page === 1 ? 'not-allowed' : 'pointer',
              fontWeight: '500'
            }}
          >
            ← Previous
          </button>
          <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
            Page {page} of {totalPages} ({total} cases)
          </span>
          <button
            onClick={() => updateParams({ page: Math.min(totalPages, page + 1).toString() })}
            disabled={page === totalPages}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              background: page === totalPages ? '#f3f4f6' : 'white',
              cursor: page === totalPages ? 'not-allowed' : 'pointer',
              fontWeight: '500'
            }}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}

export default CasesPage


