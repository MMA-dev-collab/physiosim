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
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

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
            <Link to="/cases">Cases</Link>
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
              <Link to="/login" className="btn-primary">Login</Link>
            )}
          </div>
        </header>
        <main className="app-main">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/membership" element={<MembershipPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/login" element={auth ? <Navigate to="/cases" /> : <LoginPage setAuth={setAuth} />} />
            <Route path="/register" element={auth ? <Navigate to="/cases" /> : <RegisterPage setAuth={setAuth} />} />
            <Route
              path="/cases"
              element={<CasesPage auth={auth} />}
            />
            <Route
              path="/cases/:id"
              element={auth ? <CaseRunnerPage auth={auth} /> : <Navigate to="/login" />}
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
              element={auth ? <ProfilePage auth={auth} setAuth={setAuth} /> : <Navigate to="/login" />}
            />
            <Route
              path="/leaderboard"
              element={auth ? <LeaderboardPage auth={auth} /> : <Navigate to="/login" />}
            />
          </Routes>
        </main>
      </div>
    </Router>
  )
}



export default App
