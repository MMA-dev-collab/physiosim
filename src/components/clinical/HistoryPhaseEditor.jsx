import React, { useState } from 'react'
import ImageUpload from '../common/ImageUpload'
import './PhaseEditors.css'

/**
 * History Phase Editor
 * Handles: Present History, History of Pain, Past History, Medication
 */
export function HistoryPhaseEditor({ step, onUpdate, errors, touched, setTouched }) {
    const content = step.content || {}
    const category = step.category

    const updateField = (field, value) => {
        onUpdate({
            ...step,
            content: { ...content, [field]: value }
        })
    }

    const handleBlur = (field) => {
        setTouched(prev => ({ ...prev, [field]: true }))
    }

    // Present History
    if (category === 'present_history') {
        return (
            <div className="phase-editor history-phase">
                <div className="phase-header">
                    <h4>📋 Present History</h4>
                    <p>Capture the patient's main complaint and story</p>
                </div>
                <div className="form-grid">
                    <label style={{ gridColumn: '1 / -1' }}>
                        <div className="label-row">
                            Chief Complaint (English) <span className="required">*</span>
                        </div>
                        <textarea
                            value={content.chief_complaint || ''}
                            onChange={(e) => updateField('chief_complaint', e.target.value)}
                            onBlur={() => handleBlur('chief_complaint')}
                            rows={3}
                            placeholder="Pain in the neck, heaviness in the arms, cannot turn head..."
                            className={touched.chief_complaint && errors?.chief_complaint ? 'error' : ''}
                        />
                        {touched.chief_complaint && errors?.chief_complaint && (
                            <span className="validation-error">⚠️ {errors.chief_complaint}</span>
                        )}
                    </label>
                    <label style={{ gridColumn: '1 / -1' }}>
                        <div className="label-row">
                            Chief Complaint (Arabic/Patient's Words)
                        </div>
                        <textarea
                            value={content.chief_complaint_arabic || ''}
                            onChange={(e) => updateField('chief_complaint_arabic', e.target.value)}
                            rows={2}
                            placeholder="الم في الرقبة مسمع لحد نص ضهري..."
                            dir="rtl"
                        />
                    </label>
                    <label style={{ gridColumn: '1 / -1' }}>
                        Notes
                        <textarea
                            value={content.notes || ''}
                            onChange={(e) => updateField('notes', e.target.value)}
                            rows={2}
                            placeholder="Additional context..."
                        />
                    </label>
                </div>
            </div>
        )
    }

    // History of Pain
    if (category === 'history_of_pain') {
        const painHistory = content.pain_history || {}

        const updatePainField = (field, value) => {
            updateField('pain_history', { ...painHistory, [field]: value })
        }

        const addFactor = (type) => {
            const current = painHistory[type] || []
            updatePainField(type, [...current, ''])
        }

        const updateFactor = (type, index, value) => {
            const current = [...(painHistory[type] || [])]
            current[index] = value
            updatePainField(type, current)
        }

        const removeFactor = (type, index) => {
            const current = (painHistory[type] || []).filter((_, i) => i !== index)
            updatePainField(type, current)
        }

        return (
            <div className="phase-editor history-phase">
                <div className="phase-header">
                    <h4>📊 History of Pain</h4>
                    <p>Structured pain assessment data</p>
                </div>
                <div className="form-grid">
                    <label>
                        <div className="label-row">
                            Pain Intensity (0-10) <span className="required">*</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="10"
                            value={painHistory.intensity ?? 5}
                            onChange={(e) => updatePainField('intensity', parseInt(e.target.value))}
                        />
                        <div className="range-value">{painHistory.intensity ?? 5}/10</div>
                    </label>
                    <label>
                        <div className="label-row">
                            Frequency <span className="required">*</span>
                        </div>
                        <select
                            value={painHistory.frequency || ''}
                            onChange={(e) => updatePainField('frequency', e.target.value)}
                        >
                            <option value="">Select frequency</option>
                            <option value="persistent">Persistent</option>
                            <option value="intermittent">Intermittent</option>
                            <option value="occasional">Occasional</option>
                            <option value="constant">Constant</option>
                        </select>
                    </label>
                    <label>
                        <div className="label-row">Onset</div>
                        <select
                            value={painHistory.onset || ''}
                            onChange={(e) => updatePainField('onset', e.target.value)}
                        >
                            <option value="">Select onset</option>
                            <option value="acute">Acute</option>
                            <option value="chronic">Chronic</option>
                            <option value="acute_on_chronic">Acute on Chronic</option>
                        </select>
                    </label>
                    <label>
                        <div className="label-row">Course</div>
                        <select
                            value={painHistory.course || ''}
                            onChange={(e) => updatePainField('course', e.target.value)}
                        >
                            <option value="">Select course</option>
                            <option value="progressive">Progressive</option>
                            <option value="stable">Stable</option>
                            <option value="improving">Improving</option>
                            <option value="fluctuating">Fluctuating</option>
                        </select>
                    </label>
                    <label>
                        <div className="label-row">Time of Day</div>
                        <input
                            value={painHistory.time_of_day || ''}
                            onChange={(e) => updatePainField('time_of_day', e.target.value)}
                            placeholder="Morning, evening, constant..."
                        />
                    </label>

                    {/* Aggravating Factors */}
                    <div className="factor-section" style={{ gridColumn: '1 / -1' }}>
                        <div className="section-header">
                            <h5>Aggravating Factors</h5>
                            <button type="button" className="btn-small" onClick={() => addFactor('aggravating_factors')}>
                                + Add
                            </button>
                        </div>
                        <div className="factor-list">
                            {(painHistory.aggravating_factors || []).map((factor, idx) => (
                                <div key={idx} className="factor-item">
                                    <input
                                        value={factor}
                                        onChange={(e) => updateFactor('aggravating_factors', idx, e.target.value)}
                                        placeholder="e.g., lifting heavy objects"
                                    />
                                    <button type="button" className="btn-delete-small" onClick={() => removeFactor('aggravating_factors', idx)}>×</button>
                                </div>
                            ))}
                            {(painHistory.aggravating_factors || []).length === 0 && (
                                <p className="empty-state">No aggravating factors added</p>
                            )}
                        </div>
                    </div>

                    {/* Relieving Factors */}
                    <div className="factor-section" style={{ gridColumn: '1 / -1' }}>
                        <div className="section-header">
                            <h5>Relieving Factors</h5>
                            <button type="button" className="btn-small" onClick={() => addFactor('relieving_factors')}>
                                + Add
                            </button>
                        </div>
                        <div className="factor-list">
                            {(painHistory.relieving_factors || []).map((factor, idx) => (
                                <div key={idx} className="factor-item">
                                    <input
                                        value={factor}
                                        onChange={(e) => updateFactor('relieving_factors', idx, e.target.value)}
                                        placeholder="e.g., resting"
                                    />
                                    <button type="button" className="btn-delete-small" onClick={() => removeFactor('relieving_factors', idx)}>×</button>
                                </div>
                            ))}
                            {(painHistory.relieving_factors || []).length === 0 && (
                                <p className="empty-state">No relieving factors added</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Past History
    if (category === 'past_history') {
        const conditions = content.conditions || []

        const addCondition = () => {
            onUpdate({
                ...step,
                content: { ...content, conditions: [...conditions, { condition: '', since: '', notes: '' }] }
            })
        }

        const updateCondition = (index, field, value) => {
            const updated = [...conditions]
            updated[index] = { ...updated[index], [field]: value }
            onUpdate({ ...step, content: { ...content, conditions: updated } })
        }

        const removeCondition = (index) => {
            onUpdate({
                ...step,
                content: { ...content, conditions: conditions.filter((_, i) => i !== index) }
            })
        }

        return (
            <div className="phase-editor history-phase">
                <div className="phase-header">
                    <h4>🏥 Past History</h4>
                    <p>Previous medical conditions</p>
                </div>
                <div className="dynamic-list">
                    <div className="section-header">
                        <h5>Conditions</h5>
                        <button type="button" className="btn-small" onClick={addCondition}>+ Add Condition</button>
                    </div>
                    {conditions.map((cond, idx) => (
                        <div key={idx} className="list-item">
                            <div className="item-header">
                                <span>Condition {idx + 1}</span>
                                <button type="button" className="btn-delete-small" onClick={() => removeCondition(idx)}>🗑</button>
                            </div>
                            <div className="form-grid">
                                <label>
                                    Condition <span className="required">*</span>
                                    <input
                                        value={cond.condition || ''}
                                        onChange={(e) => updateCondition(idx, 'condition', e.target.value)}
                                        placeholder="Diabetes, Hypertension..."
                                    />
                                </label>
                                <label>
                                    Since
                                    <input
                                        value={cond.since || ''}
                                        onChange={(e) => updateCondition(idx, 'since', e.target.value)}
                                        placeholder="2019, 5 years ago..."
                                    />
                                </label>
                                <label style={{ gridColumn: '1 / -1' }}>
                                    Notes
                                    <textarea
                                        value={cond.notes || ''}
                                        onChange={(e) => updateCondition(idx, 'notes', e.target.value)}
                                        rows={2}
                                        placeholder="Additional notes..."
                                    />
                                </label>
                            </div>
                        </div>
                    ))}
                    {conditions.length === 0 && (
                        <div className="empty-state-box">
                            No past history recorded. Click "+ Add Condition" if applicable, or leave empty for "N/A".
                        </div>
                    )}
                </div>
            </div>
        )
    }

    // Medication
    if (category === 'medication') {
        const medications = content.medications || []

        const addMedication = () => {
            onUpdate({
                ...step,
                content: { ...content, medications: [...medications, { name: '', dose: '', frequency: '', notes: '' }] }
            })
        }

        const updateMedication = (index, field, value) => {
            const updated = [...medications]
            updated[index] = { ...updated[index], [field]: value }
            onUpdate({ ...step, content: { ...content, medications: updated } })
        }

        const removeMedication = (index) => {
            onUpdate({
                ...step,
                content: { ...content, medications: medications.filter((_, i) => i !== index) }
            })
        }

        return (
            <div className="phase-editor history-phase">
                <div className="phase-header">
                    <h4>💊 Medication</h4>
                    <p>Current medications</p>
                </div>
                <div className="dynamic-list">
                    <div className="section-header">
                        <h5>Medications</h5>
                        <button type="button" className="btn-small" onClick={addMedication}>+ Add Medication</button>
                    </div>
                    {medications.map((med, idx) => (
                        <div key={idx} className="list-item">
                            <div className="item-header">
                                <span>Medication {idx + 1}</span>
                                <button type="button" className="btn-delete-small" onClick={() => removeMedication(idx)}>🗑</button>
                            </div>
                            <div className="form-grid">
                                <label>
                                    Name <span className="required">*</span>
                                    <input
                                        value={med.name || ''}
                                        onChange={(e) => updateMedication(idx, 'name', e.target.value)}
                                        placeholder="Ibuprofen, Paracetamol..."
                                    />
                                </label>
                                <label>
                                    Dose
                                    <input
                                        value={med.dose || ''}
                                        onChange={(e) => updateMedication(idx, 'dose', e.target.value)}
                                        placeholder="400mg, 500mg..."
                                    />
                                </label>
                                <label>
                                    Frequency
                                    <input
                                        value={med.frequency || ''}
                                        onChange={(e) => updateMedication(idx, 'frequency', e.target.value)}
                                        placeholder="Twice daily, PRN..."
                                    />
                                </label>
                                <label>
                                    Notes
                                    <input
                                        value={med.notes || ''}
                                        onChange={(e) => updateMedication(idx, 'notes', e.target.value)}
                                        placeholder="Additional notes..."
                                    />
                                </label>
                            </div>
                        </div>
                    ))}
                    {medications.length === 0 && (
                        <div className="empty-state-box">
                            No medications recorded. Click "+ Add Medication" if applicable.
                        </div>
                    )}
                </div>
            </div>
        )
    }

    return <div className="phase-editor">Unknown History category: {category}</div>
}

export default HistoryPhaseEditor
