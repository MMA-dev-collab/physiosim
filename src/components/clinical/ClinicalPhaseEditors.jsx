import React from 'react'
import ImageUpload from '../common/ImageUpload'
import './PhaseEditors.css'

/**
 * Diagnosis Phase Editor — NEW Interactive Version
 * Admin defines: keywords, synonyms, perfect answer, max score
 * Student will build a structured diagnosis at runtime.
 */
export function DiagnosisPhaseEditor({ step, onUpdate, errors, touched, setTouched }) {
    const content = step.content || {}

    // Store essay scoring data inside content for the runner to read
    const essayQuestions = step.essayQuestions || []
    const eq = essayQuestions[0] || {
        question_text: 'Build the diagnosis for this patient',
        keywords: [],
        synonyms: [],
        max_score: step.maxScore || 10,
        perfect_answer: ''
    }

    const updateEq = (field, value) => {
        const newEq = { ...eq, [field]: value }
        onUpdate({
            ...step,
            essayQuestions: [newEq]
        })
    }

    const updateMaxScore = (val) => {
        onUpdate({ ...step, maxScore: parseInt(val) || 10 })
    }

    const addKeyword = (kw) => {
        if (!kw.trim()) return
        const existing = eq.keywords || []
        if (!existing.includes(kw.trim())) {
            updateEq('keywords', [...existing, kw.trim()])
        }
    }

    const removeKeyword = (idx) => {
        updateEq('keywords', (eq.keywords || []).filter((_, i) => i !== idx))
    }

    const addSynonym = (syn) => {
        if (!syn.trim()) return
        const existing = eq.synonyms || []
        if (!existing.includes(syn.trim())) {
            updateEq('synonyms', [...existing, syn.trim()])
        }
    }

    const removeSynonym = (idx) => {
        updateEq('synonyms', (eq.synonyms || []).filter((_, i) => i !== idx))
    }

    return (
        <div className="phase-editor diagnosis-phase">
            <div className="phase-header user-input-header">
                <h4>🎯 Diagnosis — Structured Input</h4>
                <span className="user-input-badge">User Input</span>
                <p>Students will build a diagnosis using Condition, Levels, and Findings fields. Define the expected answer below.</p>
            </div>

            <div className="dynamic-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem' }}>
                {/* Supporting Evidence */}
                <div className="form-group">
                    <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px', fontSize: '0.85rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                        Supporting Evidence to Diagnose the Case
                    </label>
                    <span style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '10px', display: 'block' }}>
                        Add evidence (like Subjective, ROM, Special Tests) to help the user diagnose the case.
                    </span>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {(content.supporting_evidence || []).map((ev, idx) => (
                            <div key={idx} style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                <div style={{ flex: 1, display: 'flex', gap: '10px' }}>
                                    <input 
                                        type="text" 
                                        placeholder="Title (e.g. Subjective)" 
                                        value={ev.title || ''} 
                                        onChange={(e) => {
                                            const newEv = [...(content.supporting_evidence || [])]
                                            newEv[idx] = { ...newEv[idx], title: e.target.value }
                                            onUpdate({ ...step, content: { ...content, supporting_evidence: newEv } })
                                        }}
                                        style={{ width: '150px', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                                    />
                                    <textarea 
                                        placeholder="Evidence text..." 
                                        value={ev.text || ''} 
                                        onChange={(e) => {
                                            const newEv = [...(content.supporting_evidence || [])]
                                            newEv[idx] = { ...newEv[idx], text: e.target.value }
                                            onUpdate({ ...step, content: { ...content, supporting_evidence: newEv } })
                                        }}
                                        rows={1}
                                        style={{ flex: 1, padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', resize: 'vertical' }}
                                    />
                                </div>
                                <button type="button" onClick={() => {
                                    const newEv = (content.supporting_evidence || []).filter((_, i) => i !== idx)
                                    onUpdate({ ...step, content: { ...content, supporting_evidence: newEv } })
                                }} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '6px', padding: '8px 12px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                    
                    <button type="button" onClick={() => {
                        const newEv = [...(content.supporting_evidence || []), { title: '', text: '' }]
                        onUpdate({ ...step, content: { ...content, supporting_evidence: newEv } })
                    }} style={{ marginTop: '10px', padding: '8px 16px', borderRadius: '8px', background: '#f1f5f9', color: '#334155', border: '1px dashed #cbd5e1', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', width: '100%' }}>
                        + Add Evidence
                    </button>
                </div>

                {/* Max Score */}
                <div className="form-group">
                    <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px', fontSize: '0.85rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                        Max Score <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                        type="number"
                        min="1"
                        max="100"
                        value={step.maxScore || 10}
                        onChange={(e) => updateMaxScore(e.target.value)}
                        placeholder="10"
                        style={{ width: '120px', padding: '10px 14px', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '0.95rem', fontWeight: 600 }}
                    />
                </div>

                {/* Perfect Answer */}
                <div className="form-group">
                    <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px', fontSize: '0.85rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                        Correct Diagnosis (Perfect Answer) <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <textarea
                        value={eq.perfect_answer || ''}
                        onChange={(e) => updateEq('perfect_answer', e.target.value)}
                        rows={3}
                        placeholder="e.g. Multiple cervical disc bulges at C3-C4, C4-C5, C5-C6 with reversed cervical curve and stenosis"
                        style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '0.95rem', resize: 'vertical' }}
                    />
                    <span style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                        Shown to the student after submission as the model answer.
                    </span>
                </div>

                {/* Keywords */}
                <div className="form-group">
                    <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px', fontSize: '0.85rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                        Expected Keywords <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                        {(eq.keywords || []).map((kw, idx) => (
                            <span key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '20px', background: '#dbeafe', color: '#1e40af', fontSize: '0.85rem', fontWeight: 600 }}>
                                {kw}
                                <button type="button" onClick={() => removeKeyword(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1e40af', fontSize: '1.1rem', padding: 0, lineHeight: 1, fontWeight: 700 }}>×</button>
                            </span>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                            type="text"
                            placeholder="Type keyword and press Enter"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ',') {
                                    e.preventDefault()
                                    addKeyword(e.target.value)
                                    e.target.value = ''
                                }
                            }}
                            style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '0.9rem' }}
                        />
                        <button type="button" onClick={(e) => {
                            const input = e.target.closest('div').querySelector('input')
                            addKeyword(input.value)
                            input.value = ''
                        }} style={{ padding: '10px 20px', borderRadius: '8px', background: '#3b82f6', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>Add</button>
                    </div>
                    <span style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                        Keywords the student's generated sentence will be checked against (e.g. disc bulge, C3-C4, stenosis, reversed lordosis).
                    </span>
                </div>

                {/* Synonyms */}
                <div className="form-group">
                    <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px', fontSize: '0.85rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                        Synonyms (Optional)
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                        {(eq.synonyms || []).map((syn, idx) => (
                            <span key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '20px', background: '#fef3c7', color: '#92400e', fontSize: '0.85rem', fontWeight: 600 }}>
                                {syn}
                                <button type="button" onClick={() => removeSynonym(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#92400e', fontSize: '1.1rem', padding: 0, lineHeight: 1, fontWeight: 700 }}>×</button>
                            </span>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                            type="text"
                            placeholder="Type synonym and press Enter"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ',') {
                                    e.preventDefault()
                                    addSynonym(e.target.value)
                                    e.target.value = ''
                                }
                            }}
                            style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '0.9rem' }}
                        />
                        <button type="button" onClick={(e) => {
                            const input = e.target.closest('div').querySelector('input')
                            addSynonym(input.value)
                            input.value = ''
                        }} style={{ padding: '10px 20px', borderRadius: '8px', background: '#f59e0b', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>Add</button>
                    </div>
                    <span style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                        Alternate terms (e.g. "reversed curve" = "loss of lordosis").
                    </span>
                </div>
            </div>
        </div>
    )
}

/**
 * Problem List Phase Editor — NEW Interactive Version
 * Each expected problem is stored as an essayQuestions entry with label + keywords.
 * Students will input problems one by one at runtime.
 */
export function ProblemPhaseEditor({ step, onUpdate, errors, touched, setTouched }) {
    const essayQuestions = step.essayQuestions || []

    const updateMaxScore = (val) => {
        onUpdate({ ...step, maxScore: parseInt(val) || 10 })
    }

    const addProblem = () => {
        onUpdate({
            ...step,
            essayQuestions: [...essayQuestions, {
                question_text: '',
                keywords: [],
                synonyms: [],
                max_score: step.maxScore || 10,
                perfect_answer: ''
            }]
        })
    }

    const removeProblem = (idx) => {
        onUpdate({
            ...step,
            essayQuestions: essayQuestions.filter((_, i) => i !== idx)
        })
    }

    const updateProblem = (idx, field, value) => {
        const updated = [...essayQuestions]
        updated[idx] = { ...updated[idx], [field]: value }
        onUpdate({ ...step, essayQuestions: updated })
    }

    const addProblemKeyword = (problemIdx, kw) => {
        if (!kw.trim()) return
        const updated = [...essayQuestions]
        const existing = updated[problemIdx].keywords || []
        if (!existing.includes(kw.trim())) {
            updated[problemIdx] = { ...updated[problemIdx], keywords: [...existing, kw.trim()] }
            onUpdate({ ...step, essayQuestions: updated })
        }
    }

    const removeProblemKeyword = (problemIdx, kwIdx) => {
        const updated = [...essayQuestions]
        updated[problemIdx] = {
            ...updated[problemIdx],
            keywords: (updated[problemIdx].keywords || []).filter((_, i) => i !== kwIdx)
        }
        onUpdate({ ...step, essayQuestions: updated })
    }

    const addProblemSynonym = (problemIdx, syn) => {
        if (!syn.trim()) return
        const updated = [...essayQuestions]
        const existing = updated[problemIdx].synonyms || []
        if (!existing.includes(syn.trim())) {
            updated[problemIdx] = { ...updated[problemIdx], synonyms: [...existing, syn.trim()] }
            onUpdate({ ...step, essayQuestions: updated })
        }
    }

    const removeProblemSynonym = (problemIdx, synIdx) => {
        const updated = [...essayQuestions]
        updated[problemIdx] = {
            ...updated[problemIdx],
            synonyms: (updated[problemIdx].synonyms || []).filter((_, i) => i !== synIdx)
        }
        onUpdate({ ...step, essayQuestions: updated })
    }

    return (
        <div className="phase-editor problem-phase">
            <div className="phase-header user-input-header">
                <h4>📝 Problem List — Interactive Input</h4>
                <span className="user-input-badge">User Input</span>
                <p>Students will type problems one by one and get matched against the expected list below.</p>
            </div>

            <div className="dynamic-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem' }}>
                {/* Max Score */}
                <div className="form-group">
                    <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px', fontSize: '0.85rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                        Max Score <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                        type="number"
                        min="1"
                        max="100"
                        value={step.maxScore || 10}
                        onChange={(e) => updateMaxScore(e.target.value)}
                        placeholder="10"
                        style={{ width: '120px', padding: '10px 14px', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '0.95rem', fontWeight: 600 }}
                    />
                </div>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h5 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#1e293b' }}>Expected Problems</h5>
                    <button type="button" className="btn-small" onClick={addProblem}
                        style={{ padding: '8px 18px', borderRadius: '8px', background: '#3b82f6', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                        + Add Problem
                    </button>
                </div>

                {essayQuestions.length === 0 && (
                    <div style={{ padding: '2rem', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '2px dashed #e2e8f0', color: '#94a3b8', fontStyle: 'italic' }}>
                        No expected problems added yet. Click "+ Add Problem" to start.
                    </div>
                )}

                {essayQuestions.map((prob, idx) => (
                    <div key={idx} style={{ background: '#fff', border: '2px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <span style={{ fontWeight: 700, color: '#3b82f6', fontSize: '0.9rem' }}>Problem {idx + 1}</span>
                            <button type="button" onClick={() => removeProblem(idx)}
                                style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '8px', padding: '4px 12px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>
                                🗑 Remove
                            </button>
                        </div>

                        {/* Problem Name */}
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px', fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                                Problem Name <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <input
                                type="text"
                                value={prob.question_text || ''}
                                onChange={(e) => updateProblem(idx, 'question_text', e.target.value)}
                                placeholder="e.g. Reduced cervical ROM"
                                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '0.9rem' }}
                            />
                        </div>

                        {/* Keywords */}
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px', fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                                Matching Keywords
                            </label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                                {(prob.keywords || []).map((kw, kwIdx) => (
                                    <span key={kwIdx} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '12px', background: '#dbeafe', color: '#1e40af', fontSize: '0.8rem', fontWeight: 600 }}>
                                        {kw}
                                        <button type="button" onClick={() => removeProblemKeyword(idx, kwIdx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1e40af', fontSize: '1rem', padding: 0, lineHeight: 1 }}>×</button>
                                    </span>
                                ))}
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    type="text"
                                    placeholder="Type keyword and press Enter"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ',') {
                                            e.preventDefault()
                                            addProblemKeyword(idx, e.target.value)
                                            e.target.value = ''
                                        }
                                    }}
                                    style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}
                                />
                                <button type="button" onClick={(e) => {
                                    const input = e.target.closest('div').querySelector('input')
                                    addProblemKeyword(idx, input.value)
                                    input.value = ''
                                }} style={{ padding: '8px 16px', borderRadius: '8px', background: '#3b82f6', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>Add</button>
                            </div>
                        </div>

                        {/* Synonyms */}
                        <div>
                            <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px', fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                                Synonyms (Optional)
                            </label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                                {(prob.synonyms || []).map((syn, synIdx) => (
                                    <span key={synIdx} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '12px', background: '#fef3c7', color: '#92400e', fontSize: '0.8rem', fontWeight: 600 }}>
                                        {syn}
                                        <button type="button" onClick={() => removeProblemSynonym(idx, synIdx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#92400e', fontSize: '1rem', padding: 0, lineHeight: 1 }}>×</button>
                                    </span>
                                ))}
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    type="text"
                                    placeholder="Type synonym and press Enter"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ',') {
                                            e.preventDefault()
                                            addProblemSynonym(idx, e.target.value)
                                            e.target.value = ''
                                        }
                                    }}
                                    style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}
                                />
                                <button type="button" onClick={(e) => {
                                    const input = e.target.closest('div').querySelector('input')
                                    addProblemSynonym(idx, input.value)
                                    input.value = ''
                                }} style={{ padding: '8px 16px', borderRadius: '8px', background: '#f59e0b', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>Add</button>
                            </div>
                        </div>
                    </div>
                ))}
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
                <h4>💊 Treatment Plan</h4>
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
