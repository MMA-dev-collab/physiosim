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
            if (!editedStep.explanationOnFail) {
                errors.explanationOnFail = 'Explanation on fail is required'
            }

            // Expected Time Validation - Moved inside hint_enabled check
            /* 
            const et = editedStep.expected_time
            if (et === undefined || et === null || et === '') {
                errors.expected_time = 'Expected time is required'
            } else {
                const num = parseInt(et)
                if (isNaN(num) || num < 1 || num > 600) {
                    errors.expected_time = 'Expected time must be between 1 and 600 seconds'
                }
            } 
            */

            const options = editedStep.options || []
            if (options.length < 2) {
                errors.options = 'At least 2 options are required'
            }
            options.forEach((opt, idx) => {
                if (!opt.label) {
                    errors[`options[${idx}].label`] = `Option ${idx + 1} text is required`
                }
                if (!opt.feedback) {
                    errors[`options[${idx}].feedback`] = `Feedback for Option ${idx + 1} is required`
                }
            })
            const correctCount = options.filter(o => o.isCorrect).length
            if (correctCount !== 1) {
                errors.correctAnswer = `Exactly one correct answer is required (currently ${correctCount})`
            }

            // Hint Validation - Only run if hint is enabled
            if (editedStep.hint_enabled !== false) {
                if (!editedStep.tag) {
                    errors.tag = 'Tag / Category is required'
                }
                if (!editedStep.hint_text) {
                    errors.hint_text = 'Hint text is required'
                }
                // Expected Time Validation - Optional (has default)
                const et = editedStep.expected_time
                if (et !== undefined && et !== null && et !== '') {
                    const num = parseInt(et)
                    if (isNaN(num) || num < 1 || num > 600) {
                        errors.expected_time = 'Expected time must be between 1 and 600 seconds'
                    }
                }
            }
        }

        if (editedStep.type === 'info') {
            if (!editedStep.content?.patientName) {
                errors.patientName = 'Patient Name is required'
            } else if (!/^[a-zA-Z\s\u0600-\u06FF]+$/.test(editedStep.content.patientName)) {
                errors.patientName = 'Name must contain letters only'
            }
            if (!editedStep.content?.age && editedStep.content?.age !== 0) {
                errors.age = 'Age is required'
            } else {
                const age = parseInt(editedStep.content.age)
                if (isNaN(age) || age < 1 || age > 110) {
                    errors.age = 'Age must be between 1 and 110'
                }
            }
            if (!editedStep.content?.gender) errors.gender = 'Gender is required'
            if (!editedStep.content?.description) errors.description = 'Description is required'
            if (!editedStep.content?.chiefComplaint) errors.chiefComplaint = 'Chief Complaint is required'

            if (editedStep.content?.imageUrl && !isValidImageUrl(editedStep.content.imageUrl)) {
                errors.imageUrl = 'Please enter a valid Image URL (http(s):// or data:image/)'
            }
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
                if (!inv.result) errors[`investigations[${idx}].result`] = 'Result is required'
                if (inv.videoUrl && !isValidYouTubeUrl(inv.videoUrl)) {
                    errors[`investigations[${idx}].videoUrl`] = 'Please enter a valid Youtube Video URL (https://www.youtube.com/watch?v=...)'
                }
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

        if (editedStep.type === 'essay') {
            const essayQuestions = editedStep.essayQuestions || [];
            if (essayQuestions.length === 0) {
                errors.essayQuestions = 'At least 1 essay question is required';
            }
            essayQuestions.forEach((eq, idx) => {
                if (!eq.question_text) {
                    errors[`essayQuestions[${idx}].question_text`] = 'Question text is required';
                }
                if (!eq.keywords || eq.keywords.length === 0) {
                    errors[`essayQuestions[${idx}].keywords`] = 'At least 1 keyword is required';
                }
            });
        }

        return errors
    }

    const isValidYouTubeUrl = (url) => {
        if (!url) return false
        const trimmed = url.trim()
        return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/.test(trimmed)
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
                <div className="header-actions">
                    {/* Placeholder for future header-level buttons */}
                </div>
            </div>

            <div className="step-editor-body">
                {step.type === 'info' && <InfoStepEditor editedStep={editedStep} updateContent={updateContent} errors={errors} touched={touched} setTouched={setTouched} />}
                {step.type === 'history' && <HistoryStepEditor editedStep={editedStep} setEditedStep={setEditedStep} errors={errors} touched={touched} setTouched={setTouched} />}
                {step.type === 'mcq' && <McqStepEditor editedStep={editedStep} setEditedStep={setEditedStep} errors={errors} touched={touched} setTouched={setTouched} />}
                {step.type === 'investigation' && <InvestigationStepEditor editedStep={editedStep} setEditedStep={setEditedStep} errors={errors} touched={touched} setTouched={setTouched} />}
                {step.type === 'essay' && <EssayStepEditor editedStep={editedStep} setEditedStep={setEditedStep} errors={errors} touched={touched} setTouched={setTouched} />}
                {(step.type === 'diagnosis' || step.type === 'treatment') && (
                    <GenericStepEditor editedStep={editedStep} setEditedStep={setEditedStep} />
                )}

                {touched.all && hasErrors && (
                    <div className="validation-error" style={{ justifyContent: 'center', marginTop: '1.5rem', padding: '1rem', background: '#fef2f2', borderRadius: '8px' }}>
                        <span>⚠️</span> Please fix the validation errors before saving.
                    </div>
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
                <div className="flex items-center gap-1">
                    Patient Name <span className="text-red-500">*</span>
                </div>
                <input
                    value={editedStep.content?.patientName || ''}
                    onChange={(e) => updateContent('patientName', e.target.value)}
                    onBlur={() => handleBlur('patientName')}
                    placeholder="Ms. A"
                    style={{ borderColor: touched.patientName && errors.patientName ? 'var(--step-editor-danger)' : undefined }}
                />
                {touched.patientName && errors.patientName && (
                    <span className="validation-error"><span>⚠️</span>{errors.patientName}</span>
                )}
            </label>
            <label>
                <div className="flex items-center gap-1">
                    Age <span className="text-red-500">*</span>
                </div>
                <input
                    type="number"
                    min="1"
                    max="110"
                    value={editedStep.content?.age ?? ''}
                    onChange={(e) => {
                        const val = e.target.value
                        if (val !== '' && !/^\d+$/.test(val)) return
                        updateContent('age', val === '' ? '' : parseInt(val))
                    }}
                    onKeyDown={(e) => {
                        if (['-', '+', 'e', 'E', '.'].includes(e.key)) {
                            e.preventDefault()
                        }
                    }}
                    onBlur={() => handleBlur('age')}
                    placeholder="54"
                    style={{ borderColor: (touched.all || touched.age) && errors.age ? 'var(--step-editor-danger)' : undefined }}
                />
                {touched.age && errors.age && (
                    <span className="validation-error"><span>⚠️</span>{errors.age}</span>
                )}
            </label>
            <label>
                <div className="flex items-center gap-1">
                    Gender <span className="text-red-500">*</span>
                </div>
                <select
                    value={editedStep.content?.gender || ''}
                    onChange={(e) => updateContent('gender', e.target.value)}
                    onBlur={() => handleBlur('gender')}
                    style={{ borderColor: touched.gender && errors.gender ? 'var(--step-editor-danger)' : undefined }}
                >
                    <option value="" disabled>Select Gender</option>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                </select>
                {touched.gender && errors.gender && (
                    <span className="validation-error"><span>⚠️</span>{errors.gender}</span>
                )}
            </label>
            <label>
                Image URL (optional)
                <input
                    value={editedStep.content?.imageUrl || ''}
                    onChange={(e) => updateContent('imageUrl', e.target.value)}
                    onBlur={() => handleBlur('imageUrl')}
                    placeholder="https://... or data:image/..."
                    style={{ borderColor: touched.imageUrl && errors.imageUrl ? 'var(--step-editor-danger)' : undefined }}
                />
                {touched.imageUrl && errors.imageUrl && (
                    <span className="validation-error"><span>⚠️</span>{errors.imageUrl}</span>
                )}
            </label>
            <label style={{ gridColumn: '1 / -1' }}>
                <div className="flex items-center gap-1">
                    Description <span className="text-red-500">*</span>
                </div>
                <textarea
                    value={editedStep.content?.description || ''}
                    onChange={(e) => updateContent('description', e.target.value)}
                    onBlur={() => handleBlur('description')}
                    rows={4}
                    placeholder="I have had knee pain for a few months..."
                    style={{ borderColor: touched.description && errors.description ? 'var(--step-editor-danger)' : undefined }}
                />
                {touched.description && errors.description && (
                    <span className="validation-error"><span>⚠️</span>{errors.description}</span>
                )}
            </label>
            <label style={{ gridColumn: '1 / -1' }}>
                <div className="flex items-center gap-1">
                    Chief Complaint (Arabic/Patient's words) <span className="text-red-500">*</span>
                </div>
                <textarea
                    value={editedStep.content?.chiefComplaint || ''}
                    onChange={(e) => updateContent('chiefComplaint', e.target.value)}
                    onBlur={() => handleBlur('chiefComplaint')}
                    rows={2}
                    placeholder="طلوع ونزل السلم بيتعبوني..."
                    style={{ borderColor: touched.chiefComplaint && errors.chiefComplaint ? 'var(--step-editor-danger)' : undefined }}
                />
                {touched.chiefComplaint && errors.chiefComplaint && (
                    <span className="validation-error"><span>⚠️</span>{errors.chiefComplaint}</span>
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
                <div className="flex items-center gap-1">
                    Title <span className="text-red-500">*</span>
                </div>
                <input
                    value={editedStep.content?.title || ''}
                    onChange={(e) => setEditedStep({ ...editedStep, content: { ...editedStep.content, title: e.target.value } })}
                    onBlur={() => setTouched(prev => ({ ...prev, title: true }))}
                    placeholder="History of Pain"
                    style={{ borderColor: touched.title && errors.title ? 'var(--step-editor-danger)' : undefined }}
                />
                {touched.title && errors.title && (
                    <span className="validation-error"><span>⚠️</span>{errors.title}</span>
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

            <div style={{ gridColumn: '1 / -1', marginTop: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Questions</h4>
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
                                <div className="flex items-center gap-1">
                                    Question Text <span className="text-red-500">*</span>
                                </div>
                                <textarea
                                    value={q.question || ''}
                                    onChange={(e) => updateQuestion(idx, 'question', e.target.value)}
                                    onBlur={() => setTouched(prev => ({ ...prev, [`questions[${idx}].question`]: true }))}
                                    rows={2}
                                    placeholder="When did the pain start?"
                                    style={{ borderColor: touched[`questions[${idx}].question`] && errors[`questions[${idx}].question`] ? 'var(--step-editor-danger)' : undefined }}
                                />
                                {touched[`questions[${idx}].question`] && errors[`questions[${idx}].question`] && (
                                    <span className="validation-error"><span>⚠️</span>{errors[`questions[${idx}].question`]}</span>
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
                                <div className="flex items-center gap-1">
                                    Answer <span className="text-red-500">*</span>
                                </div>
                                <textarea
                                    value={q.answer || ''}
                                    onChange={(e) => updateQuestion(idx, 'answer', e.target.value)}
                                    onBlur={() => setTouched(prev => ({ ...prev, [`questions[${idx}].answer`]: true }))}
                                    rows={2}
                                    placeholder="It started about 3 months ago..."
                                    style={{ borderColor: touched[`questions[${idx}].answer`] && errors[`questions[${idx}].answer`] ? 'var(--step-editor-danger)' : undefined }}
                                />
                                {touched[`questions[${idx}].answer`] && errors[`questions[${idx}].answer`] && (
                                    <span className="validation-error"><span>⚠️</span>{errors[`questions[${idx}].answer`]}</span>
                                )}
                            </label>
                        </div>
                    </div>
                ))}

                {questions.length === 0 && (
                    <div style={{ padding: '2rem', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '2px dashed #e2e8f0', color: '#64748b' }}>
                        No questions added yet. Click "+ Add Question" to start.
                    </div>
                )}
                {touched.all && errors.questions && (
                    <p className="validation-error" style={{ marginTop: '1rem' }}><span>⚠️</span>{errors.questions}</p>
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
                <div className="flex items-center gap-1">
                    Question/Prompt <span className="text-red-500">*</span>
                </div>
                <textarea
                    value={editedStep.content?.prompt || editedStep.question || ''}
                    onChange={(e) => {
                        setEditedStep({
                            ...editedStep,
                            question: e.target.value,
                            content: { ...editedStep.content, prompt: e.target.value }
                        })
                    }}
                    onBlur={() => setTouched(prev => ({ ...prev, question: true }))}
                    rows={3}
                    placeholder="What is the MOST appropriate next action?"
                    style={{ borderColor: (touched.all || touched.question) && errors.question ? 'var(--step-editor-danger)' : undefined }}
                />
                {(touched.all || touched.question) && errors.question && (
                    <span className="validation-error"><span>⚠️</span>{errors.question}</span>
                )}
            </label>

            <label>
                <div className="flex items-center gap-1">
                    Max Score <span className="text-red-500">*</span>
                </div>
                <input
                    type="number"
                    value={editedStep.maxScore || 10}
                    onChange={(e) => {
                        const val = parseInt(e.target.value)
                        setEditedStep({ ...editedStep, maxScore: isNaN(val) ? '' : val })
                    }}
                    onBlur={() => setTouched(prev => ({ ...prev, maxScore: true }))}
                    min={1}
                    max={10}
                    placeholder="10"
                    style={{ borderColor: (touched.all || touched.maxScore) && errors.maxScore ? 'var(--step-editor-danger)' : undefined }}
                />
                {(touched.all || touched.maxScore) && errors.maxScore && (
                    <span className="validation-error"><span>⚠️</span>{errors.maxScore}</span>
                )}
            </label>

            <label style={{ gridColumn: '2 / -1' }}>
                <div className="flex items-center gap-1">
                    Explanation on Fail <span className="text-red-500">*</span>
                </div>
                <input
                    value={editedStep.explanationOnFail || ''}
                    onChange={(e) => setEditedStep({ ...editedStep, explanationOnFail: e.target.value })}
                    onBlur={() => setTouched(prev => ({ ...prev, explanationOnFail: true }))}
                    placeholder="Remember that..."
                    style={{ borderColor: (touched.all || touched.explanationOnFail) && errors.explanationOnFail ? 'var(--step-editor-danger)' : undefined }}
                />
                {(touched.all || touched.explanationOnFail) && errors.explanationOnFail && (
                    <span className="validation-error"><span>⚠️</span>{errors.explanationOnFail}</span>
                )}
            </label>

            <div className="adaptive-feedback-box" style={{ gridColumn: '1 / -1' }}>
                <div className="adaptive-header">
                    <h4 className="adaptive-title">
                        <span>💡</span> Adaptive Feedback Settings
                    </h4>
                    <label className="hint-toggle">
                        <span>Enable Hint</span>
                        <input
                            type="checkbox"
                            checked={editedStep.hint_enabled !== false}
                            onChange={(e) => {
                                const isEnabled = e.target.checked;
                                if (!isEnabled) {
                                    // RESET STATE: Clear all hint related fields and errors
                                    setEditedStep({
                                        ...editedStep,
                                        hint_enabled: false,
                                        hint_text: "",
                                        tag: "",
                                        expected_time: ""
                                    });
                                    // Clear touched state for hint-related fields
                                    setTouched(prev => {
                                        const newTouched = { ...prev };
                                        delete newTouched.hint_text;
                                        delete newTouched.tag;
                                        delete newTouched.expected_time;
                                        return newTouched;
                                    });
                                } else {
                                    setEditedStep({ ...editedStep, hint_enabled: true });
                                }
                            }}
                        />
                    </label>
                </div>

                {editedStep.hint_enabled !== false && (
                    <div className="form-grid" style={{ transition: 'all 0.3s ease' }}>
                        <label>
                            <div className="flex items-center gap-1">
                                Tag / Category <span className="text-red-500">*</span>
                            </div>
                            <select
                                value={editedStep.tag || ''}
                                onChange={(e) => setEditedStep({ ...editedStep, tag: e.target.value })}
                                onBlur={() => setTouched(prev => ({ ...prev, tag: true }))}
                                style={{ borderColor: (touched.all || touched.tag) && errors.tag ? 'var(--step-editor-danger)' : undefined }}
                            >
                                <option value="">Select Tag</option>
                                <option value="Anatomy">Anatomy</option>
                                <option value="Diagnosis">Diagnosis</option>
                                <option value="MSK">MSK</option>
                                <option value="Imaging">Imaging</option>
                                <option value="Treatment">Treatment</option>
                                <option value="Physiology">Physiology</option>
                            </select>
                            {(touched.all || touched.tag) && errors.tag ? (
                                <span className="validation-error"><span>⚠️</span>{errors.tag}</span>
                            ) : (
                                <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 400 }}>Used for performance analysis</span>
                            )}
                        </label>
                        <label>
                            <div className="flex items-center gap-1">
                                Expected Time (seconds)
                            </div>
                            <input
                                type="number"
                                value={editedStep.expected_time ?? ''}
                                onChange={(e) => {
                                    const val = e.target.value
                                    if (val !== '' && !/^\d+$/.test(val)) return
                                    setEditedStep({ ...editedStep, expected_time: val === '' ? '' : parseInt(val) })
                                }}
                                onKeyDown={(e) => {
                                    if (['-', '+', 'e', 'E', '.'].includes(e.key)) {
                                        e.preventDefault()
                                    }
                                }}
                                onBlur={() => setTouched(prev => ({ ...prev, expected_time: true }))}
                                min={1}
                                max={600}
                                placeholder="45"
                                style={{ borderColor: (touched.all || touched.expected_time) && errors.expected_time ? 'var(--step-editor-danger)' : undefined }}
                            />
                            {(touched.all || touched.expected_time) && errors.expected_time ? (
                                <span className="validation-error"><span>⚠️</span>{errors.expected_time}</span>
                            ) : (
                                <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 400 }}>Threshold for idle hint (1-600s)</span>
                            )}
                        </label>
                        <label style={{ gridColumn: '1 / -1' }}>
                            <div className="flex items-center gap-1">
                                Hint Text <span className="text-red-500">*</span>
                            </div>
                            <textarea
                                value={editedStep.hint_text || ''}
                                onChange={(e) => setEditedStep({ ...editedStep, hint_text: e.target.value })}
                                onBlur={() => setTouched(prev => ({ ...prev, hint_text: true }))}
                                rows={2}
                                placeholder="A contextual hint to show when the student is stuck..."
                                style={{ borderColor: (touched.all || touched.hint_text) && errors.hint_text ? 'var(--step-editor-danger)' : undefined }}
                            />
                            {(touched.all || touched.hint_text) && errors.hint_text ? (
                                <span className="validation-error"><span>⚠️</span>{errors.hint_text}</span>
                            ) : (
                                <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 400 }}>Shown automatically after {editedStep.expected_time || 45}s of inactivity</span>
                            )}
                        </label>
                    </div>
                )}
            </div>

            <div style={{ gridColumn: '1 / -1', marginTop: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Options (Min 2, Max 6)</h4>
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
                                <div className="flex items-center gap-1">
                                    Option Text {idx < 2 && <span className="text-red-500">*</span>}
                                </div>
                                <textarea
                                    value={opt.label || ''}
                                    onChange={(e) => updateOption(idx, 'label', e.target.value)}
                                    onBlur={() => setTouched(prev => ({ ...prev, [`options[${idx}].label`]: true }))}
                                    rows={2}
                                    placeholder="Order MRI of the knee immediately"
                                    style={{ borderColor: (touched.all || touched[`options[${idx}].label`]) && errors[`options[${idx}].label`] ? 'var(--step-editor-danger)' : undefined }}
                                />
                                {(touched.all || touched[`options[${idx}].label`]) && errors[`options[${idx}].label`] && (
                                    <span className="validation-error"><span>⚠️</span>{errors[`options[${idx}].label`]}</span>
                                )}
                            </label>
                            <label style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={opt.isCorrect || false}
                                    onChange={(e) => updateOption(idx, 'isCorrect', e.target.checked)}
                                    style={{ width: '18px', height: '18px' }}
                                />
                                <span style={{ fontWeight: 600 }}>Is Correct Answer</span>
                            </label>
                            <label style={{ gridColumn: '1 / -1' }}>
                                <div className="flex items-center gap-1">
                                    Feedback <span className="text-red-500">*</span>
                                </div>
                                <input
                                    value={opt.feedback || ''}
                                    onChange={(e) => updateOption(idx, 'feedback', e.target.value)}
                                    onBlur={() => setTouched(prev => ({ ...prev, [`options[${idx}].feedback`]: true }))}
                                    placeholder="Jumping to advanced imaging without..."
                                    style={{ borderColor: (touched.all || touched[`options[${idx}].feedback`]) && errors[`options[${idx}].feedback`] ? 'var(--step-editor-danger)' : undefined }}
                                />
                                {(touched.all || touched[`options[${idx}].feedback`]) && errors[`options[${idx}].feedback`] && (
                                    <span className="validation-error"><span>⚠️</span>{errors[`options[${idx}].feedback`]}</span>
                                )}
                            </label>
                        </div>
                    </div>
                ))}

                {options.length < 2 && (
                    <div style={{ padding: '1rem', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fee2e2', color: '#ef4444', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>⚠️</span> At least 2 options are required for an MCQ step.
                    </div>
                )}
                {touched.all && (errors.options || errors.correctAnswer) && (
                    <div className="validation-error" style={{ marginTop: '1rem' }}>
                        <span>⚠️</span> {errors.options || errors.correctAnswer}
                    </div>
                )}
            </div>
        </div >
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
            <div style={{ gridColumn: '1 / -1', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Investigations/Tests</h4>
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
                                <div className="flex items-center gap-1">
                                    Group Label <span className="text-red-500">*</span>
                                </div>
                                <input
                                    value={inv.groupLabel || ''}
                                    onChange={(e) => updateInvestigation(idx, 'groupLabel', e.target.value)}
                                    onBlur={() => setTouched(prev => ({ ...prev, [`investigations[${idx}].groupLabel`]: true }))}
                                    placeholder="Physical Examination"
                                    style={{ borderColor: touched[`investigations[${idx}].groupLabel`] && errors[`investigations[${idx}].groupLabel`] ? 'var(--step-editor-danger)' : undefined }}
                                />
                                {touched[`investigations[${idx}].groupLabel`] && errors[`investigations[${idx}].groupLabel`] && (
                                    <span className="validation-error"><span>⚠️</span>{errors[`investigations[${idx}].groupLabel`]}</span>
                                )}
                            </label>
                            <label>
                                <div className="flex items-center gap-1">
                                    Test Name <span className="text-red-500">*</span>
                                </div>
                                <input
                                    value={inv.testName || ''}
                                    onChange={(e) => updateInvestigation(idx, 'testName', e.target.value)}
                                    onBlur={() => setTouched(prev => ({ ...prev, [`investigations[${idx}].testName`]: true }))}
                                    placeholder="Lachman Test"
                                    style={{ borderColor: touched[`investigations[${idx}].testName`] && errors[`investigations[${idx}].testName`] ? 'var(--step-editor-danger)' : undefined }}
                                />
                                {touched[`investigations[${idx}].testName`] && errors[`investigations[${idx}].testName`] && (
                                    <span className="validation-error"><span>⚠️</span>{errors[`investigations[${idx}].testName`]}</span>
                                )}
                            </label>
                            <label style={{ gridColumn: '1 / -1' }}>
                                <div className="flex items-center gap-1">
                                    Description <span className="text-red-500">*</span>
                                </div>
                                <textarea
                                    value={inv.description || ''}
                                    onChange={(e) => updateInvestigation(idx, 'description', e.target.value)}
                                    onBlur={() => setTouched(prev => ({ ...prev, [`investigations[${idx}].description`]: true }))}
                                    rows={2}
                                    placeholder="Test to assess ACL integrity..."
                                    style={{ borderColor: touched[`investigations[${idx}].description`] && errors[`investigations[${idx}].description`] ? 'var(--step-editor-danger)' : undefined }}
                                />
                                {touched[`investigations[${idx}].description`] && errors[`investigations[${idx}].description`] && (
                                    <span className="validation-error"><span>⚠️</span>{errors[`investigations[${idx}].description`]}</span>
                                )}
                            </label>
                            <label>
                                <div className="flex items-center gap-1">
                                    Result <span className="text-red-500">*</span>
                                </div>
                                <select
                                    value={inv.result || ''}
                                    onChange={(e) => updateInvestigation(idx, 'result', e.target.value)}
                                    onBlur={() => setTouched(prev => ({ ...prev, [`investigations[${idx}].result`]: true }))}
                                    style={{ borderColor: touched[`investigations[${idx}].result`] && errors[`investigations[${idx}].result`] ? 'var(--step-editor-danger)' : undefined }}
                                >
                                    <option value="" disabled>Select Result</option>
                                    <option value="Positive">Positive</option>
                                    <option value="Negative">Negative</option>
                                    <option value="Inconclusive">Inconclusive</option>
                                </select>
                                {touched[`investigations[${idx}].result`] && errors[`investigations[${idx}].result`] && (
                                    <span className="validation-error"><span>⚠️</span>{errors[`investigations[${idx}].result`]}</span>
                                )}
                            </label>
                            <label>
                                Video URL (optional)
                                <input
                                    value={inv.videoUrl || ''}
                                    onChange={(e) => updateInvestigation(idx, 'videoUrl', e.target.value)}
                                    onBlur={() => setTouched(prev => ({ ...prev, [`investigations[${idx}].videoUrl`]: true }))}
                                    placeholder="https://youtube.com/watch?v=..."
                                    style={{ borderColor: touched[`investigations[${idx}].videoUrl`] && errors[`investigations[${idx}].videoUrl`] ? 'var(--step-editor-danger)' : undefined }}
                                />
                                {touched[`investigations[${idx}].videoUrl`] && errors[`investigations[${idx}].videoUrl`] && (
                                    <span className="validation-error"><span>⚠️</span>{errors[`investigations[${idx}].videoUrl`]}</span>
                                )}
                            </label>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>X-rays/Imaging</h4>
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
                                <div className="flex items-center gap-1">
                                    Label <span className="text-red-500">*</span>
                                </div>
                                <input
                                    value={xray.label || ''}
                                    onChange={(e) => updateXray(idx, 'label', e.target.value)}
                                    onBlur={() => setTouched(prev => ({ ...prev, [`xrays[${idx}].label`]: true }))}
                                    placeholder="AP View"
                                    style={{ borderColor: touched[`xrays[${idx}].label`] && errors[`xrays[${idx}].label`] ? 'var(--step-editor-danger)' : undefined }}
                                />
                                {touched[`xrays[${idx}].label`] && errors[`xrays[${idx}].label`] && (
                                    <span className="validation-error"><span>⚠️</span>{errors[`xrays[${idx}].label`]}</span>
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
                                <div className="flex items-center gap-1">
                                    Image URL (base64 or URL) <span className="text-red-500">*</span>
                                </div>
                                <textarea
                                    value={xray.imageUrl || ''}
                                    onChange={(e) => updateXray(idx, 'imageUrl', e.target.value)}
                                    onBlur={() => setTouched(prev => ({ ...prev, [`xray_${idx}_image`]: true }))}
                                    rows={3}
                                    placeholder="data:image/png;base64,... or https://..."
                                    style={{ borderColor: touched[`xray_${idx}_image`] && errors[`xray_${idx}_image`] ? 'var(--step-editor-danger)' : undefined }}
                                />
                                {touched[`xray_${idx}_image`] && errors[`xray_${idx}_image`] && (
                                    <span className="validation-error"><span>⚠️</span>{errors[`xray_${idx}_image`]}</span>
                                )}
                            </label>
                        </div>
                    </div>
                ))}
            </div>

            {touched.all && errors.investigations && (
                <div className="validation-error" style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                    <span>⚠️</span> {errors.investigations}
                </div>
            )}
        </div>
    )
}

// Generic Step Editor (for diagnosis, treatment, etc.)
function GenericStepEditor({ editedStep, setEditedStep }) {
    return (
        <div className="form-grid">
            <label style={{ gridColumn: '1 / -1' }}>
                <div className="flex items-center gap-1 mb-2">
                    Advanced Content (JSON)
                </div>
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
                    rows={12}
                    style={{ fontFamily: 'monospace', fontSize: '0.875rem', background: '#f8fafc' }}
                    placeholder='{}'
                />
                <span style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.5rem' }}>⚠️ Manual JSON editing is for advanced users only.</span>
            </label>
        </div>
    )
}

// Essay Step Editor
function EssayStepEditor({ editedStep, setEditedStep, errors, touched, setTouched }) {
    const essayQuestions = editedStep.essayQuestions || [];

    const addEssayQuestion = () => {
        const newQuestions = [...essayQuestions, {
            question_text: '',
            keywords: [],
            synonyms: [],
            max_score: editedStep.maxScore || 10,
            perfect_answer: ''
        }];
        setEditedStep({
            ...editedStep,
            essayQuestions: newQuestions
        });
    };

    const removeEssayQuestion = (index) => {
        const newQuestions = essayQuestions.filter((_, i) => i !== index);
        setEditedStep({
            ...editedStep,
            essayQuestions: newQuestions
        });
    };

    const updateEssayQuestion = (index, field, value) => {
        const newQuestions = [...essayQuestions];
        newQuestions[index] = { ...newQuestions[index], [field]: value };
        setEditedStep({
            ...editedStep,
            essayQuestions: newQuestions
        });
    };

    const addKeyword = (questionIndex, keyword) => {
        if (!keyword.trim()) return;
        const newQuestions = [...essayQuestions];
        const keywords = newQuestions[questionIndex].keywords || [];
        if (!keywords.includes(keyword.trim())) {
            newQuestions[questionIndex].keywords = [...keywords, keyword.trim()];
            setEditedStep({ ...editedStep, essayQuestions: newQuestions });
        }
    };

    const removeKeyword = (questionIndex, keywordIndex) => {
        const newQuestions = [...essayQuestions];
        newQuestions[questionIndex].keywords = newQuestions[questionIndex].keywords.filter((_, i) => i !== keywordIndex);
        setEditedStep({ ...editedStep, essayQuestions: newQuestions });
    };

    const addSynonym = (questionIndex, synonym) => {
        if (!synonym.trim()) return;
        const newQuestions = [...essayQuestions];
        const synonyms = newQuestions[questionIndex].synonyms || [];
        if (!synonyms.includes(synonym.trim())) {
            newQuestions[questionIndex].synonyms = [...synonyms, synonym.trim()];
            setEditedStep({ ...editedStep, essayQuestions: newQuestions });
        }
    };

    const removeSynonym = (questionIndex, synonymIndex) => {
        const newQuestions = [...essayQuestions];
        newQuestions[questionIndex].synonyms = newQuestions[questionIndex].synonyms.filter((_, i) => i !== synonymIndex);
        setEditedStep({ ...editedStep, essayQuestions: newQuestions });
    };

    return (
        <div className="form-grid">
            <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Essay Questions</h4>
                    <button type="button" className="btn-secondary btn-small" onClick={addEssayQuestion}>
                        + Add Essay Question
                    </button>
                </div>

                {essayQuestions.map((eq, idx) => (
                    <div key={idx} className="array-item">
                        <div className="array-item-header">
                            <span>Essay Question {idx + 1}</span>
                            <button type="button" className="btn-delete-small" onClick={() => removeEssayQuestion(idx)}>
                                🗑
                            </button>
                        </div>
                        <div className="form-grid">
                            <label style={{ gridColumn: '1 / -1' }}>
                                <div className="flex items-center gap-1">
                                    Question Text <span className="text-red-500">*</span>
                                </div>
                                <textarea
                                    value={eq.question_text || ''}
                                    onChange={(e) => updateEssayQuestion(idx, 'question_text', e.target.value)}
                                    onBlur={() => setTouched(prev => ({ ...prev, [`essayQuestions[${idx}].question_text`]: true }))}
                                    rows={3}
                                    placeholder="Describe the pathophysiology of the patient's condition..."
                                    style={{
                                        borderColor: touched[`essayQuestions[${idx}].question_text`] && errors[`essayQuestions[${idx}].question_text`]
                                            ? 'var(--step-editor-danger)'
                                            : undefined
                                    }}
                                />
                                {touched[`essayQuestions[${idx}].question_text`] && errors[`essayQuestions[${idx}].question_text`] && (
                                    <span className="validation-error"><span>⚠️</span>{errors[`essayQuestions[${idx}].question_text`]}</span>
                                )}
                            </label>

                            <label style={{ gridColumn: '1 / -1' }}>
                                <div className="flex items-center gap-1">
                                    Keywords <span className="text-red-500">*</span>
                                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 400 }}>
                                        (Press Enter to add)
                                    </span>
                                </div>
                                <TagInput
                                    tags={eq.keywords || []}
                                    onAdd={(keyword) => addKeyword(idx, keyword)}
                                    onRemove={(keywordIdx) => removeKeyword(idx, keywordIdx)}
                                    placeholder="Type keyword and press Enter..."
                                />
                                {touched[`essayQuestions[${idx}].keywords`] && errors[`essayQuestions[${idx}].keywords`] && (
                                    <span className="validation-error"><span>⚠️</span>{errors[`essayQuestions[${idx}].keywords`]}</span>
                                )}
                            </label>

                            <label style={{ gridColumn: '1 / -1' }}>
                                <div className="flex items-center gap-1">
                                    Synonyms (Optional)
                                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 400 }}>
                                        (Press Enter to add)
                                    </span>
                                </div>
                                <TagInput
                                    tags={eq.synonyms || []}
                                    onAdd={(synonym) => addSynonym(idx, synonym)}
                                    onRemove={(synonymIdx) => removeSynonym(idx, synonymIdx)}
                                    placeholder="Type synonym and press Enter..."
                                />
                            </label>

                            <label style={{ gridColumn: '1 / -1' }}>
                                <div className="flex items-center gap-1">
                                    Perfect Answer (Optional)
                                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 400 }}>
                                        (Model answer for students to compare)
                                    </span>
                                </div>
                                <textarea
                                    value={eq.perfect_answer || ''}
                                    onChange={(e) => updateEssayQuestion(idx, 'perfect_answer', e.target.value)}
                                    rows={5}
                                    placeholder="Enter the ideal answer that students can view after submission..."
                                    style={{
                                        fontFamily: 'inherit',
                                        fontSize: '0.95rem'
                                    }}
                                />
                            </label>

                            <label>
                                Max Score (Optional)
                                <input
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={eq.max_score || editedStep.maxScore || 10}
                                    onChange={(e) => updateEssayQuestion(idx, 'max_score', parseInt(e.target.value))}
                                    placeholder="10"
                                />
                            </label>
                        </div>
                    </div>
                ))}

                {essayQuestions.length === 0 && (
                    <div style={{
                        padding: '2rem',
                        textAlign: 'center',
                        background: '#f8fafc',
                        borderRadius: '12px',
                        border: '2px dashed #e2e8f0',
                        color: '#64748b'
                    }}>
                        No essay questions added yet. Click "+ Add Essay Question" to start.
                    </div>
                )}
                {touched.all && errors.essayQuestions && (
                    <p className="validation-error" style={{ marginTop: '1rem' }}>
                        <span>⚠️</span>{errors.essayQuestions}
                    </p>
                )}
            </div>

            <div className="adaptive-feedback-box" style={{ gridColumn: '1 / -1' }}>
                <div className="adaptive-header">
                    <h4 className="adaptive-title">
                        <span>💡</span> Adaptive Feedback Settings
                    </h4>
                    <label className="hint-toggle">
                        <span>Enable Hint</span>
                        <input
                            type="checkbox"
                            checked={editedStep.hint_enabled !== false}
                            onChange={(e) => {
                                const isEnabled = e.target.checked;
                                if (!isEnabled) {
                                    // RESET STATE: Clear all hint related fields and errors
                                    setEditedStep({
                                        ...editedStep,
                                        hint_enabled: false,
                                        hint_text: "",
                                        tag: "",
                                        expected_time: ""
                                    });
                                    // Clear touched state for hint-related fields
                                    setTouched(prev => {
                                        const newTouched = { ...prev };
                                        delete newTouched.hint_text;
                                        delete newTouched.tag;
                                        delete newTouched.expected_time;
                                        return newTouched;
                                    });
                                } else {
                                    setEditedStep({ ...editedStep, hint_enabled: true });
                                }
                            }}
                        />
                    </label>
                </div>

                {editedStep.hint_enabled !== false && (
                    <div className="form-grid" style={{ transition: 'all 0.3s ease' }}>
                        <label>
                            <div className="flex items-center gap-1">
                                Tag / Category <span className="text-red-500">*</span>
                            </div>
                            <select
                                value={editedStep.tag || ''}
                                onChange={(e) => setEditedStep({ ...editedStep, tag: e.target.value })}
                                onBlur={() => setTouched(prev => ({ ...prev, tag: true }))}
                                style={{ borderColor: (touched.all || touched.tag) && errors.tag ? 'var(--step-editor-danger)' : undefined }}
                            >
                                <option value="">Select Tag</option>
                                <option value="Anatomy">Anatomy</option>
                                <option value="Diagnosis">Diagnosis</option>
                                <option value="MSK">MSK</option>
                                <option value="Imaging">Imaging</option>
                                <option value="Treatment">Treatment</option>
                                <option value="Physiology">Physiology</option>
                            </select>
                            {(touched.all || touched.tag) && errors.tag ? (
                                <span className="validation-error"><span>⚠️</span>{errors.tag}</span>
                            ) : (
                                <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 400 }}>Used for performance analysis</span>
                            )}
                        </label>
                        <label>
                            <div className="flex items-center gap-1">
                                Expected Time (seconds)
                            </div>
                            <input
                                type="number"
                                value={editedStep.expected_time ?? ''}
                                onChange={(e) => {
                                    const val = e.target.value
                                    if (val !== '' && !/^\d+$/.test(val)) return
                                    setEditedStep({ ...editedStep, expected_time: val === '' ? '' : parseInt(val) })
                                }}
                                onKeyDown={(e) => {
                                    if (['-', '+', 'e', 'E', '.'].includes(e.key)) {
                                        e.preventDefault()
                                    }
                                }}
                                onBlur={() => setTouched(prev => ({ ...prev, expected_time: true }))}
                                min={1}
                                max={600}
                                placeholder="45"
                                style={{ borderColor: (touched.all || touched.expected_time) && errors.expected_time ? 'var(--step-editor-danger)' : undefined }}
                            />
                            {(touched.all || touched.expected_time) && errors.expected_time ? (
                                <span className="validation-error"><span>⚠️</span>{errors.expected_time}</span>
                            ) : (
                                <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 400 }}>Threshold for idle hint (1-600s)</span>
                            )}
                        </label>
                        <label style={{ gridColumn: '1 / -1' }}>
                            <div className="flex items-center gap-1">
                                Hint Text <span className="text-red-500">*</span>
                            </div>
                            <textarea
                                value={editedStep.hint_text || ''}
                                onChange={(e) => setEditedStep({ ...editedStep, hint_text: e.target.value })}
                                onBlur={() => setTouched(prev => ({ ...prev, hint_text: true }))}
                                rows={2}
                                placeholder="A contextual hint to show when the student is stuck..."
                                style={{ borderColor: (touched.all || touched.hint_text) && errors.hint_text ? 'var(--step-editor-danger)' : undefined }}
                            />
                            {(touched.all || touched.hint_text) && errors.hint_text ? (
                                <span className="validation-error"><span>⚠️</span>{errors.hint_text}</span>
                            ) : (
                                <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 400 }}>Shown automatically after {editedStep.expected_time || 45}s of inactivity</span>
                            )}
                        </label>
                    </div>
                )}
            </div>
        </div>
    );
}

// Tag Input Component for Keywords/Synonyms
function TagInput({ tags, onAdd, onRemove, placeholder }) {
    const [inputValue, setInputValue] = React.useState('');

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (inputValue.trim()) {
                onAdd(inputValue.trim());
                setInputValue('');
            }
        }
    };

    return (
        <div>
            <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                {tags.map((tag, idx) => (
                    <span
                        key={idx}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '0.25rem 0.5rem',
                            background: '#e0e7ff',
                            color: '#3730a3',
                            borderRadius: '4px',
                            fontSize: '0.875rem'
                        }}
                    >
                        {tag}
                        <button
                            type="button"
                            onClick={() => onRemove(idx)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#3730a3',
                                cursor: 'pointer',
                                padding: '0',
                                fontSize: '1rem',
                                lineHeight: '1'
                            }}
                        >
                            ×
                        </button>
                    </span>
                ))}
            </div>
        </div>
    );
}