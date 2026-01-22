import React, { useState } from 'react'
import { useToast } from '../context/ToastContext'
import './StepEditor.css'
import EmojiInput from './common/EmojiInput'

export default function StepEditor({ step, onSave, onCancel }) {
    const [editedStep, setEditedStep] = useState({ ...step })
    const [saving, setSaving] = useState(false)
    const [touched, setTouched] = useState({})
    const { toast } = useToast()

    const updateContent = (field, value) => {
        setEditedStep({
            ...editedStep,
            content: {
                ...editedStep.content,
                [field]: value
            }
        })
    }

    // Validation logic
    const validate = () => {
        const errors = {}

        if (editedStep.type === 'mcq') {
            if (!editedStep.question && !editedStep.content?.prompt) {
                errors.question = 'Question is required'
            }
            if (!editedStep.maxScore || editedStep.maxScore < 1 || editedStep.maxScore > 10) {
                errors.maxScore = 'Max Score must be between 1 and 10'
            }
            const options = editedStep.options || []
            if (options.length < 2) {
                errors.options = 'At least 2 options are required'
            }
            const correctCount = options.filter(o => o.isCorrect).length
            if (correctCount !== 1) {
                errors.correctAnswer = `Exactly one correct answer is required (currently ${correctCount})`
            }
        }

        if (editedStep.type === 'info') {
            if (!editedStep.content?.patientName) {
                errors.patientName = 'Patient Name is required'
            } else if (!/^[a-zA-Z\s\u0600-\u06FF]+$/.test(editedStep.content.patientName)) {
                errors.patientName = 'Name must contain letters only'
            }
            if (!editedStep.content?.age) errors.age = 'Age is required'
            if (!editedStep.content?.gender) errors.gender = 'Gender is required'
            if (!editedStep.content?.description) errors.description = 'Description is required'
            if (!editedStep.content?.chiefComplaint) errors.chiefComplaint = 'Chief Complaint is required'
        }

        if (editedStep.type === 'history') {
            if (!editedStep.content?.title) errors.title = 'Title is required'
            const questions = editedStep.content?.questions || []
            if (questions.length === 0) {
                errors.questions = 'At least 1 question is required'
            }
            questions.forEach((q, idx) => {
                if (!q.question) errors[`questions[${idx}].question`] = 'Question Text is required'
                if (!q.answer) errors[`questions[${idx}].answer`] = 'Answer is required'
            })
        }

        if (editedStep.type === 'investigation') {
            const investigations = editedStep.investigations || []
            const xrays = editedStep.xrays || []
            if (investigations.length === 0 && xrays.length === 0) {
                errors.investigations = 'At least 1 investigation or X-ray is required'
            }

            investigations.forEach((inv, idx) => {
                if (!inv.groupLabel) errors[`investigations[${idx}].groupLabel`] = 'Group Label is required'
                if (!inv.testName) errors[`investigations[${idx}].testName`] = 'Test Name is required'
                if (!inv.description) errors[`investigations[${idx}].description`] = 'Description is required'
            })

            // Validate X-ray image URLs (required)
            xrays.forEach((xray, idx) => {
                if (!xray.label) errors[`xrays[${idx}].label`] = 'Label is required'
                if (!xray.imageUrl || !xray.imageUrl.trim()) {
                    errors[`xray_${idx}_image`] = 'X-Ray Image URL is required'
                } else if (!isValidImageUrl(xray.imageUrl)) {
                    errors[`xray_${idx}_image`] = 'Please enter a valid Image URL (http(s):// or data:image/)'
                }
            })
        }

        return errors
    }

    const isValidImageUrl = (url) => {
        if (!url) return false
        const trimmed = url.trim()
        return /^https?:\/\/.+/.test(trimmed) || /^data:image\/.+/.test(trimmed)
    }



    const errors = validate()
    const hasErrors = Object.keys(errors).length > 0

    const handleSave = async () => {
        // Mark all fields as touched
        setTouched({ all: true })

        if (hasErrors) {
            toast.error('Please fix validation errors before saving')
            return
        }

        setSaving(true)
        try {
            await onSave(editedStep)
        } catch (e) {
            toast.error('Failed to save: ' + e.message)
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
                {step.type === 'info' && <InfoStepEditor editedStep={editedStep} updateContent={updateContent} errors={errors} touched={touched} setTouched={setTouched} />}
                {step.type === 'history' && <HistoryStepEditor editedStep={editedStep} setEditedStep={setEditedStep} errors={errors} touched={touched} setTouched={setTouched} />}
                {step.type === 'mcq' && <McqStepEditor editedStep={editedStep} setEditedStep={setEditedStep} errors={errors} touched={touched} setTouched={setTouched} />}
                {step.type === 'investigation' && <InvestigationStepEditor editedStep={editedStep} setEditedStep={setEditedStep} errors={errors} touched={touched} setTouched={setTouched} />}
                {(step.type === 'diagnosis' || step.type === 'treatment') && (
                    <GenericStepEditor editedStep={editedStep} setEditedStep={setEditedStep} />
                )}
            </div>

            <div className="step-editor-footer">
                <button className="btn-secondary" onClick={onCancel} disabled={saving}>
                    Close
                </button>
                <button className="btn-primary" onClick={handleSave} disabled={saving || hasErrors}>
                    {saving ? 'Saving...' : 'Save Step'}
                </button>
            </div>
            {touched.all && hasErrors && (
                <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.5rem', textAlign: 'center' }}>
                    Please fix the errors above before saving.
                </div>
            )}
        </div>
    )
}

// Info Step Editor
function InfoStepEditor({ editedStep, updateContent, errors, touched, setTouched }) {
    const handleBlur = (field) => {
        setTouched(prev => ({ ...prev, [field]: true }))
    }

    return (
        <div className="form-grid">
            <label>
                Patient Name <span style={{ color: 'red' }}>*</span>
                <input
                    value={editedStep.content?.patientName || ''}
                    onChange={(e) => updateContent('patientName', e.target.value)}
                    onBlur={() => handleBlur('patientName')}
                    placeholder="Ms. A"
                    style={{ borderColor: touched.patientName && errors.patientName ? 'red' : undefined }}
                />
                {touched.patientName && errors.patientName && (
                    <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors.patientName}</span>
                )}
            </label>
            <label>
                Age <span style={{ color: 'red' }}>*</span>
                <input
                    type="number"
                    value={editedStep.content?.age || ''}
                    onChange={(e) => updateContent('age', parseInt(e.target.value))}
                    onBlur={() => handleBlur('age')}
                    placeholder="54"
                    style={{ borderColor: touched.age && errors.age ? 'red' : undefined }}
                />
                {touched.age && errors.age && (
                    <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors.age}</span>
                )}
            </label>
            <label>
                Gender <span style={{ color: 'red' }}>*</span>
                <select
                    value={editedStep.content?.gender || 'Female'}
                    onChange={(e) => updateContent('gender', e.target.value)}
                    onBlur={() => handleBlur('gender')}
                    style={{ borderColor: touched.gender && errors.gender ? 'red' : undefined }}
                >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                </select>
                {touched.gender && errors.gender && (
                    <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors.gender}</span>
                )}
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
                Description <span style={{ color: 'red' }}>*</span>
                <textarea
                    value={editedStep.content?.description || ''}
                    onChange={(e) => updateContent('description', e.target.value)}
                    onBlur={() => handleBlur('description')}
                    rows={3}
                    placeholder="I have had knee pain for a few months..."
                    style={{ borderColor: touched.description && errors.description ? 'red' : undefined }}
                />
                {touched.description && errors.description && (
                    <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors.description}</span>
                )}
            </label>
            <label style={{ gridColumn: '1 / -1' }}>
                Chief Complaint (Arabic/Patient's words) <span style={{ color: 'red' }}>*</span>
                <textarea
                    value={editedStep.content?.chiefComplaint || ''}
                    onChange={(e) => updateContent('chiefComplaint', e.target.value)}
                    onBlur={() => handleBlur('chiefComplaint')}
                    rows={2}
                    placeholder="طلوع ونزل السلم بيتعبوني..."
                    style={{ borderColor: touched.chiefComplaint && errors.chiefComplaint ? 'red' : undefined }}
                />
                {touched.chiefComplaint && errors.chiefComplaint && (
                    <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors.chiefComplaint}</span>
                )}
            </label>
        </div>
    )
}

// History Step Editor
function HistoryStepEditor({ editedStep, setEditedStep, errors, touched, setTouched }) {
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
                Title <span style={{ color: 'red' }}>*</span>
                <input
                    value={editedStep.content?.title || ''}
                    onChange={(e) => setEditedStep({ ...editedStep, content: { ...editedStep.content, title: e.target.value } })}
                    onBlur={() => setTouched(prev => ({ ...prev, title: true }))}
                    placeholder="History of Pain"
                    style={{ borderColor: touched.title && errors.title ? 'red' : undefined }}
                />
                {touched.title && errors.title && (
                    <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors.title}</span>
                )}
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
                                Question Text <span style={{ color: 'red' }}>*</span>
                                <textarea
                                    value={q.question || ''}
                                    onChange={(e) => updateQuestion(idx, 'question', e.target.value)}
                                    onBlur={() => setTouched(prev => ({ ...prev, [`questions[${idx}].question`]: true }))}
                                    rows={2}
                                    placeholder="When did the pain start?"
                                    style={{ borderColor: touched[`questions[${idx}].question`] && errors[`questions[${idx}].question`] ? 'red' : undefined }}
                                />
                                {touched[`questions[${idx}].question`] && errors[`questions[${idx}].question`] && (
                                    <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors[`questions[${idx}].question`]}</span>
                                )}
                            </label>
                            <label>
                                Icon (Emoji)
                                <EmojiInput
                                    value={q.icon || ''}
                                    onChange={(val) => updateQuestion(idx, 'icon', val)}
                                    placeholder="❓"
                                />
                            </label>
                            <label style={{ gridColumn: '1 / -1' }}>
                                Answer <span style={{ color: 'red' }}>*</span>
                                <textarea
                                    value={q.answer || ''}
                                    onChange={(e) => updateQuestion(idx, 'answer', e.target.value)}
                                    onBlur={() => setTouched(prev => ({ ...prev, [`questions[${idx}].answer`]: true }))}
                                    rows={2}
                                    placeholder="It started about 3 months ago..."
                                    style={{ borderColor: touched[`questions[${idx}].answer`] && errors[`questions[${idx}].answer`] ? 'red' : undefined }}
                                />
                                {touched[`questions[${idx}].answer`] && errors[`questions[${idx}].answer`] && (
                                    <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors[`questions[${idx}].answer`]}</span>
                                )}
                            </label>
                        </div>
                    </div>
                ))}

                {questions.length === 0 && (
                    <p style={{ color: '#6b7280', fontStyle: 'italic' }}>No questions added yet. Click "Add Question" to start.</p>
                )}
                {touched.all && errors.questions && (
                    <p style={{ color: '#ef4444', fontSize: '0.9rem', marginTop: '0.5rem' }}>{errors.questions}</p>
                )}
            </div>
        </div>
    )
}

// MCQ Step Editor
function McqStepEditor({ editedStep, setEditedStep, errors, touched, setTouched }) {
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
                Question/Prompt <span style={{ color: 'red' }}>*</span>
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
                    style={{ borderColor: touched.all && errors.question ? 'red' : undefined }}
                />
                {touched.all && errors.question && (
                    <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors.question}</span>
                )}
            </label>

            <label>
                Max Score <span style={{ color: 'red' }}>*</span>
                <input
                    type="number"
                    value={editedStep.maxScore || 10}
                    onChange={(e) => {
                        const val = parseInt(e.target.value)
                        if (!isNaN(val) && val >= 1 && val <= 10) {
                            setEditedStep({ ...editedStep, maxScore: val })
                        }
                    }}
                    min={1}
                    max={10}
                    placeholder="10"
                    style={{ borderColor: touched.all && errors.maxScore ? 'red' : undefined }}
                />
                {touched.all && errors.maxScore && (
                    <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors.maxScore}</span>
                )}
            </label>

            <label style={{ gridColumn: '2 / -1' }}>
                Explanation on Fail <span style={{ color: 'red' }}>*</span>
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
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input
                                    type="checkbox"
                                    checked={opt.isCorrect || false}
                                    onChange={(e) => updateOption(idx, 'isCorrect', e.target.checked)}
                                />
                                Is Correct Answer
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
                {touched.all && errors.options && (
                    <p style={{ color: '#ef4444', fontSize: '0.9rem', marginTop: '0.5rem' }}>{errors.options}</p>
                )}
                {touched.all && errors.correctAnswer && (
                    <p style={{ color: '#ef4444', fontSize: '0.9rem', marginTop: '0.5rem' }}>{errors.correctAnswer}</p>
                )}
            </div>
        </div>
    )
}

// Investigation Step Editor
function InvestigationStepEditor({ editedStep, setEditedStep, errors, touched, setTouched }) {
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
                                Group Label <span style={{ color: 'red' }}>*</span>
                                <input
                                    value={inv.groupLabel || ''}
                                    onChange={(e) => updateInvestigation(idx, 'groupLabel', e.target.value)}
                                    onBlur={() => setTouched(prev => ({ ...prev, [`investigations[${idx}].groupLabel`]: true }))}
                                    placeholder="Physical Examination"
                                    style={{ borderColor: touched[`investigations[${idx}].groupLabel`] && errors[`investigations[${idx}].groupLabel`] ? 'red' : undefined }}
                                />
                                {touched[`investigations[${idx}].groupLabel`] && errors[`investigations[${idx}].groupLabel`] && (
                                    <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors[`investigations[${idx}].groupLabel`]}</span>
                                )}
                            </label>
                            <label>
                                Test Name <span style={{ color: 'red' }}>*</span>
                                <input
                                    value={inv.testName || ''}
                                    onChange={(e) => updateInvestigation(idx, 'testName', e.target.value)}
                                    onBlur={() => setTouched(prev => ({ ...prev, [`investigations[${idx}].testName`]: true }))}
                                    placeholder="Lachman Test"
                                    style={{ borderColor: touched[`investigations[${idx}].testName`] && errors[`investigations[${idx}].testName`] ? 'red' : undefined }}
                                />
                                {touched[`investigations[${idx}].testName`] && errors[`investigations[${idx}].testName`] && (
                                    <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors[`investigations[${idx}].testName`]}</span>
                                )}
                            </label>
                            <label style={{ gridColumn: '1 / -1' }}>
                                Description <span style={{ color: 'red' }}>*</span>
                                <textarea
                                    value={inv.description || ''}
                                    onChange={(e) => updateInvestigation(idx, 'description', e.target.value)}
                                    onBlur={() => setTouched(prev => ({ ...prev, [`investigations[${idx}].description`]: true }))}
                                    rows={2}
                                    placeholder="Test to assess ACL integrity..."
                                    style={{ borderColor: touched[`investigations[${idx}].description`] && errors[`investigations[${idx}].description`] ? 'red' : undefined }}
                                />
                                {touched[`investigations[${idx}].description`] && errors[`investigations[${idx}].description`] && (
                                    <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors[`investigations[${idx}].description`]}</span>
                                )}
                            </label>
                            <label>
                                Result
                                <select
                                    value={inv.result || ''}
                                    onChange={(e) => updateInvestigation(idx, 'result', e.target.value)}
                                >
                                    <option value="">Select Result</option>
                                    <option value="Positive">Positive</option>
                                    <option value="Negative">Negative</option>
                                    <option value="Inconclusive">Inconclusive</option>
                                </select>
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
                {touched.all && errors.investigations && (
                    <p style={{ color: '#ef4444', fontSize: '0.9rem', marginTop: '0.5rem' }}>{errors.investigations}</p>
                )}
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
                                Label <span style={{ color: 'red' }}>*</span>
                                <input
                                    value={xray.label || ''}
                                    onChange={(e) => updateXray(idx, 'label', e.target.value)}
                                    onBlur={() => setTouched(prev => ({ ...prev, [`xrays[${idx}].label`]: true }))}
                                    placeholder="AP View"
                                    style={{ borderColor: touched[`xrays[${idx}].label`] && errors[`xrays[${idx}].label`] ? 'red' : undefined }}
                                />
                                {touched[`xrays[${idx}].label`] && errors[`xrays[${idx}].label`] && (
                                    <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors[`xrays[${idx}].label`]}</span>
                                )}
                            </label>
                            <label>
                                Icon (Emoji)
                                <EmojiInput
                                    value={xray.icon || ''}
                                    onChange={(val) => updateXray(idx, 'icon', val)}
                                    placeholder="🩻"
                                />
                            </label>
                            <label style={{ gridColumn: '1 / -1' }}>
                                Image URL (base64 or URL) <span style={{ color: 'red' }}>*</span>
                                <textarea
                                    value={xray.imageUrl || ''}
                                    onChange={(e) => updateXray(idx, 'imageUrl', e.target.value)}
                                    onBlur={() => setTouched(prev => ({ ...prev, [`xray_${idx}_image`]: true }))}
                                    rows={3}
                                    placeholder="data:image/png;base64,... or https://..."
                                    style={{ borderColor: touched[`xray_${idx}_image`] && errors[`xray_${idx}_image`] ? 'red' : undefined }}
                                />
                                {touched[`xray_${idx}_image`] && errors[`xray_${idx}_image`] && (
                                    <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors[`xray_${idx}_image`]}</span>
                                )}
                            </label>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// Generic Step Editor (for diagnosis, treatment, etc.)
function GenericStepEditor({ editedStep, setEditedStep }) {
    return (
        <div className="form-grid">
            <label style={{ gridColumn: '1 / -1' }}>
                Content (JSON)
                <textarea
                    value={JSON.stringify(editedStep.content || {}, null, 2)}
                    onChange={(e) => {
                        try {
                            const parsed = JSON.parse(e.target.value)
                            setEditedStep({ ...editedStep, content: parsed })
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