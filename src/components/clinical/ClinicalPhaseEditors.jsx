import React from 'react'
import ImageUpload from '../common/ImageUpload'
import './PhaseEditors.css'

/**
 * Diagnosis Phase Editor
 * Handles: Diagnosis entry with supporting findings
 */
export function DiagnosisPhaseEditor({ step, onUpdate, errors, touched, setTouched }) {
    const content = step.content || {}
    const diagnoses = content.diagnoses || []

    const addDiagnosis = () => {
        onUpdate({
            ...step,
            content: {
                ...content,
                diagnoses: [...diagnoses, {
                    code: '',
                    label: '',
                    confidence: 80,
                    supporting_findings: [],
                    notes: '',
                    image_url: ''
                }]
            }
        })
    }

    const updateDiagnosis = (index, field, value) => {
        const updated = [...diagnoses]
        updated[index] = { ...updated[index], [field]: value }
        onUpdate({ ...step, content: { ...content, diagnoses: updated } })
    }

    const removeDiagnosis = (index) => {
        onUpdate({
            ...step,
            content: { ...content, diagnoses: diagnoses.filter((_, i) => i !== index) }
        })
    }

    const addSupportingFinding = (diagIndex) => {
        const updated = [...diagnoses]
        const findings = updated[diagIndex].supporting_findings || []
        updated[diagIndex] = { ...updated[diagIndex], supporting_findings: [...findings, ''] }
        onUpdate({ ...step, content: { ...content, diagnoses: updated } })
    }

    const updateSupportingFinding = (diagIndex, findingIndex, value) => {
        const updated = [...diagnoses]
        const findings = [...(updated[diagIndex].supporting_findings || [])]
        findings[findingIndex] = value
        updated[diagIndex] = { ...updated[diagIndex], supporting_findings: findings }
        onUpdate({ ...step, content: { ...content, diagnoses: updated } })
    }

    const removeSupportingFinding = (diagIndex, findingIndex) => {
        const updated = [...diagnoses]
        const findings = (updated[diagIndex].supporting_findings || []).filter((_, i) => i !== findingIndex)
        updated[diagIndex] = { ...updated[diagIndex], supporting_findings: findings }
        onUpdate({ ...step, content: { ...content, diagnoses: updated } })
    }

    return (
        <div className="phase-editor diagnosis-phase">
            <div className="phase-header user-input-header">
                <h4>🎯 Diagnosis</h4>
                <span className="user-input-badge">User Input</span>
                <p>Working diagnosis based on clinical findings</p>
            </div>
            <div className="dynamic-list">
                <div className="section-header">
                    <h5>Diagnoses</h5>
                    <button type="button" className="btn-small" onClick={addDiagnosis}>+ Add Diagnosis</button>
                </div>
                {diagnoses.map((diag, idx) => (
                    <div key={idx} className="list-item diagnosis-item">
                        <div className="item-header">
                            <span>Diagnosis {idx + 1}</span>
                            <button type="button" className="btn-delete-small" onClick={() => removeDiagnosis(idx)}>🗑</button>
                        </div>
                        <div className="form-grid">
                            <label style={{ gridColumn: '1 / -1' }}>
                                <div className="label-row">
                                    Diagnosis Label <span className="required">*</span>
                                </div>
                                <textarea
                                    value={diag.label || ''}
                                    onChange={(e) => updateDiagnosis(idx, 'label', e.target.value)}
                                    rows={2}
                                    placeholder="e.g., Multiple disc bulge C3-4, C4-5, C5-6. C5-6 touching cord (stenosis), reversed curve"
                                />
                            </label>
                            <label>
                                Diagnosis Code
                                <input
                                    value={diag.code || ''}
                                    onChange={(e) => updateDiagnosis(idx, 'code', e.target.value)}
                                    placeholder="e.g., dx_cervical_disc_bulge_c5_6"
                                />
                            </label>
                            <label>
                                Confidence (%)
                                <div className="range-input-wrapper">
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={diag.confidence ?? 80}
                                        onChange={(e) => updateDiagnosis(idx, 'confidence', parseInt(e.target.value))}
                                    />
                                    <span className="range-value">{diag.confidence ?? 80}%</span>
                                </div>
                            </label>

                            {/* Supporting Findings */}
                            <div className="supporting-findings" style={{ gridColumn: '1 / -1' }}>
                                <div className="section-header">
                                    <h6>Supporting Findings</h6>
                                    <button type="button" className="btn-small btn-tiny" onClick={() => addSupportingFinding(idx)}>+ Add</button>
                                </div>
                                <div className="findings-list">
                                    {(diag.supporting_findings || []).map((finding, fIdx) => (
                                        <div key={fIdx} className="finding-item">
                                            <input
                                                value={finding}
                                                onChange={(e) => updateSupportingFinding(idx, fIdx, e.target.value)}
                                                placeholder="e.g., imaging_c5_6_disc_contact_cord, rom_cervical_rotation_limited..."
                                            />
                                            <button type="button" className="btn-delete-small" onClick={() => removeSupportingFinding(idx, fIdx)}>×</button>
                                        </div>
                                    ))}
                                    {(diag.supporting_findings || []).length === 0 && (
                                        <p className="empty-state">No supporting findings linked</p>
                                    )}
                                </div>
                            </div>

                            <label style={{ gridColumn: '1 / -1' }}>
                                Notes
                                <textarea
                                    value={diag.notes || ''}
                                    onChange={(e) => updateDiagnosis(idx, 'notes', e.target.value)}
                                    rows={2}
                                    placeholder="Additional clinical notes..."
                                />
                            </label>
                        </div>
                    </div>
                ))}
                {diagnoses.length === 0 && (
                    <div className="empty-state-box">
                        No diagnoses entered. Click "+ Add Diagnosis" to define the working diagnosis.
                    </div>
                )}
            </div>
        </div>
    )
}

/**
 * Problem List Phase Editor
 * Handles: Problem entries linked to findings
 */
export function ProblemPhaseEditor({ step, onUpdate, errors, touched, setTouched }) {
    const content = step.content || {}
    const problems = content.problems || []

    const addProblem = () => {
        onUpdate({
            ...step,
            content: {
                ...content,
                problems: [...problems, {
                    id: `prob_${Date.now()}`,
                    label: '',
                    severity: 3,
                    functional_impact: '',
                    supporting_findings: [],
                    priority: 'medium',
                    notes: ''
                }]
            }
        })
    }

    const updateProblem = (index, field, value) => {
        const updated = [...problems]
        updated[index] = { ...updated[index], [field]: value }
        onUpdate({ ...step, content: { ...content, problems: updated } })
    }

    const removeProblem = (index) => {
        onUpdate({
            ...step,
            content: { ...content, problems: problems.filter((_, i) => i !== index) }
        })
    }

    return (
        <div className="phase-editor problem-phase">
            <div className="phase-header user-input-header">
                <h4>📝 Problem List</h4>
                <span className="user-input-badge">User Input</span>
                <p>Actionable problems derived from assessment findings</p>
            </div>
            <div className="dynamic-list">
                <div className="section-header">
                    <h5>Problems</h5>
                    <button type="button" className="btn-small" onClick={addProblem}>+ Add Problem</button>
                </div>
                {problems.map((prob, idx) => (
                    <div key={idx} className="list-item problem-item">
                        <div className="item-header">
                            <span>Problem {idx + 1}</span>
                            <span className={`priority-badge priority-${prob.priority || 'medium'}`}>
                                {prob.priority || 'medium'}
                            </span>
                            <button type="button" className="btn-delete-small" onClick={() => removeProblem(idx)}>🗑</button>
                        </div>
                        <div className="form-grid">
                            <label style={{ gridColumn: '1 / -1' }}>
                                <div className="label-row">
                                    Problem Label <span className="required">*</span>
                                </div>
                                <input
                                    value={prob.label || ''}
                                    onChange={(e) => updateProblem(idx, 'label', e.target.value)}
                                    placeholder="e.g., Reversed Curve, Tight Upper Trap, Limited neck extension..."
                                />
                            </label>
                            <label>
                                Severity (1-5)
                                <div className="range-input-wrapper">
                                    <input
                                        type="range"
                                        min="1"
                                        max="5"
                                        value={prob.severity ?? 3}
                                        onChange={(e) => updateProblem(idx, 'severity', parseInt(e.target.value))}
                                    />
                                    <span className="range-value">{prob.severity ?? 3}/5</span>
                                </div>
                            </label>
                            <label>
                                Priority
                                <select
                                    value={prob.priority || 'medium'}
                                    onChange={(e) => updateProblem(idx, 'priority', e.target.value)}
                                >
                                    <option value="high">High</option>
                                    <option value="medium">Medium</option>
                                    <option value="low">Low</option>
                                </select>
                            </label>
                            <label style={{ gridColumn: '1 / -1' }}>
                                Functional Impact
                                <input
                                    value={prob.functional_impact || ''}
                                    onChange={(e) => updateProblem(idx, 'functional_impact', e.target.value)}
                                    placeholder="e.g., neck rotation limited, difficulty breathing..."
                                />
                            </label>
                            <label style={{ gridColumn: '1 / -1' }}>
                                Notes
                                <textarea
                                    value={prob.notes || ''}
                                    onChange={(e) => updateProblem(idx, 'notes', e.target.value)}
                                    rows={2}
                                    placeholder="Additional notes..."
                                />
                            </label>
                        </div>
                    </div>
                ))}
                {problems.length === 0 && (
                    <div className="empty-state-box">
                        No problems listed. Click "+ Add Problem" to create the problem list.
                    </div>
                )}
            </div>
        </div>
    )
}

/**
 * Treatment Phase Editor
 * Handles: Treatment table (Problem → Treatment → Benefit)
 */
export function TreatmentPhaseEditor({ step, onUpdate, errors, touched, setTouched }) {
    const content = step.content || {}
    const treatments = content.treatments || []

    const addTreatment = () => {
        onUpdate({
            ...step,
            content: {
                ...content,
                treatments: [...treatments, {
                    id: `treat_${Date.now()}`,
                    problem_id: '',
                    problem_label: '',
                    intervention: '',
                    benefit: '',
                    links: []
                }]
            }
        })
    }

    const updateTreatment = (index, field, value) => {
        const updated = [...treatments]
        updated[index] = { ...updated[index], [field]: value }
        onUpdate({ ...step, content: { ...content, treatments: updated } })
    }

    const removeTreatment = (index) => {
        onUpdate({
            ...step,
            content: { ...content, treatments: treatments.filter((_, i) => i !== index) }
        })
    }

    const addLink = (treatIndex) => {
        const updated = [...treatments]
        const links = updated[treatIndex].links || []
        updated[treatIndex] = { ...updated[treatIndex], links: [...links, ''] }
        onUpdate({ ...step, content: { ...content, treatments: updated } })
    }

    const updateLink = (treatIndex, linkIndex, value) => {
        const updated = [...treatments]
        const links = [...(updated[treatIndex].links || [])]
        links[linkIndex] = value
        updated[treatIndex] = { ...updated[treatIndex], links }
        onUpdate({ ...step, content: { ...content, treatments: updated } })
    }

    const removeLink = (treatIndex, linkIndex) => {
        const updated = [...treatments]
        const links = (updated[treatIndex].links || []).filter((_, i) => i !== linkIndex)
        updated[treatIndex] = { ...updated[treatIndex], links }
        onUpdate({ ...step, content: { ...content, treatments: updated } })
    }

    return (
        <div className="phase-editor treatment-phase">
            <div className="phase-header">
                <h4>💊 Treatment</h4>
                <p>Interventions mapped to problems</p>
            </div>

            {/* Treatment Table */}
            <div className="treatment-table">
                <div className="table-header">
                    <div className="col-problem">Problem</div>
                    <div className="col-treatment">Treatment</div>
                    <div className="col-benefit">Benefit</div>
                    <div className="col-actions"></div>
                </div>
                {treatments.map((treat, idx) => (
                    <div key={idx} className="table-row">
                        <div className="col-problem">
                            <textarea
                                value={treat.problem_label || ''}
                                onChange={(e) => updateTreatment(idx, 'problem_label', e.target.value)}
                                placeholder="e.g., Tight Muscles"
                                rows={2}
                            />
                        </div>
                        <div className="col-treatment">
                            <textarea
                                value={treat.intervention || ''}
                                onChange={(e) => updateTreatment(idx, 'intervention', e.target.value)}
                                placeholder="e.g., Muscle energy technique, SNAG left rotation..."
                                rows={2}
                            />
                            <div className="link-list">
                                {(treat.links || []).map((link, lIdx) => (
                                    <div key={lIdx} className="link-item">
                                        <input
                                            value={link}
                                            onChange={(e) => updateLink(idx, lIdx, e.target.value)}
                                            placeholder="https://..."
                                        />
                                        <button type="button" className="btn-delete-small" onClick={() => removeLink(idx, lIdx)}>×</button>
                                    </div>
                                ))}
                                <button type="button" className="btn-link-add" onClick={() => addLink(idx)}>+ Link</button>
                            </div>
                        </div>
                        <div className="col-benefit">
                            <textarea
                                value={treat.benefit || ''}
                                onChange={(e) => updateTreatment(idx, 'benefit', e.target.value)}
                                placeholder="e.g., Pain relief and increase ROM"
                                rows={2}
                            />
                        </div>
                        <div className="col-actions">
                            <button type="button" className="btn-delete-small" onClick={() => removeTreatment(idx)}>🗑</button>
                        </div>
                    </div>
                ))}
                {treatments.length === 0 && (
                    <div className="empty-table-state">
                        No treatments added. Click "+ Add Treatment" below.
                    </div>
                )}
            </div>
            <div className="table-footer">
                <button type="button" className="btn-small" onClick={addTreatment}>+ Add Treatment</button>
            </div>
        </div>
    )
}

export default { DiagnosisPhaseEditor, ProblemPhaseEditor, TreatmentPhaseEditor }
