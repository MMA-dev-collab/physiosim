import React, { useEffect, useState } from 'react'
import { API_BASE_URL } from '../config'
import Loader from '@/components/ui/loader-12'

export default function LeaderboardPage({ auth }) {
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentUserRank, setCurrentUserRank] = useState(null)

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/leaderboard`, {
      headers: {
        Authorization: `Bearer ${auth.token}`,
        'ngrok-skip-browser-warning': 'true'
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setLeaderboard(data)
        const userRank = data.find((entry) => entry.userId === auth.user.id)
        setCurrentUserRank(userRank)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [auth])

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', width: '100%' }}>
      <Loader />
    </div>
  )

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-eyebrow">Leaderboard</div>
        <h1 className="page-title">Top Performers</h1>
        <p className="page-subtitle">
          See how you rank against other students based on cases completed and scores.
        </p>
      </div>

      {currentUserRank && (
        <div className="card" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', borderColor: '#3b82f6' }}>
          <div className="section-title">Your Rank</div>
          <div className="stat-row">
            <div className="stat">
              <div className="stat-label">Position</div>
              <div className="stat-value" style={{ fontSize: '2rem' }}>{getRankIcon(currentUserRank.rank)}</div>
            </div>
            <div className="stat">
              <div className="stat-label">Cases Completed</div>
              <div className="stat-value">{currentUserRank.casesCompleted}</div>
            </div>
            <div className="stat">
              <div className="stat-label">Total Score</div>
              <div className="stat-value">{currentUserRank.totalScore}</div>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="section-title">Top 100 Students</div>
        <div className="leaderboard-table">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ textAlign: 'left', padding: '0.75rem' }}>Rank</th>
                <th style={{ textAlign: 'left', padding: '0.75rem' }}>Email</th>
                <th style={{ textAlign: 'right', padding: '0.75rem' }}>Cases</th>
                <th style={{ textAlign: 'right', padding: '0.75rem' }}>Score</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry) => (
                <tr
                  key={entry.userId}
                  style={{
                    borderBottom: '1px solid #e5e7eb',
                    background: entry.userId === auth.user.id ? '#eff6ff' : 'transparent',
                  }}
                >
                  <td style={{ padding: '0.75rem', fontWeight: entry.rank <= 3 ? 700 : 500 }}>
                    {getRankIcon(entry.rank)}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    {entry.email}
                    {entry.userId === auth.user.id && (
                      <span className="badge" style={{ marginLeft: '0.5rem' }}>You</span>
                    )}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>{entry.casesCompleted}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600 }}>{entry.totalScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}



