import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../config'
import Loader from '@/components/ui/loader-12'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts'
import './PerformanceDashboard.css'

const COLORS = {
    strong: '#10b981',
    neutral: '#f59e0b',
    weak: '#ef4444',
    primary: '#6366f1',
    secondary: '#8b5cf6'
}

const PIE_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4']

export default function PerformanceDashboard({ auth }) {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [data, setData] = useState(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/performance/analysis`, {
                    headers: {
                        Authorization: `Bearer ${auth.token}`,
                        'ngrok-skip-browser-warning': 'true'
                    }
                })
                if (!res.ok) throw new Error('Failed to load performance data')
                const result = await res.json()
                setData(result)
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [auth.token])

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <Loader />
        </div>
    )

    if (error) return (
        <div className="page">
            <div style={{ color: '#ef4444', fontWeight: 500 }}>{error}</div>
        </div>
    )

    const hasData = data && data.overallStats.totalAttempts > 0

    return (
        <div className="page performance-dashboard">
            <div className="page-header">
                <div className="page-eyebrow">Analytics</div>
                <h1 className="page-title">Performance Dashboard</h1>
                <p className="page-subtitle">
                    Track your learning progress and identify areas for improvement
                </p>
            </div>

            {!hasData ? (
                <div className="card empty-state">
                    <div className="empty-icon">📊</div>
                    <h3>No Data Yet</h3>
                    <p>Complete some cases to see your performance analytics!</p>
                    <button className="btn-primary" onClick={() => navigate('/cases')}>
                        Browse Cases
                    </button>
                </div>
            ) : (
                <>
                    {/* Overall Stats Cards */}
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon">📝</div>
                            <div className="stat-info">
                                <div className="stat-value">{data.overallStats.totalAttempts}</div>
                                <div className="stat-label">Total Attempts</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">✅</div>
                            <div className="stat-info">
                                <div className="stat-value">{data.overallStats.correctAttempts}</div>
                                <div className="stat-label">Correct Answers</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">🎯</div>
                            <div className="stat-info">
                                <div className="stat-value">{data.overallStats.accuracyRate}%</div>
                                <div className="stat-label">Accuracy Rate</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">⏱️</div>
                            <div className="stat-info">
                                <div className="stat-value">{data.overallStats.avgTimePerQuestion}s</div>
                                <div className="stat-label">Avg. Time/Question</div>
                            </div>
                        </div>
                    </div>

                    {/* Charts Row */}
                    <div className="charts-grid">
                        {/* Accuracy Over Time */}
                        {data.accuracyOverTime.length > 0 && (
                            <div className="card chart-card">
                                <h3>Accuracy Over Time</h3>
                                <ResponsiveContainer width="100%" height={250}>
                                    <LineChart data={data.accuracyOverTime}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis
                                            dataKey="date"
                                            tick={{ fontSize: 12 }}
                                            tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        />
                                        <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                                        <Tooltip
                                            formatter={(val) => [`${val}%`, 'Accuracy']}
                                            labelFormatter={(val) => new Date(val).toLocaleDateString()}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="accuracy"
                                            stroke={COLORS.primary}
                                            strokeWidth={2}
                                            dot={{ fill: COLORS.primary }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        )}

                        {/* Time Per Category */}
                        {data.byTag.length > 0 && (
                            <div className="card chart-card">
                                <h3>Time by Category</h3>
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={data.byTag}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis dataKey="tag" tick={{ fontSize: 12 }} />
                                        <YAxis tick={{ fontSize: 12 }} />
                                        <Tooltip formatter={(val) => [`${val}s`, 'Avg Time']} />
                                        <Bar dataKey="avgTimeSpent" fill={COLORS.secondary} radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="expectedTime" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}

                        {/* Error Rate Distribution */}
                        {data.byTag.length > 0 && (
                            <div className="card chart-card">
                                <h3>Attempts by Category</h3>
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie
                                            data={data.byTag}
                                            dataKey="totalAttempts"
                                            nameKey="tag"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            label={({ tag, percent }) => `${tag} (${(percent * 100).toFixed(0)}%)`}
                                        >
                                            {data.byTag.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>

                    {/* Confidence by Tag */}
                    <div className="card">
                        <h3>Performance by Category</h3>
                        <p className="section-description">Your strengths and areas for improvement</p>
                        <div className="confidence-grid">
                            {data.byTag.map((tag) => (
                                <div key={tag.tag} className={`confidence-card ${tag.confidence}`}>
                                    <div className="confidence-header">
                                        <span className="confidence-tag">{tag.tag}</span>
                                        <span className={`confidence-badge ${tag.confidence}`}>
                                            {tag.confidence === 'strong' && '💪 Strong'}
                                            {tag.confidence === 'neutral' && '📈 Improving'}
                                            {tag.confidence === 'weak' && '⚠️ Needs Work'}
                                        </span>
                                    </div>
                                    <div className="confidence-stats">
                                        <div className="confidence-stat">
                                            <span className="confidence-stat-value">{100 - tag.errorRate}%</span>
                                            <span className="confidence-stat-label">Accuracy</span>
                                        </div>
                                        <div className="confidence-stat">
                                            <span className="confidence-stat-value">{tag.avgTimeSpent}s</span>
                                            <span className="confidence-stat-label">Avg Time</span>
                                        </div>
                                        <div className="confidence-stat">
                                            <span className="confidence-stat-value">{tag.totalAttempts}</span>
                                            <span className="confidence-stat-label">Attempts</span>
                                        </div>
                                    </div>
                                    <div className="confidence-label">{tag.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Weak Points Summary */}
                    {data.byTag.filter(t => t.confidence === 'weak').length > 0 && (
                        <div className="card weak-points-card">
                            <h3>⚠️ Areas Needing Attention</h3>
                            <div className="weak-points-list">
                                {data.byTag.filter(t => t.confidence === 'weak').map((tag) => (
                                    <div key={tag.tag} className="weak-point-item">
                                        <div className="weak-point-tag">{tag.tag}</div>
                                        <div className="weak-point-reason">
                                            {tag.errorRate > 50 && `High error rate (${tag.errorRate}%)`}
                                            {tag.errorRate <= 50 && tag.avgTimeSpent > tag.expectedTime &&
                                                `Taking longer than expected (${tag.avgTimeSpent}s vs ${tag.expectedTime}s)`}
                                        </div>
                                        <button className="btn-secondary btn-small" onClick={() => navigate('/cases')}>
                                            Practice
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
