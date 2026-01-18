import React, { useEffect, useState } from 'react'
import CasesTab from '../components/admin/CasesTab'
import UsersTab from '../components/admin/UsersTab'
import CategoriesTab from '../components/admin/CategoriesTab'
import AdminDevices from './AdminDevices'
import SubscriptionsTab from '../components/admin/SubscriptionsTab'
import CaseAccessTab from '../components/admin/CaseAccessTab'
import SubscriptionPlansTab from '../components/admin/SubscriptionPlansTab'
import { API_BASE_URL } from '../config'
import './AdminDashboard.css'

function AdminDashboard({ auth }) {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="admin-dashboard-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="logo-icon">H</div>
          <div className="logo-text">Healthink.</div>
        </div>
        <nav className="admin-sidebar-nav">
          <button
            className={`admin-sidebar-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <span>📊</span> Dashboard
          </button>
          <button
            className={`admin-sidebar-item ${activeTab === 'cases' ? 'active' : ''}`}
            onClick={() => setActiveTab('cases')}
          >
            <span>📋</span> Cases
          </button>
          <button
            className={`admin-sidebar-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <span>👥</span> Users
          </button>
          <button
            className={`admin-sidebar-item ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            <span>🏷️</span> Categories
          </button>
          <button
            className={`admin-sidebar-item ${activeTab === 'subscriptions' ? 'active' : ''}`}
            onClick={() => setActiveTab('subscriptions')}
          >
            <span>💳</span> Subscriptions
          </button>
          <button
            className={`admin-sidebar-item ${activeTab === 'case-access' ? 'active' : ''}`}
            onClick={() => setActiveTab('case-access')}
          >
            <span>🔐</span> Case Access
          </button>
          <button
            className={`admin-sidebar-item ${activeTab === 'plans' ? 'active' : ''}`}
            onClick={() => setActiveTab('plans')}
          >
            <span>📦</span> Plans
          </button>
          <button
            className={`admin-sidebar-item ${activeTab === 'devices' ? 'active' : ''}`}
            onClick={() => setActiveTab('devices')}
          >
            <span>🔒</span> Device Locks
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="admin-main-content">
        {/* Top Bar */}
        <header className="top-bar">
          <div className="search-bar">
            <span>🔍</span>
            <input type="text" placeholder="Search..." />
          </div>
          <div className="user-profile">
            <button className="notification-btn">🔔</button>
            <div className="profile-info">
              <img src="https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff" alt="Admin" className="avatar" />
              <div className="profile-text">
                <span className="profile-name">Admin User</span>
                <span className="profile-role">Administrator</span>
              </div>
              <span>⌄</span>
            </div>
          </div>
        </header>

        {/* Tab Content */}
        <div className="tab-content-container">
          {activeTab === 'overview' && <OverviewTab auth={auth} />}
          {activeTab === 'cases' && <CasesTab auth={auth} />}
          {activeTab === 'users' && <UsersTab auth={auth} />}
          {activeTab === 'categories' && <CategoriesTab auth={auth} />}
          {activeTab === 'subscriptions' && <SubscriptionsTab auth={auth} />}
          {activeTab === 'case-access' && <CaseAccessTab auth={auth} />}
          {activeTab === 'plans' && <SubscriptionPlansTab auth={auth} />}
          {activeTab === 'devices' && <AdminDevices auth={auth} />}
        </div>
      </main>
    </div>
  )
}

function OverviewTab({ auth }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/admin/overview`, {
      headers: {
        Authorization: `Bearer ${auth.token}`,
        'ngrok-skip-browser-warning': 'true'
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setStats(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [auth])

  if (loading) return <div>Loading dashboard...</div>
  if (!stats) return <div>Error loading stats</div>

  return (
    <div className="overview-container">
      {/* Header Greeting */}
      <div className="dashboard-header">
        <div className="greeting">
          <h1>Good Morning, Admin</h1>
          <p>Here is what's happening with your platform today.</p>
        </div>
        <div className="date-filters">
          <div className="filter-pill">📅 {new Date().toLocaleDateString()}</div>
          <div className="filter-pill active">Weekly</div>
          <button className="notification-btn" style={{ background: 'var(--primary-color)', color: 'white' }}>→</button>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="dashboard-grid">
        {/* Left Column: Hero / Platform Health */}


        {/* Right Column: Widgets */}
        <div className="widgets-column">
          {/* Stats Row */}
          <div className="stats-row">
            <div className="stat-widget">
              <div className="stat-header">
                <span className="stat-label">Total Users</span>
                <button style={{ border: 'none', background: 'transparent' }}>⋮</button>
              </div>
              <div className="stat-value">{stats.totalUsers}</div>
              <div className="stat-trend trend-up">
                <span>↗</span> 12% from last week
              </div>
            </div>
            <div className="stat-widget">
              <div className="stat-header">
                <span className="stat-label">Total Cases</span>
                <button style={{ border: 'none', background: 'transparent' }}>⋮</button>
              </div>
              <div className="stat-value">{stats.totalCases}</div>
              <div className="stat-trend trend-up">
                <span>↗</span> 5 new today
              </div>
            </div>
            <div className="stat-widget">
              <div className="stat-header">
                <span className="stat-label">Completions</span>
                <button style={{ border: 'none', background: 'transparent' }}>⋮</button>
              </div>
              <div className="stat-value">{stats.totalCompletions}</div>
              <div className="stat-trend trend-up">
                <span>↗</span> High engagement
              </div>
            </div>
          </div>

          {/* Activity List */}
          <div className="secondary-widgets">
            <div className="widget-card" style={{ gridColumn: '1 / -1' }}>
              <div className="widget-header">
                <div className="widget-title">
                  <span>💊</span> Recent Activity
                </div>
                <button style={{ border: 'none', background: 'transparent' }}>⋮</button>
              </div>
              <div className="activity-list">
                {stats.recentActivity && stats.recentActivity.length > 0 ? (
                  stats.recentActivity.map((activity, index) => (
                    <div className="list-item" key={index}>
                      <div className="item-icon">
                        {activity.type === 'user_joined' ? '👤' : '📋'}
                      </div>
                      <div className="item-content">
                        <div className="item-title">
                          {activity.type === 'user_joined' ? 'New User Joined' : 'New Case Created'}
                        </div>
                        <div className="item-subtitle">
                          {activity.title} • {new Date(activity.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ color: 'var(--secondary-color)', textAlign: 'center', padding: '1rem' }}>
                    No recent activity
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
