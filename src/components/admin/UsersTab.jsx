import React, { useEffect, useState } from 'react'
import { API_BASE_URL } from '../../config'
import './CasesTab.css' // Reuse table styles

export default function UsersTab({ auth }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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
      .catch((e) => console.error(e))
  }, [auth])

  const handleMembershipUpdate = async (userId, type) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/membership`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ membershipType: type }),
      })
      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, membershipType: type } : u))
      }
    } catch (e) {
      alert('Failed to update membership')
    }
  }

  if (loading) return <div>Loading users...</div>

  return (
    <div className="admin-users">
      <div className="section-header" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0 }}>User Management</h2>
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
                  <select
                    value={user.membershipType}
                    onChange={(e) => handleMembershipUpdate(user.id, e.target.value)}
                    style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      border: '1px solid #e2e8f0',
                      background: user.membershipType === 'premium' ? '#eff6ff' : 'white',
                      color: user.membershipType === 'premium' ? '#2563eb' : 'inherit'
                    }}
                  >
                    <option value="free">Free</option>
                    <option value="premium">Premium</option>
                  </select>
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
