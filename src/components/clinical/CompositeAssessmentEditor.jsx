import React, { useState } from 'react'
import ImageUpload from '../common/ImageUpload'
import { ROM_CLINICAL_TIP } from '../../config/clinicalPhases'
import './PhaseEditors.css'

/**
 * CompositeAssessmentEditor
 * 
 * Admin editor for managing multiple assessment sections within a single step.
 * The step's content has: { sections: [...], clinicalTip: '...' }
 * Each section has a `type` and type-specific data.
 * 
 * Props:
 *   step  - the entire step object
 *   onUpdate(step) - called with the updated step
 */

const SECTION_TYPES = [
  { value: 'observation', label: '👁️ Observation', desc: 'Posture observation with image views' },
  { value: 'rom', label: '📐 ROM (AROM / PROM)', desc: 'Range of motion entries' },
  { value: 'mmt', label: '💪 MMT', desc: 'Manual muscle test grades' },
  { value: 'sensory_exam', label: '🫀 Sensory Exam', desc: 'Dermatome sensory testing' },
  { value: 'flexibility_test', label: '🧘 Flexibility Tests', desc: 'Flexibility test entries' },
  { value: 'special_tests', label: '🧪 Special Tests', desc: 'Positive/negative clinical tests' },
  { value: 'palpation', label: '🤲 Palpation', desc: 'Palpation findings by tissue type' },
  { value: 'cervical_curve', label: '🦴 Cervical Curve', desc: 'Visual examination of spinal curvature' },
  { value: 'investigations', label: '📸 Imagery', desc: 'X-ray, MRI, imagery studies' },
  { value: 'mri_findings', label: '📸 MRI Findings', desc: 'Imagery findings with customizable status pills & optional warnings' },
  { value: 'mri_imaging', label: '🖼️ MRI Imaging', desc: 'Side-by-side MRI images with zoom & fullscreen' },
  { value: 'umnl_screening', label: '🧠 UMNL Screening', desc: 'Neurological test outcomes & screening' },
  { value: 'mcq', label: '❓ MCQ', desc: 'Multiple choice clinical decision question' },
  { value: 'essay', label: '📝 Essay', desc: 'Short answer / reflective question' },
]

export default function CompositeAssessmentEditor({ step, onUpdate }) {
  const content = step?.content || {}
  const sections = content.sections || []
  const clinicalTip = content.clinicalTip || ''
  const [expandedIdx, setExpandedIdx] = useState(null)
  const [showAddMenu, setShowAddMenu] = useState(false)

  const updateSections = (newSections) => {
    onUpdate({
      ...step,
      content: { ...content, sections: newSections }
    })
  }

  const addSection = (type) => {
    const newSection = createDefaultSection(type)
    updateSections([...sections, newSection])
    setExpandedIdx(sections.length)
    setShowAddMenu(false)
  }

  const removeSection = (idx) => {
    const updated = sections.filter((_, i) => i !== idx)
    updateSections(updated)
    if (expandedIdx === idx) setExpandedIdx(null)
  }

  const moveSection = (idx, direction) => {
    const newIdx = idx + direction
    if (newIdx < 0 || newIdx >= sections.length) return
    const updated = [...sections]
    const temp = updated[idx]
    updated[idx] = updated[newIdx]
    updated[newIdx] = temp
    updateSections(updated)
    setExpandedIdx(newIdx)
  }

  const updateSection = (idx, updatedSection) => {
    const updated = [...sections]
    updated[idx] = updatedSection
    updateSections(updated)
  }

  const updateClinicalTip = (value) => {
    onUpdate({
      ...step,
      content: { ...content, clinicalTip: value }
    })
  }

  return (
    <div className="phase-editor assessment-phase">
      <div className="phase-header">
        <h4>🔬 Composite Examination Step</h4>
        <p>Add multiple examination sections that will be displayed together on one scrollable page.</p>
      </div>

      {/* Sections List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
        {sections.map((section, idx) => {
          const sectionMeta = SECTION_TYPES.find(t => t.value === section.type) || { label: section.type, desc: '' }
          const isExpanded = expandedIdx === idx

          return (
            <div key={idx} style={{
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              overflow: 'hidden',
              background: isExpanded ? '#f8faff' : '#fff'
            }}>
              {/* Section Header */}
              <div
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px', cursor: 'pointer',
                  background: isExpanded ? '#eef2ff' : '#fafbfc',
                  borderBottom: isExpanded ? '1px solid #e2e8f0' : 'none'
                }}
                onClick={() => setExpandedIdx(isExpanded ? null : idx)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.1rem' }}>{sectionMeta.label.split(' ')[0]}</span>
                  <strong style={{ fontSize: '0.9rem', color: '#1e293b' }}>
                    {section.title || sectionMeta.label}
                  </strong>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    {section.type === 'observation' && `${(section.views || []).length} views`}
                    {section.type === 'rom' && `${(section.entries || []).length} entries`}
                    {section.type === 'mmt' && `${(section.entries || []).length} muscles`}
                    {section.type === 'flexibility_test' && `${(section.entries || []).length} tests`}
                    {section.type === 'special_tests' && `${(section.entries || []).length} tests`}
                    {section.type === 'palpation' && `${(section.entries || []).length} entries`}
                    {section.type === 'investigations' && `${(section.entries || []).length} studies`}
                    {section.type === 'mcq' && `Questions & ${(section.options || []).length} options`}
                    {section.type === 'essay' && `Short answer question`}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '4px' }} onClick={e => e.stopPropagation()}>
                  <button type="button" className="btn-delete-small" title="Move Up" disabled={idx === 0} onClick={() => moveSection(idx, -1)}>↑</button>
                  <button type="button" className="btn-delete-small" title="Move Down" disabled={idx === sections.length - 1} onClick={() => moveSection(idx, 1)}>↓</button>
                  <button type="button" className="btn-delete-small" title="Remove" onClick={() => removeSection(idx)}>🗑</button>
                </div>
              </div>

              {/* Expanded Editor */}
              {isExpanded && (
                <div style={{ padding: '16px' }}>
                  {/* Section Title Override */}
                  <label style={{ display: 'block', marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase' }}>Section Title</span>
                    <input
                      value={section.title || ''}
                      onChange={e => updateSection(idx, { ...section, title: e.target.value })}
                      placeholder={sectionMeta.label}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', marginTop: '4px' }}
                    />
                  </label>

                  {/* Type-specific editor */}
                  <SectionEditor
                    section={section}
                    onUpdate={(updated) => updateSection(idx, updated)}
                  />
                </div>
              )}
            </div>
          )
        })}

        {sections.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8', background: '#f8f9fc', borderRadius: '10px', border: '1px dashed #cbd5e1' }}>
            No sections added yet. Click "＋ Add Section" to start building this examination step.
          </div>
        )}
      </div>

      {/* Add Section Button */}
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <button
          type="button"
          className="btn-small"
          onClick={() => setShowAddMenu(!showAddMenu)}
          style={{ width: '100%', padding: '10px', fontSize: '0.9rem' }}
        >
          ＋ Add Section
        </button>

        {showAddMenu && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
            background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)', marginTop: '4px', overflow: 'hidden'
          }}>
            {(step?.category === 'composite_imaging'
              ? SECTION_TYPES.filter(st => ['mri_findings', 'mri_imaging', 'umnl_screening'].includes(st.value))
              : SECTION_TYPES.filter(st => !['mri_findings', 'mri_imaging', 'umnl_screening'].includes(st.value))
            ).map(st => (
              <button
                key={st.value}
                type="button"
                onClick={() => addSection(st.value)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px',
                  width: '100%', border: 'none', background: 'none', cursor: 'pointer',
                  textAlign: 'left', fontSize: '0.85rem', borderBottom: '1px solid #f1f5f9'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <span style={{ fontSize: '1.1rem' }}>{st.label.split(' ')[0]}</span>
                <div>
                  <div style={{ fontWeight: 600, color: '#1e293b' }}>{st.label}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{st.desc}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Clinical Tip */}
      <div style={{ padding: '14px', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a', marginBottom: '20px' }}>
        <label>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#92400e', textTransform: 'uppercase' }}>
            💡 Clinical Tip (shown at bottom)
          </span>
          <textarea
            value={clinicalTip}
            onChange={e => updateClinicalTip(e.target.value)}
            rows={3}
            placeholder="Add a clinical tip for this examination step..."
            style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #fde68a', fontSize: '0.85rem', marginTop: '6px', background: '#fff' }}
          />
        </label>
      </div>
    </div>
  )
}

/* ── Helper: Create default section data by type ── */
function createDefaultSection(type) {
  const base = { type, title: '' }
  switch (type) {
    case 'observation':
      return { ...base, views: [], findings: [] }
    case 'rom':
      return { ...base, subType: 'arom', endFeelMode: 'overall', endFeel: '', entries: [] }
    case 'mmt':
      return { ...base, entries: [] }
    case 'sensory_exam':
      return { ...base, entries: [] }
    case 'flexibility_test':
      return { ...base, entries: [], tags: [] }
    case 'special_tests':
      return { ...base, entries: [] }
    case 'palpation':
      return { 
        ...base, 
        image_url: '',
        status_title: 'Status',
        status_options: [
          { label: 'Normal', value: 'normal', type: 'normal' },
          { label: 'Tender', value: 'tender', type: 'mid' },
          { label: 'Tender++', value: 'tender_plus', type: 'extreme' }
        ],
        entries: [] 
      }
    case 'cervical_curve':
      return {
        ...base,
        options: [
            { id: 'reversed', title: 'Reversed Curve', image_url: '', footer_text: 'Not present', selected_footer_text: 'Detected in this patient' },
            { id: 'normal', title: 'Normal Lordosis', image_url: '', footer_text: 'Not present', selected_footer_text: 'Detected in this patient' },
            { id: 'flattened', title: 'Flattened', image_url: '', footer_text: 'Not present', selected_footer_text: 'Detected in this patient' }
        ],
        selected_option_id: 'normal'
      }
    case 'investigations':
      return { ...base, entries: [] }
    case 'mri_findings':
      return {
        ...base,
        image_url: '',
        status_title: 'Status',
        status_options: [
          { label: 'Normal', value: 'normal', type: 'normal' },
          { label: 'Abnormal', value: 'abnormal', type: 'extreme' }
        ],
        entries: [] 
      }
    case 'mri_imaging':
      return {
        ...base,
        images: [
          { title: 'Sagittal View', image_url: '' },
          { title: 'Axial View', image_url: '' }
        ],
        enable_warning: false,
        warning_text: '',
        warning_level: ''
      }
    case 'umnl_screening':
      return {
        ...base,
        subtitle: '',
        entries: [],
        outcome_title: 'Outcome',
        outcome_subtitle: '',
        outcome_type: 'success'
      }
    case 'mcq':
      return { ...base, question: '', options: [{ id: 'a', text: '', isCorrect: true }], explanationOnFail: '', explanationOnSuccess: '', hint: '' }
    case 'essay':
      return { ...base, question: '', expectedKeywords: [], hint: '', placeholder: '' }
    default:
      return { ...base, data: {} }
  }
}

/* ── Per-type Section Editors ── */
function SectionEditor({ section, onUpdate }) {
  switch (section.type) {
    case 'observation': return <ObservationSectionEditor section={section} onUpdate={onUpdate} />
    case 'rom': return <RomSectionEditor section={section} onUpdate={onUpdate} />
    case 'mmt': return <MmtSectionEditor section={section} onUpdate={onUpdate} />
    case 'sensory_exam': return <SensoryExamSectionEditor section={section} onUpdate={onUpdate} />
    case 'flexibility_test': return <FlexibilityTestSectionEditor section={section} onUpdate={onUpdate} />
    case 'special_tests': return <SpecialTestsSectionEditor section={section} onUpdate={onUpdate} />
    case 'palpation': return <PalpationSectionEditor section={section} onUpdate={onUpdate} />
    case 'cervical_curve': return <CervicalCurveEditor section={section} onUpdate={onUpdate} />
    case 'investigations': return <InvestigationsSectionEditor section={section} onUpdate={onUpdate} />
    case 'mri_findings': return <MriFindingsSectionEditor section={section} onUpdate={onUpdate} />
    case 'mri_imaging': return <MriImagingSectionEditor section={section} onUpdate={onUpdate} />
    case 'umnl_screening': return <UmnlScreeningSectionEditor section={section} onUpdate={onUpdate} />
    case 'mcq': return <McqSectionEditor section={section} onUpdate={onUpdate} />
    case 'essay': return <EssaySectionEditor section={section} onUpdate={onUpdate} />
    default: return <div style={{ color: '#94a3b8' }}>Unknown section type: {section.type}</div>
  }
}

/* ── Observation Editor ── */
function ObservationSectionEditor({ section, onUpdate }) {
  const views = section.views || []
  const addView = () => onUpdate({ ...section, views: [...views, { label: '', image_url: '', findings: [] }] })
  const updateView = (idx, field, value) => {
    const u = [...views]; u[idx] = { ...u[idx], [field]: value }; onUpdate({ ...section, views: u })
  }
  const removeView = (idx) => onUpdate({ ...section, views: views.filter((_, i) => i !== idx) })
  const addViewFinding = (vIdx) => {
    const u = [...views]; u[vIdx] = { ...u[vIdx], findings: [...(u[vIdx].findings || []), ''] }; onUpdate({ ...section, views: u })
  }
  const updateViewFinding = (vIdx, fIdx, val) => {
    const u = [...views]; const f = [...(u[vIdx].findings || [])]; f[fIdx] = val; u[vIdx] = { ...u[vIdx], findings: f }; onUpdate({ ...section, views: u })
  }
  const removeViewFinding = (vIdx, fIdx) => {
    const u = [...views]; u[vIdx] = { ...u[vIdx], findings: (u[vIdx].findings || []).filter((_, i) => i !== fIdx) }; onUpdate({ ...section, views: u })
  }

  return (
    <div>
      <div className="section-header">
        <h5>Views</h5>
        <button type="button" className="btn-small" onClick={addView}>+ Add View</button>
      </div>
      {views.map((view, idx) => (
        <div key={idx} className="list-item" style={{ marginBottom: '12px' }}>
          <div className="item-header">
            <span>View {idx + 1}</span>
            <button type="button" className="btn-delete-small" onClick={() => removeView(idx)}>🗑</button>
          </div>
          <div className="form-grid">
            <label>
              Label <span className="required">*</span>
              <input value={view.label || ''} onChange={e => updateView(idx, 'label', e.target.value)} placeholder="e.g. Anterior, Posterior, Sagittal" />
            </label>
            <div style={{ gridColumn: '1 / -1' }}>
              <ImageUpload label="View Image" folderType="observation" initialUrl={view.image_url} onUpload={url => updateView(idx, 'image_url', url)} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <div className="section-header"><h5>Findings</h5><button type="button" className="btn-small" onClick={() => addViewFinding(idx)}>+ Add</button></div>
              {(view.findings || []).map((f, fIdx) => (
                <div key={fIdx} className="finding-item" style={{ display: 'flex', gap: '6px', marginBottom: '4px' }}>
                  <input value={f} onChange={e => updateViewFinding(idx, fIdx, e.target.value)} placeholder="e.g. Forward head posture" style={{ flex: 1 }} />
                  <button type="button" className="btn-delete-small" onClick={() => removeViewFinding(idx, fIdx)}>×</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
      {views.length === 0 && <div className="empty-state-box">No views. Click "+ Add View".</div>}
    </div>
  )
}

/* ── ROM Editor ── */
function RomSectionEditor({ section, onUpdate }) {
  const entries = section.entries || []
  const subType = section.subType || 'arom'
  const endFeelMode = section.endFeelMode || 'overall'
  const endFeel = section.endFeel || ''

  const addEntry = () => onUpdate({ ...section, entries: [...entries, { movement: '', value: '', pain: '', endFeel: '', image_url: '' }] })
  const updateEntry = (idx, field, val) => { const u = [...entries]; u[idx] = { ...u[idx], [field]: val }; onUpdate({ ...section, entries: u }) }
  const removeEntry = (idx) => onUpdate({ ...section, entries: entries.filter((_, i) => i !== idx) })

  return (
    <div>
      <div style={{ display: 'flex', gap: '20px', marginBottom: '16px' }}>
        <label>
          <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>ROM Type</span>
          <select value={subType} onChange={e => onUpdate({ ...section, subType: e.target.value })} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}>
            <option value="arom">AROM (Active)</option>
            <option value="prom">PROM (Passive)</option>
          </select>
        </label>
        <label>
          <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>End Feel Mode</span>
          <select value={endFeelMode} onChange={e => onUpdate({ ...section, endFeelMode: e.target.value })} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}>
            <option value="overall">Single / Overall (Bottom)</option>
            <option value="per_movement">Per Movement (Table Column)</option>
          </select>
        </label>
      </div>

      <div className="section-header"><h5>Entries</h5><button type="button" className="btn-small" onClick={addEntry}>+ Add</button></div>
      {entries.map((e, idx) => (
        <div key={idx} className="list-item" style={{ marginBottom: '12px' }}>
          <div className="item-header"><span>{idx + 1}</span><button type="button" className="btn-delete-small" onClick={() => removeEntry(idx)}>🗑</button></div>
          <div className="form-grid">
            <label style={{ gridColumn: 'span 2' }}>Movement *<input value={e.movement || ''} onChange={ev => updateEntry(idx, 'movement', ev.target.value)} placeholder="e.g. Flexion" /></label>
            <label>ROM Value<input value={e.value || ''} onChange={ev => updateEntry(idx, 'value', ev.target.value)} placeholder="e.g. Normal, Limited" /></label>
            <label>Pain
              <select value={e.pain || ''} onChange={ev => updateEntry(idx, 'pain', ev.target.value)}>
                <option value="">Select</option><option value="Absent">Absent</option><option value="Present">Present</option><option value="Slightly">Slightly</option>
              </select>
            </label>
            
            <div style={{ gridColumn: '1 / -1' }}>
              <ImageUpload label="Movement Image (Hover)" folderType="rom" initialUrl={e.image_url} onUpload={url => updateEntry(idx, 'image_url', url)} />
            </div>

            {endFeelMode === 'per_movement' && (
              <label style={{ gridColumn: '1 / -1' }}>End Feel<input value={e.endFeel || ''} onChange={ev => updateEntry(idx, 'endFeel', ev.target.value)} placeholder="e.g. Firm, Empty" /></label>
            )}
          </div>
        </div>
      ))}
      {entries.length === 0 && <div className="empty-state-box">No ROM entries.</div>}

      {endFeelMode === 'overall' && (
        <div style={{ marginTop: '16px', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <label>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>Overall End Feel</span>
            <input value={endFeel} onChange={e => onUpdate({ ...section, endFeel: e.target.value })} placeholder="e.g. EMPTY" style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
          </label>
        </div>
      )}
    </div>
  )
}

/* ── MMT Editor ── */
function MmtSectionEditor({ section, onUpdate }) {
  const entries = section.entries || []
  const addEntry = () => onUpdate({ ...section, entries: [...entries, { level: '', muscle_action: '', grade: '', status: '', notes: '' }] })
  const updateEntry = (idx, field, val) => { const u = [...entries]; u[idx] = { ...u[idx], [field]: val }; onUpdate({ ...section, entries: u }) }
  const removeEntry = (idx) => onUpdate({ ...section, entries: entries.filter((_, i) => i !== idx) })

  return (
    <div>
      <div className="section-header"><h5>Muscle Actions</h5><button type="button" className="btn-small" onClick={addEntry}>+ Add</button></div>
      {entries.map((e, idx) => (
        <div key={idx} className="list-item">
          <div className="item-header"><span>{idx + 1}</span><button type="button" className="btn-delete-small" onClick={() => removeEntry(idx)}>🗑</button></div>
          <div className="form-grid">
            <label>Level (e.g. C5)<input value={e.level || ''} onChange={ev => updateEntry(idx, 'level', ev.target.value)} placeholder="C5" /></label>
            <label>Muscle Action *<input value={e.muscle_action || e.muscle || ''} onChange={ev => updateEntry(idx, 'muscle_action', ev.target.value)} placeholder="e.g. Shoulder abduction" /></label>
            <label>Grade (0-5)
              <select value={e.grade || ''} onChange={ev => updateEntry(idx, 'grade', ev.target.value)}>
                <option value="">Select</option>{[0,1,2,3,4,5].map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </label>
            <label>Status
              <select value={e.status || ''} onChange={ev => updateEntry(idx, 'status', ev.target.value)}>
                <option value="">Select status</option>
                <option value="Normal">Normal</option>
                <option value="Slightly Weak">Slightly Weak</option>
                <option value="Weak">Weak</option>
              </select>
            </label>
            <label style={{ gridColumn: '1/-1' }}>Notes<input value={e.notes || ''} onChange={ev => updateEntry(idx, 'notes', ev.target.value)} /></label>
          </div>
        </div>
      ))}
      {entries.length === 0 && <div className="empty-state-box">No MMT entries.</div>}
    </div>
  )
}

/* ── Sensory Exam Editor ── */
function SensoryExamSectionEditor({ section, onUpdate }) {
  const entries = section.entries || []
  const addEntry = () => onUpdate({ ...section, entries: [...entries, { level: '', sense: '', status: '', notes: '' }] })
  const updateEntry = (idx, field, val) => { const u = [...entries]; u[idx] = { ...u[idx], [field]: val }; onUpdate({ ...section, entries: u }) }
  const removeEntry = (idx) => onUpdate({ ...section, entries: entries.filter((_, i) => i !== idx) })

  return (
    <div>
      <div className="section-header"><h5>Sensory Entries</h5><button type="button" className="btn-small" onClick={addEntry}>+ Add</button></div>
      {entries.map((e, idx) => (
        <div key={idx} className="list-item">
          <div className="item-header"><span>{idx + 1}</span><button type="button" className="btn-delete-small" onClick={() => removeEntry(idx)}>🗑</button></div>
          <div className="form-grid">
            <label>Level (e.g. C5, Thumb)<input value={e.level || ''} onChange={ev => updateEntry(idx, 'level', ev.target.value)} placeholder="C5, Web space, Thumb..." /></label>
            <label>Sense / Area *<input value={e.sense || ''} onChange={ev => updateEntry(idx, 'sense', ev.target.value)} placeholder="e.g. Light touch, Pin prick" /></label>
            <label>Status
              <select value={e.status || ''} onChange={ev => updateEntry(idx, 'status', ev.target.value)}>
                <option value="">Select status</option>
                <option value="Normal">Normal</option>
                <option value="Abnormal">Abnormal</option>
              </select>
            </label>
            <label style={{ gridColumn: '1/-1' }}>Notes<input value={e.notes || ''} onChange={ev => updateEntry(idx, 'notes', ev.target.value)} /></label>
          </div>
        </div>
      ))}
      {entries.length === 0 && <div className="empty-state-box">No sensory entries.</div>}
    </div>
  )
}

/* ── Flexibility Test Editor ── */
function FlexibilityTestSectionEditor({ section, onUpdate }) {
  const entries = section.entries || []
  const tags = section.tags || []
  const addEntry = () => onUpdate({ ...section, entries: [...entries, { test_name: '', result: '', image_url: '', notes: '', link: '' }] })
  const updateEntry = (idx, field, val) => { const u = [...entries]; u[idx] = { ...u[idx], [field]: val }; onUpdate({ ...section, entries: u }) }
  const removeEntry = (idx) => onUpdate({ ...section, entries: entries.filter((_, i) => i !== idx) })

  const [tagInput, setTagInput] = useState('')
  const addTag = () => { if (tagInput.trim()) { onUpdate({ ...section, tags: [...tags, tagInput.trim()] }); setTagInput('') } }
  const removeTag = (tIdx) => onUpdate({ ...section, tags: tags.filter((_, i) => i !== tIdx) })

  return (
    <div>
      {/* Tags management */}
      <div style={{ marginBottom: '20px', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <div className="section-header"><h5>Flexibility Findings (Tags)</h5></div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
          {tags.map((tag, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: '#e2e8f0', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>
              {tag}
              <button type="button" onClick={() => removeTag(i)} style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer', fontSize: '1rem', lineHeight: 1, color: '#94a3b8' }}>×</button>
            </span>
          ))}
          {tags.length === 0 && <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>No tags added.</span>}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input 
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
            placeholder="Add finding tag..." 
            style={{ flex: 1, padding: '6px 10px', fontSize: '0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
          <button type="button" className="btn-small" onClick={addTag}>Add</button>
        </div>
      </div>

      <div className="section-header"><h5>Detailed Test Cards (with Images)</h5><button type="button" className="btn-small" onClick={addEntry}>+ Add Test</button></div>
      {entries.map((e, idx) => (
        <div key={idx} className="list-item">
          <div className="item-header"><span>{idx + 1}</span><button type="button" className="btn-delete-small" onClick={() => removeEntry(idx)}>🗑</button></div>
          <div className="form-grid">
            <label style={{ gridColumn: '1 / -1' }}>Test Name *<input value={e.test_name || ''} onChange={ev => updateEntry(idx, 'test_name', ev.target.value)} placeholder="e.g. 1. Upper Trap Tight" /></label>
            <div style={{ gridColumn: '1 / -1' }}>
              <ImageUpload label="Test Image" folderType="flexibility" initialUrl={e.image_url} onUpload={url => updateEntry(idx, 'image_url', url)} />
            </div>
            <label>Result<input value={e.result || ''} onChange={ev => updateEntry(idx, 'result', ev.target.value)} placeholder="e.g. Positive / Tight" /></label>
            <label>Link<input value={e.link || ''} onChange={ev => updateEntry(idx, 'link', ev.target.value)} placeholder="https://..." /></label>
            <label style={{ gridColumn: '1 / -1' }}>Notes<textarea value={e.notes || ''} onChange={ev => updateEntry(idx, 'notes', ev.target.value)} rows={1} /></label>
          </div>
        </div>
      ))}
      {entries.length === 0 && <div className="empty-state-box">No flexibility test cards.</div>}
    </div>
  )
}

/* ── Special Tests Editor ── */
function SpecialTestsSectionEditor({ section, onUpdate }) {
  const entries = section.entries || []
  const addEntry = () => onUpdate({ ...section, entries: [...entries, { test_name: '', result: '', notes: '', link: '', image_url: '' }] })
  const updateEntry = (idx, field, val) => { const u = [...entries]; u[idx] = { ...u[idx], [field]: val }; onUpdate({ ...section, entries: u }) }
  const removeEntry = (idx) => onUpdate({ ...section, entries: entries.filter((_, i) => i !== idx) })

  return (
    <div>
      <div className="section-header"><h5>Tests</h5><button type="button" className="btn-small" onClick={addEntry}>+ Add</button></div>
      {entries.map((e, idx) => (
        <div key={idx} className="list-item">
          <div className="item-header"><span>{idx + 1}</span><button type="button" className="btn-delete-small" onClick={() => removeEntry(idx)}>🗑</button></div>
          <div className="form-grid">
            <label style={{ gridColumn: '1 / -1' }}>Test Name *<input value={e.test_name || ''} onChange={ev => updateEntry(idx, 'test_name', ev.target.value)} placeholder="e.g. Spurling" /></label>
            <div style={{ gridColumn: '1 / -1' }}>
              <ImageUpload label="Test Image" folderType="special_tests" initialUrl={e.image_url} onUpload={url => updateEntry(idx, 'image_url', url)} />
            </div>
            <label>Result
              <select value={e.result || ''} onChange={ev => updateEntry(idx, 'result', ev.target.value)}>
                <option value="">Select</option><option value="positive">Positive (+)</option><option value="negative">Negative (-)</option><option value="n/a">N/A</option>
              </select>
            </label>
            <label>Link (YouTube)<input value={e.link || ''} onChange={ev => updateEntry(idx, 'link', ev.target.value)} placeholder="https://youtube.com/..." /></label>
            <label style={{ gridColumn: '1 / -1' }}>Notes<input value={e.notes || ''} onChange={ev => updateEntry(idx, 'notes', ev.target.value)} /></label>
          </div>
        </div>
      ))}
      {entries.length === 0 && <div className="empty-state-box">No special tests.</div>}
    </div>
  )
}

/* ── Palpation Editor ── */
function PalpationSectionEditor({ section, onUpdate }) {
  const entries = section.entries || []
  const statusOptions = section.status_options || []
  
  const addEntry = () => onUpdate({ ...section, entries: [...entries, { level: '', status_value: '', notes: '' }] })
  const updateEntry = (idx, field, val) => { const u = [...entries]; u[idx] = { ...u[idx], [field]: val }; onUpdate({ ...section, entries: u }) }
  const removeEntry = (idx) => onUpdate({ ...section, entries: entries.filter((_, i) => i !== idx) })

  const addOption = () => onUpdate({ 
    ...section, 
    status_options: [...statusOptions, { label: 'New Option', value: 'new_' + Date.now(), type: 'normal' }] 
  })
  const updateOption = (idx, field, val) => { 
    const u = [...statusOptions]; u[idx] = { ...u[idx], [field]: val }; onUpdate({ ...section, status_options: u }) 
  }
  const removeOption = (idx) => onUpdate({ 
    ...section, 
    status_options: statusOptions.filter((_, i) => i !== idx) 
  })

  return (
    <div className="space-y-6">
      <div className="form-grid">
        <label style={{ gridColumn: '1 / -1' }}>
          Status Column Title
          <input 
            value={section.status_title || 'Status'} 
            onChange={e => onUpdate({ ...section, status_title: e.target.value })} 
            placeholder="e.g. Rotation status, Tender status" 
          />
        </label>
        <div style={{ gridColumn: '1 / -1' }}>
          <ImageUpload 
            label="Section Image (Reference)" 
            folderType="palpation" 
            initialUrl={section.image_url} 
            onUpload={url => onUpdate({ ...section, image_url: url })} 
          />
        </div>
      </div>

      <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <div className="section-header !mb-4">
          <h5 style={{ fontSize: '0.85rem', color: '#475569' }}>Status Options & Colors</h5>
          <button type="button" className="btn-small" onClick={addOption}>+ Add Option</button>
        </div>
        <div className="space-y-2">
          {statusOptions.map((opt, oIdx) => (
            <div key={oIdx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input 
                value={opt.label} 
                onChange={e => updateOption(oIdx, 'label', e.target.value)} 
                placeholder="Label (Normal)" 
                style={{ flex: 1, padding: '6px 10px', fontSize: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
              />
              <select 
                value={opt.type} 
                onChange={e => updateOption(oIdx, 'type', e.target.value)}
                style={{ width: '100px', padding: '6px', fontSize: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
              >
                <option value="normal">Normal</option>
                <option value="mid">Mid</option>
                <option value="extreme">Extreme</option>
              </select>
              <button type="button" className="btn-delete-small" onClick={() => removeOption(oIdx)}>×</button>
            </div>
          ))}
        </div>
      </div>

      <div className="section-header">
        <h5>Entries (Patient Data)</h5>
        <button type="button" className="btn-small" onClick={addEntry}>+ Add Level</button>
      </div>
      <div className="space-y-3">
        {entries.map((e, idx) => (
          <div key={idx} className="list-item">
            <div className="item-header">
              <span>{idx + 1}</span>
              <button type="button" className="btn-delete-small" onClick={() => removeEntry(idx)}>🗑</button>
            </div>
            <div className="form-grid">
              <label>
                Level (e.g. C3-C4)
                <input value={e.level || ''} onChange={ev => updateEntry(idx, 'level', ev.target.value)} placeholder="C4" />
              </label>
              <label>
                {section.status_title || 'Status'}
                <select 
                  value={e.status_value || ''} 
                  onChange={ev => updateEntry(idx, 'status_value', ev.target.value)}
                >
                  <option value="">Select status</option>
                  {statusOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </label>
              <label style={{ gridColumn: '1 / -1' }}>
                Notes
                <input value={e.notes || ''} onChange={ev => updateEntry(idx, 'notes', ev.target.value)} />
              </label>
            </div>
          </div>
        ))}
      </div>
      {entries.length === 0 && <div className="empty-state-box">No palpation entries. Click "+ Add Level".</div>}
    </div>
  )
}

/* ── Cervical Curve Editor ── */
function CervicalCurveEditor({ section, onUpdate }) {
  const options = section.options || []
  
  const addOption = () => onUpdate({ 
    ...section, 
    options: [...options, { id: 'opt_' + Date.now(), title: 'New Option', image_url: '', footer_text: 'Not present', selected_footer_text: 'Detected in this patient' }] 
  })
  
  const updateOption = (idx, field, val) => {
    const u = [...options]; u[idx] = { ...u[idx], [field]: val }; onUpdate({ ...section, options: u })
  }
  
  const removeOption = (idx) => onUpdate({ ...section, options: options.filter((_, i) => i !== idx) })

  return (
    <div className="space-y-4">
      <div className="section-header">
        <h5>Examination Options</h5>
        <button type="button" className="btn-small" onClick={addOption}>+ Add Option</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {options.map((opt, idx) => (
          <div key={idx} className={`p-4 rounded-xl border-2 transition-all ${section.selected_option_id === opt.id ? 'border-blue-500 bg-blue-50' : 'border-slate-100 bg-white'}`}>
            <div className="flex justify-between items-start mb-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name={`selected-curve-${section.id || 'curr'}`}
                  checked={section.selected_option_id === opt.id}
                  onChange={() => onUpdate({ ...section, selected_option_id: opt.id })}
                />
                <span className="text-sm font-bold text-slate-700">Set as Finding</span>
              </label>
              <button type="button" className="text-slate-400 hover:text-red-500" onClick={() => removeOption(idx)}>×</button>
            </div>

            <div className="space-y-3">
              <label className="block">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Title</span>
                <input 
                  value={opt.title} 
                  onChange={e => updateOption(idx, 'title', e.target.value)} 
                  className="w-full mt-1 p-2 border border-slate-200 rounded-md font-medium text-sm"
                />
              </label>
              <ImageUpload 
                label="Option Image" 
                folderType="clinical" 
                initialUrl={opt.image_url} 
                onUpload={url => updateOption(idx, 'image_url', url)} 
              />
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Footer (Unselected)</span>
                  <input 
                    value={opt.footer_text} 
                    onChange={e => updateOption(idx, 'footer_text', e.target.value)} 
                    className="w-full mt-1 p-2 border border-slate-200 rounded-md text-[11px]"
                  />
                </label>
                <label className="block">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Footer (Selected)</span>
                  <input 
                    value={opt.selected_footer_text} 
                    onChange={e => updateOption(idx, 'selected_footer_text', e.target.value)} 
                    className="w-full mt-1 p-2 border border-slate-200 rounded-md text-[11px]"
                  />
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>
      {options.length === 0 && <div className="empty-state-box">No options defined. Click "+ Add Option".</div>}
    </div>
  )
}

/* ── Investigations Editor ── */
function InvestigationsSectionEditor({ section, onUpdate }) {
  const entries = section.entries || []
  const addEntry = () => onUpdate({ ...section, entries: [...entries, { modality: '', image_url: '', report_text: '', conclusion: '' }] })
  const updateEntry = (idx, field, val) => { const u = [...entries]; u[idx] = { ...u[idx], [field]: val }; onUpdate({ ...section, entries: u }) }
  const removeEntry = (idx) => onUpdate({ ...section, entries: entries.filter((_, i) => i !== idx) })

  return (
    <div>
      <div className="section-header"><h5>Imaging Studies</h5><button type="button" className="btn-small" onClick={addEntry}>+ Add</button></div>
      {entries.map((e, idx) => (
        <div key={idx} className="list-item">
          <div className="item-header"><span>{idx + 1}</span><button type="button" className="btn-delete-small" onClick={() => removeEntry(idx)}>🗑</button></div>
          <div className="form-grid">
            <label>Modality *
              <select value={e.modality || ''} onChange={ev => updateEntry(idx, 'modality', ev.target.value)}>
                <option value="">Select</option><option value="xray">X-Ray</option><option value="mri">MRI</option><option value="ct">CT</option><option value="ultrasound">Ultrasound</option>
              </select>
            </label>
            <div style={{ gridColumn: '1 / -1' }}>
              <ImageUpload label="Image" folderType="investigations" initialUrl={e.image_url} onUpload={url => updateEntry(idx, 'image_url', url)} />
            </div>
            <label style={{ gridColumn: '1/-1' }}>Report<textarea value={e.report_text || ''} onChange={ev => updateEntry(idx, 'report_text', ev.target.value)} rows={2} placeholder="Findings..." /></label>
            <label style={{ gridColumn: '1/-1' }}>Conclusion *<textarea value={e.conclusion || ''} onChange={ev => updateEntry(idx, 'conclusion', ev.target.value)} rows={2} placeholder="Clinical implication..." /></label>
          </div>
        </div>
      ))}
      {entries.length === 0 && <div className="empty-state-box">No imaging studies.</div>}
    </div>
  )
}
/* ── MCQ Section Editor ── */
function McqSectionEditor({ section, onUpdate }) {
  const options = section.options || []
  const addOption = () => onUpdate({ ...section, options: [...options, { id: String.fromCharCode(97 + options.length), text: '', isCorrect: false }] })
  const updateOption = (idx, field, val) => { const u = [...options]; u[idx] = { ...u[idx], [field]: val }; onUpdate({ ...section, options: u }) }
  const removeOption = (idx) => onUpdate({ ...section, options: options.filter((_, i) => i !== idx) })

  return (
    <div className="space-y-4">
      <label className="block text-sm font-bold text-slate-700">
        Question Text *
        <textarea
          value={section.question || ''}
          onChange={e => onUpdate({ ...section, question: e.target.value })}
          rows={2}
          className="w-full mt-1 p-2 border border-slate-300 rounded-md font-medium"
          placeholder="Ask a clinical question..."
        />
      </label>

      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div className="flex justify-between items-center mb-4">
          <h6 className="text-xs font-black text-slate-500 uppercase tracking-widest">Options</h6>
          <button type="button" className="btn-small" onClick={addOption}>+ Add Option</button>
        </div>
        <div className="space-y-3">
          {options.map((opt, idx) => (
            <div key={idx} className="flex flex-col gap-3 bg-white p-3 rounded-lg border border-slate-200">
              <div className="flex gap-3 items-start">
                <input
                  type="radio"
                  name={`mcq-correct-${section.title || 'sect'}`}
                  checked={opt.isCorrect}
                  onChange={() => {
                    const u = options.map((o, i) => ({ ...o, isCorrect: i === idx }))
                    onUpdate({ ...section, options: u })
                  }}
                  className="mt-2"
                />
                <input
                  value={opt.text}
                  onChange={e => updateOption(idx, 'text', e.target.value)}
                  placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                  className="flex-1 p-1.5 text-sm border-b border-slate-100 focus:border-blue-400 outline-none"
                />
                <button type="button" className="text-slate-400 hover:text-red-500 transition-colors" onClick={() => removeOption(idx)}>×</button>
              </div>
              
              <div className="bg-slate-50 p-3 rounded border border-slate-100 text-sm ml-6">
                 <h6 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Rich Content (Optional)</h6>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                   <div className="col-span-1 md:col-span-2">
                     <ImageUpload
                       label="Option Image"
                       folderType="step-image"
                       initialUrl={opt.imageUrl}
                       onUpload={url => updateOption(idx, 'imageUrl', url)}
                     />
                     <div className="mt-2">
                       <label className="text-[11px] text-slate-500">Or enter Image URL manually:</label>
                       <input
                         value={opt.imageUrl || ''}
                         onChange={e => updateOption(idx, 'imageUrl', e.target.value)}
                         placeholder="https://..."
                         className="w-full mt-1 p-1.5 border border-slate-200 rounded outline-none focus:border-blue-400"
                       />
                     </div>
                   </div>
                   <div>
                     <label className="text-[11px] text-slate-500 font-bold">Subtext (under image)</label>
                     <input
                       value={opt.subtext || ''}
                       onChange={e => updateOption(idx, 'subtext', e.target.value)}
                       placeholder="Detected in this patient"
                       className="w-full mt-1 p-1.5 border border-slate-200 rounded outline-none focus:border-blue-400"
                     />
                   </div>
                   <div>
                     <label className="text-[11px] text-slate-500 font-bold">Video URL/Link</label>
                     <input
                       value={opt.videoUrl || ''}
                       onChange={e => updateOption(idx, 'videoUrl', e.target.value)}
                       placeholder="https://youtube.com/watch?v=..."
                       className="w-full mt-1 p-1.5 border border-slate-200 rounded outline-none focus:border-blue-400"
                     />
                   </div>
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <label className="block text-sm font-bold text-slate-700">
          Max Score
          <input
            type="number"
            min="1"
            max="100"
            value={section.maxScore || ''}
            onChange={e => onUpdate({ ...section, maxScore: parseInt(e.target.value) || '' })}
            placeholder="e.g. 10"
            className="w-full mt-1 p-2 border border-slate-300 rounded-md text-sm"
          />
        </label>
        <label className="block text-sm font-bold text-green-700">
          Explanation on Success
          <textarea
            value={section.explanationOnSuccess || ''}
            onChange={e => onUpdate({ ...section, explanationOnSuccess: e.target.value })}
            rows={2}
            className="w-full mt-1 p-2 border border-green-200 rounded-md text-xs"
          />
        </label>
        <label className="block text-sm font-bold text-red-700">
          Explanation on Fail
          <textarea
            value={section.explanationOnFail || ''}
            onChange={e => onUpdate({ ...section, explanationOnFail: e.target.value })}
            rows={2}
            className="w-full mt-1 p-2 border border-red-200 rounded-md text-xs"
          />
        </label>
      </div>

      <div className="flex gap-4">
        {/* Placeholder for future side-by-side elements if needed. Old single hint removed. */}
      </div>

      <HintsEditor 
        hints={section.hints || (section.hint ? [{ text: section.hint, delaySeconds: section.hintDelaySeconds || 0 }] : [])}
        onUpdate={(newHints) => onUpdate({ ...section, hints: newHints, hint: null, hintDelaySeconds: null })}
      />
    </div>
  )
}

/* ── Essay Section Editor ── */
function EssaySectionEditor({ section, onUpdate }) {
  const [keywordInput, setKeywordInput] = useState('')
  const keywords = section.expectedKeywords || []

  const addKeyword = () => {
    if (keywordInput.trim()) {
      onUpdate({ ...section, expectedKeywords: [...keywords, keywordInput.trim()] })
      setKeywordInput('')
    }
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-bold text-slate-700">
        Question Text *
        <textarea
          value={section.question || ''}
          onChange={e => onUpdate({ ...section, question: e.target.value })}
          rows={3}
          className="w-full mt-1 p-3 border border-slate-300 rounded-md font-medium"
          placeholder="Ask a reflective or analytical question..."
        />
      </label>

      <label className="block text-sm font-bold text-slate-700">
        Placeholder Text (Optional)
        <textarea
          value={section.placeholder || ''}
          onChange={e => onUpdate({ ...section, placeholder: e.target.value })}
          rows={2}
          className="w-full mt-1 p-2 border border-slate-300 rounded-md text-sm"
          placeholder="e.g. Type your reasoning here..."
        />
      </label>

      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
        <div className="section-header !mb-2">
            <h6 className="text-xs font-black text-blue-600 uppercase tracking-widest">Expected Keywords (Auto-scoring)</h6>
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {keywords.map((kw, i) => (
            <span key={i} className="flex items-center gap-2 px-3 py-1 bg-white border border-blue-200 text-blue-700 rounded-full text-xs font-bold shadow-sm">
              {kw}
              <button type="button" onClick={() => onUpdate({ ...section, expectedKeywords: keywords.filter((_, idx) => idx !== i) })} className="text-blue-300 hover:text-red-500">×</button>
            </span>
          ))}
          {keywords.length === 0 && <p className="text-[11px] text-blue-400 italic">No keywords added. System will accept any thoughtful answer.</p>}
        </div>
        <div className="flex gap-2">
           <input
             value={keywordInput}
             onChange={e => setKeywordInput(e.target.value)}
             onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
             placeholder="Add keyword..."
             className="flex-1 p-2 text-xs border border-blue-200 rounded-md"
           />
           <button type="button" className="btn-small" onClick={addKeyword}>Add</button>
        </div>
      </div>

      <label className="block text-sm font-bold text-slate-700 mt-4">
        Max Score
        <input
          type="number"
          min="1"
          max="100"
          value={section.maxScore || ''}
          onChange={e => onUpdate({ ...section, maxScore: parseInt(e.target.value) || '' })}
          placeholder="e.g. 20"
          className="w-full md:w-1/3 mt-1 p-2 border border-slate-300 rounded-md text-sm"
        />
      </label>

      <div className="flex gap-4">
        {/* Placeholder for future side-by-side elements if needed. Old single hint removed. */}
      </div>

      <HintsEditor 
        hints={section.hints || (section.hint ? [{ text: section.hint, delaySeconds: section.hintDelaySeconds || 0 }] : [])}
        onUpdate={(newHints) => onUpdate({ ...section, hints: newHints, hint: null, hintDelaySeconds: null })}
      />
    </div>
  )
}

/* ── Multiple Hints Editor ── */
function HintsEditor({ hints, onUpdate }) {
  const addHint = () => {
    onUpdate([...(hints || []), { text: '', delaySeconds: 0 }]);
  };
  const updateHint = (idx, field, value) => {
    const updated = [...(hints || [])];
    updated[idx][field] = value;
    onUpdate(updated);
  };
  const removeHint = (idx) => {
    onUpdate((hints || []).filter((_, i) => i !== idx));
  };

  return (
    <div className="mt-4 bg-[#eef2ff] p-4 border border-[#c7d2fe] rounded-xl flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h6 className="text-[0.9rem] font-bold text-[#3730a3] flex items-center gap-2">
          <span className="text-xl">💡</span> Multiple Hints
        </h6>
        <button type="button" onClick={addHint} className="text-xs bg-white text-[#4f46e5] px-4 py-2 rounded-lg hover:bg-[#e0e7ff] border border-[#a5b4fc] font-bold transition-all shadow-sm">
          + Add Hint
        </button>
      </div>
      
      {(!hints || hints.length === 0) && (
        <p className="text-sm text-[#818cf8] italic">No hints added. Students will not see any hints.</p>
      )}

      <div className="flex flex-col gap-3">
        {(hints || []).map((hint, idx) => (
          <div key={idx} className="flex gap-4 items-start bg-white p-4 rounded-xl border border-[#c7d2fe] shadow-sm relative group">
            <div className="w-8 h-8 shrink-0 flex items-center justify-center rounded-full bg-[#eef2ff] text-[#4f46e5] font-bold text-sm">
              {idx + 1}
            </div>
            
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Hint Text</label>
              <textarea
                value={hint.text || ''}
                onChange={e => updateHint(idx, 'text', e.target.value)}
                rows={2}
                className="w-full p-2.5 border border-slate-200 rounded-lg text-[0.95rem] outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] transition-all"
                placeholder="What should the student consider?"
              />
            </div>
            
            <div className="w-28 shrink-0">
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Delay (sec)</label>
              <input
                type="number"
                min="0"
                value={hint.delaySeconds || 0}
                onChange={e => updateHint(idx, 'delaySeconds', parseInt(e.target.value) || 0)}
                className="w-full p-2.5 border border-slate-200 rounded-lg text-[0.95rem] outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] transition-all"
              />
            </div>
            
            <button 
              type="button" 
              onClick={() => removeHint(idx)} 
              className="absolute -top-2 -right-2 w-7 h-7 bg-white border border-slate-200 rounded-full text-slate-400 hover:text-red-500 hover:border-red-200 flex items-center justify-center text-lg leading-none shadow-sm opacity-0 group-hover:opacity-100 transition-opacity" 
              title="Remove Hint"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── MRI Findings Editor ── */
function MriFindingsSectionEditor({ section, onUpdate }) {
  const entries = section.entries || []
  const statusOptions = section.status_options || []
  
  const addEntry = () => onUpdate({ ...section, entries: [...entries, { level: '', status_value: '', is_warning: false, warning_title: '', warning_text: '' }] })
  const updateEntry = (idx, field, val) => { const u = [...entries]; u[idx] = { ...u[idx], [field]: val }; onUpdate({ ...section, entries: u }) }
  const removeEntry = (idx) => onUpdate({ ...section, entries: entries.filter((_, i) => i !== idx) })

  const addOption = () => onUpdate({ 
    ...section, 
    status_options: [...statusOptions, { label: 'New Option', value: 'new_' + Date.now(), type: 'normal' }] 
  })
  const updateOption = (idx, field, val) => { 
    const u = [...statusOptions]; u[idx] = { ...u[idx], [field]: val }; onUpdate({ ...section, status_options: u }) 
  }
  const removeOption = (idx) => onUpdate({ 
    ...section, 
    status_options: statusOptions.filter((_, i) => i !== idx) 
  })

  return (
    <div className="space-y-6">
      <div className="form-grid">
        <label style={{ gridColumn: '1 / -1' }}>
          Status Column Title
          <input 
            value={section.status_title || 'Status'} 
            onChange={e => onUpdate({ ...section, status_title: e.target.value })} 
            placeholder="e.g. Tenderness, Bulge Status" 
          />
        </label>
        <div style={{ gridColumn: '1 / -1' }}>
          <ImageUpload 
            label="MRI/Imaging Visual" 
            folderType="imaging" 
            initialUrl={section.image_url} 
            onUpload={url => onUpdate({ ...section, image_url: url })} 
          />
        </div>
      </div>

      <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <div className="section-header !mb-4">
          <h5 style={{ fontSize: '0.85rem', color: '#475569' }}>Status Options & Colors</h5>
          <button type="button" className="btn-small" onClick={addOption}>+ Add Option</button>
        </div>
        <div className="space-y-2">
          {statusOptions.map((opt, oIdx) => (
            <div key={oIdx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input 
                value={opt.label} 
                onChange={e => updateOption(oIdx, 'label', e.target.value)} 
                placeholder="Label (Normal)" 
                style={{ flex: 1, padding: '6px 10px', fontSize: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
              />
              <select 
                value={opt.type} 
                onChange={e => updateOption(oIdx, 'type', e.target.value)}
                style={{ width: '100px', padding: '6px', fontSize: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
              >
                <option value="normal">Normal (Green)</option>
                <option value="mid">Mid (Orange)</option>
                <option value="extreme">Extreme (Red)</option>
              </select>
              <button type="button" className="btn-delete-small" onClick={() => removeOption(oIdx)}>×</button>
            </div>
          ))}
        </div>
      </div>

      <div className="section-header">
        <h5>Findings & Warnings</h5>
        <button type="button" className="btn-small" onClick={addEntry}>+ Add Level</button>
      </div>
      <div className="space-y-3">
        {entries.map((e, idx) => (
          <div key={idx} className="list-item" style={{ border: e.is_warning ? '2px solid #fecaca' : '1px solid #e2e8f0' }}>
            <div className="item-header" style={{ background: e.is_warning ? '#fef2f2' : '' }}>
              <span style={{ color: e.is_warning ? '#dc2626' : 'inherit', fontWeight: e.is_warning ? 'bold' : 'normal' }}>
                {e.is_warning ? '⚠️ ' : ''}Level {idx + 1}
              </span>
              <button type="button" className="btn-delete-small" onClick={() => removeEntry(idx)}>🗑</button>
            </div>
            <div className="form-grid">
              <label>
                Level (e.g. C5-C6)
                <input value={e.level || ''} onChange={ev => updateEntry(idx, 'level', ev.target.value)} placeholder="C5-C6" />
              </label>
              <label>
                {section.status_title || 'Status'}
                <select 
                  value={e.status_value || ''} 
                  onChange={ev => updateEntry(idx, 'status_value', ev.target.value)}
                >
                  <option value="">Select status</option>
                  {statusOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </label>
              <div style={{ gridColumn: '1 / -1', marginTop: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: e.is_warning ? '8px' : '0' }}>
                  <input 
                    type="checkbox" 
                    checked={e.is_warning || false} 
                    onChange={ev => updateEntry(idx, 'is_warning', ev.target.checked)} 
                    style={{ width: '16px', height: '16px' }}
                  />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#b91c1c' }}>Mark as Warning</span>
                </label>
                {e.is_warning && (
                  <div className="space-y-2">
                    <label>
                      Warning Title
                      <input 
                        value={e.warning_title || ''} 
                        onChange={ev => updateEntry(idx, 'warning_title', ev.target.value)} 
                        placeholder="e.g. C5-C6 disc is touching the spinal cord" 
                        style={{ 
                          border: '1px solid #fca5a5', 
                          background: '#fef2f2',
                          color: '#991b1b'
                        }}
                      />
                    </label>
                    <label>
                      Warning Description
                      <input 
                        value={e.warning_text || ''} 
                        onChange={ev => updateEntry(idx, 'warning_text', ev.target.value)} 
                        placeholder="e.g. Possible cervical myelopathy (UMNL). Must rule out before treatment." 
                        style={{ 
                          border: '1px solid #fca5a5', 
                          background: '#fef2f2',
                          color: '#991b1b'
                        }}
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {entries.length === 0 && <div className="empty-state-box">No findings recorded. Click "+ Add Level".</div>}
    </div>
  )
}

/* ── MRI Imaging Editor ── */
function MriImagingSectionEditor({ section, onUpdate }) {
  const images = section.images || []

  const updateImage = (idx, field, val) => {
    const u = [...images]; u[idx] = { ...u[idx], [field]: val }; onUpdate({ ...section, images: u })
  }
  const addImage = () => onUpdate({ ...section, images: [...images, { title: 'New View', image_url: '' }] })
  const removeImage = (idx) => onUpdate({ ...section, images: images.filter((_, i) => i !== idx) })

  return (
    <div className="space-y-6">
      <div className="section-header">
        <h5>MRI Images</h5>
        <button type="button" className="btn-small" onClick={addImage}>+ Add Image</button>
      </div>
      <div className="space-y-4">
        {images.map((img, idx) => (
          <div key={idx} className="list-item">
            <div className="item-header">
              <span>Image {idx + 1}</span>
              <button type="button" className="btn-delete-small" onClick={() => removeImage(idx)}>🗑</button>
            </div>
            <div className="form-grid">
              <label style={{ gridColumn: '1 / -1' }}>
                Image Title
                <input value={img.title || ''} onChange={e => updateImage(idx, 'title', e.target.value)} placeholder="e.g. Sagittal View" />
              </label>
              <div style={{ gridColumn: '1 / -1' }}>
                <ImageUpload 
                  label={`Image ${idx + 1}`}
                  folderType="imaging" 
                  initialUrl={img.image_url} 
                  onUpload={url => updateImage(idx, 'image_url', url)} 
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      {images.length === 0 && <div className="empty-state-box">No images added. Click "+ Add Image".</div>}

      {/* Warning toggle */}
      <div style={{ background: '#fef2f2', padding: '16px', borderRadius: '12px', border: '1px solid #fecaca' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: section.enable_warning ? '12px' : '0' }}>
          <input 
            type="checkbox" 
            checked={section.enable_warning || false} 
            onChange={e => onUpdate({ ...section, enable_warning: e.target.checked })} 
            style={{ width: '16px', height: '16px' }}
          />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#b91c1c' }}>⚠️ Enable Warning Banner</span>
        </label>
        {section.enable_warning && (
          <div className="form-grid" style={{ marginTop: '8px' }}>
            <label>
              Warning Level
              <input 
                value={section.warning_level || ''} 
                onChange={e => onUpdate({ ...section, warning_level: e.target.value })} 
                placeholder="e.g. C5-C6" 
              />
            </label>
            <label style={{ gridColumn: '1 / -1' }}>
              Warning Text
              <input 
                value={section.warning_text || ''} 
                onChange={e => onUpdate({ ...section, warning_text: e.target.value })} 
                placeholder="e.g. C5-C6 disc is touching the spinal cord" 
                style={{ border: '1px solid #fca5a5', background: '#fff', color: '#991b1b' }}
              />
            </label>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── UMNL Screening Editor ── */
function UmnlScreeningSectionEditor({ section, onUpdate }) {
  const entries = section.entries || []
  
  const addEntry = () => onUpdate({ 
    ...section, 
    entries: [...entries, { 
      title: 'New Test', 
      subtitle: '', 
      options: [
        { label: 'Negative', value: 'negative', colorType: 'normal' },
        { label: 'Positive', value: 'positive', colorType: 'extreme' }
      ], 
      selected_value: 'negative' 
    }] 
  })
  
  const updateEntry = (idx, field, val) => { 
    const u = [...entries]; u[idx] = { ...u[idx], [field]: val }; onUpdate({ ...section, entries: u }) 
  }
  
  const removeEntry = (idx) => onUpdate({ ...section, entries: entries.filter((_, i) => i !== idx) })

  // Nested updates for options inside a test entry
  const addOption = (eIdx) => {
    const u = [...entries]
    u[eIdx].options = [...(u[eIdx].options || []), { label: 'New', value: 'new_' + Date.now(), colorType: 'normal' }]
    onUpdate({ ...section, entries: u })
  }
  const updateOption = (eIdx, oIdx, field, val) => {
    const u = [...entries]
    u[eIdx].options[oIdx] = { ...u[eIdx].options[oIdx], [field]: val }
    onUpdate({ ...section, entries: u })
  }
  const removeOption = (eIdx, oIdx) => {
    const u = [...entries]
    u[eIdx].options = u[eIdx].options.filter((_, i) => i !== oIdx)
    onUpdate({ ...section, entries: u })
  }

  return (
    <div className="space-y-6">
      <div className="form-grid">
        <label style={{ gridColumn: '1 / -1' }}>
          Section Subtitle
          <input 
            value={section.subtitle || ''} 
            onChange={e => onUpdate({ ...section, subtitle: e.target.value })} 
            placeholder="e.g. Perform the following tests..." 
          />
        </label>
      </div>

      <div className="section-header">
        <h5>Neurological Tests</h5>
        <button type="button" className="btn-small" onClick={addEntry}>+ Add Test</button>
      </div>
      <div className="space-y-4">
        {entries.map((e, idx) => (
          <div key={idx} className="list-item !p-0 overflow-hidden" style={{ border: '1px solid #cbd5e1' }}>
            <div className="item-header" style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1', padding: '10px 14px' }}>
              <span className="font-bold text-slate-700">Test {idx + 1}</span>
              <button type="button" className="btn-delete-small" onClick={() => removeEntry(idx)}>🗑</button>
            </div>
            <div className="p-4 space-y-4">
              <div className="form-grid">
                <label>
                  Test Title
                  <input value={e.title || ''} onChange={ev => updateEntry(idx, 'title', ev.target.value)} placeholder="e.g. Babinski Sign" />
                </label>
                <label>
                  Test Subtitle
                  <input value={e.subtitle || ''} onChange={ev => updateEntry(idx, 'subtitle', ev.target.value)} placeholder="e.g. Dorsiflexion of big toe = positive" />
                </label>
                <label style={{ gridColumn: '1 / -1' }}>
                  <strong>Selected Result (Presented to Student)</strong>
                  <select 
                    value={e.selected_value || ''} 
                    onChange={ev => updateEntry(idx, 'selected_value', ev.target.value)}
                    style={{ background: '#eef2ff', borderColor: '#c7d2fe', color: '#4338ca', fontWeight: 'bold' }}
                  >
                    <option value="">Select a result</option>
                    {(e.options || []).map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </label>
              </div>
              
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Available Options</span>
                  <button type="button" className="btn-small" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => addOption(idx)}>+ Option</button>
                </div>
                <div className="space-y-2">
                  {(e.options || []).map((opt, oIdx) => (
                    <div key={oIdx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input 
                        value={opt.label} 
                        onChange={ev => updateOption(idx, oIdx, 'label', ev.target.value)} 
                        placeholder="Label" 
                        style={{ flex: 1, padding: '4px 8px', fontSize: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                      />
                      <input 
                        value={opt.value} 
                        onChange={ev => updateOption(idx, oIdx, 'value', ev.target.value)} 
                        placeholder="Value (id)" 
                        style={{ flex: 1, padding: '4px 8px', fontSize: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                      />
                      <select 
                        value={opt.colorType} 
                        onChange={ev => updateOption(idx, oIdx, 'colorType', ev.target.value)}
                        style={{ padding: '4px', fontSize: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                      >
                        <option value="normal">Green (Normal)</option>
                        <option value="mid">Orange (Mid)</option>
                        <option value="extreme">Red (Extreme)</option>
                      </select>
                      <button type="button" className="btn-delete-small" style={{ width: '24px', height: '24px' }} onClick={() => removeOption(idx, oIdx)}>×</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {entries.length === 0 && <div className="empty-state-box">No tests recorded. Click "+ Add Test".</div>}

      <div style={{ background: '#fdf4ff', padding: '16px', borderRadius: '12px', border: '1px solid #fbcfe8', marginTop: '24px' }}>
        <h5 style={{ fontSize: '0.9rem', color: '#9d174d', marginBottom: '16px', marginTop: 0 }}>Outcome Summary</h5>
        <div className="form-grid">
          <label>
            Outcome Title
            <input 
              value={section.outcome_title || ''} 
              onChange={e => onUpdate({ ...section, outcome_title: e.target.value })} 
              placeholder="e.g. Outcome: UMNL Excluded" 
            />
          </label>
          <label>
            Outcome Type (Color)
            <select 
              value={section.outcome_type || 'success'} 
              onChange={e => onUpdate({ ...section, outcome_type: e.target.value })}
            >
              <option value="success">Success / Safe (Green)</option>
              <option value="warning">Warning / Refer (Red/Orange)</option>
              <option value="neutral">Neutral / Informative (Blue)</option>
            </select>
          </label>
          <label style={{ gridColumn: '1 / -1' }}>
            Outcome Subtitle / Explanation
            <input 
              value={section.outcome_subtitle || ''} 
              onChange={e => onUpdate({ ...section, outcome_subtitle: e.target.value })} 
              placeholder="e.g. Safe to Proceed" 
            />
          </label>
        </div>
      </div>
    </div>
  )
}

