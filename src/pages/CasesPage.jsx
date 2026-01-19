import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../config'

function CasesPage({ auth }) {
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [difficultyFilter, setDifficultyFilter] = useState('all')
  const [durationFilter, setDurationFilter] = useState('all')
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        // Load cases
        const headers = {
          'ngrok-skip-browser-warning': 'true'
        }
        if (auth?.token) {
          headers.Authorization = `Bearer ${auth.token}`
        }

        const res = await fetch(`${API_BASE_URL}/api/cases`, { headers })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.message || 'Failed to load cases')
        }
        const data = await res.json()
        setCases(data)

        // Load categories
        const catRes = await fetch(`${API_BASE_URL}/api/categories`, {
          headers: { 'ngrok-skip-browser-warning': 'true' }
        })
        const catData = await catRes.json()
        if (catRes.ok) setCategories(catData)

      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [auth])

  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const textMatch =
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        (c.metadata?.brief || '').toLowerCase().includes(search.toLowerCase())
      const catMatch = categoryFilter === 'all' ||
        (c.categoryId && c.categoryId.toString() === categoryFilter) ||
        (!c.categoryId && c.category === categoryFilter) // Fallback for legacy string match if needed
      const diffMatch = difficultyFilter === 'all' || c.difficulty === difficultyFilter
      const durMatch = durationFilter === 'all' ||
        (durationFilter === 'short' && (c.duration || 10) <= 10) ||
        (durationFilter === 'medium' && (c.duration || 10) > 10 && (c.duration || 10) <= 20) ||
        (durationFilter === 'long' && (c.duration || 10) > 20)
      return textMatch && catMatch && diffMatch && durMatch
    })
  }, [cases, search, categoryFilter, difficultyFilter, durationFilter])

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
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>
          <div className="cases-filter-dropdowns">
            <select
              className="filter-dropdown"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>
            <select
              className="filter-dropdown"
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
            >
              <option value="all">Difficulty</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
            <select
              className="filter-dropdown"
              value={durationFilter}
              onChange={(e) => setDurationFilter(e.target.value)}
            >
              <option value="all">Duration</option>
              <option value="short">Short (≤10 min)</option>
              <option value="medium">Medium (11-20 min)</option>
              <option value="long">Long ({'>'}20 min)</option>
            </select>
          </div>
        </div>
      </div>

      {loading && <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Loading cases…</div>}
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
    </div>
  )
}

export default CasesPage


