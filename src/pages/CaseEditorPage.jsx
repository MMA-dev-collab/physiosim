import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../config'
import StepEditor from '../components/StepEditor'
import './CaseEditorPage.css'

export default function CaseEditorPage({ auth }) {
    const { id } = useParams()
    const navigate = useNavigate()
    const isEdit = !!id

    const [activeTab, setActiveTab] = useState('basic') // basic, steps
    const [loading, setLoading] = useState(isEdit)
    const [categories, setCategories] = useState([])
    const [error, setError] = useState(null)

    // Case Data
    const [caseData, setCaseData] = useState({
        title: '',
        specialty: 'Physical Therapy',
        category: '',
        categoryId: '',
        difficulty: 'Intermediate',
        isLocked: false,
        prerequisiteCaseId: '',
        metadata: { brief: '' },
        thumbnailUrl: '',
        duration: 10,
    })

    // Steps Data
    const [steps, setSteps] = useState([])
    const [editingStepId, setEditingStepId] = useState(null)

    // Load Categories
    useEffect(() => {
        fetch(`${API_BASE_URL}/api/categories`, {
            headers: { 'ngrok-skip-browser-warning': 'true' }
        })
            .then(res => res.json())
            .then(data => setCategories(data))
            .catch(e => console.error(e))
    }, [])

    // Load Case if Edit
    useEffect(() => {
        if (isEdit) {
            const load = async () => {
                try {
                    // Load Case Info (Using the list endpoint for now and filtering, or we should add a GET /api/cases/:id endpoint for admin?)
                    // Actually, the public GET /api/cases/:id exists but might be filtered.
                    // Let's assume we can fetch from the list for now or add a specific endpoint.
                    // Wait, server.js has GET /api/cases/:id for runner, but maybe we can use that.
                    // Actually, let's just fetch the list and find it for simplicity, or add a proper endpoint.
                    // Better: Use the runner endpoint but it might check for prerequisites.
                    // Let's add a quick fetch to the list.
                    const res = await fetch(`${API_BASE_URL}/api/admin/cases`, {
                        headers: {
                            Authorization: `Bearer ${auth.token}`,
                            'ngrok-skip-browser-warning': 'true'
                        }
                    })
                    const cases = await res.json()
                    const found = cases.find(c => c.id === parseInt(id))
                    if (found) {
                        setCaseData({
                            ...found,
                            metadata: found.metadata || { brief: '' }
                        })
                    } else {
                        throw new Error('Case not found')
                    }

                    // Load Steps
                    const stepsRes = await fetch(`${API_BASE_URL}/api/admin/cases/${id}/steps`, {
                        headers: {
                            Authorization: `Bearer ${auth.token}`,
                            'ngrok-skip-browser-warning': 'true'
                        }
                    })
                    const stepsData = await stepsRes.json()
                    setSteps(stepsData)

                } catch (e) {
                    setError(e.message)
                } finally {
                    setLoading(false)
                }
            }
            load()
        }
    }, [id, auth.token, isEdit])

    const handleSaveBasic = async () => {
        try {
            const url = isEdit
                ? `${API_BASE_URL}/api/admin/cases/${id}`
                : `${API_BASE_URL}/api/admin/cases`
            const method = isEdit ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${auth.token}`,
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify(caseData),
            })

            if (!res.ok) throw new Error('Failed to save')
            const data = await res.json()

            if (!isEdit) {
                // Redirect to edit mode to add steps
                navigate(`/admin/cases/${data.id}/edit`)
            } else {
                alert('Case saved successfully')
            }
        } catch (e) {
            alert(e.message)
        }
    }

    // Step Management (Simplified for now)
    const handleUpdateStep = async (editedStep) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/steps/${editedStep.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${auth.token}`,
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify(editedStep),
            })
            if (!res.ok) throw new Error('Failed to update step')

            // Reload steps
            const stepsRes = await fetch(`${API_BASE_URL}/api/admin/cases/${id}/steps`, {
                headers: {
                    Authorization: `Bearer ${auth.token}`,
                    'ngrok-skip-browser-warning': 'true'
                }
            })
            const stepsData = await stepsRes.json()
            setSteps(stepsData)
            setEditingStepId(null)
            alert('Step updated successfully!')
        } catch (e) {
            throw e
        }
    }

    const handleAddStep = async (type) => {
        // Basic step template
        const newStep = {
            stepIndex: steps.length,
            type,
            content: {},
            question: '',
            explanationOnFail: '',
            maxScore: 10,
            options: [],
            investigations: [],
            xrays: []
        }

        // Save to backend immediately to get ID
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/cases/${id}/steps`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${auth.token}`,
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify(newStep),
            })
            if (!res.ok) throw new Error('Failed to create step')

            // Reload steps
            const stepsRes = await fetch(`${API_BASE_URL}/api/admin/cases/${id}/steps`, {
                headers: {
                    Authorization: `Bearer ${auth.token}`,
                    'ngrok-skip-browser-warning': 'true'
                }
            })
            const stepsData = await stepsRes.json()
            setSteps(stepsData)
        } catch (e) {
            alert(e.message)
        }
    }

    const handleDeleteStep = async (stepId) => {
        if (!window.confirm('Delete step?')) return
        try {
            await fetch(`${API_BASE_URL}/api/admin/steps/${stepId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${auth.token}`,
                    'ngrok-skip-browser-warning': 'true'
                }
            })
            setSteps(steps.filter(s => s.id !== stepId))
        } catch (e) {
            alert(e.message)
        }
    }

    if (loading) return <div className="p-8">Loading...</div>

    return (
        <div className="case-editor-page">
            <div className="editor-header">
                <button className="back-btn" onClick={() => navigate('/admin')}>← Back to Dashboard</button>
                <h1>{isEdit ? `Edit Case: ${caseData.title}` : 'Create New Case'}</h1>
            </div>

            <div className="editor-tabs">
                <button
                    className={`tab-btn ${activeTab === 'basic' ? 'active' : ''}`}
                    onClick={() => setActiveTab('basic')}
                >
                    Basic Info
                </button>
                <button
                    className={`tab-btn ${activeTab === 'steps' ? 'active' : ''}`}
                    onClick={() => {
                        if (!isEdit) {
                            alert('Please save the case first before adding steps.')
                            return
                        }
                        setActiveTab('steps')
                    }}
                    disabled={!isEdit}
                >
                    Steps ({steps.length})
                </button>
            </div>

            <div className="editor-content">
                {activeTab === 'basic' && (
                    <div className="form-section">
                        <div className="form-grid">
                            <label>
                                Title
                                <input
                                    value={caseData.title}
                                    onChange={e => setCaseData({ ...caseData, title: e.target.value })}
                                    placeholder="Case Title"
                                />
                            </label>
                            <label>
                                Category
                                <select
                                    value={caseData.categoryId || ''}
                                    onChange={(e) => {
                                        const val = e.target.value
                                        const catId = val ? parseInt(val) : null
                                        const cat = categories.find(c => c.id === catId)
                                        setCaseData({ ...caseData, categoryId: catId, category: cat ? cat.name : '' })
                                    }}
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                Difficulty
                                <select
                                    value={caseData.difficulty}
                                    onChange={e => setCaseData({ ...caseData, difficulty: e.target.value })}
                                >
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Advanced">Advanced</option>
                                </select>
                            </label>
                            <label>
                                Duration (min)
                                <input
                                    type="number"
                                    value={caseData.duration}
                                    onChange={e => setCaseData({ ...caseData, duration: parseInt(e.target.value) })}
                                />
                            </label>
                            <label style={{ gridColumn: '1 / -1' }}>
                                Brief Description
                                <textarea
                                    value={caseData.metadata.brief || ''}
                                    onChange={e => setCaseData({ ...caseData, metadata: { ...caseData.metadata, brief: e.target.value } })}
                                    rows={3}
                                />
                            </label>
                        </div>
                        <div className="form-actions">
                            <button className="btn-primary" onClick={handleSaveBasic}>
                                {isEdit ? 'Update Case Info' : 'Create Case & Continue'}
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'steps' && (
                    <div className="steps-section">
                        <div className="steps-list">
                            {steps.map((step, idx) => (
                                <div key={step.id} className="step-card">
                                    <div className="step-header">
                                        <span className="step-number">Step {idx + 1}</span>
                                        <span className="step-type">{step.type.toUpperCase()}</span>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                className={editingStepId === step.id ? 'btn-primary btn-small' : 'btn-secondary btn-small'}
                                                onClick={() => setEditingStepId(editingStepId === step.id ? null : step.id)}
                                            >
                                                {editingStepId === step.id ? 'Close' : 'Edit'}
                                            </button>
                                            <button className="btn-delete-step" onClick={() => handleDeleteStep(step.id)}>🗑</button>
                                        </div>
                                    </div>
                                    {editingStepId === step.id ? (
                                        <div style={{ marginTop: '1rem' }}>
                                            <StepEditor
                                                step={step}
                                                onSave={handleUpdateStep}
                                                onCancel={() => setEditingStepId(null)}
                                            />
                                        </div>
                                    ) : (
                                        <div className="step-preview">
                                            {step.type === 'info' && (
                                                <p>Patient: {step.content?.patientName || 'Not set'}, Age: {step.content?.age || 'Not set'}</p>
                                            )}
                                            {step.type === 'history' && (
                                                <p>{step.content?.questions?.length || 0} questions</p>
                                            )}
                                            {step.type === 'mcq' && (
                                                <p>Question: {step.question || step.content?.prompt || 'Not set'} ({step.options?.length || 0} options)</p>
                                            )}
                                            {step.type === 'investigation' && (
                                                <p>{step.investigations?.length || 0} investigations, {step.xrays?.length || 0} x-rays</p>
                                            )}
                                            {(step.type === 'diagnosis' || step.type === 'treatment') && (
                                                <p>{step.type} step</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="add-step-controls">
                            <h3>Add New Step</h3>
                            <div className="step-buttons">
                                <button className="btn-secondary" onClick={() => handleAddStep('info')}>+ Info Step</button>
                                <button className="btn-secondary" onClick={() => handleAddStep('history')}>+ History Step</button>
                                <button className="btn-secondary" onClick={() => handleAddStep('mcq')}>+ MCQ Step</button>
                                <button className="btn-secondary" onClick={() => handleAddStep('investigation')}>+ Investigation</button>
                                <button className="btn-secondary" onClick={() => handleAddStep('diagnosis')}>+ Diagnosis</button>
                                <button className="btn-secondary" onClick={() => handleAddStep('treatment')}>+ Treatment</button>
                            </div>
                        </div>
                        <p style={{ marginTop: '1rem', color: '#3b82f6', fontSize: '0.9rem' }}>
                            💡 Click "Edit" on any step to add or modify its content.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
