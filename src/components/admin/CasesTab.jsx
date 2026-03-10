import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../../config'
import { CATEGORY_ICONS } from '../../utils/constants'
import ConfirmationModal from '../common/ConfirmationModal'

export default function CasesTab({ auth }) {
  const navigate = useNavigate()
  const [cases, setCases] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [caseToDelete, setCaseToDelete] = useState(null)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

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

  // Reset to first page when search or category filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [search, categoryFilter])

  // Pagination Logic
  const totalPages = Math.ceil(filteredCases.length / pageSize)
  const paginatedCases = filteredCases.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const getDifficultyStyle = (difficulty) => {
    const d = difficulty?.toLowerCase()
    if (d === 'beginner') return 'bg-[var(--color-badge-bg-beginner)] text-[var(--color-badge-beginner)]'
    if (d === 'intermediate') return 'bg-[var(--color-badge-bg-intermediate)] text-[var(--color-badge-intermediate)]'
    if (d === 'advanced') return 'bg-[var(--color-badge-bg-advanced)] text-[var(--color-badge-advanced)]'
    return 'bg-admin-bg text-admin-text-muted'
  }

  if (loading) return (
    <div className="p-8 animate-pulse space-y-4">
      <div className="flex justify-between items-center">
        <div className="h-8 w-48 bg-slate-200 rounded-lg" />
        <div className="h-10 w-32 bg-slate-200 rounded-lg" />
      </div>
      <div className="flex gap-3">
        <div className="h-10 w-72 bg-slate-200 rounded-lg" />
        <div className="h-10 w-40 bg-slate-200 rounded-lg" />
      </div>
      <div className="bg-white rounded-xl border border-slate-200">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-16 border-b border-slate-100 mx-4" />
        ))}
      </div>
    </div>
  )

  return (
    <div className="p-8">
      {/* Page Title & Actions */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-admin-primary">Case Library</h2>
          <p className="text-slate-500 text-sm mt-1">Manage and publish clinical simulation scenarios.</p>
        </div>
        <button
          onClick={() => navigate('/admin/cases/new')}
          className="bg-admin-primary text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-admin-primary-hover transition-all shadow-sm"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          New Case
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative w-full max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-admin-text-muted text-lg">search</span>
          <input
            className="w-full pl-10 pr-4 py-2 bg-admin-bg border border-admin-border rounded-lg text-sm focus:ring-2 focus:ring-admin-primary/20 placeholder:text-admin-text-muted text-admin-text transition-all"
            placeholder="Search clinical cases..."
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-admin-bg border border-admin-border rounded-lg text-xs font-semibold text-admin-text-muted py-2 pl-3 pr-8 focus:ring-2 focus:ring-admin-primary/20 cursor-pointer"
        >
          <option value="all">All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
          ))}
        </select>
      </div>

      {/* Data Table */}
      <div className="bg-admin-card rounded-xl border border-admin-border overflow-x-auto shadow-admin-card">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-admin-bg border-b border-admin-border">
              <th className="py-4 px-6 text-xs font-bold text-admin-text-muted uppercase tracking-wider">Case Title</th>
              <th className="py-4 px-4 text-xs font-bold text-admin-text-muted uppercase tracking-wider">Category</th>
              <th className="py-4 px-4 text-xs font-bold text-admin-text-muted uppercase tracking-wider">Difficulty</th>
              <th className="py-4 px-4 text-xs font-bold text-admin-text-muted uppercase tracking-wider">Steps</th>
              <th className="py-4 px-4 text-xs font-bold text-admin-text-muted uppercase tracking-wider">Duration</th>
              <th className="py-4 px-4 text-xs font-bold text-admin-text-muted uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-admin-border/50">
            {paginatedCases.map(c => (
              <tr key={c.id} className="hover:bg-admin-bg/50 transition-colors">
                <td className="py-4 px-6">
                  <div className="font-semibold text-admin-primary">{c.title}</div>
                  <div className="text-[11px] text-slate-400">ID: {c.id}</div>
                </td>
                <td className="py-4 px-4">
                  <span className="px-2.5 py-1 bg-admin-bg text-admin-text-muted rounded-md text-xs font-medium border border-admin-border/50 flex items-center gap-2 w-fit">
                    {CATEGORY_ICONS.includes(c.categoryIcon) ? (
                      <span className="material-symbols-outlined text-[16px] leading-none">{c.categoryIcon || 'category'}</span>
                    ) : (
                      <span className="text-[14px] leading-none">{c.categoryIcon}</span>
                    )}
                    {c.categoryName || c.category}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight ${getDifficultyStyle(c.difficulty)}`}>
                    {c.difficulty}
                  </span>
                </td>
                <td className="py-4 px-4 text-sm text-admin-text-muted font-medium">{c.stepCount || 0} Steps</td>
                <td className="py-4 px-4 text-sm text-admin-text-muted">{c.duration} min</td>
                <td className="py-4 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => navigate(`/admin/cases/${c.id}/edit`)}
                      className="p-1.5 hover:bg-admin-bg rounded-lg text-admin-text-muted hover:text-admin-primary transition-colors"
                      title="Edit"
                    >
                      <span className="material-symbols-outlined text-lg">edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(c)}
                      className="p-1.5 hover:bg-admin-danger/10 rounded-lg text-admin-text-muted hover:text-admin-danger transition-colors"
                      title="Delete"
                    >
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredCases.length === 0 && !loading && (
          <div className="py-12 text-center">
            <span className="material-symbols-outlined text-4xl text-slate-300 mb-2 block">search_off</span>
            <p className="text-slate-400 text-sm">No cases found matching your filters.</p>
          </div>
        )}
      </div>

      {/* Pagination UI */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between bg-white px-6 py-4 rounded-xl border border-admin-border shadow-admin-card overflow-x-auto gap-4">
          <p className="text-sm text-admin-text-muted whitespace-nowrap">
            Showing <span className="font-bold text-admin-text">{Math.min(filteredCases.length, (currentPage - 1) * pageSize + 1)}</span> to{' '}
            <span className="font-bold text-admin-text">{Math.min(filteredCases.length, currentPage * pageSize)}</span> of{' '}
            <span className="font-bold text-admin-text">{filteredCases.length}</span> cases
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="w-10 h-10 flex items-center justify-center rounded-lg border border-admin-border text-admin-text-muted hover:border-admin-primary hover:text-admin-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>

            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1
                if (
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded-lg text-sm font-bold transition-all shrink-0 ${currentPage === pageNum
                        ? 'bg-admin-primary text-white shadow-sm'
                        : 'text-admin-text-muted hover:bg-admin-bg'
                        }`}
                    >
                      {pageNum}
                    </button>
                  )
                }
                if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                  return <span key={pageNum} className="text-slate-300">...</span>
                }
                return null
              })}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="w-10 h-10 flex items-center justify-center rounded-lg border border-admin-border text-admin-text-muted hover:border-admin-primary hover:text-admin-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[1001]">
          <div className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${toast.type === 'success' ? 'bg-admin-accent' : 'bg-red-500'
            }`}>
            <span className="material-symbols-outlined text-lg">
              {toast.type === 'success' ? 'check_circle' : 'error'}
            </span>
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
