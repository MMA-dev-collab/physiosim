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
  { value: 'flexibility_test', label: '🧘 Flexibility Tests', desc: 'Flexibility test entries' },
  { value: 'special_tests', label: '🧪 Special Tests', desc: 'Positive/negative clinical tests' },
  { value: 'palpation', label: '🤲 Palpation', desc: 'Palpation findings by tissue type' },
  { value: 'investigations', label: '🩻 Investigations', desc: 'X-ray, MRI, imaging studies' },
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
        <h4>🔬 Composite Assessment Step</h4>
        <p>Add multiple assessment sections that will be displayed together on one scrollable page.</p>
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
            No sections added yet. Click "＋ Add Section" to start building this assessment step.
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
            {SECTION_TYPES.map(st => (
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
      <div style={{ padding: '14px', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a' }}>
        <label>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#92400e', textTransform: 'uppercase' }}>
            💡 Clinical Tip (shown at bottom)
          </span>
          <textarea
            value={clinicalTip}
            onChange={e => updateClinicalTip(e.target.value)}
            rows={3}
            placeholder="Add a clinical tip for this assessment step..."
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
      return { ...base, subType: 'arom', entries: [] }
    case 'mmt':
      return { ...base, entries: [] }
    case 'flexibility_test':
      return { ...base, entries: [], tags: [] }
    case 'special_tests':
      return { ...base, entries: [] }
    case 'palpation':
      return { ...base, entries: [] }
    case 'investigations':
      return { ...base, entries: [] }
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
    case 'flexibility_test': return <FlexibilityTestSectionEditor section={section} onUpdate={onUpdate} />
    case 'special_tests': return <SpecialTestsSectionEditor section={section} onUpdate={onUpdate} />
    case 'palpation': return <PalpationSectionEditor section={section} onUpdate={onUpdate} />
    case 'investigations': return <InvestigationsSectionEditor section={section} onUpdate={onUpdate} />
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
  const addEntry = () => onUpdate({ ...section, entries: [...entries, { movement: '', value: '', pain: '', end_feel: '' }] })
  const updateEntry = (idx, field, val) => { const u = [...entries]; u[idx] = { ...u[idx], [field]: val }; onUpdate({ ...section, entries: u }) }
  const removeEntry = (idx) => onUpdate({ ...section, entries: entries.filter((_, i) => i !== idx) })

  return (
    <div>
      <label style={{ marginBottom: '12px', display: 'block' }}>
        ROM Type
        <select value={subType} onChange={e => onUpdate({ ...section, subType: e.target.value })} style={{ marginLeft: '8px' }}>
          <option value="arom">AROM (Active)</option>
          <option value="prom">PROM (Passive)</option>
        </select>
      </label>
      <div className="section-header"><h5>Entries</h5><button type="button" className="btn-small" onClick={addEntry}>+ Add</button></div>
      {entries.map((e, idx) => (
        <div key={idx} className="list-item">
          <div className="item-header"><span>{idx + 1}</span><button type="button" className="btn-delete-small" onClick={() => removeEntry(idx)}>🗑</button></div>
          <div className="form-grid">
            <label>Movement *<input value={e.movement || ''} onChange={ev => updateEntry(idx, 'movement', ev.target.value)} placeholder="e.g. Flexion" /></label>
            <label>ROM Value<input value={e.value || ''} onChange={ev => updateEntry(idx, 'value', ev.target.value)} placeholder="e.g. Limited, 45°" /></label>
            <label>Pain
              <select value={e.pain || ''} onChange={ev => updateEntry(idx, 'pain', ev.target.value)}>
                <option value="">Select</option><option value="Absent">Absent</option><option value="Present">Present</option><option value="Slightly">Slightly</option>
              </select>
            </label>
            {subType === 'prom' && <label>End Feel<input value={e.end_feel || ''} onChange={ev => updateEntry(idx, 'end_feel', ev.target.value)} placeholder="e.g. Firm, Empty" /></label>}
          </div>
        </div>
      ))}
      {entries.length === 0 && <div className="empty-state-box">No ROM entries.</div>}
    </div>
  )
}

/* ── MMT Editor ── */
function MmtSectionEditor({ section, onUpdate }) {
  const entries = section.entries || []
  const addEntry = () => onUpdate({ ...section, entries: [...entries, { muscle: '', grade: '', notes: '' }] })
  const updateEntry = (idx, field, val) => { const u = [...entries]; u[idx] = { ...u[idx], [field]: val }; onUpdate({ ...section, entries: u }) }
  const removeEntry = (idx) => onUpdate({ ...section, entries: entries.filter((_, i) => i !== idx) })

  return (
    <div>
      <div className="section-header"><h5>Muscles</h5><button type="button" className="btn-small" onClick={addEntry}>+ Add</button></div>
      {entries.map((e, idx) => (
        <div key={idx} className="list-item">
          <div className="item-header"><span>{idx + 1}</span><button type="button" className="btn-delete-small" onClick={() => removeEntry(idx)}>🗑</button></div>
          <div className="form-grid">
            <label>Muscle *<input value={e.muscle || ''} onChange={ev => updateEntry(idx, 'muscle', ev.target.value)} placeholder="e.g. Quadriceps" /></label>
            <label>Grade (0-5)
              <select value={e.grade || ''} onChange={ev => updateEntry(idx, 'grade', ev.target.value)}>
                <option value="">Select</option>{[0,1,2,3,4,5].map(g => <option key={g} value={g}>{g}</option>)}
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

/* ── Flexibility Test Editor ── */
function FlexibilityTestSectionEditor({ section, onUpdate }) {
  const entries = section.entries || []
  const addEntry = () => onUpdate({ ...section, entries: [...entries, { test_name: '', result: '', notes: '', link: '' }] })
  const updateEntry = (idx, field, val) => { const u = [...entries]; u[idx] = { ...u[idx], [field]: val }; onUpdate({ ...section, entries: u }) }
  const removeEntry = (idx) => onUpdate({ ...section, entries: entries.filter((_, i) => i !== idx) })

  return (
    <div>
      <div className="section-header"><h5>Tests</h5><button type="button" className="btn-small" onClick={addEntry}>+ Add</button></div>
      {entries.map((e, idx) => (
        <div key={idx} className="list-item">
          <div className="item-header"><span>{idx + 1}</span><button type="button" className="btn-delete-small" onClick={() => removeEntry(idx)}>🗑</button></div>
          <div className="form-grid">
            <label>Test Name *<input value={e.test_name || ''} onChange={ev => updateEntry(idx, 'test_name', ev.target.value)} placeholder="e.g. Upper Trap" /></label>
            <label>Result<input value={e.result || ''} onChange={ev => updateEntry(idx, 'result', ev.target.value)} placeholder="e.g. Tight, Normal" /></label>
            <label>Link<input value={e.link || ''} onChange={ev => updateEntry(idx, 'link', ev.target.value)} placeholder="https://..." /></label>
            <label>Notes<input value={e.notes || ''} onChange={ev => updateEntry(idx, 'notes', ev.target.value)} /></label>
          </div>
        </div>
      ))}
      {entries.length === 0 && <div className="empty-state-box">No flexibility tests.</div>}
    </div>
  )
}

/* ── Special Tests Editor ── */
function SpecialTestsSectionEditor({ section, onUpdate }) {
  const entries = section.entries || []
  const addEntry = () => onUpdate({ ...section, entries: [...entries, { test_name: '', result: '', notes: '', link: '' }] })
  const updateEntry = (idx, field, val) => { const u = [...entries]; u[idx] = { ...u[idx], [field]: val }; onUpdate({ ...section, entries: u }) }
  const removeEntry = (idx) => onUpdate({ ...section, entries: entries.filter((_, i) => i !== idx) })

  return (
    <div>
      <div className="section-header"><h5>Tests</h5><button type="button" className="btn-small" onClick={addEntry}>+ Add</button></div>
      {entries.map((e, idx) => (
        <div key={idx} className="list-item">
          <div className="item-header"><span>{idx + 1}</span><button type="button" className="btn-delete-small" onClick={() => removeEntry(idx)}>🗑</button></div>
          <div className="form-grid">
            <label>Test Name *<input value={e.test_name || ''} onChange={ev => updateEntry(idx, 'test_name', ev.target.value)} placeholder="e.g. Spurling" /></label>
            <label>Result
              <select value={e.result || ''} onChange={ev => updateEntry(idx, 'result', ev.target.value)}>
                <option value="">Select</option><option value="positive">Positive (+)</option><option value="negative">Negative (-)</option><option value="n/a">N/A</option>
              </select>
            </label>
            <label>Link<input value={e.link || ''} onChange={ev => updateEntry(idx, 'link', ev.target.value)} placeholder="https://..." /></label>
            <label>Notes<input value={e.notes || ''} onChange={ev => updateEntry(idx, 'notes', ev.target.value)} /></label>
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
  const addEntry = () => onUpdate({ ...section, entries: [...entries, { location: '', finding: '', severity: '', notes: '' }] })
  const updateEntry = (idx, field, val) => { const u = [...entries]; u[idx] = { ...u[idx], [field]: val }; onUpdate({ ...section, entries: u }) }
  const removeEntry = (idx) => onUpdate({ ...section, entries: entries.filter((_, i) => i !== idx) })

  return (
    <div>
      <div className="section-header"><h5>Entries</h5><button type="button" className="btn-small" onClick={addEntry}>+ Add</button></div>
      {entries.map((e, idx) => (
        <div key={idx} className="list-item">
          <div className="item-header"><span>{idx + 1}</span><button type="button" className="btn-delete-small" onClick={() => removeEntry(idx)}>🗑</button></div>
          <div className="form-grid">
            <label>Location *<input value={e.location || ''} onChange={ev => updateEntry(idx, 'location', ev.target.value)} placeholder="e.g. Spinous process" /></label>
            <label>Finding *<input value={e.finding || ''} onChange={ev => updateEntry(idx, 'finding', ev.target.value)} placeholder="e.g. Tenderness" /></label>
            <label>Severity
              <select value={e.severity || ''} onChange={ev => updateEntry(idx, 'severity', ev.target.value)}>
                <option value="">Select</option><option value="mild">Mild</option><option value="moderate">Moderate</option><option value="severe">Severe</option>
              </select>
            </label>
            <label>Notes<input value={e.notes || ''} onChange={ev => updateEntry(idx, 'notes', ev.target.value)} /></label>
          </div>
        </div>
      ))}
      {entries.length === 0 && <div className="empty-state-box">No palpation entries.</div>}
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
