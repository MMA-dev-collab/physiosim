import React, { useState } from 'react'
import { useToast } from '../../context/ToastContext'
import { CLINICAL_PHASES, PHASE_CATEGORIES, getCategoryById } from '../../config/clinicalPhases'
import { HistoryPhaseEditor } from './HistoryPhaseEditor'
import { AssessmentPhaseEditor } from './AssessmentPhaseEditor'
import { DiagnosisPhaseEditor, ProblemPhaseEditor, TreatmentPhaseEditor } from './ClinicalPhaseEditors'
import './PhaseEditors.css'

/**
 * ClinicalStepEditor - Unified wrapper for all clinical phase editors
 * Routes to the correct phase editor based on step.phase and step.category
 */
export default function ClinicalStepEditor({ step, onSave, onCancel }) {
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
            const diagnoses = content?.diagnoses || []
            if (diagnoses.length === 0) {
                errors.diagnoses = 'At least one diagnosis is required'
            }
            diagnoses.forEach((d, idx) => {
                if (!d.label?.trim()) {
                    errors[`diagnosis_${idx}_label`] = `Diagnosis ${idx + 1} label is required`
                }
            })
        }

        if (phase === 'problem_list') {
            const problems = content?.problems || []
            if (problems.length === 0) {
                errors.problems = 'At least one problem is required'
            }
            problems.forEach((p, idx) => {
                if (!p.label?.trim()) {
                    errors[`problem_${idx}_label`] = `Problem ${idx + 1} label is required`
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
            onUpdate: handleStepUpdate,
            errors,
            touched,
            setTouched
        }

        switch (editedStep.phase) {
            case 'history_presentation':
                return <HistoryPhaseEditor {...editorProps} />
            case 'assessment':
                return <AssessmentPhaseEditor {...editorProps} />
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
        history_presentation: 'linear-gradient(135deg, #10b981, #059669)',
        assessment: 'linear-gradient(135deg, #3b82f6, #2563eb)',
        diagnosis: 'linear-gradient(135deg, #f59e0b, #d97706)',
        problem_list: 'linear-gradient(135deg, #ef4444, #dc2626)',
        treatment: 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
    }
    return colors[phase] || 'linear-gradient(135deg, #6b7280, #4b5563)'
}

export { ClinicalStepEditor }
