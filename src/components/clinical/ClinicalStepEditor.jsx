import React, { useState } from 'react'
import { useToast } from '../../context/ToastContext'
import { CLINICAL_PHASES, PHASE_CATEGORIES, getCategoryById } from '../../config/clinicalPhases'
import { HistoryPhaseEditor } from './HistoryPhaseEditor'
import CompositeHistoryEditor from './CompositeHistoryEditor'
import { AssessmentPhaseEditor } from './AssessmentPhaseEditor'
import CompositeAssessmentEditor from './CompositeAssessmentEditor'
import { DiagnosisPhaseEditor, ProblemPhaseEditor, TreatmentPhaseEditor } from './ClinicalPhaseEditors'
import ImageUpload from '../common/ImageUpload'
import './PhaseEditors.css'

/**
 * ClinicalStepEditor - Unified wrapper for all clinical phase editors
 * Routes to the correct phase editor based on step.phase and step.category
 */
export default function ClinicalStepEditor({ step, allSteps, onSave, onCancel }) {
    const [editedStep, setEditedStep] = useState({ ...step })
    const [saving, setSaving] = useState(false)
    const [touched, setTouched] = useState({})
    const { toast } = useToast()

    const handleStepUpdate = (updatedStep) => {
        setEditedStep(updatedStep)
    }

    const validate = () => {
        const errors = {}
        const { phase, category, content } = editedStep

        // Phase-specific validation
        if (phase === 'history_presentation') {
            if (category === 'present_history') {
                if (!content?.chief_complaint?.trim()) {
                    errors.chief_complaint = 'Chief complaint is required'
                }
            }
            if (category === 'history_of_pain') {
                const pain = content?.pain_history || {}
                if (pain.intensity === null || pain.intensity === undefined) {
                    errors.pain_intensity = 'Pain intensity is required'
                }
                if (!pain.frequency) {
                    errors.pain_frequency = 'Frequency is required'
                }
            }
        }

        if (phase === 'diagnosis') {
            const eq = editedStep.essayQuestions && editedStep.essayQuestions[0]
            if (!eq || !eq.keywords || eq.keywords.length === 0) {
                errors.diagnosisKeywords = 'At least 1 expected keyword is required for diagnosis'
            }
            if (!eq || !eq.perfect_answer?.trim()) {
                errors.diagnosisPerfectAnswer = 'Correct diagnosis (perfect answer) is required'
            }
        }

        if (phase === 'problem_list') {
            const problems = editedStep.essayQuestions || []
            if (problems.length === 0) {
                errors.problems = 'At least one expected problem is required'
            }
            problems.forEach((p, idx) => {
                if (!p.question_text?.trim()) {
                    errors[`problem_${idx}_label`] = `Problem ${idx + 1} name is required`
                }
            })
        }

        if (phase === 'treatment') {
            const treatments = content?.treatments || []
            if (treatments.length === 0) {
                errors.treatments = 'At least one treatment is required'
            }
        }

        return errors
    }

    const errors = validate()
    const hasErrors = Object.keys(errors).length > 0

    const handleSave = async () => {
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

    // Get phase and category info
    const phaseInfo = CLINICAL_PHASES.find(p => p.id === editedStep.phase)
    const categoryInfo = getCategoryById(editedStep.phase, editedStep.category)

    // Render the appropriate phase editor
    const renderPhaseEditor = () => {
        const editorProps = {
            step: editedStep,
            allSteps,
            onUpdate: handleStepUpdate,
            errors,
            touched,
            setTouched
        }

        switch (editedStep.phase) {
            case 'case_overview':
                return (
                    <div className="phase-editor case-overview-editor">
                        <div className="editor-section">
                            <h4>Visual Presentation</h4>
                            <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
                                Upload an image that represents the clinical scenario to be displayed alongside the patient card.
                            </p>
                            <div className="form-group">
                                <label>Patient Image</label>
                                <ImageUpload
                                    label="Upload Image"
                                    folderType="step-image"
                                    initialUrl={editedStep.content?.imageUrl}
                                    onUpload={(url) => handleStepUpdate({ ...editedStep, content: { ...editedStep.content, imageUrl: url } })}
                                />
                                <div style={{ marginTop: '1rem' }}>
                                    <label style={{ fontSize: '0.85rem', color: '#64748b' }}>Or enter image URL manually:</label>
                                    <input
                                        type="url"
                                        value={editedStep.content?.imageUrl || ''}
                                        onChange={(e) => handleStepUpdate({ ...editedStep, content: { ...editedStep.content, imageUrl: e.target.value } })}
                                        placeholder="https://..."
                                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px', marginTop: '0.25rem' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )
            case 'history_presentation':
                if (editedStep.category === 'composite_history') {
                    return <CompositeHistoryEditor step={editedStep} onUpdate={handleStepUpdate} />
                }
                return <HistoryPhaseEditor {...editorProps} />
            case 'assessment':
                if (editedStep.content?.sections || editedStep.category === 'composite') {
                    return <CompositeAssessmentEditor step={editedStep} onUpdate={handleStepUpdate} />
                }
                return <AssessmentPhaseEditor {...editorProps} />
            case 'imaging':
                return <CompositeAssessmentEditor step={editedStep} onUpdate={handleStepUpdate} />
            case 'diagnosis':
                return <DiagnosisPhaseEditor {...editorProps} />
            case 'problem_list':
                return <ProblemPhaseEditor {...editorProps} />
            case 'treatment':
                return <TreatmentPhaseEditor {...editorProps} />
            default:
                return <div className="phase-editor">Unknown phase: {editedStep.phase}</div>
        }
    }

    return (
        <div className="clinical-step-editor">
            <div className="step-editor-header">
                <div className="header-info">
                    <span className="phase-badge" style={{ background: getPhaseColor(editedStep.phase) }}>
                        {phaseInfo?.icon} {phaseInfo?.shortLabel || editedStep.phase}
                    </span>
                    <h3>{categoryInfo?.label || editedStep.category}</h3>
                </div>
                <div className="header-meta">
                    {categoryInfo?.inputMode === 'user_input' && (
                        <span className="input-mode-badge user">User Input</span>
                    )}
                </div>
            </div>

            <div className="step-editor-body">
                <div className="form-group mb-6" style={{ padding: '0 1.5rem' }}>
                    <label className="text-slate-500 font-bold uppercase tracking-wider text-xs mb-2 block">Step Name (Optional)</label>
                    <input 
                        type="text"
                        value={editedStep.title || ''}
                        onChange={(e) => handleStepUpdate({ ...editedStep, title: e.target.value })}
                        placeholder="e.g. Observation, Palpation, Examination..."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-semibold"
                    />
                    <p className="text-[10px] text-slate-400 mt-1.5 ml-1 italic">This title will identify the step in the builder and runner sidebar.</p>
                </div>

                {renderPhaseEditor()}

                {touched.all && hasErrors && (
                    <div className="validation-summary">
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

// Helper function for phase colors
function getPhaseColor(phase) {
    const colors = {
        case_overview: 'linear-gradient(135deg, #a855f7, #9333ea)', // Purple gradient
        history_presentation: 'linear-gradient(135deg, #10b981, #059669)',
        assessment: 'linear-gradient(135deg, #3b82f6, #2563eb)',
        imaging: 'linear-gradient(135deg, #0ea5e9, #0ea5e9)', // Cyan gradient
        diagnosis: 'linear-gradient(135deg, #f59e0b, #d97706)',
        problem_list: 'linear-gradient(135deg, #ef4444, #dc2626)',
        treatment: 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
    }
    return colors[phase] || 'linear-gradient(135deg, #6b7280, #4b5563)'
}

export { ClinicalStepEditor }
