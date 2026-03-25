import React, { useState } from 'react'
import './PhaseEditors.css'

/**
 * CompositeHistoryEditor
 * 
 * Admin editor for managing a unified Subjective History step.
 * Content shape:
 * {
 *   chief_complaint: '',
 *   key_findings: [], // strings
 *   lifestyle: { occupational: '', household: '' },
 *   pain_characteristics: { intensity: null, pain_type: '', relief: '', aggravating: '' }
 * }
 */
export default function CompositeHistoryEditor({ step, onUpdate }) {
  const content = step?.content || {}
  
  // Safe extraction with fallbacks
  const chief_complaint = content.chief_complaint || ''
  const key_findings = content.key_findings || []
  const lifestyle = content.lifestyle || { occupational: '', household: '' }
  const pain = content.pain_characteristics || { intensity: '', pain_type: '', relief: '', aggravating: '' }
  const past_history = Array.isArray(content.past_history) ? content.past_history : []
  const medication = Array.isArray(content.medication) ? content.medication : []

  const [tagInput, setTagInput] = useState('')

  const handleUpdate = (field, value) => {
    onUpdate({
      ...step,
      content: { ...content, [field]: value }
    })
  }

  const handleLifestyleUpdate = (field, value) => {
    handleUpdate('lifestyle', { ...lifestyle, [field]: value })
  }

  const handlePainUpdate = (field, value) => {
    handleUpdate('pain_characteristics', { ...pain, [field]: value })
  }

  const handleAddTag = (e) => {
    e.preventDefault()
    if (!tagInput.trim()) return
    if (!key_findings.includes(tagInput.trim())) {
      handleUpdate('key_findings', [...key_findings, tagInput.trim()])
    }
    setTagInput('')
  }

  const handleRemoveTag = (tagToRemove) => {
    handleUpdate('key_findings', key_findings.filter(t => t !== tagToRemove))
  }

  const handlePastHistoryListUpdate = (index, field, value) => {
    const newList = [...past_history]
    newList[index] = { ...newList[index], [field]: value }
    handleUpdate('past_history', newList)
  }

  const handleAddPastHistory = () => {
    handleUpdate('past_history', [...past_history, { condition: '', since: '', notes: '' }])
  }

  const handleRemovePastHistory = (index) => {
    handleUpdate('past_history', past_history.filter((_, i) => i !== index))
  }

  const handleMedicationListUpdate = (index, field, value) => {
    const newList = [...medication]
    newList[index] = { ...newList[index], [field]: value }
    handleUpdate('medication', newList)
  }

  const handleAddMedication = () => {
    handleUpdate('medication', [...medication, { name: '', dose: '', frequency: '', notes: '' }])
  }

  const handleRemoveMedication = (index) => {
    handleUpdate('medication', medication.filter((_, i) => i !== index))
  }

  return (
    <div className="phase-editor history-phase">
      <div className="phase-header">
        <h4>📋 Subjective History (Unified)</h4>
        <p>Enter all patient history findings to be displayed on a single composite screen.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* SECTION 1: History of Pain (Context & Tags) */}
        <div className="editor-card" style={{ padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h5 style={{ marginTop: 0, marginBottom: '16px', color: '#1e293b', fontSize: '1.1rem', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px' }}>
            Part 1: Case Context & Key Findings
          </h5>
          
          <label style={{ display: 'block', marginBottom: '16px' }}>
            <span style={{ fontWeight: 600, display: 'block', marginBottom: '6px' }}>Chief Complaint *</span>
            <textarea
              value={chief_complaint}
              onChange={e => handleUpdate('chief_complaint', e.target.value)}
              rows={4}
              placeholder='e.g. "الألم كان بيجيلي زمان لما كنت بشتغل مندوبة مبيعات..."'
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            />
          </label>

          <div style={{ marginBottom: '8px' }}>
            <span style={{ fontWeight: 600, display: 'block', marginBottom: '6px' }}>Key Findings (Tags)</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
              {key_findings.map((tag, idx) => (
                <span key={idx} style={{ 
                  background: '#e0f2fe', color: '#0369a1', padding: '4px 12px', 
                  borderRadius: '16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px'
                }}>
                  {tag}
                  <button type="button" onClick={() => handleRemoveTag(tag)} style={{ background: 'none', border: 'none', color: '#0284c7', cursor: 'pointer', padding: 0 }}>&times;</button>
                </span>
              ))}
              {key_findings.length === 0 && <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontStyle: 'italic' }}>No tags added.</span>}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAddTag(e) }}
                placeholder="e.g. Chronic, Sharp/Numb, Progressive"
                style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
              <button type="button" onClick={handleAddTag} className="btn-secondary">Add Tag</button>
            </div>
          </div>
        </div>

        {/* SECTION 2: Lifestyle Factors */}
        <div className="editor-card" style={{ padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h5 style={{ marginTop: 0, marginBottom: '16px', color: '#1e293b', fontSize: '1.1rem', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px' }}>
            Part 2: Lifestyle Factors
          </h5>
          
          <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <label>
              <span style={{ fontWeight: 600, display: 'block', marginBottom: '6px' }}>Occupational</span>
              <input
                value={lifestyle.occupational}
                onChange={e => handleLifestyleUpdate('occupational', e.target.value)}
                placeholder="e.g. Sales (Repeated heavy lifting)"
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </label>
            <label>
              <span style={{ fontWeight: 600, display: 'block', marginBottom: '6px' }}>Household</span>
              <input
                value={lifestyle.household}
                onChange={e => handleLifestyleUpdate('household', e.target.value)}
                placeholder="e.g. Heavy lifting (Gas tanks)"
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </label>
          </div>
        </div>

        {/* SECTION 3: Pain Characteristics */}
        <div className="editor-card" style={{ padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h5 style={{ marginTop: 0, marginBottom: '16px', color: '#1e293b', fontSize: '1.1rem', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px' }}>
            Part 3: Pain Characteristics
          </h5>
          
          <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <label>
              <span style={{ fontWeight: 600, display: 'block', marginBottom: '6px' }}>Pain Intensity (0-10)</span>
              <select
                value={pain.intensity ?? ''}
                onChange={e => handlePainUpdate('intensity', e.target.value ? Number(e.target.value) : '')}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff' }}
              >
                <option value="">Select Intensity...</option>
                {[0,1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}/10</option>)}
              </select>
            </label>

            <label>
              <span style={{ fontWeight: 600, display: 'block', marginBottom: '6px' }}>Pain Type / Quality</span>
              <input
                value={pain.pain_type}
                onChange={e => handlePainUpdate('pain_type', e.target.value)}
                placeholder="e.g. Tingling, Burning"
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </label>

            <label>
              <span style={{ fontWeight: 600, display: 'block', marginBottom: '6px' }}>Relieving Factors</span>
              <input
                value={pain.relief}
                onChange={e => handlePainUpdate('relief', e.target.value)}
                placeholder="e.g. Rest, Ice"
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </label>

            <label>
              <span style={{ fontWeight: 600, display: 'block', marginBottom: '6px' }}>Aggravating Factors</span>
              <input
                value={pain.aggravating}
                onChange={e => handlePainUpdate('aggravating', e.target.value)}
                placeholder="e.g. Lifting, Prolonged sitting"
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </label>
          </div>
        </div>

        {/* SECTION 4: Past History */}
        <div className="editor-card" style={{ padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px' }}>
            <h5 style={{ margin: 0, color: '#1e293b', fontSize: '1.1rem' }}>Part 4: Past History</h5>
            <button type="button" onClick={handleAddPastHistory} className="btn-secondary" style={{ padding: '4px 12px', fontSize: '0.8rem' }}>+ Add Condition</button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {past_history.map((item, idx) => (
              <div key={idx} style={{ padding: '12px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', position: 'relative' }}>
                <button 
                  type="button" 
                  onClick={() => handleRemovePastHistory(idx)}
                  style={{ position: 'absolute', top: '8px', right: '8px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.2rem' }}
                >
                  &times;
                </button>
                <div className="form-grid" style={{ gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '8px' }}>
                  <label>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Condition</span>
                    <input value={item.condition} onChange={e => handlePastHistoryListUpdate(idx, 'condition', e.target.value)} placeholder="e.g. Hypertension" style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                  </label>
                  <label>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Since</span>
                    <input value={item.since} onChange={e => handlePastHistoryListUpdate(idx, 'since', e.target.value)} placeholder="e.g. 2018" style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                  </label>
                </div>
                <label>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Notes</span>
                  <textarea value={item.notes} onChange={e => handlePastHistoryListUpdate(idx, 'notes', e.target.value)} rows={2} placeholder="Optional details..." style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                </label>
              </div>
            ))}
            {past_history.length === 0 && <p style={{ color: '#64748b', fontSize: '0.9rem', fontStyle: 'italic', textAlign: 'center' }}>No past history conditions added.</p>}
          </div>
        </div>

        {/* SECTION 5: Medication */}
        <div className="editor-card" style={{ padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px' }}>
            <h5 style={{ margin: 0, color: '#1e293b', fontSize: '1.1rem' }}>Part 5: Medication</h5>
            <button type="button" onClick={handleAddMedication} className="btn-secondary" style={{ padding: '4px 12px', fontSize: '0.8rem' }}>+ Add Medication</button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {medication.map((item, idx) => (
              <div key={idx} style={{ padding: '12px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', position: 'relative' }}>
                <button 
                  type="button" 
                  onClick={() => handleRemoveMedication(idx)}
                  style={{ position: 'absolute', top: '8px', right: '8px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.2rem' }}
                >
                  &times;
                </button>
                <div className="form-grid" style={{ gridTemplateColumns: '2fr 1fr 1fr', gap: '12px', marginBottom: '8px' }}>
                  <label>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Name</span>
                    <input value={item.name} onChange={e => handleMedicationListUpdate(idx, 'name', e.target.value)} placeholder="e.g. Lisinopril" style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                  </label>
                  <label>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Dose</span>
                    <input value={item.dose} onChange={e => handleMedicationListUpdate(idx, 'dose', e.target.value)} placeholder="e.g. 10mg" style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                  </label>
                  <label>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Freq.</span>
                    <input value={item.frequency} onChange={e => handleMedicationListUpdate(idx, 'frequency', e.target.value)} placeholder="e.g. 1x/day" style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                  </label>
                </div>
                <label>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Notes</span>
                  <input value={item.notes} onChange={e => handleMedicationListUpdate(idx, 'notes', e.target.value)} placeholder="Additional instructions..." style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                </label>
              </div>
            ))}
            {medication.length === 0 && <p style={{ color: '#64748b', fontSize: '0.9rem', fontStyle: 'italic', textAlign: 'center' }}>No medications added.</p>}
          </div>
        </div>

      </div>
    </div>
  )
}
