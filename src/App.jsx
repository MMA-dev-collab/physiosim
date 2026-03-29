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
import ComponentShowcase from './pages/ComponentShowcase'

import { API_BASE_URL } from './config'

import { ToastProvider } from './context/ToastContext'
import './App.css'

function Navbar({ auth, logout, menuOpen, toggleMenu, closeMenu, isAdmin, showDropdown, setShowDropdown }) {
  const location = useLocation()
  if (location.pathname.startsWith('/admin')) return null

  return (
    <header className={`sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md transition-all duration-300 ${menuOpen ? 'h-screen' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center" onClick={closeMenu}>
            <img 
              src="https://res.cloudinary.com/dhicz31vg/image/upload/v1770665363/WhatsApp_Image_2026-02-07_at_12.41.01_AM-removebg-preview_cwfaaa.png" 
              alt="PhysioSim Logo" 
              className="h-[6.5rem] w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link 
              to="/" 
              className={`text-sm font-semibold transition-colors ${location.pathname === '/' ? 'text-primary' : 'text-slate-600 hover:text-primary'}`}
            >
              Home
            </Link>
            <Link 
              to="/membership" 
              className={`text-sm font-semibold transition-colors ${location.pathname === '/membership' ? 'text-primary' : 'text-slate-600 hover:text-primary'}`}
            >
              Membership
            </Link>
            <Link 
              to="/cases" 
              className={`text-sm font-semibold transition-colors ${location.pathname === '/cases' ? 'text-primary' : 'text-slate-600 hover:text-primary'}`}
            >
              Cases
            </Link>
            <Link 
              to="/about" 
              className={`text-sm font-semibold transition-colors ${location.pathname === '/about' ? 'text-primary' : 'text-slate-600 hover:text-primary'}`}
            >
              About Us
            </Link>
            {auth && (
              <Link 
                to="/leaderboard" 
                className={`text-sm font-semibold transition-colors ${location.pathname === '/leaderboard' ? 'text-primary' : 'text-slate-600 hover:text-primary'}`}
              >
                Leaderboard
              </Link>
            )}
            {isAdmin && (
              <Link 
                to="/admin" 
                className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors"
              >
                Admin
              </Link>
            )}
          </nav>

          {/* Auth Area */}
          <div className="flex items-center gap-4">
            {auth ? (
              <div className="relative profile-dropdown-container">
                <button 
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition-colors"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm overflow-hidden">
                    {auth.user.profileImage ? (
                      <img src={auth.user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      auth.user.email[0].toUpperCase()
                    )}
                  </div>
                  <span className="hidden lg:block text-sm font-medium text-slate-700">{auth.user.name || auth.user.email.split('@')[0]}</span>
                  <span className={`text-[10px] text-slate-400 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}>▼</span>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-2 border-b border-slate-50">
                      <p className="text-sm font-bold text-slate-900 truncate">{auth.user.name || 'User'}</p>
                      <p className="text-xs text-slate-500 truncate">{auth.user.email}</p>
                    </div>
                    <Link to="/profile" className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors" onClick={() => setShowDropdown(false)}>
                      My Profile
                    </Link>
                    <button 
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      onClick={() => { logout(); setShowDropdown(false); }}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link 
                to="/login" 
                className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-primary-hover transition-all shadow-md shadow-primary/20 active:scale-95"
              >
                Login
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              onClick={toggleMenu}
            >
              <div className="w-6 h-5 relative flex flex-col justify-between">
                <span className={`w-full h-0.5 bg-current rounded-full transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                <span className={`w-full h-0.5 bg-current rounded-full transition-opacity duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
                <span className={`w-full h-0.5 bg-current rounded-full transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2.5' : ''}`} />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Backdrop */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 animate-in fade-in slide-in-from-top-4 duration-300 overflow-y-auto">
          <nav className="px-4 py-6 flex flex-col gap-4">
            <Link to="/" className="text-lg font-bold text-slate-900 py-2" onClick={closeMenu}>Home</Link>
            <Link to="/membership" className="text-lg font-bold text-slate-900 py-2" onClick={closeMenu}>Membership</Link>
            <Link to="/cases" className="text-lg font-bold text-slate-900 py-2" onClick={closeMenu}>Cases</Link>
            <Link to="/about" className="text-lg font-bold text-slate-900 py-2" onClick={closeMenu}>About Us</Link>
            {auth && <Link to="/leaderboard" className="text-lg font-bold text-slate-900 py-2" onClick={closeMenu}>Leaderboard</Link>}
            {isAdmin && <Link to="/admin" className="text-lg font-bold text-slate-900 py-2" onClick={closeMenu}>Admin</Link>}
          </nav>
        </div>
      )}
    </header>
  );
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
              <Route path="/showcase" element={<ComponentShowcase />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ToastProvider>
  )
}



export default App
