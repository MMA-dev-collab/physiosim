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
 * Handles: Treatment table (Problem → Treatment → Dosages & Video)
 */
export function TreatmentPhaseEditor({ step, allSteps, onUpdate, errors, touched, setTouched }) {
    const content = step.content || {}
    const treatments = content.treatments || []

    // Extract problems from previous `problem_list` step if available
    const problemListStep = allSteps?.find(s => s.phase === 'problem_list')
    const availableProblems = problemListStep?.essayQuestions || []

    const addTreatment = () => {
        onUpdate({
            ...step,
            content: {
                ...content,
                treatments: [...treatments, {
                    id: `treat_${Date.now()}`,
                    problem_id: '',
                    problem_label: '',
                    goal: '',
                    intervention: '',
                    dosages: [],
                    videoUrl: ''
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

    const addDosage = (treatIndex, dosageText) => {
        if (!dosageText.trim()) return
        const updated = [...treatments]
        const dosages = updated[treatIndex].dosages || []
        updated[treatIndex] = { ...updated[treatIndex], dosages: [...dosages, dosageText.trim()] }
        onUpdate({ ...step, content: { ...content, treatments: updated } })
    }

    const removeDosage = (treatIndex, dosageIndex) => {
        const updated = [...treatments]
        const dosages = (updated[treatIndex].dosages || []).filter((_, i) => i !== dosageIndex)
        updated[treatIndex] = { ...updated[treatIndex], dosages }
        onUpdate({ ...step, content: { ...content, treatments: updated } })
    }

    return (
        <div className="phase-editor treatment-phase">
            <div className="phase-header">
                <h4>💊 Treatment Plan</h4>
                <p>Interventions mapped to problems</p>
            </div>

            {/* Treatment Table */}
            <div className="treatment-table" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {treatments.map((treat, idx) => (
                    <div key={idx} className="table-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr', gap: '12px', padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc', position: 'relative' }}>
                        
                        {/* Remove Button */}
                        <div style={{ position: 'absolute', top: '8px', right: '8px' }}>
                            <button type="button" className="btn-delete-small" style={{ background: '#fee2e2', color: '#ef4444', padding: '4px 8px', borderRadius: '6px' }} onClick={() => removeTreatment(idx)}>🗑</button>
                        </div>

                        {/* Col 1: Problem & Goal */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Problem</label>
                                {availableProblems.length > 0 && (
                                    <select
                                        value={availableProblems.find(p => p.question_text === treat.problem_label) ? treat.problem_label : ''}
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                updateTreatment(idx, 'problem_label', e.target.value)
                                            }
                                        }}
                                        style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '8px', fontSize: '0.85rem' }}
                                    >
                                        <option value="">-- Select from Problem List --</option>
                                        {availableProblems.map((prob, pIdx) => (
                                            <option key={pIdx} value={prob.question_text}>{prob.question_text}</option>
                                        ))}
                                    </select>
                                )}
                                <input
                                    type="text"
                                    value={treat.problem_label || ''}
                                    onChange={(e) => updateTreatment(idx, 'problem_label', e.target.value)}
                                    placeholder="Or type custom problem..."
                                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Goal</label>
                                <textarea
                                    value={treat.goal || ''}
                                    onChange={(e) => updateTreatment(idx, 'goal', e.target.value)}
                                    placeholder="e.g., Reduce muscle tightness..."
                                    rows={3}
                                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                                />
                            </div>
                        </div>

                        {/* Col 2: Treatment & Video */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderLeft: '1px solid #e2e8f0', paddingLeft: '12px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Treatment / Technique</label>
                                <textarea
                                    value={treat.intervention || ''}
                                    onChange={(e) => updateTreatment(idx, 'intervention', e.target.value)}
                                    placeholder="e.g., Muscle energy technique (MET)"
                                    rows={2}
                                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>YouTube Video URL</label>
                                <input
                                    type="text"
                                    value={treat.videoUrl || ''}
                                    onChange={(e) => updateTreatment(idx, 'videoUrl', e.target.value)}
                                    placeholder="https://youtube.com/watch?v=..."
                                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                                />
                            </div>
                        </div>

                        {/* Col 3: Dosages */}
                        <div style={{ display: 'flex', flexDirection: 'column', borderLeft: '1px solid #e2e8f0', paddingLeft: '12px' }}>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Dosages / Tips</label>
                            
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                                {(treat.dosages || []).map((dos, dIdx) => (
                                    <span key={dIdx} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '12px', background: '#e0e7ff', color: '#4338ca', fontSize: '0.75rem', fontWeight: 600 }}>
                                        {dos}
                                        <button type="button" onClick={() => removeDosage(idx, dIdx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4338ca', fontSize: '1rem', padding: 0, lineHeight: 1 }}>×</button>
                                    </span>
                                ))}
                            </div>
                            <div style={{ display: 'flex', gap: '6px' }}>
                                <input
                                    type="text"
                                    placeholder="Add dosage and press Enter"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault()
                                            addDosage(idx, e.target.value)
                                            e.target.value = ''
                                        }
                                    }}
                                    style={{ flex: 1, padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                                />
                                <button type="button" onClick={(e) => {
                                    const input = e.target.closest('div').querySelector('input')
                                    addDosage(idx, input.value)
                                    input.value = ''
                                }} style={{ padding: '6px 12px', borderRadius: '6px', background: '#6366f1', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.75rem' }}>Add</button>
                            </div>
                        </div>
                        
                    </div>
                ))}
                {treatments.length === 0 && (
                    <div className="empty-table-state" style={{ padding: '2rem', textAlign: 'center', border: '2px dashed #cbd5e1', borderRadius: '12px', color: '#64748b' }}>
                        No treatments added. Click "+ Add Treatment" below.
                    </div>
                )}
            </div>
            <div className="table-footer" style={{ marginTop: '16px' }}>
                <button type="button" className="btn-small" style={{ background: '#4338ca', color: '#fff', padding: '8px 16px', borderRadius: '8px', fontWeight: 600 }} onClick={addTreatment}>+ Add Treatment</button>
            </div>
        </div>
    )
}

export default { DiagnosisPhaseEditor, ProblemPhaseEditor, TreatmentPhaseEditor }
