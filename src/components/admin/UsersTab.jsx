import React, { useEffect, useState } from 'react'
import { API_BASE_URL } from '../../config'
import './CasesTab.css' // Reuse table styles

export default function UsersTab({ auth }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const loadUsers = () => {
    fetch(`${API_BASE_URL}/api/admin/users`, {
      headers: {
        Authorization: `Bearer ${auth.token}`,
        'ngrok-skip-browser-warning': 'true'
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setUsers(data)
        setLoading(false)
      })
      .catch((e) => {
        console.error(e)
        setLoading(false)
      })
  }

  useEffect(() => {
    loadUsers()
  }, [auth])

  if (loading) return <div>Loading users...</div>

  return (
    <div className="admin-users">
      <div className="section-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>User Management</h2>
        <button
          onClick={() => { setLoading(true); loadUsers(); }}
          style={{ padding: '0.5rem 1rem', background: 'var(--primary-color, #2563eb)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Refresh
        </button>
      </div>

      <div className="cases-table-container">
        <table className="cases-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Membership</th>
              <th>Progress</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <div style={{ fontWeight: '500' }}>{user.email}</div>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>ID: {user.id}</div>
                </td>
                <td>
                  <span className="badge" style={{ background: '#f3f4f6' }}>{user.role}</span>
                </td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span
                      className="badge"
                      style={{
                        background: (user.planRole === 'premium' || user.membershipType === 'Premium') ? '#eff6ff' :
                          (user.planRole === 'ultra' || user.membershipType === 'Ultra') ? '#fef3c7' : '#f3f4f6',
                        color: (user.planRole === 'premium' || user.membershipType === 'Premium') ? '#2563eb' :
                          (user.planRole === 'ultra' || user.membershipType === 'Ultra') ? '#d97706' : '#6b7280',
                        fontWeight: '500'
                      }}
                    >
                      {user.membershipType || 'Normal'}
                    </span>
                    <small style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      {user.membershipType && user.membershipType !== 'Normal' && user.membershipType !== 'Free' ?
                        'Via active subscription' :
                        'Default Access'}
                    </small>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span style={{ fontSize: '0.85rem' }}>✅ {user.stats?.casesCompleted || 0} Cases</span>
                    <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>⭐ {user.stats?.totalScore || 0} Points</span>
                  </div>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
