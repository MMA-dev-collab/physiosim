import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../config'
import StepEditor from '../components/StepEditor'
import { useToast } from '../context/ToastContext'
import ConfirmationModal from '../components/common/ConfirmationModal'
import './CaseEditorPage.css'

export default function CaseEditorPage({ auth }) {
    const { id } = useParams()
    const navigate = useNavigate()
    const isEdit = !!id

    const [activeTab, setActiveTab] = useState('basic') // basic, steps
    const [loading, setLoading] = useState(isEdit)
    const [categories, setCategories] = useState([])
    const [error, setError] = useState(null)
    const [stepToDelete, setStepToDelete] = useState(null)

    const { toast } = useToast()

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
        status: 'draft',
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

    const [touched, setTouched] = useState({})

    const validate = () => {
        const errors = {}
        if (!caseData.title) errors.title = 'Title is required'
        if (!caseData.categoryId) errors.categoryId = 'Category is required'
        if (!caseData.duration) errors.duration = 'Duration is required'
        else if (caseData.duration > 30) errors.duration = 'Duration cannot exceed 30 minutes'
        if (!caseData.metadata.brief) errors.brief = 'Brief Description is required'
        return errors
    }

    const errors = validate()

    const handleSaveBasic = async () => {
        // Validation
        if (Object.keys(errors).length > 0) {
            setTouched({
                title: true,
                categoryId: true,
                duration: true,
                brief: true
            })
            toast.error('Please fix the errors before saving.')

            // Auto-focus first error
            const firstErrorKey = Object.keys(errors)[0]
            const element = document.getElementById(`field-${firstErrorKey}`)
            if (element) element.focus()

            return
        }

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
                toast.success('Case created! Please add steps.')
                navigate(`/admin/cases/${data.id}/edit`)
            } else {
                toast.success('Case saved successfully')
            }
        } catch (e) {
            toast.error(e.message)
        }
    }

    const handleSaveDraftAndExit = async () => {
        // NO VALIDATION IN DRAFT MODE - let user save and exit freely
        try {
            if (isEdit) {
                // If editing, save current state as draft
                const url = `${API_BASE_URL}/api/admin/cases/${id}`
                const res = await fetch(url, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${auth.token}`,
                        'ngrok-skip-browser-warning': 'true'
                    },
                    body: JSON.stringify({ ...caseData, status: 'draft' }),
                })

                if (!res.ok) throw new Error('Failed to save draft')
                toast.success('Case saved as draft')
            }
            // Navigate to admin dashboard
            navigate('/admin')
        } catch (e) {
            toast.error(e.message)
            // Still navigate even if save fails
            navigate('/admin')
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
            toast.success('Step updated successfully!')
        } catch (e) {
            throw e
        }
    }

    const handlePublish = async () => {
        // PUBLISHING VALIDATION - strict rules enforced here
        if (steps.length < 3) {
            toast.error('Publishing requires at least 3 steps (1 Info + 2 others)')
            return
        }

        // Check if Info step exists and is the first step
        const firstStep = steps.find(s => s.stepIndex === 0)
        if (!firstStep || firstStep.type !== 'info') {
            toast.error('The first step must be an "Info" step')
            return
        }

        // DEEP VALIDATION - ensure all steps have content
        for (const step of steps) {
            if (step.type === 'info') {
                const content = step.content || {}
                if (!content.patientName || !content.age || !content.gender ||
                    !content.description || !content.chiefComplaint) {
                    toast.error(`Step ${step.stepIndex + 1} (Info): Missing required fields`)
                    return
                }
            }

            if (step.type === 'history') {
                const questions = step.content?.questions || []
                if (questions.length === 0) {
                    toast.error(`Step ${step.stepIndex + 1} (History): No questions added`)
                    return
                }
                for (const q of questions) {
                    if (!q.question || !q.answer) {
                        toast.error(`Step ${step.stepIndex + 1} (History): Question or answer is empty`)
                        return
                    }
                }
            }

            if (step.type === 'mcq') {
                const options = step.options || []
                if (options.length < 2) {
                    toast.error(`Step ${step.stepIndex + 1} (MCQ): At least 2 options required`)
                    return
                }
                const correctCount = options.filter(o => o.isCorrect).length
                if (correctCount !== 1) {
                    toast.error(`Step ${step.stepIndex + 1} (MCQ): Exactly 1 correct answer required`)
                    return
                }
            }

            if (step.type === 'investigation') {
                const investigations = step.investigations || []
                const xrays = step.xrays || []
                if (investigations.length === 0 && xrays.length === 0) {
                    toast.error(`Step ${step.stepIndex + 1} (Investigation): No investigations or X-rays added`)
                    return
                }
                for (const inv of investigations) {
                    if (!inv.groupLabel || !inv.testName || !inv.description) {
                        toast.error(`Step ${step.stepIndex + 1} (Investigation): Missing required fields`)
                        return
                    }
                }
                for (const xray of xrays) {
                    if (!xray.label || !xray.imageUrl) {
                        toast.error(`Step ${step.stepIndex + 1} (X-Ray): Missing label or image URL`)
                        return
                    }
                }
            }
        }

        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/cases/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${auth.token}`,
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify({ ...caseData, status: 'published' }),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.message || 'Failed to publish')
            }

            setCaseData({ ...caseData, status: 'published' })
            toast.success('Case published successfully!')
        } catch (e) {
            console.error('[Publish Error]', e);
            toast.error(e.message || 'Failed to publish case due to plan limits or other error.')
        }
    }

    const handleUnpublish = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/cases/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${auth.token}`,
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify({ ...caseData, status: 'draft' }),
            })

            if (!res.ok) throw new Error('Failed to unpublish')

            setCaseData({ ...caseData, status: 'draft' })
            toast.success('Case unpublished successfully!')
        } catch (e) {
            toast.error(e.message)
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
            toast.success('Step added!')
        } catch (e) {
            toast.error(e.message)
        }
    }

    const handleDeleteStep = (stepId) => {
        setStepToDelete(stepId)
    }

    const confirmDeleteStep = async () => {
        if (!stepToDelete) return

        try {
            await fetch(`${API_BASE_URL}/api/admin/steps/${stepToDelete}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${auth.token}`,
                    'ngrok-skip-browser-warning': 'true'
                }
            })
            setSteps(steps.filter(s => s.id !== stepToDelete))
            toast.success('Step deleted')
            setStepToDelete(null)
        } catch (e) {
            toast.error(e.message)
        }
    }

    if (loading) return <div className="p-8">Loading...</div>

    return (
        <div className="case-editor-page">
            <div className="editor-header">
                <button className="back-btn" onClick={handleSaveDraftAndExit}>← Back to Dashboard</button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <h1>{isEdit ? `Edit Case: ${caseData.title}` : 'Create New Case'}</h1>
                    {isEdit && (
                        <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '100px',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            background: caseData.status === 'published' ? '#dcfce7' : '#fef3c7',
                            color: caseData.status === 'published' ? '#166534' : '#92400e'
                        }}>
                            {caseData.status === 'published' ? '✓ Published' : '📝 Draft'}
                        </span>
                    )}
                </div>
                {isEdit && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {caseData.status === 'draft' ? (
                            <button
                                className="btn-primary"
                                onClick={handlePublish}
                                disabled={steps.length < 3}
                                title={steps.length < 3 ? 'Need at least 3 steps to publish' : ''}
                            >
                                🚀 Publish Case
                            </button>
                        ) : (
                            <button
                                className="btn-secondary"
                                onClick={handleUnpublish}
                                style={{ fontSize: '0.875rem' }}
                            >
                                Unpublish
                            </button>
                        )}
                    </div>
                )}
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
                            toast.warning('Please save the case first before adding steps.')
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
                                <span>Title <span style={{ color: 'red' }}>*</span></span>
                                <input
                                    id="field-title"
                                    value={caseData.title}
                                    onChange={e => setCaseData({ ...caseData, title: e.target.value })}
                                    onBlur={() => setTouched({ ...touched, title: true })}
                                    placeholder="Case Title"
                                    style={touched.title && errors.title ? { borderColor: 'red' } : {}}
                                />
                                {touched.title && errors.title && <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors.title}</span>}
                            </label>
                            <label>
                                <span>Category <span style={{ color: 'red' }}>*</span></span>
                                <select
                                    id="field-categoryId"
                                    value={caseData.categoryId || ''}
                                    onChange={(e) => {
                                        const val = e.target.value
                                        const catId = val ? parseInt(val) : null
                                        const cat = categories.find(c => c.id === catId)
                                        setCaseData({ ...caseData, categoryId: catId, category: cat ? cat.name : '' })
                                    }}
                                    onBlur={() => setTouched({ ...touched, categoryId: true })}
                                    style={touched.categoryId && errors.categoryId ? { borderColor: 'red' } : {}}
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                                    ))}
                                </select>
                                {touched.categoryId && errors.categoryId && <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors.categoryId}</span>}
                            </label>
                            <label>
                                <span>Difficulty <span style={{ color: 'red' }}>*</span></span>
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
                                <span>Duration (min) <span style={{ color: 'red' }}>*</span></span>
                                <input
                                    id="field-duration"
                                    type="number"
                                    value={caseData.duration}
                                    onChange={e => setCaseData({ ...caseData, duration: parseInt(e.target.value) })}
                                    onBlur={() => setTouched({ ...touched, duration: true })}
                                    style={touched.duration && errors.duration ? { borderColor: 'red' } : {}}
                                />
                                {touched.duration && errors.duration && <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors.duration}</span>}
                            </label>
                            <label style={{ gridColumn: '1 / -1' }}>
                                <span>Brief Description <span style={{ color: 'red' }}>*</span></span>
                                <textarea
                                    id="field-brief"
                                    value={caseData.metadata.brief || ''}
                                    onChange={e => setCaseData({ ...caseData, metadata: { ...caseData.metadata, brief: e.target.value } })}
                                    onBlur={() => setTouched({ ...touched, brief: true })}
                                    rows={3}
                                    style={touched.brief && errors.brief ? { borderColor: 'red' } : {}}
                                />
                                {touched.brief && errors.brief && <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors.brief}</span>}
                            </label>
                        </div>
                        <div className="form-actions" style={{ display: 'flex', gap: '1rem' }}>
                            <button className="btn-primary" onClick={handleSaveBasic}>
                                {isEdit ? 'Update Case Info' : 'Create Case & Continue'}
                            </button>
                            <button className="btn-secondary" onClick={handleSaveDraftAndExit}>
                                Save as Draft & Exit
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



            <ConfirmationModal
                isOpen={!!stepToDelete}
                title="Delete Step"
                message="Are you sure you want to delete this step? This action cannot be undone."
                confirmText="Delete"
                onConfirm={confirmDeleteStep}
                onCancel={() => setStepToDelete(null)}
                isDanger={true}
            />
        </div>
    )
}
