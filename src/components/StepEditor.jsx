import React, { useState } from 'react'
import './StepEditor.css'

export default function StepEditor({ step, onSave, onCancel }) {
    const [editedStep, setEditedStep] = useState({ ...step })
    const [saving, setSaving] = useState(false)

    const updateContent = (field, value) => {
        setEditedStep({
            ...editedStep,
            content: {
                ...editedStep.content,
                [field]: value
            }
        })
    }

    const handleSave = async () => {
        // Validation
        if (editedStep.type === 'mcq') {
            const options = editedStep.options || []
            if (options.length < 2) {
                alert('MCQ steps must have at least 2 options.')
                return
            }
            const correctCount = options.filter(o => o.isCorrect).length
            if (correctCount !== 1) {
                alert(`MCQ steps must have exactly one correct answer. You have selected ${correctCount}.`)
                return
            }
        }

        setSaving(true)
        try {
            await onSave(editedStep)
        } catch (e) {
            alert('Failed to save: ' + e.message)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="step-editor">
            <div className="step-editor-header">
                <h3>Edit {step.type.toUpperCase()} Step</h3>
            </div>

            <div className="step-editor-body">
                {step.type === 'info' && <InfoStepEditor editedStep={editedStep} updateContent={updateContent} />}
                {step.type === 'history' && <HistoryStepEditor editedStep={editedStep} setEditedStep={setEditedStep} />}
                {step.type === 'mcq' && <McqStepEditor editedStep={editedStep} setEditedStep={setEditedStep} />}
                {step.type === 'investigation' && <InvestigationStepEditor editedStep={editedStep} setEditedStep={setEditedStep} />}
                {(step.type === 'diagnosis' || step.type === 'treatment') && (
                    <GenericStepEditor editedStep={editedStep} updateContent={updateContent} />
                )}
            </div>

            <div className="step-editor-footer">
                <button className="btn-secondary" onClick={onCancel} disabled={saving}>
                    Cancel
                </button>
                <button className="btn-primary" onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Step'}
                </button>
            </div>
        </div>
    )
}

// Info Step Editor
function InfoStepEditor({ editedStep, updateContent }) {
    return (
        <div className="form-grid">
            <label>
                Patient Name
                <input
                    value={editedStep.content?.patientName || ''}
                    onChange={(e) => updateContent('patientName', e.target.value)}
                    placeholder="Ms. A"
                />
            </label>
            <label>
                Age
                <input
                    type="number"
                    value={editedStep.content?.age || ''}
                    onChange={(e) => updateContent('age', parseInt(e.target.value))}
                    placeholder="54"
                />
            </label>
            <label>
                Gender
                <select
                    value={editedStep.content?.gender || 'Female'}
                    onChange={(e) => updateContent('gender', e.target.value)}
                >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                </select>
            </label>
            <label>
                Image URL (optional)
                <input
                    value={editedStep.content?.imageUrl || ''}
                    onChange={(e) => updateContent('imageUrl', e.target.value)}
                    placeholder="https://... or data:image/..."
                />
            </label>
            <label style={{ gridColumn: '1 / -1' }}>
                Description
                <textarea
                    value={editedStep.content?.description || ''}
                    onChange={(e) => updateContent('description', e.target.value)}
                    rows={3}
                    placeholder="I have had knee pain for a few months..."
                />
            </label>
            <label style={{ gridColumn: '1 / -1' }}>
                Chief Complaint (Arabic/Patient's words)
                <textarea
                    value={editedStep.content?.chiefComplaint || ''}
                    onChange={(e) => updateContent('chiefComplaint', e.target.value)}
                    rows={2}
                    placeholder="طلوع ونزل السلم بيتعبوني..."
                />
            </label>
        </div>
    )
}

// History Step Editor
function HistoryStepEditor({ editedStep, setEditedStep }) {
    const questions = editedStep.content?.questions || []

    const updateQuestion = (index, field, value) => {
        const newQuestions = [...questions]
        newQuestions[index] = { ...newQuestions[index], [field]: value }
        setEditedStep({
            ...editedStep,
            content: { ...editedStep.content, questions: newQuestions }
        })
    }

    const addQuestion = () => {
        const newQuestions = [...questions, { question: '', answer: '', icon: '❓' }]
        setEditedStep({
            ...editedStep,
            content: { ...editedStep.content, questions: newQuestions }
        })
    }

    const removeQuestion = (index) => {
        const newQuestions = questions.filter((_, i) => i !== index)
        setEditedStep({
            ...editedStep,
            content: { ...editedStep.content, questions: newQuestions }
        })
    }

    return (
        <div className="form-grid">
            <label style={{ gridColumn: '1 / -1' }}>
                Title
                <input
                    value={editedStep.content?.title || ''}
                    onChange={(e) => setEditedStep({ ...editedStep, content: { ...editedStep.content, title: e.target.value } })}
                    placeholder="History of Pain"
                />
            </label>
            <label style={{ gridColumn: '1 / -1' }}>
                Description
                <textarea
                    value={editedStep.content?.description || ''}
                    onChange={(e) => setEditedStep({ ...editedStep, content: { ...editedStep.content, description: e.target.value } })}
                    rows={2}
                    placeholder="Questions you should ask and patient answers"
                />
            </label>

            <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h4>Questions</h4>
                    <button type="button" className="btn-secondary btn-small" onClick={addQuestion}>
                        + Add Question
                    </button>
                </div>

                {questions.map((q, idx) => (
                    <div key={idx} className="array-item">
                        <div className="array-item-header">
                            <span>Question {idx + 1}</span>
                            <button type="button" className="btn-delete-small" onClick={() => removeQuestion(idx)}>
                                🗑
                            </button>
                        </div>
                        <div className="form-grid">
                            <label style={{ gridColumn: '1 / 3' }}>
                                Question Text
                                <textarea
                                    value={q.question || ''}
                                    onChange={(e) => updateQuestion(idx, 'question', e.target.value)}
                                    rows={2}
                                    placeholder="When did the pain start?"
                                />
                            </label>
                            <label>
                                Icon
                                <input
                                    value={q.icon || ''}
                                    onChange={(e) => updateQuestion(idx, 'icon', e.target.value)}
                                    placeholder="❓"
                                />
                            </label>
                            <label style={{ gridColumn: '1 / -1' }}>
                                Answer
                                <textarea
                                    value={q.answer || ''}
                                    onChange={(e) => updateQuestion(idx, 'answer', e.target.value)}
                                    rows={2}
                                    placeholder="It started about 3 months ago..."
                                />
                            </label>
                        </div>
                    </div>
                ))}

                {questions.length === 0 && (
                    <p style={{ color: '#6b7280', fontStyle: 'italic' }}>No questions added yet. Click "Add Question" to start.</p>
                )}
            </div>
        </div>
    )
}

// MCQ Step Editor
function McqStepEditor({ editedStep, setEditedStep }) {
    const options = editedStep.options || []

    const updateOption = (index, field, value) => {
        const newOptions = [...options]
        newOptions[index] = { ...newOptions[index], [field]: value }
        setEditedStep({ ...editedStep, options: newOptions })
    }

    const addOption = () => {
        const newOptions = [...options, { label: '', isCorrect: false, feedback: '' }]
        setEditedStep({ ...editedStep, options: newOptions })
    }

    const removeOption = (index) => {
        const newOptions = options.filter((_, i) => i !== index)
        setEditedStep({ ...editedStep, options: newOptions })
    }

    return (
        <div className="form-grid">
            <label style={{ gridColumn: '1 / -1' }}>
                Question/Prompt
                <textarea
                    value={editedStep.content?.prompt || editedStep.question || ''}
                    onChange={(e) => {
                        setEditedStep({
                            ...editedStep,
                            question: e.target.value,
                            content: { ...editedStep.content, prompt: e.target.value }
                        })
                    }}
                    rows={2}
                    placeholder="What is the MOST appropriate next action?"
                />
            </label>

            <label>
                Max Score
                <input
                    type="number"
                    value={editedStep.maxScore || 10}
                    onChange={(e) => setEditedStep({ ...editedStep, maxScore: parseInt(e.target.value) })}
                    placeholder="10"
                />
            </label>

            <label style={{ gridColumn: '2 / -1' }}>
                Explanation on Fail
                <input
                    value={editedStep.explanationOnFail || ''}
                    onChange={(e) => setEditedStep({ ...editedStep, explanationOnFail: e.target.value })}
                    placeholder="Remember that..."
                />
            </label>

            <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h4>Options (Min 2, Max 6)</h4>
                    <button type="button" className="btn-secondary btn-small" onClick={addOption} disabled={options.length >= 6}>
                        + Add Option
                    </button>
                </div>

                {options.map((opt, idx) => (
                    <div key={idx} className="array-item">
                        <div className="array-item-header">
                            <span>Option {idx + 1}</span>
                            <button type="button" className="btn-delete-small" onClick={() => removeOption(idx)}>
                                🗑
                            </button>
                        </div>
                        <div className="form-grid">
                            <label style={{ gridColumn: '1 / -1' }}>
                                Option Text
                                <textarea
                                    value={opt.label || ''}
                                    onChange={(e) => updateOption(idx, 'label', e.target.value)}
                                    rows={2}
                                    placeholder="Order MRI of the knee immediately"
                                />
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={opt.isCorrect || false}
                                    onChange={(e) => updateOption(idx, 'isCorrect', e.target.checked)}
                                />
                                {' '}Is Correct Answer
                            </label>
                            <label style={{ gridColumn: '2 / -1' }}>
                                Feedback
                                <input
                                    value={opt.feedback || ''}
                                    onChange={(e) => updateOption(idx, 'feedback', e.target.value)}
                                    placeholder="Jumping to advanced imaging without..."
                                />
                            </label>
                        </div>
                    </div>
                ))}

                {options.length < 2 && (
                    <p style={{ color: '#ef4444', fontSize: '0.9rem' }}>⚠ At least 2 options are required for an MCQ step.</p>
                )}
            </div>
        </div>
    )
}

// Investigation Step Editor
function InvestigationStepEditor({ editedStep, setEditedStep }) {
    const investigations = editedStep.investigations || []
    const xrays = editedStep.xrays || []

    const addInvestigation = () => {
        const newInvestigations = [...investigations, { groupLabel: '', testName: '', description: '', result: '', videoUrl: '' }]
        setEditedStep({ ...editedStep, investigations: newInvestigations })
    }

    const removeInvestigation = (index) => {
        const newInvestigations = investigations.filter((_, i) => i !== index)
        setEditedStep({ ...editedStep, investigations: newInvestigations })
    }

    const updateInvestigation = (index, field, value) => {
        const newInvestigations = [...investigations]
        newInvestigations[index] = { ...newInvestigations[index], [field]: value }
        setEditedStep({ ...editedStep, investigations: newInvestigations })
    }

    const addXray = () => {
        const newXrays = [...xrays, { label: '', icon: '🩻', imageUrl: '' }]
        setEditedStep({ ...editedStep, xrays: newXrays })
    }

    const removeXray = (index) => {
        const newXrays = xrays.filter((_, i) => i !== index)
        setEditedStep({ ...editedStep, xrays: newXrays })
    }

    const updateXray = (index, field, value) => {
        const newXrays = [...xrays]
        newXrays[index] = { ...newXrays[index], [field]: value }
        setEditedStep({ ...editedStep, xrays: newXrays })
    }

    return (
        <div className="form-grid">
            <div style={{ gridColumn: '1 / -1', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h4>Investigations/Tests</h4>
                    <button type="button" className="btn-secondary btn-small" onClick={addInvestigation}>
                        + Add Investigation
                    </button>
                </div>

                {investigations.map((inv, idx) => (
                    <div key={idx} className="array-item">
                        <div className="array-item-header">
                            <span>Investigation {idx + 1}</span>
                            <button type="button" className="btn-delete-small" onClick={() => removeInvestigation(idx)}>
                                🗑
                            </button>
                        </div>
                        <div className="form-grid">
                            <label>
                                Group Label
                                <input
                                    value={inv.groupLabel || ''}
                                    onChange={(e) => updateInvestigation(idx, 'groupLabel', e.target.value)}
                                    placeholder="Physical Examination"
                                />
                            </label>
                            <label>
                                Test Name
                                <input
                                    value={inv.testName || ''}
                                    onChange={(e) => updateInvestigation(idx, 'testName', e.target.value)}
                                    placeholder="Lachman Test"
                                />
                            </label>
                            <label style={{ gridColumn: '1 / -1' }}>
                                Description
                                <textarea
                                    value={inv.description || ''}
                                    onChange={(e) => updateInvestigation(idx, 'description', e.target.value)}
                                    rows={2}
                                    placeholder="Test to assess ACL integrity..."
                                />
                            </label>
                            <label>
                                Result
                                <input
                                    value={inv.result || ''}
                                    onChange={(e) => updateInvestigation(idx, 'result', e.target.value)}
                                    placeholder="Positive / Negative"
                                />
                            </label>
                            <label>
                                Video URL (optional)
                                <input
                                    value={inv.videoUrl || ''}
                                    onChange={(e) => updateInvestigation(idx, 'videoUrl', e.target.value)}
                                    placeholder="https://youtube.com/watch?v=..."
                                />
                            </label>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h4>X-rays/Imaging</h4>
                    <button type="button" className="btn-secondary btn-small" onClick={addXray}>
                        + Add X-ray
                    </button>
                </div>

                {xrays.map((xray, idx) => (
                    <div key={idx} className="array-item">
                        <div className="array-item-header">
                            <span>X-ray {idx + 1}</span>
                            <button type="button" className="btn-delete-small" onClick={() => removeXray(idx)}>
                                🗑
                            </button>
                        </div>
                        <div className="form-grid">
                            <label>
                                Label
                                <input
                                    value={xray.label || ''}
                                    onChange={(e) => updateXray(idx, 'label', e.target.value)}
                                    placeholder="AP View"
                                />
                            </label>
                            <label>
                                Icon
                                <input
                                    value={xray.icon || ''}
                                    onChange={(e) => updateXray(idx, 'icon', e.target.value)}
                                    placeholder="🩻"
                                />
                            </label>
                            <label style={{ gridColumn: '1 / -1' }}>
                                Image URL (base64 or URL)
                                <textarea
                                    value={xray.imageUrl || ''}
                                    onChange={(e) => updateXray(idx, 'imageUrl', e.target.value)}
                                    rows={3}
                                    placeholder="data:image/png;base64,... or https://..."
                                />
                            </label>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// Generic Step Editor (for diagnosis, treatment, etc.)
function GenericStepEditor({ editedStep, updateContent }) {
    return (
        <div className="form-grid">
            <label style={{ gridColumn: '1 / -1' }}>
                Content (JSON)
                <textarea
                    value={JSON.stringify(editedStep.content || {}, null, 2)}
                    onChange={(e) => {
                        try {
                            const parsed = JSON.parse(e.target.value)
                            updateContent('_all', parsed)
                        } catch (err) {
                            // Invalid JSON, ignore for now
                        }
                    }}
                    rows={10}
                    placeholder='{}'
                />
            </label>
        </div>
    )
}
