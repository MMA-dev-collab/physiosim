import React, { useEffect, useState } from 'react'
import { API_BASE_URL } from '../../config'

export default function UsersTab({ auth }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')
  const [selectedUser, setSelectedUser] = useState(null)

  const loadUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
          'ngrok-skip-browser-warning': 'true'
        },
      })
      const data = await res.json()
      if (res.ok) setUsers(data)
      else setError('Failed to load users')
    } catch (e) {
      setError('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const filteredUsers = users.filter(u => {
    if (filter === 'all') return true
    if (filter === 'admin') return u.role === 'admin'
    if (filter === 'instructor') return u.role === 'instructor'
    if (filter === 'student') return u.role === 'student' || u.role === 'user'
    return true
  })

  // Close drawer on escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setSelectedUser(null)
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [])

  const getRoleBadge = (role) => {
    const styles = {
      admin: 'bg-slate-100 text-slate-800',
      instructor: 'bg-[var(--color-badge-bg-intermediate)] text-[var(--color-badge-intermediate)]',
      student: 'bg-[var(--color-badge-bg-beginner)] text-[var(--color-badge-beginner)]',
      user: 'bg-[var(--color-badge-bg-beginner)] text-[var(--color-badge-beginner)]',
    }
    return styles[role] || styles.user
  }

  const getMemberBadge = (type) => {
    if (type === 'premium' || type === 'Premium') return { dot: 'bg-admin-accent', label: 'Premium', ribbon: 'bg-admin-accent/10 text-admin-accent' }
    if (type === 'ultra' || type === 'Ultra') return { dot: 'bg-amber-500', label: 'Ultra', ribbon: 'bg-amber-100 text-amber-600' }
    if (type === 'institutional' || type === 'Institutional Access') return { dot: 'bg-indigo-500', label: type, ribbon: 'bg-indigo-100 text-indigo-600' }
    return { dot: 'bg-slate-400', label: type || 'Free', ribbon: 'bg-slate-100 text-slate-600' }
  }

  if (loading) return (
    <div className="p-4 md:p-8 animate-pulse space-y-4">
      <div className="flex justify-between items-center">
        <div className="h-8 w-48 bg-slate-200 rounded-lg" />
        <div className="flex gap-1 hidden sm:flex">
          {[1, 2, 3].map(i => <div key={i} className="h-8 w-20 bg-slate-200 rounded-md" />)}
        </div>
      </div>
      <div className="bg-white rounded-xl border border-slate-200">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="flex items-center gap-4 py-5 px-6 border-b border-slate-100">
            <div className="w-10 h-10 bg-slate-200 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-slate-200 rounded" />
              <div className="h-3 w-44 bg-slate-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  if (error) return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <span className="material-symbols-outlined text-5xl text-red-300 mb-4 block">error</span>
        <p className="text-slate-600 font-medium">{error}</p>
        <button onClick={loadUsers} className="mt-4 px-4 py-2 bg-admin-primary text-white text-sm font-bold rounded-lg hover:bg-admin-primary/90">
          Retry
        </button>
      </div>
    </div>
  )

  return (
    <div className="p-4 md:p-8 relative bg-admin-bg min-h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-admin-text">User Management</h2>
          <p className="text-admin-text-muted text-sm mt-1">Managing {users.length} simulation users</p>
        </div>
        <div className="flex gap-2">
          <div className="flex overflow-x-auto p-1 bg-admin-bg border border-admin-border rounded-lg shadow-admin-card whitespace-nowrap hide-scrollbar">
            {[
              { id: 'all', label: 'All Users' },
              { id: 'admin', label: 'Admins' },
              { id: 'student', label: 'Students' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex-shrink-0 ${filter === f.id ? 'bg-admin-primary text-white shadow-sm' : 'text-admin-text-muted hover:text-admin-text hover:bg-admin-card'
                  }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <button onClick={loadUsers} className="p-2 hover:bg-admin-bg rounded-lg text-admin-text-muted shrink-0 border border-admin-border shadow-sm">
            <span className="material-symbols-outlined text-lg">refresh</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-admin-card rounded-xl border border-admin-border overflow-x-auto shadow-admin-card">
        <table className="w-full text-left border-collapse min-w-[800px] whitespace-nowrap">
          <thead>
            <tr className="bg-admin-bg border-b border-admin-border">
              <th className="py-4 px-6 text-xs font-bold text-admin-text-muted uppercase tracking-wider">User</th>
              <th className="py-4 px-4 text-xs font-bold text-admin-text-muted uppercase tracking-wider">Role</th>
              <th className="py-4 px-4 text-xs font-bold text-admin-text-muted uppercase tracking-wider">Plan</th>
              <th className="py-4 px-4 text-xs font-bold text-admin-text-muted uppercase tracking-wider">Joined</th>
              <th className="py-4 px-4 text-xs font-bold text-admin-text-muted uppercase tracking-wider text-center">Cases</th>
              <th className="py-4 px-4 text-xs font-bold text-admin-text-muted uppercase tracking-wider text-center">Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-admin-border/50">
            {filteredUsers.map(u => {
              const member = getMemberBadge(u.membershipType)
              const isSelected = selectedUser?.id === u.id
              return (
                <tr
                  key={u.id}
                  onClick={() => setSelectedUser(u)}
                  className={`cursor-pointer transition-colors ${isSelected ? 'bg-admin-primary/5 hover:bg-admin-primary/10' : 'hover:bg-slate-50/50'}`}
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-admin-primary/10 border border-admin-primary/20 overflow-hidden flex items-center justify-center text-admin-primary shrink-0 font-bold">
                        {u.profileImage ? (
                          <img className="w-full h-full object-cover" src={u.profileImage} alt="" />
                        ) : (
                          u.name?.charAt(0).toUpperCase() || u.email?.charAt(0).toUpperCase() || 'U'
                        )}
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${isSelected ? 'text-admin-primary' : 'text-admin-text'}`}>{u.name || u.email?.split('@')[0]}</p>
                        <p className="text-xs text-admin-text-muted">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadge(u.role)}`}>
                      {u.role?.charAt(0).toUpperCase() + u.role?.slice(1)}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-admin-text-muted">
                    <span className="flex items-center gap-1.5 font-medium">
                      <span className={`w-2 h-2 rounded-full ${member.dot}`} />
                      {member.label}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-admin-text-muted">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
                  </td>
                  <td className="py-4 px-4 text-sm font-semibold text-center text-admin-text">
                    {u.completedCases || 0}
                  </td>
                  <td className="py-4 px-4 text-sm font-bold text-center text-admin-accent">
                    {u.totalPoints || 0}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filteredUsers.length === 0 && (
          <div className="py-12 text-center">
            <span className="material-symbols-outlined text-4xl text-slate-300 mb-2 block">person_off</span>
            <p className="text-slate-400 text-sm">No users found for this filter.</p>
          </div>
        )}
      </div>

      {/* Slide-over User Drawer */}
      {selectedUser && (
        <>
          {/* Backdrop for mobile */}
          <div
            className="fixed inset-0 bg-admin-overlay z-40 transition-opacity lg:hidden"
            onClick={() => setSelectedUser(null)}
          />

          <div style={{ zIndex: 1000 }} className="fixed inset-y-0 right-0 z-50 w-full max-w-[400px] bg-admin-card shadow-admin-modal border-l border-admin-border transform transition-transform duration-300 translate-x-0 flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-admin-border bg-admin-bg/50">
              <h3 className="text-lg font-bold text-admin-text">User Profile</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-admin-card border border-admin-border text-admin-text-muted hover:text-admin-text shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Profile Header */}
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-admin-primary/10 border-4 border-white shadow-md overflow-hidden flex items-center justify-center text-admin-primary font-bold text-4xl mb-4">
                  {selectedUser.profileImage ? (
                    <img className="w-full h-full object-cover" src={selectedUser.profileImage} alt="" />
                  ) : (
                    selectedUser.name?.charAt(0).toUpperCase() || selectedUser.email?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
                <h2 className="text-xl font-black text-admin-text">{selectedUser.name || 'Unnamed User'}</h2>
                <p className="text-sm text-admin-text-muted">{selectedUser.email}</p>
                <div className="flex items-center gap-2 mt-3 flex-wrap justify-center">
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getRoleBadge(selectedUser.role)}`}>
                    {selectedUser.role}
                  </span>
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getMemberBadge(selectedUser.membershipType).ribbon}`}>
                    {getMemberBadge(selectedUser.membershipType).label} Plan
                  </span>
                </div>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-admin-bg rounded-2xl p-4 text-center border border-admin-border shadow-sm">
                  <span className="material-symbols-outlined text-admin-primary text-2xl mb-1">prescriptions</span>
                  <p className="text-3xl font-black text-admin-text">{selectedUser.completedCases || 0}</p>
                  <p className="text-[11px] font-bold uppercase text-admin-text-muted tracking-wider">Cases Finished</p>
                </div>
                <div className="bg-admin-accent/5 rounded-2xl p-4 text-center border border-admin-accent/10 shadow-sm">
                  <span className="material-symbols-outlined text-admin-accent text-2xl mb-1">award_star</span>
                  <p className="text-3xl font-black text-admin-accent">{selectedUser.totalPoints || 0}</p>
                  <p className="text-[11px] font-bold uppercase text-admin-accent/70 tracking-wider">Total Points</p>
                </div>
              </div>

              {/* User Details */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-admin-text-muted uppercase tracking-widest px-1">Detailed Information</h4>
                <div className="bg-admin-bg rounded-xl border border-admin-border overflow-hidden divide-y divide-admin-border/50">
                  <div className="flex items-center justify-between p-4 bg-admin-card/30">
                    <span className="text-sm text-admin-text-muted font-medium">User ID</span>
                    <span className="text-sm font-mono text-admin-text font-medium">#{selectedUser.id}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-admin-card/30">
                    <span className="text-sm text-admin-text-muted font-medium">Joined Date</span>
                    <span className="text-sm text-admin-text font-medium">
                      {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-admin-card/30">
                    <span className="text-sm text-admin-text-muted font-medium">Phone</span>
                    <span className="text-sm text-admin-text font-medium">
                      {selectedUser.phone || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-admin-card/30">
                    <span className="text-sm text-admin-text-muted font-medium">Email Verified</span>
                    <span className={`text-sm font-bold ${selectedUser.email_verified ? 'text-admin-success' : 'text-admin-text-muted'}`}>
                      {selectedUser.email_verified ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                className="w-full py-3 bg-admin-primary-soft text-admin-primary hover:bg-admin-primary hover:text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
                onClick={() => {
                  window.location.href = `mailto:${selectedUser.email}`
                }}
              >
                <span className="material-symbols-outlined text-[18px]">mail</span>
                Contact User
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
