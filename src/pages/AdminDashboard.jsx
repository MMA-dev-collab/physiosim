import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import CasesTab from '../components/admin/CasesTab'
import UsersTab from '../components/admin/UsersTab'
import CategoriesTab from '../components/admin/CategoriesTab'
import SubscriptionsTab from '../components/admin/SubscriptionsTab'
import CaseAccessTab from '../components/admin/CaseAccessTab'
import SubscriptionPlansTab from '../components/admin/SubscriptionPlansTab'
import DashboardLayout from '../components/admin/DashboardLayout'
import HeaderBar from '../components/admin/HeaderBar'
import { API_BASE_URL } from '../config'

function AdminDashboard({ auth }) {
  const [activeTab, setActiveTab] = useState('overview')

  // Function to switch tabs, useful for "View in Library" buttons
  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
  }

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={handleTabChange} auth={auth}>
      <HeaderBar activeTab={activeTab} auth={auth} />
      <div className="flex-1">
        {activeTab === 'overview' && <OverviewTab auth={auth} onTabChange={handleTabChange} />}
        {activeTab === 'cases' && <CasesTab auth={auth} />}
        {activeTab === 'users' && <UsersTab auth={auth} />}
        {activeTab === 'categories' && <CategoriesTab auth={auth} />}
        {activeTab === 'subscriptions' && <SubscriptionsTab auth={auth} />}
        {activeTab === 'case-access' && <CaseAccessTab auth={auth} />}
        {activeTab === 'plans' && <SubscriptionPlansTab auth={auth} />}
      </div>
    </DashboardLayout>
  )
}

function OverviewTab({ auth, onTabChange }) {
  const [stats, setStats] = useState(null)
  const [recentCases, setRecentCases] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, casesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/admin/overview`, {
            headers: { Authorization: `Bearer ${auth.token}`, 'ngrok-skip-browser-warning': 'true' }
          }),
          fetch(`${API_BASE_URL}/api/admin/cases`, {
            headers: { Authorization: `Bearer ${auth.token}`, 'ngrok-skip-browser-warning': 'true' }
          })
        ])

        if (statsRes.ok) setStats(await statsRes.json())

        if (casesRes.ok) {
          const allCases = await casesRes.json()
          // Sort by ID descending to get newest cases (assuming higher ID = newer)
          const sortedCases = allCases.sort((a, b) => b.id - a.id).slice(0, 5)
          setRecentCases(sortedCases)
        }
      } catch (err) {
        console.error("Failed to load dashboard data", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [auth])

  const handleDeleteCaseLocal = async (id) => {
    if (!window.confirm('Delete this case?')) return
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/cases/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${auth.token}`, 'ngrok-skip-browser-warning': 'true' }
      })
      if (res.ok) {
        setRecentCases(prev => prev.filter(c => c.id !== id))
        if (stats) setStats(prev => ({ ...prev, totalCases: prev.totalCases - 1 }))
      }
    } catch (e) {
      console.error(e)
      alert("Failed to delete case")
    }
  }

  const getDifficultyBadge = (difficulty) => {
    const styles = {
      Beginner: 'bg-[var(--color-badge-bg-beginner)] text-[var(--color-badge-beginner)] border-[var(--color-badge-beginner)]/20',
      Intermediate: 'bg-[var(--color-badge-bg-intermediate)] text-[var(--color-badge-intermediate)] border-[var(--color-badge-intermediate)]/20',
      Advanced: 'bg-[var(--color-badge-bg-advanced)] text-[var(--color-badge-advanced)] border-[var(--color-badge-advanced)]/20',
    }
    const style = styles[difficulty] || 'bg-admin-bg text-admin-text-muted border-admin-border'
    return <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${style}`}>{difficulty}</span>
  }

  if (loading) return (
    <div className="p-4 md:p-8 space-y-6 animate-pulse">
      {/* Skeleton: Welcome Banner */}
      <div className="h-28 bg-slate-200 rounded-2xl" />
      {/* Skeleton: Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 bg-slate-200 rounded-2xl" />
        ))}
      </div>
      {/* Skeleton: Activity & Cases */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64 bg-slate-200 rounded-2xl" />
        <div className="h-64 bg-slate-200 rounded-2xl" />
      </div>
    </div>
  )

  if (!stats) return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <span className="material-symbols-outlined text-5xl text-slate-300 mb-4 block">error</span>
        <p className="text-slate-500 font-medium">Error loading dashboard stats</p>
        <p className="text-sm text-slate-400 mt-1">Please check your connection and try again.</p>
      </div>
    </div>
  )

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-admin-card p-6 md:p-8 rounded-2xl border border-admin-border shadow-admin-card">
        <div>
          <h3 className="text-xl md:text-2xl font-extrabold tracking-tight text-admin-text">
            Welcome back, {auth?.user?.name?.split(' ')[0] || 'Admin'}!
          </h3>
          <p className="text-admin-text-muted mt-1 text-sm md:text-base">Here's what's happening with your platform today.</p>
        </div>
        <div className="flex items-center gap-3 self-start md:self-auto">
          <span className="px-4 py-2 bg-admin-bg rounded-lg text-sm font-medium text-admin-text-muted border border-admin-border">
            📅 {new Date().toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Total Users */}
        <div className="bg-admin-card p-6 rounded-2xl border border-admin-border shadow-admin-card hover:shadow-admin-card-hover transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-admin-text-muted font-medium">Total Users</span>
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <span className="material-symbols-outlined">group</span>
            </div>
          </div>
          <p className="text-3xl font-black text-admin-text">{stats.totalUsers}</p>
          <div className="flex items-center gap-1 text-admin-success text-sm mt-2 font-bold uppercase tracking-wider text-[10px]">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            <span>Active platform users</span>
          </div>
        </div>

        {/* Total Cases */}
        <div className="bg-admin-card p-6 rounded-2xl border border-admin-border shadow-admin-card hover:shadow-admin-card-hover transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-admin-text-muted font-medium">Total Cases</span>
            <div className="w-10 h-10 rounded-lg bg-admin-primary-soft text-admin-primary flex items-center justify-center border border-admin-primary/10">
              <span className="material-symbols-outlined">clinical_notes</span>
            </div>
          </div>
          <p className="text-3xl font-black text-admin-text">{stats.totalCases}</p>
          <div className="flex items-center gap-1 text-admin-success text-sm mt-2 font-bold uppercase tracking-wider text-[10px]">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            <span>Simulation library</span>
          </div>
        </div>

        {/* Completions */}
        <div className="bg-admin-card p-6 rounded-2xl border border-admin-border shadow-admin-card hover:shadow-admin-card-hover transition-shadow sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <span className="text-admin-text-muted font-medium">Completions</span>
            <div className="w-10 h-10 rounded-lg bg-admin-primary-soft text-admin-primary flex items-center justify-center border border-admin-primary/10">
              <span className="material-symbols-outlined">fact_check</span>
            </div>
          </div>
          <p className="text-3xl font-black text-admin-text">{stats.totalCompletions}</p>
          <div className="flex items-center gap-1 text-admin-success text-sm mt-2 font-bold uppercase tracking-wider text-[10px]">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            <span>High engagement</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Current Simulation Cases */}
        <div className="bg-admin-card rounded-2xl border border-admin-border shadow-admin-card flex flex-col h-[500px] overflow-hidden">
          <div className="p-6 border-b border-admin-border flex items-center justify-between bg-admin-bg/50">
            <div>
              <h4 className="text-lg font-bold text-admin-text">Current Simulation Cases</h4>
              <p className="text-xs text-admin-text-muted mt-0.5">Recently added or modified cases.</p>
            </div>
            <button
              onClick={() => onTabChange('cases')}
              className="px-4 py-2 bg-admin-primary-soft text-admin-sidebar-active-text text-sm font-bold rounded-lg hover:bg-admin-primary hover:text-white transition-all shadow-sm flex items-center gap-2"
            >
              View Library <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
          <div className="flex-1">
            <ul className="divide-y divide-admin-border/50">
              {recentCases.map((c) => (
                <li key={c.id} className="p-4 hover:bg-admin-bg transition-colors flex items-center justify-between group gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-admin-primary-soft text-admin-primary flex items-center justify-center shrink-0 border border-admin-primary/5">
                      <span className="material-symbols-outlined text-[20px]">prescriptions</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-admin-text truncate pr-4">{c.title || 'Untitled Case'}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {getDifficultyBadge(c.difficulty)}
                        <span className="text-xs text-slate-500">{c.category || 'General'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions (visible on hover or always on small screens) */}
                  <div className="flex items-center gap-1 lg:opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <Link to={`/admin/cases/${c.id}`} className="p-2 text-admin-text-muted hover:text-admin-primary rounded-lg hover:bg-admin-primary-soft transition-colors tooltip" title="Edit Case">
                      <span className="material-symbols-outlined text-[18px]">edit_square</span>
                    </Link>
                    <button onClick={() => handleDeleteCaseLocal(c.id)} className="p-2 text-admin-text-muted hover:text-admin-danger rounded-lg hover:bg-admin-danger/10 transition-colors tooltip" title="Delete Case">
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </li>
              ))}
              {recentCases.length === 0 && (
                <li className="p-8 text-center text-slate-500">
                  No simulation cases found.
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-admin-card rounded-2xl border border-admin-border shadow-admin-card flex flex-col h-[500px] overflow-hidden">
          <div className="p-6 border-b border-admin-border bg-admin-bg/50">
            <h4 className="text-lg font-bold text-admin-text">Recent Activities</h4>
            <p className="text-xs text-admin-text-muted mt-0.5">Overview of platform events.</p>
          </div>
          <div className="p-6 flex-1">
            <div className="space-y-6">
              {stats.recentActivity && stats.recentActivity.length > 0 ? (
                stats.recentActivity.map((activity, index) => (
                  <div className="flex gap-4 relative" key={index}>
                    {/* Activity Line (skip for last item) */}
                    {index !== stats.recentActivity.length - 1 && (
                      <div className="absolute left-5 top-10 bottom-[-24px] w-[2px] bg-slate-100 -ml-[1px]"></div>
                    )}

                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 border-4 border-white ${activity.type === 'user_joined'
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-green-100 text-green-600'
                      }`}>
                      <span className="material-symbols-outlined text-[18px]">
                        {activity.type === 'user_joined' ? 'person_add' : 'publish'}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1">
                      <p className="text-sm font-semibold leading-tight text-slate-900">
                        {activity.type === 'user_joined' ? 'New User Registered' : 'New Case Uploaded'}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {activity.title}
                      </p>
                      <p className="text-[10px] uppercase font-bold text-slate-400 mt-2 truncate">
                        {new Date(activity.date).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                  <span className="material-symbols-outlined text-4xl text-slate-200 mb-2 block">inbox</span>
                  <p className="text-slate-400 text-sm font-medium">No recent activity</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
