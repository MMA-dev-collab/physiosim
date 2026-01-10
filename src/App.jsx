import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import './App.css'
import HomePage from './pages/HomePage'
import MembershipPage from './pages/MembershipPage'
import AboutPage from './pages/AboutPage'
import CasesPage from './pages/CasesPage'
import CaseRunnerPage from './pages/CaseRunnerPage'
import AdminDashboard from './pages/AdminDashboard'
import CaseEditorPage from './pages/CaseEditorPage'
import ProfilePage from './pages/ProfilePage'
import LeaderboardPage from './pages/LeaderboardPage'

import { API_BASE_URL } from './config'

function App() {
  const [auth, setAuth] = useState(() => {
    const stored = localStorage.getItem('auth')
    return stored ? JSON.parse(stored) : null
  })
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    if (auth) localStorage.setItem('auth', JSON.stringify(auth))
    else localStorage.removeItem('auth')
  }, [auth])

  const logout = () => setAuth(null)

  const isAdmin = auth?.user?.role === 'admin'
  console.log(API_BASE_URL + '/api/categories')
  return (
    <Router>

      <div className="app-shell">
        <header className="app-header">
          <div className="logo">PhysioCaseLab</div>
          <nav className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/membership">Membership</Link>
            <Link to="/about">About</Link>
            {auth && <Link to="/cases">Cases</Link>}
            {auth && <Link to="/leaderboard">Leaderboard</Link>}
            {isAdmin && <Link to="/admin">Admin</Link>}
          </nav>
          <div className="auth-area">
            {auth ? (
              <div className="user-nav">
                <div className="profile-dropdown-container">
                  <button className="profile-trigger" onClick={() => setShowDropdown(!showDropdown)}>
                    <div className="profile-avatar-mini">
                      {auth.user.profileImage ? (
                        <img src={auth.user.profileImage} alt="Profile" />
                      ) : (
                        <div className="avatar-placeholder-mini">{auth.user.email[0].toUpperCase()}</div>
                      )}
                    </div>
                    <span className="profile-name-mini">{auth.user.name || auth.user.email.split('@')[0]}</span>
                    <span className="dropdown-arrow">▼</span>
                  </button>

                  {showDropdown && (
                    <div className="profile-dropdown">
                      <div className="dropdown-header">
                        <p className="dropdown-user-name">{auth.user.name || 'User'}</p>
                        <p className="dropdown-user-email">{auth.user.email}</p>
                      </div>
                      <div className="dropdown-divider"></div>
                      <Link to="/profile" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                        My Profile
                      </Link>
                      <button className="dropdown-item logout-btn" onClick={() => { logout(); setShowDropdown(false); }}>
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <AuthControls setAuth={setAuth} />
            )}
          </div>
        </header>
        <main className="app-main">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/membership" element={<MembershipPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route
              path="/cases"
              element={auth ? <CasesPage auth={auth} /> : <Navigate to="/" />}
            />
            <Route
              path="/cases/:id"
              element={auth ? <CaseRunnerPage auth={auth} /> : <Navigate to="/" />}
            />
            <Route
              path="/admin"
              element={isAdmin ? <AdminDashboard auth={auth} /> : <Navigate to="/" />}
            />
            <Route
              path="/admin/cases/new"
              element={isAdmin ? <CaseEditorPage auth={auth} /> : <Navigate to="/" />}
            />
            <Route
              path="/admin/cases/:id/edit"
              element={isAdmin ? <CaseEditorPage auth={auth} /> : <Navigate to="/" />}
            />
            <Route
              path="/profile"
              element={auth ? <ProfilePage auth={auth} setAuth={setAuth} /> : <Navigate to="/" />}
            />
            <Route
              path="/leaderboard"
              element={auth ? <LeaderboardPage auth={auth} /> : <Navigate to="/" />}
            />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

function AuthControls({ setAuth }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/` + (mode === 'login' ? 'login' : 'register'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || 'Authentication failed')
      }
      const data = await res.json()
      setAuth(data)
      setEmail('')
      setPassword('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-controls">
      <form onSubmit={handleSubmit} className="auth-form">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <div className="error-text">{error}</div>}
        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? '...' : mode === 'login' ? 'Login' : 'Register'}
        </button>
      </form>
      <button
        className="link-button"
        type="button"
        onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
      >
        {mode === 'login' ? 'Create account' : 'Have an account? Login'}
      </button>
    </div>
  )
}

export default App
