import React, { useEffect, useState } from 'react'
import { API_BASE_URL } from '../../config'

export default function FeedbackTab({ auth }) {
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCase, setSelectedCase] = useState(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`${API_BASE_URL}/api/admin/feedback`, {
          headers: {
            Authorization: `Bearer ${auth.token}`,
            'ngrok-skip-browser-warning': 'true'
          }
        })
        if (!res.ok) throw new Error('Failed to load feedback')
        const data = await res.json()
        setCases(data)
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [auth])

  const getDifficultyColor = (d) => {
    const map = {
      Beginner: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      Intermediate: 'bg-amber-50 text-amber-600 border-amber-200',
      Advanced: 'bg-red-50 text-red-600 border-red-200',
    }
    return map[d] || 'bg-slate-50 text-slate-600 border-slate-200'
  }

  if (loading) return (
    <div className="p-4 md:p-8 animate-pulse space-y-4">
      <div className="h-8 w-56 bg-slate-200 rounded-lg" />
      <div className="space-y-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-20 bg-slate-200 rounded-xl" />
        ))}
      </div>
    </div>
  )

  if (error) return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <span className="material-symbols-outlined text-5xl text-red-300 mb-4 block">error</span>
        <p className="text-slate-600 font-medium">{error}</p>
      </div>
    </div>
  )

  // Detail View — showing feedback entries for a selected case
  if (selectedCase) {
    return (
      <div className="p-4 md:p-8 bg-admin-bg min-h-full">
        {/* Breadcrumb header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setSelectedCase(null)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-admin-card border border-admin-border text-admin-text-muted hover:text-admin-primary shadow-sm transition-colors"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
          </button>
          <div>
            <h2 className="text-xl font-bold text-admin-text">{selectedCase.caseTitle}</h2>
            <p className="text-admin-text-muted text-sm">{selectedCase.feedbackCount} feedback {selectedCase.feedbackCount === 1 ? 'entry' : 'entries'}</p>
          </div>
        </div>

        {/* Feedback entries */}
        <div className="space-y-4">
          {selectedCase.entries.map((entry) => (
            <div
              key={entry.id}
              className="bg-admin-card rounded-2xl border border-admin-border shadow-admin-card p-6"
            >
              {/* User Header row */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-11 h-11 rounded-full bg-admin-primary/10 border border-admin-primary/20 overflow-hidden flex items-center justify-center text-admin-primary shrink-0 font-bold">
                  {entry.userProfileImage ? (
                    <img className="w-full h-full object-cover" src={entry.userProfileImage} alt="" />
                  ) : (
                    entry.userName?.charAt(0).toUpperCase() || entry.userEmail?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-admin-text">{entry.userName || entry.userEmail?.split('@')[0]}</p>
                  <p className="text-xs text-admin-text-muted truncate">{entry.userEmail}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-admin-text-muted">
                    {entry.completedAt ? new Date(entry.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '–'}
                  </p>
                  <p className="text-sm font-black text-admin-accent mt-0.5">{entry.score || 0} pts</p>
                </div>
              </div>

              {/* Feedback text */}
              <div className="bg-admin-bg rounded-xl border border-admin-border p-4">
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{entry.feedback}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // List View — cases that have feedback
  return (
    <div className="p-4 md:p-8 bg-admin-bg min-h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-admin-text">Users Feedback</h2>
          <p className="text-admin-text-muted text-sm mt-1">
            {cases.length} {cases.length === 1 ? 'case' : 'cases'} with feedback
          </p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-admin-primary-soft text-admin-primary flex items-center justify-center border border-admin-primary/10">
          <span className="material-symbols-outlined">rate_review</span>
        </div>
      </div>

      {cases.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <span className="material-symbols-outlined text-5xl text-slate-200 mb-4">chat_bubble</span>
          <p className="text-slate-400 font-medium text-lg">No feedback submitted yet</p>
          <p className="text-slate-300 text-sm mt-1">Feedback will appear here once users complete cases.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {cases.map((c) => (
            <button
              key={c.caseId}
              onClick={() => setSelectedCase(c)}
              className="w-full text-left bg-admin-card rounded-2xl border border-admin-border shadow-admin-card hover:shadow-admin-card-hover hover:border-admin-primary/30 transition-all p-5 flex items-center gap-4 group"
            >
              {/* Case icon */}
              <div className="w-12 h-12 rounded-xl bg-admin-primary-soft text-admin-primary flex items-center justify-center shrink-0 border border-admin-primary/5 group-hover:bg-admin-primary group-hover:text-white transition-colors">
                <span className="material-symbols-outlined">clinical_notes</span>
              </div>

              {/* Case info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-admin-text truncate group-hover:text-admin-primary transition-colors">
                  {c.caseTitle}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getDifficultyColor(c.caseDifficulty)}`}>
                    {c.caseDifficulty || 'General'}
                  </span>
                </div>
              </div>

              {/* Feedback count badge */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1.5 bg-admin-primary/10 text-admin-primary px-3 py-1.5 rounded-full">
                  <span className="material-symbols-outlined text-sm">chat</span>
                  <span className="text-xs font-black">{c.feedbackCount}</span>
                </div>
                <span className="material-symbols-outlined text-slate-300 text-lg group-hover:text-admin-primary transition-colors">chevron_right</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
