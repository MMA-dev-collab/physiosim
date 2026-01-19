import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { API_BASE_URL } from '../config'
import './ProfilePage.css'
import { useToast } from '../context/ToastContext'

export default function ProfilePage({ auth, setAuth }) {
  const { toast } = useToast()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(auth.user.name || '')
  const [profileImage, setProfileImage] = useState(auth.user.profileImage || '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/profile/stats`, {
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

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImage(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ name, profileImage }),
      })
      if (!res.ok) throw new Error('Failed to update profile')

      // Update local auth state
      const updatedAuth = {
        ...auth,
        user: {
          ...auth.user,
          name,
          profileImage
        }
      }
      setAuth(updatedAuth)
      toast.success('Profile updated successfully')
      setEditing(false)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="page">Loading...</div>
  if (!stats) return <div className="page">Error loading profile</div>

  const membershipExpired = stats.membershipExpiresAt && new Date(stats.membershipExpiresAt) < new Date()

  return (
    <div className="page profile-page">
      <div className="page-header">
        <div className="page-eyebrow">Profile</div>
        <h1 className="page-title">Your Profile</h1>
        <p className="page-subtitle">
          Manage your account information and view your progress.
        </p>
      </div>

      <div className="profile-container">
        <div className="profile-main">
          <div className="card profile-info-card">
            <div className="profile-header-flex">
              <div className="profile-image-section">
                <div className="profile-avatar-large">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" />
                  ) : (
                    <div className="avatar-placeholder">{auth.user.email[0].toUpperCase()}</div>
                  )}
                  {editing && (
                    <label className="image-upload-overlay">
                      <input type="file" accept="image/*" onChange={handleImageUpload} hidden />
                      <span>Change</span>
                    </label>
                  )}
                </div>
              </div>
              <div className="profile-details-section">
                {editing ? (
                  <div className="edit-form">
                    <div className="form-group">
                      <label>Full Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your Name"
                      />
                    </div>
                    <div className="form-group">
                      <label>Email Address</label>
                      <input type="text" value={auth.user.email} disabled />
                    </div>
                    <div className="edit-actions">
                      <button className="btn-primary" onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button className="btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="display-info">
                    <h2 className="user-name">{auth.user.name || 'Set your name'}</h2>
                    <p className="user-email">{auth.user.email}</p>
                    <button className="btn-secondary btn-small" onClick={() => setEditing(true)}>
                      Edit Profile
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid-2" style={{ marginTop: '1.5rem' }}>
            <div className="card">
              <div className="section-title">Membership</div>
              <div style={{ marginTop: '1rem' }}>
                <div className="stat-row">
                  <div className="stat">
                    <div className="stat-label">Current Plan</div>
                    <div className="stat-value">
                      <span className={`badge ${stats.membershipType === 'premium' ? 'badge-completed' : ''}`}>
                        {stats.membershipType === 'premium' ? 'Premium' : 'Free'}
                      </span>
                    </div>
                  </div>
                  {stats.membershipExpiresAt && (
                    <div className="stat">
                      <div className="stat-label">Expires</div>
                      <div className="stat-value" style={{ color: membershipExpired ? '#ef4444' : '#111827' }}>
                        {new Date(stats.membershipExpiresAt).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                </div>
                {stats.membershipType !== 'premium' && (
                  <Link to="/membership" style={{ display: 'inline-block', marginTop: '1rem' }}>
                    <button className="btn-primary">Upgrade to Premium</button>
                  </Link>
                )}
              </div>
            </div>

            <div className="card">
              <div className="section-title">Statistics</div>
              <div className="stat-row" style={{ marginTop: '1rem' }}>
                <div className="stat">
                  <div className="stat-label">Cases Completed</div>
                  <div className="stat-value">{stats.casesCompleted}</div>
                </div>
                <div className="stat">
                  <div className="stat-label">Total Score</div>
                  <div className="stat-value">{stats.totalScore}</div>
                </div>
                <div className="stat">
                  <div className="stat-label">Rank</div>
                  <div className="stat-value">#{stats.rank}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{ marginTop: '1.5rem' }}>
            <div className="section-title">Completed Cases</div>
            <div className="completed-cases-list">
              {stats.completedCases && stats.completedCases.length > 0 ? (
                stats.completedCases.map((c) => (
                  <div key={c.caseId} className="completed-case-item">
                    <div className="case-info">
                      <div className="case-title-small">{c.title}</div>
                      <div className="case-date-small">
                        Completed on {new Date(c.completedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="case-score-badge">
                      Score: {c.score}
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-cases-text">No cases completed yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div className="section-title">Quick Actions</div>
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          <Link to="/cases">
            <button className="btn-primary">View Cases</button>
          </Link>
          <Link to="/leaderboard">
            <button className="btn-secondary">View Leaderboard</button>
          </Link>
          {stats.membershipType !== 'premium' && (
            <Link to="/membership">
              <button className="btn-secondary">Upgrade Membership</button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
