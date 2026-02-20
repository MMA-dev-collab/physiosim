import React from 'react'
import ImageUpload from '../common/ImageUpload'
import { ROM_CLINICAL_TIP } from '../../config/clinicalPhases'
import './PhaseEditors.css'

/**
 * Assessment Phase Editor
 * Handles: Observation, Palpation, ROM, MMT, Flexibility, Special Tests, Investigations
 */
export function AssessmentPhaseEditor({ step, onUpdate, errors, touched, setTouched }) {
    const content = step.content || {}
    const category = step.category

    const updateField = (field, value) => {
        onUpdate({
            ...step,
            content: { ...content, [field]: value }
        })
    }

    // ===== OBSERVATION EDITORS =====
    if (category?.startsWith('observation_')) {
        const viewType = category.replace('observation_', '')
        const viewLabels = {
            anterior: 'Anterior View',
            sagittal: 'Sagittal View (Lateral)',
            posterior: 'Posterior View',
            local: 'Local Observation'
        }

        const findings = content.findings || []

        const addFinding = () => {
            updateField('findings', [...findings, ''])
        }

        const updateFinding = (index, value) => {
            const updated = [...findings]
            updated[index] = value
            updateField('findings', updated)
        }

        const removeFinding = (index) => {
            updateField('findings', findings.filter((_, i) => i !== index))
        }

        return (
            <div className="phase-editor assessment-phase">
                <div className="phase-header">
                    <h4>👁️ Observation - {viewLabels[viewType] || viewType}</h4>
                    <p>Visual assessment from {viewType} view</p>
                </div>
                <div className="form-grid">
                    <div style={{ gridColumn: '1 / -1' }}>
                        <ImageUpload
                            label={`${viewLabels[viewType] || viewType} Image`}
                            folderType="observation"
                            initialUrl={content.image_url}
                            onUpload={(url) => updateField('image_url', url)}
                        />
                    </div>

                    <div className="findings-section" style={{ gridColumn: '1 / -1' }}>
                        <div className="section-header">
                            <h5>Observations/Findings</h5>
                            <button type="button" className="btn-small" onClick={addFinding}>+ Add Finding</button>
                        </div>
                        <div className="findings-list">
                            {findings.map((finding, idx) => (
                                <div key={idx} className="finding-item">
                                    <input
                                        value={finding}
                                        onChange={(e) => updateFinding(idx, e.target.value)}
                                        placeholder="e.g., kyphosis, rounded shoulder, FHP, asymmetrical shoulder level..."
                                    />
                                    <button type="button" className="btn-delete-small" onClick={() => removeFinding(idx)}>×</button>
                                </div>
                            ))}
                            {findings.length === 0 && (
                                <p className="empty-state">No findings added. Click "+ Add Finding" to document observations.</p>
                            )}
                        </div>
                    </div>

                    <label style={{ gridColumn: '1 / -1' }}>
                        Notes
                        <textarea
                            value={content.notes || ''}
                            onChange={(e) => updateField('notes', e.target.value)}
                            rows={2}
                            placeholder="Additional observations or notes..."
                        />
                    </label>
                </div>
            </div>
        )
    }

    // ===== PALPATION EDITORS =====
    if (category?.startsWith('palpation_')) {
        const tissueType = category.replace('palpation_', '')
        const tissueLabels = {
            skin: 'Skin',
            muscles: 'Muscles',
            bone: 'Bone'
        }

        const entries = content.entries || []

        const addEntry = () => {
            onUpdate({
                ...step,
                content: { ...content, entries: [...entries, { location: '', finding: '', severity: '', image_url: '', notes: '' }] }
            })
        }

        const updateEntry = (index, field, value) => {
            const updated = [...entries]
            updated[index] = { ...updated[index], [field]: value }
            onUpdate({ ...step, content: { ...content, entries: updated } })
        }

        const removeEntry = (index) => {
            onUpdate({
                ...step,
                content: { ...content, entries: entries.filter((_, i) => i !== index) }
            })
        }

        return (
            <div className="phase-editor assessment-phase">
                <div className="phase-header">
                    <h4>🤲 Palpation - {tissueLabels[tissueType] || tissueType}</h4>
                    <p>Palpation findings for {tissueLabels[tissueType] || tissueType}</p>
                </div>
                <div className="dynamic-list">
                    <div className="section-header">
                        <h5>Palpation Entries</h5>
                        <button type="button" className="btn-small" onClick={addEntry}>+ Add Entry</button>
                    </div>
                    {entries.map((entry, idx) => (
                        <div key={idx} className="list-item">
                            <div className="item-header">
                                <span>Entry {idx + 1}</span>
                                <button type="button" className="btn-delete-small" onClick={() => removeEntry(idx)}>🗑</button>
                            </div>
                            <div className="form-grid">
                                <label>
                                    Location <span className="required">*</span>
                                    <input
                                        value={entry.location || ''}
                                        onChange={(e) => updateEntry(idx, 'location', e.target.value)}
                                        placeholder="e.g., spinous process, transverse process..."
                                    />
                                </label>
                                <label>
                                    Finding <span className="required">*</span>
                                    <input
                                        value={entry.finding || ''}
                                        onChange={(e) => updateEntry(idx, 'finding', e.target.value)}
                                        placeholder="e.g., flattened curve, tenderness..."
                                    />
                                </label>
                                <label>
                                    Severity
                                    <select
                                        value={entry.severity || ''}
                                        onChange={(e) => updateEntry(idx, 'severity', e.target.value)}
                                    >
                                        <option value="">Select severity</option>
                                        <option value="mild">Mild</option>
                                        <option value="moderate">Moderate</option>
                                        <option value="severe">Severe</option>
                                    </select>
                                </label>
                                <label style={{ gridColumn: '1 / -1' }}>
                                    Notes
                                    <textarea
                                        value={entry.notes || ''}
                                        onChange={(e) => updateEntry(idx, 'notes', e.target.value)}
                                        rows={2}
                                        placeholder="Additional notes..."
                                    />
                                </label>
                            </div>
                        </div>
                    ))}
                    {entries.length === 0 && (
                        <div className="empty-state-box">
                            No palpation findings. Click "+ Add Entry" to document findings.
                        </div>
                    )}
                </div>
            </div>
        )
    }

    // ===== ROM EDITORS =====
    if (category?.startsWith('rom_')) {
        const romType = category.replace('rom_', '').toUpperCase()
        const entries = content.entries || []

        const addEntry = () => {
            onUpdate({
                ...step,
                content: {
                    ...content,
                    entries: [...entries, {
                        movement: '',
                        value: '',
                        pain: false,
                        end_feel: '',
                        notes: ''
                    }]
                }
            })
        }

        const updateEntry = (index, field, value) => {
            const updated = [...entries]
            updated[index] = { ...updated[index], [field]: value }
            onUpdate({ ...step, content: { ...content, entries: updated } })
        }

        const removeEntry = (index) => {
            onUpdate({
                ...step,
                content: { ...content, entries: entries.filter((_, i) => i !== index) }
            })
        }

        return (
            <div className="phase-editor assessment-phase">
                <div className="phase-header">
                    <h4>📐 ROM Assessment - {romType}</h4>
                    <p>Range of Motion - {romType === 'AROM' ? 'Active' : 'Passive'}</p>
                </div>

                {/* Clinical Tip Box */}
                <div className="clinical-tip-box">
                    <div className="tip-header">
                        <span className="tip-icon">💡</span>
                        <strong>{ROM_CLINICAL_TIP.title}</strong>
                    </div>
                    <ul className="tip-rules">
                        {ROM_CLINICAL_TIP.rules.map((rule, idx) => (
                            <li key={idx}>
                                <strong>{rule.condition}</strong> → {rule.interpretation}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="dynamic-list">
                    <div className="section-header">
                        <h5>{romType} Entries</h5>
                        <button type="button" className="btn-small" onClick={addEntry}>+ Add Movement</button>
                    </div>
                    {entries.map((entry, idx) => (
                        <div key={idx} className="list-item">
                            <div className="item-header">
                                <span>Movement {idx + 1}</span>
                                <button type="button" className="btn-delete-small" onClick={() => removeEntry(idx)}>🗑</button>
                            </div>
                            <div className="form-grid">
                                <label>
                                    Movement <span className="required">*</span>
                                    <input
                                        value={entry.movement || ''}
                                        onChange={(e) => updateEntry(idx, 'movement', e.target.value)}
                                        placeholder="e.g., Neck extension, Rotation, Side bending..."
                                    />
                                </label>
                                <label>
                                    Value (degrees or description)
                                    <input
                                        value={entry.value || ''}
                                        onChange={(e) => updateEntry(idx, 'value', e.target.value)}
                                        placeholder="e.g., 45°, limited, normal..."
                                    />
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <input
                                        type="checkbox"
                                        checked={entry.pain || false}
                                        onChange={(e) => updateEntry(idx, 'pain', e.target.checked)}
                                    />
                                    Pain Present
                                </label>
                                {romType === 'PROM' && (
                                    <label>
                                        End Feel
                                        <select
                                            value={entry.end_feel || ''}
                                            onChange={(e) => updateEntry(idx, 'end_feel', e.target.value)}
                                        >
                                            <option value="">Select end feel</option>
                                            <option value="normal_soft">Normal - Soft Tissue</option>
                                            <option value="normal_firm">Normal - Firm</option>
                                            <option value="normal_hard">Normal - Hard (Bone)</option>
                                            <option value="empty">Empty</option>
                                            <option value="spasm">Muscle Spasm</option>
                                            <option value="springy">Springy Block</option>
                                        </select>
                                    </label>
                                )}
                                <label style={{ gridColumn: '1 / -1' }}>
                                    Notes
                                    <input
                                        value={entry.notes || ''}
                                        onChange={(e) => updateEntry(idx, 'notes', e.target.value)}
                                        placeholder="e.g., limited due to pain Lt > Rt..."
                                    />
                                </label>
                            </div>
                        </div>
                    ))}
                    {entries.length === 0 && (
                        <div className="empty-state-box">
                            No ROM entries. Click "+ Add Movement" to document ROM findings.
                        </div>
                    )}
                </div>
            </div>
        )
    }

    // ===== MMT EDITOR =====
    if (category === 'mmt') {
        const entries = content.entries || []

        const addEntry = () => {
            onUpdate({
                ...step,
                content: { ...content, entries: [...entries, { muscle: '', grade: '', notes: '', link: '' }] }
            })
        }

        const updateEntry = (index, field, value) => {
            const updated = [...entries]
            updated[index] = { ...updated[index], [field]: value }
            onUpdate({ ...step, content: { ...content, entries: updated } })
        }

        const removeEntry = (index) => {
            onUpdate({
                ...step,
                content: { ...content, entries: entries.filter((_, i) => i !== index) }
            })
        }

        return (
            <div className="phase-editor assessment-phase">
                <div className="phase-header">
                    <h4>💪 Manual Muscle Test (MMT)</h4>
                    <p>Muscle strength grading (0-5)</p>
                </div>
                <div className="dynamic-list">
                    <div className="section-header">
                        <h5>MMT Entries</h5>
                        <button type="button" className="btn-small" onClick={addEntry}>+ Add Muscle</button>
                    </div>
                    {entries.map((entry, idx) => (
                        <div key={idx} className="list-item">
                            <div className="item-header">
                                <span>Muscle {idx + 1}</span>
                                <button type="button" className="btn-delete-small" onClick={() => removeEntry(idx)}>🗑</button>
                            </div>
                            <div className="form-grid">
                                <label>
                                    Muscle <span className="required">*</span>
                                    <input
                                        value={entry.muscle || ''}
                                        onChange={(e) => updateEntry(idx, 'muscle', e.target.value)}
                                        placeholder="e.g., Quadriceps, Biceps..."
                                    />
                                </label>
                                <label>
                                    Grade (0-5)
                                    <select
                                        value={entry.grade || ''}
                                        onChange={(e) => updateEntry(idx, 'grade', e.target.value)}
                                    >
                                        <option value="">Select grade</option>
                                        <option value="0">0 - No contraction</option>
                                        <option value="1">1 - Flicker</option>
                                        <option value="2">2 - Movement without gravity</option>
                                        <option value="3">3 - Movement against gravity</option>
                                        <option value="4">4 - Movement against some resistance</option>
                                        <option value="5">5 - Normal strength</option>
                                        <option value="n/a">N/A</option>
                                    </select>
                                </label>
                                <label>
                                    Reference Link
                                    <input
                                        value={entry.link || ''}
                                        onChange={(e) => updateEntry(idx, 'link', e.target.value)}
                                        placeholder="https://..."
                                    />
                                </label>
                                <label style={{ gridColumn: '1 / -1' }}>
                                    Notes
                                    <input
                                        value={entry.notes || ''}
                                        onChange={(e) => updateEntry(idx, 'notes', e.target.value)}
                                        placeholder="Additional notes..."
                                    />
                                </label>
                            </div>
                        </div>
                    ))}
                    {entries.length === 0 && (
                        <div className="empty-state-box">
                            No MMT findings. Click "+ Add Muscle" or mark as "N/A" if not applicable.
                        </div>
                    )}
                </div>
            </div>
        )
    }

    // ===== FLEXIBILITY TEST EDITOR =====
    if (category === 'flexibility_test') {
        const entries = content.entries || []

        const addEntry = () => {
            onUpdate({
                ...step,
                content: { ...content, entries: [...entries, { test_name: '', result: '', notes: '', link: '' }] }
            })
        }

        const updateEntry = (index, field, value) => {
            const updated = [...entries]
            updated[index] = { ...updated[index], [field]: value }
            onUpdate({ ...step, content: { ...content, entries: updated } })
        }

        const removeEntry = (index) => {
            onUpdate({
                ...step,
                content: { ...content, entries: entries.filter((_, i) => i !== index) }
            })
        }

        return (
            <div className="phase-editor assessment-phase">
                <div className="phase-header user-input-header">
                    <h4>🧘 Flexibility Test</h4>
                    <span className="user-input-badge">User Input</span>
                    <p>Document flexibility findings</p>
                </div>
                <div className="dynamic-list">
                    <div className="section-header">
                        <h5>Flexibility Tests</h5>
                        <button type="button" className="btn-small" onClick={addEntry}>+ Add Test</button>
                    </div>
                    {entries.map((entry, idx) => (
                        <div key={idx} className="list-item">
                            <div className="item-header">
                                <span>Test {idx + 1}</span>
                                <button type="button" className="btn-delete-small" onClick={() => removeEntry(idx)}>🗑</button>
                            </div>
                            <div className="form-grid">
                                <label>
                                    Test Name <span className="required">*</span>
                                    <input
                                        value={entry.test_name || ''}
                                        onChange={(e) => updateEntry(idx, 'test_name', e.target.value)}
                                        placeholder="e.g., Upper Trap, Levator, Scalene..."
                                    />
                                </label>
                                <label>
                                    Result
                                    <input
                                        value={entry.result || ''}
                                        onChange={(e) => updateEntry(idx, 'result', e.target.value)}
                                        placeholder="e.g., Tight, Normal..."
                                    />
                                </label>
                                <label>
                                    Reference Link
                                    <input
                                        value={entry.link || ''}
                                        onChange={(e) => updateEntry(idx, 'link', e.target.value)}
                                        placeholder="https://..."
                                    />
                                </label>
                                <label>
                                    Notes
                                    <input
                                        value={entry.notes || ''}
                                        onChange={(e) => updateEntry(idx, 'notes', e.target.value)}
                                        placeholder="Additional notes..."
                                    />
                                </label>
                            </div>
                        </div>
                    ))}
                    {entries.length === 0 && (
                        <div className="empty-state-box">
                            No flexibility tests documented. Click "+ Add Test" to add findings.
                        </div>
                    )}
                </div>
            </div>
        )
    }

    // ===== SPECIAL TESTS EDITOR =====
    if (category === 'special_tests') {
        const entries = content.entries || []

        const addEntry = () => {
            onUpdate({
                ...step,
                content: { ...content, entries: [...entries, { test_name: '', result: '', notes: '', link: '' }] }
            })
        }

        const updateEntry = (index, field, value) => {
            const updated = [...entries]
            updated[index] = { ...updated[index], [field]: value }
            onUpdate({ ...step, content: { ...content, entries: updated } })
        }

        const removeEntry = (index) => {
            onUpdate({
                ...step,
                content: { ...content, entries: entries.filter((_, i) => i !== index) }
            })
        }

        return (
            <div className="phase-editor assessment-phase">
                <div className="phase-header user-input-header">
                    <h4>🧪 Special Tests</h4>
                    <span className="user-input-badge">User Input</span>
                    <p>Clinical special tests</p>
                </div>
                <div className="dynamic-list">
                    <div className="section-header">
                        <h5>Special Tests</h5>
                        <button type="button" className="btn-small" onClick={addEntry}>+ Add Test</button>
                    </div>
                    {entries.map((entry, idx) => (
                        <div key={idx} className="list-item">
                            <div className="item-header">
                                <span>Test {idx + 1}</span>
                                <button type="button" className="btn-delete-small" onClick={() => removeEntry(idx)}>🗑</button>
                            </div>
                            <div className="form-grid">
                                <label>
                                    Test Name <span className="required">*</span>
                                    <input
                                        value={entry.test_name || ''}
                                        onChange={(e) => updateEntry(idx, 'test_name', e.target.value)}
                                        placeholder="e.g., Compression/Distraction, Spurling A&B, VBI..."
                                    />
                                </label>
                                <label>
                                    Result
                                    <select
                                        value={entry.result || ''}
                                        onChange={(e) => updateEntry(idx, 'result', e.target.value)}
                                    >
                                        <option value="">Select result</option>
                                        <option value="positive">Positive (+)</option>
                                        <option value="negative">Negative (-)</option>
                                        <option value="pending">Pending</option>
                                        <option value="n/a">N/A</option>
                                    </select>
                                </label>
                                <label>
                                    Reference Link
                                    <input
                                        value={entry.link || ''}
                                        onChange={(e) => updateEntry(idx, 'link', e.target.value)}
                                        placeholder="https://..."
                                    />
                                </label>
                                <label>
                                    Notes
                                    <input
                                        value={entry.notes || ''}
                                        onChange={(e) => updateEntry(idx, 'notes', e.target.value)}
                                        placeholder="Additional notes..."
                                    />
                                </label>
                            </div>
                        </div>
                    ))}
                    {entries.length === 0 && (
                        <div className="empty-state-box">
                            No special tests documented. Click "+ Add Test" to define tests for user to perform.
                        </div>
                    )}
                </div>
            </div>
        )
    }

    // ===== INVESTIGATIONS (IMAGING) EDITOR =====
    if (category === 'investigations') {
        const entries = content.entries || []

        const addEntry = () => {
            onUpdate({
                ...step,
                content: { ...content, entries: [...entries, { modality: '', image_url: '', report_text: '', conclusion: '' }] }
            })
        }

        const updateEntry = (index, field, value) => {
            const updated = [...entries]
            updated[index] = { ...updated[index], [field]: value }
            onUpdate({ ...step, content: { ...content, entries: updated } })
        }

        const removeEntry = (index) => {
            onUpdate({
                ...step,
                content: { ...content, entries: entries.filter((_, i) => i !== index) }
            })
        }

        return (
            <div className="phase-editor assessment-phase">
                <div className="phase-header">
                    <h4>🩻 Investigations (Imaging)</h4>
                    <p>X-ray, MRI, CT, and other imaging</p>
                </div>
                <div className="dynamic-list">
                    <div className="section-header">
                        <h5>Imaging Studies</h5>
                        <button type="button" className="btn-small" onClick={addEntry}>+ Add Imaging</button>
                    </div>
                    {entries.map((entry, idx) => (
                        <div key={idx} className="list-item">
                            <div className="item-header">
                                <span>Imaging {idx + 1}</span>
                                <button type="button" className="btn-delete-small" onClick={() => removeEntry(idx)}>🗑</button>
                            </div>
                            <div className="form-grid">
                                <label>
                                    Modality <span className="required">*</span>
                                    <select
                                        value={entry.modality || ''}
                                        onChange={(e) => updateEntry(idx, 'modality', e.target.value)}
                                    >
                                        <option value="">Select modality</option>
                                        <option value="xray">X-Ray</option>
                                        <option value="mri">MRI</option>
                                        <option value="ct">CT Scan</option>
                                        <option value="ultrasound">Ultrasound</option>
                                        <option value="other">Other</option>
                                    </select>
                                </label>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <ImageUpload
                                        label="Imaging File"
                                        folderType="investigations"
                                        initialUrl={entry.image_url}
                                        onUpload={(url) => updateEntry(idx, 'image_url', url)}
                                    />
                                </div>
                                <label style={{ gridColumn: '1 / -1' }}>
                                    Report Text
                                    <textarea
                                        value={entry.report_text || ''}
                                        onChange={(e) => updateEntry(idx, 'report_text', e.target.value)}
                                        rows={3}
                                        placeholder="Radiologist report or findings..."
                                    />
                                </label>
                                <label style={{ gridColumn: '1 / -1' }}>
                                    <div className="label-row">
                                        Conclusion / Clinical Implication <span className="required">*</span>
                                    </div>
                                    <textarea
                                        value={entry.conclusion || ''}
                                        onChange={(e) => updateEntry(idx, 'conclusion', e.target.value)}
                                        rows={2}
                                        placeholder="e.g., Disc touching spinal cord at C5-6, need to exclude UMNL..."
                                    />
                                </label>
                            </div>
                        </div>
                    ))}
                    {entries.length === 0 && (
                        <div className="empty-state-box">
                            No imaging studies. Click "+ Add Imaging" to add X-ray, MRI, etc.
                        </div>
                    )}
                </div>
            </div>
        )
    }

    return <div className="phase-editor">Unknown Assessment category: {category}</div>
}

export default AssessmentPhaseEditor
