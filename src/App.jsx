import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
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
import VerifyEmailPage from './pages/VerifyEmailPage'
import PerformanceDashboard from './pages/PerformanceDashboard'
import ComponentShowcase from './pages/ComponentShowcase'

import { API_BASE_URL } from './config'

import { ToastProvider } from './context/ToastContext'
import './App.css'

function Navbar({ auth, logout, menuOpen, toggleMenu, closeMenu, isAdmin, showDropdown, setShowDropdown }) {
  const location = useLocation()
  if (location.pathname.startsWith('/admin')) return null

  return (
    <header className={`app-header ${menuOpen ? 'menu-open' : ''}`}>
      <div className="logo">
        <img src="https://res.cloudinary.com/dhicz31vg/image/upload/v1770665363/WhatsApp_Image_2026-02-07_at_12.41.01_AM-removebg-preview_cwfaaa.png" alt="PhysioSim" />
      </div>

      <button className="mobile-menu-toggle" onClick={toggleMenu} aria-label="Toggle Navigation">
        <span className={`hamburger ${menuOpen ? 'active' : ''}`}></span>
      </button>

      <nav className={`nav-links ${menuOpen ? 'active' : ''}`}>
        <Link to="/" onClick={closeMenu}>Home</Link>
        <Link to="/membership" onClick={closeMenu}>Membership</Link>
        <Link to="/about" onClick={closeMenu}>About</Link>
        <Link to="/cases" onClick={closeMenu}>Cases</Link>
        {auth && <Link to="/performance" onClick={closeMenu}>My Progress</Link>}
        {auth && <Link to="/leaderboard" onClick={closeMenu}>Leaderboard</Link>}
        {isAdmin && <Link to="/admin" onClick={closeMenu}>Admin</Link>}
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
  )
}

function App() {
  const [auth, setAuth] = useState(() => {
    const stored = localStorage.getItem('auth')
    return stored ? JSON.parse(stored) : null
  })
  const [showDropdown, setShowDropdown] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (auth) localStorage.setItem('auth', JSON.stringify(auth))
    else localStorage.removeItem('auth')
  }, [auth])

  const logout = () => setAuth(null)
  const toggleMenu = () => setMenuOpen(!menuOpen)
  const closeMenu = () => setMenuOpen(false)

  const isAdmin = auth?.user?.role === 'admin'
  return (
    <ToastProvider>
      <Router>
        <div className="app-shell">
          <Navbar
            auth={auth}
            logout={logout}
            menuOpen={menuOpen}
            toggleMenu={toggleMenu}
            closeMenu={closeMenu}
            isAdmin={isAdmin}
            showDropdown={showDropdown}
            setShowDropdown={setShowDropdown}
          />
          <main className="app-main">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/membership" element={<MembershipPage auth={auth} />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/login" element={auth ? <Navigate to="/" /> : <LoginPage setAuth={setAuth} />} />
              <Route path="/register" element={auth ? <Navigate to="/" /> : <RegisterPage setAuth={setAuth} />} />
              <Route path="/verify-email" element={<VerifyEmailPage setAuth={setAuth} />} />
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
              <Route
                path="/performance"
                element={auth ? <PerformanceDashboard auth={auth} /> : <Navigate to="/login" />}
              />
              <Route path="/showcase" element={<ComponentShowcase />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ToastProvider>
  )
}



export default App
