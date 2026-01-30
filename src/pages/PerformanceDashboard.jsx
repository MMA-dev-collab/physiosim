import React, { useState, useEffect, useMemo } from 'react'
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
    ReferenceLine,
    Cell,
    Legend
} from 'recharts'
import './PerformanceDashboard.css'

const COLORS = {
    primary: '#3b82f6',    // blue-500
    primaryDark: '#2563eb', // blue-600
    success: '#10b981',    // emerald-500
    warning: '#f59e0b',    // amber-500
    danger: '#ef4444',     // red-500
    neutral: '#94a3b8',    // slate-400
    background: '#f8fafc'  // slate-50
}

const getFeedback = (type, value) => {
    if (type === 'accuracy') {
        if (value >= 85) return { text: 'Excellent', color: 'text-emerald-600', bg: 'bg-emerald-50' }
        if (value >= 70) return { text: 'Good', color: 'text-blue-600', bg: 'bg-blue-50' }
        if (value >= 50) return { text: 'Needs Work', color: 'text-amber-600', bg: 'bg-amber-50' }
        return { text: 'Critical', color: 'text-red-600', bg: 'bg-red-50' }
    }
    if (type === 'time') {
        // Assuming ~60s is ideal average for this example context, adjust as needed or use expectedTime
        if (value < 10) return { text: 'Rushing?', color: 'text-amber-600', bg: 'bg-amber-50' }
        if (value > 120) return { text: 'Slow', color: 'text-amber-600', bg: 'bg-amber-50' }
        return { text: 'On Pace', color: 'text-emerald-600', bg: 'bg-emerald-50' }
    }
    return { text: '-', color: 'text-slate-600', bg: 'bg-slate-50' }
}

export default function PerformanceDashboard({ auth }) {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [data, setData] = useState(null)
    const [timeFilter, setTimeFilter] = useState('All')

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

    const processedData = useMemo(() => {
        if (!data) return null
        
        // Identify weakest category
        const sortedByWeakness = [...data.byTag].sort((a, b) => {
             // Lower accuracy is worse
             const accDiff = (100 - b.errorRate) - (100 - a.errorRate) // this sorts high to low, we want low to high
             if ((100 - a.errorRate) !== (100 - b.errorRate)) return (100 - a.errorRate) - (100 - b.errorRate)
             return 0
        })

        const weakest = sortedByWeakness[0]?.confidence === 'weak' ? sortedByWeakness[0] : null
        const uniqueTags = ['All', ...new Set(data.byTag.map(item => item.tag))]

        return {
            weakest,
            sortedTags: sortedByWeakness,
            uniqueTags
        }
    }, [data])

    if (loading) return (
        <div className="flex justify-center items-center h-screen">
            <Loader />
        </div>
    )

    if (error) return (
        <div className="page">
            <div className="text-red-500 font-medium">{error}</div>
        </div>
    )

    const hasData = data && data.overallStats.totalAttempts > 0

    return (
        <div className="page performance-dashboard">
            <div className="page-header">
                <div className="page-eyebrow">Analytics</div>
                <h1 className="page-title">Performance Dashboard</h1>
                <p className="page-subtitle">
                    Your personal learning coach. Track progress and identify what to practice next.
                </p>
            </div>

            {!hasData ? (
                <div className="card empty-state">
                    <div className="empty-icon">📊</div>
                    <h3>Start Your Journey</h3>
                    <p>Complete your first case to unlock personalized insights.</p>
                    <button className="btn-primary" onClick={() => navigate('/cases')}>
                        Start Practice
                    </button>
                </div>
            ) : (
                <>
                    {/* 1. CRITICAL ATTENTION SECTION */}
                    {processedData.weakest && (
                        <div className="section-block attention-section">
                            <div className="card attention-card">
                                <div className="attention-content">
                                    <div className="attention-header">
                                        <div className="attention-icon">⚠️</div>
                                        <div>
                                            <h3>Focus Area: {processedData.weakest.tag}</h3>
                                            <p>{processedData.weakest.label || `Accuracy in ${processedData.weakest.tag} is lower than your average.`}</p>
                                        </div>
                                    </div>
                                    <div className="attention-stats">
                                        <div className="mini-stat">
                                            <span className="label">Accuracy</span>
                                            <span className="value critical">{100 - processedData.weakest.errorRate}%</span>
                                        </div>
                                        <div className="mini-stat">
                                            <span className="label">Mistakes</span>
                                            <span className="value">{processedData.weakest.totalAttempts * (processedData.weakest.errorRate / 100)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="attention-action">
                                    <p className="recommendation">Recommended: Practice 3 more {processedData.weakest.tag} cases.</p>
                                    <button className="btn-primary w-full" onClick={() => navigate(`/cases?filter=${processedData.weakest.tag}`)}>
                                        Practice {processedData.weakest.tag} Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 2. TOP STATS CARDS */}
                    <div className="stats-grid">
                        <StatCard 
                            icon="📝" 
                            label="Total Attempts" 
                            value={data.overallStats.totalAttempts} 
                            subtext="Lifetime cases"
                        />
                        <StatCard 
                            icon="🎯" 
                            label="Accuracy Rate" 
                            value={`${data.overallStats.accuracyRate}%`}
                            feedback={getFeedback('accuracy', data.overallStats.accuracyRate)}
                        />
                        <StatCard 
                            icon="✅" 
                            label="Correct Answers" 
                            value={data.overallStats.correctAttempts}
                            subtext={`out of ${data.overallStats.totalAttempts}`}
                        />
                        <StatCard 
                            icon="⏱️" 
                            label="Avg Time / Question" 
                            value={`${data.overallStats.avgTimePerQuestion}s`}
                            feedback={getFeedback('time', data.overallStats.avgTimePerQuestion)}
                        />
                    </div>

                    {/* 3. TIME BY CATEGORY (Full width) */}
                    <div className="section-block">
                        <div className="section-header-row">
                            <div>
                                <h3>Speed & Efficiency</h3>
                                <p className="section-description">Compare your average time per question against the ideal time.</p>
                            </div>
                            <div className="filter-pills">
                                {processedData.uniqueTags.map(tag => (
                                    <button 
                                        key={tag}
                                        className={`pill-filter ${timeFilter === tag ? 'active' : ''}`}
                                        onClick={() => setTimeFilter(tag)}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="card chart-card full-width">
                            <ResponsiveContainer width="100%" height={320}>
                                <BarChart 
                                    data={timeFilter === 'All' ? data.byTag : data.byTag.filter(t => t.tag === timeFilter)}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="tag" tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
                                    <YAxis tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} unit="s" />
                                    <Tooltip 
                                        cursor={{fill: '#f1f5f9'}}
                                        contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                                    />
                                    <Legend />
                                    <Bar dataKey="avgTimeSpent" name="Your Time" fill={COLORS.primary} radius={[4, 4, 0, 0]} barSize={40} />
                                    <Bar dataKey="expectedTime" name="Ideal Time" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                            <div className="chart-insight">
                                💡 Tip: If your time is significantly lower than Ideal Time, you might be rushing.
                            </div>
                        </div>
                    </div>

                    {/* 4. SECONDARY CHARTS GRID */}
                    <div className="grid-2-charts">
                        {/* Accuracy Trend */}
                        <div className="card chart-card">
                            <h3>Accuracy Metric</h3>
                            <p className="text-sm text-slate-500 mb-4">Trend over last 10 sessions</p>
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={data.accuracyOverTime}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis 
                                        dataKey="date" 
                                        tick={{fontSize: 10}} 
                                        tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                                    />
                                    <YAxis domain={[0, 100]} hide />
                                    <Tooltip />
                                    <ReferenceLine y={80} stroke={COLORS.success} strokeDasharray="3 3" label={{ value: 'Target (80%)', fill: COLORS.success, fontSize: 10, position: 'insideTopRight' }} />
                                    <Line type="monotone" dataKey="accuracy" stroke={COLORS.primary} strokeWidth={3} dot={{r: 4, fill: COLORS.primary, strokeWidth: 2, stroke: '#fff'}} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Attempts Distribution (Horizontal Bar) */}
                        <div className="card chart-card">
                            <h3>Volume by Category</h3>
                            <p className="text-sm text-slate-500 mb-4">Where are you spending your time?</p>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart layout="vertical" data={data.byTag} margin={{ left: 40 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                                    <XAxis type="number" hide />
                                    <YAxis type="category" dataKey="tag" width={100} tick={{fontSize: 12}} />
                                    <Tooltip cursor={{fill: 'transparent'}} />
                                    <Bar dataKey="totalAttempts" fill={COLORS.primaryDark} radius={[0, 4, 4, 0]} barSize={20}>
                                        {data.byTag.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? COLORS.primary : COLORS.primaryDark} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 5. DETAILED CATEGORY CARDS */}
                    <div className="section-block">
                        <h3>Category Performance</h3>
                        <p className="section-description mb-6">Prioritized by where you need most improvement.</p>
                        <div className="confidence-grid">
                            {processedData.sortedTags.map((tag) => (
                                <CategoryCard key={tag.tag} tagData={tag} navigate={navigate} />
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

function StatCard({ icon, label, value, subtext, feedback }) {
    return (
        <div className="stat-card">
            <div className="stat-icon">{icon}</div>
            <div className="stat-info">
                <div className="stat-value">{value}</div>
                <div className="stat-label">{label}</div>
                {feedback ? (
                    <div className={`stat-feedback ${feedback.color} ${feedback.bg}`}>
                        {feedback.text}
                    </div>
                ) : (
                   subtext && <div className="stat-subtext">{subtext}</div>
                )}
            </div>
        </div>
    )
}

function CategoryCard({ tagData, navigate }) {
    const isWeak = tagData.confidence === 'weak'
    const accuracy = 100 - tagData.errorRate
    
    return (
        <div className={`confidence-card ${tagData.confidence}`}>
            <div className="confidence-header">
                <div>
                    <span className="confidence-tag">{tagData.tag}</span>
                    <div className="confidence-tag-label">{tagData.label}</div>
                </div>
                <span className={`confidence-badge ${tagData.confidence}`}>
                    {tagData.confidence === 'strong' && 'Top Strength'}
                    {tagData.confidence === 'neutral' && 'Improving'}
                    {tagData.confidence === 'weak' && 'Needs Practice'}
                </span>
            </div>
            
            <div className="confidence-meter-container">
                <div className="flex justify-between text-xs mb-1">
                    <span>Accuracy</span>
                    <span className="font-bold">{accuracy.toFixed(0)}%</span>
                </div>
                <div className="meter-bg">
                    <div 
                        className="meter-fill" 
                        style={{ 
                            width: `${accuracy}%`,
                            backgroundColor: isWeak ? COLORS.danger : (accuracy > 80 ? COLORS.success : COLORS.warning)
                        }}
                    ></div>
                </div>
            </div>

            <div className="confidence-stats-row">
                <div className="c-stat">
                    <span className="val">{tagData.avgTimeSpent}s</span>
                    <span className="lbl">Avg Time</span>
                </div>
                <div className="c-stat">
                    <span className="val">{tagData.totalAttempts}</span>
                    <span className="lbl">Attempts</span>
                </div>
            </div>

            {isWeak && (
                <button 
                    className="btn-practice-sm"
                    onClick={() => navigate(`/cases?filter=${tagData.tag}`)}
                >
                    Practice {tagData.tag}
                </button>
            )}
        </div>
    )
}
