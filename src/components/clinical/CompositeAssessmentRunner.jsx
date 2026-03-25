import React from 'react'

/**
 * CompositeAssessmentRunner
 * Renders ALL sub-tests of a single assessment Main Step on one scrollable page.
 * 
 * Props:
 *   step.content.sections[] - array of { type, title, ...data }
 *   step.content.clinicalTip - optional clinical tip text
 *   step.title - admin-given name of this Main Step
 */
export default function CompositeAssessmentRunner({ step }) {
  const content = step?.content || {}
  const sections = content.sections || []
  const clinicalTip = content.clinicalTip || null

  if (sections.length === 0) {
    return (
      <div className="car-empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p>No assessment data configured for this step.</p>
      </div>
    )
  }

  return (
    <div className="car-container">
      {/* Step Title */}
      {step.title && (
        <h2 className="car-step-title">{step.title}</h2>
      )}

      {/* Render each section */}
      {sections.map((section, idx) => (
        <div key={idx} className="bg-white rounded-[24px] p-8 border border-slate-100 shadow-sm mb-6">
          {renderSection(section)}
        </div>
      ))}

    </div>
  )
}

function renderSection(section) {
  switch (section.type) {
    case 'observation':
      return <ObservationSection section={section} />
    case 'rom':
      return <RomSection section={section} />
    case 'flexibility_test':
      return <FlexibilitySection section={section} />
    case 'special_tests':
      return <SpecialTestsSection section={section} />
    case 'investigations':
      return <InvestigationsSection section={section} />
    case 'mmt':
      return <MmtSection section={section} />
    case 'palpation':
      return <PalpationSection section={section} />
    default:
      return <GenericSection section={section} />
  }
}

/* ==========================
   OBSERVATION SECTION
   3-column image grid with labels and findings
========================== */
function ObservationSection({ section }) {
  const views = section.views || []
  const findings = section.findings || []

  return (
    <div className="car-obs">
      <h3 className="font-bold text-slate-800 mb-8">{section.title || 'Posture Observation'}</h3>
      {views.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {views.map((view, i) => (
            <div key={i} className="text-center space-y-4">
              <p className="text-sm font-bold text-slate-500">{view.label}</p>
              {view.image_url && (
                <div className="h-48 flex items-center justify-center">
                  <img
                    src={view.image_url}
                    alt={view.label || 'Observation view'}
                    className="h-full object-contain rounded-lg"
                    loading="lazy"
                  />
                </div>
              )}
              {view.findings && view.findings.length > 0 ? (
                <p className="text-xs font-medium text-slate-600">
                  {view.findings.map((f, j) => (
                    <React.Fragment key={j}>
                      {f}
                      {j < view.findings.length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </p>
              ) : (
                <div className="text-center text-slate-400 text-xs italic">Normal Findings</div>
              )}
            </div>
          ))}
        </div>
      )}
      {/* Standalone findings (not per-view) */}
      {findings.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {findings.map((f, i) => (
            <span key={i} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">{f}</span>
          ))}
        </div>
      )}
    </div>
  )
}

/* ==========================
   ROM SECTION
   Table with movement, ROM value (badge), and pain status
========================== */
function RomSection({ section }) {
  const entries = section.entries || []
  const endFeel = section.endFeel || section.end_feel || null
  const romType = section.subType || '' // 'arom' or 'prom'

  const getRomBadgeColors = (value) => {
    if (!value) return 'bg-slate-100 text-slate-600'
    const v = value.toLowerCase()
    if (v === 'normal' || v === 'full') return 'bg-green-50 text-green-600'
    if (v === 'limited' || v === 'restricted') return 'bg-red-50 text-red-600'
    return 'bg-slate-100 text-slate-600'
  }

  const getPainDotColor = (pain) => {
    if (!pain) return 'bg-slate-300'
    const p = pain.toLowerCase()
    if (p === 'present' || p === 'yes' || p === 'severe') return 'bg-red-600'
    if (p === 'slightly' || p === 'mild' || p === 'minimal') return 'bg-orange-500'
    if (p === 'absent' || p === 'no' || p === 'none') return 'bg-green-500'
    return 'bg-slate-300'
  }

  return (
    <div className="car-rom">
      <h3 className="font-bold text-slate-800 mb-6">
        {section.title || `Range of Motion${romType ? ` (${romType.toUpperCase()})` : ''}`}
      </h3>
      {entries.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 border-b border-slate-100">
                <th className="text-left py-4 font-bold uppercase tracking-wider">Movement</th>
                <th className="text-center py-4 font-bold uppercase tracking-wider">{romType === 'prom' ? 'Passive ROM' : 'Active ROM'}</th>
                <th className="text-left py-4 font-bold uppercase tracking-wider">Pain status</th>
                {romType === 'prom' && <th className="text-left py-4 font-bold uppercase tracking-wider">End Feel</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {entries.map((entry, i) => (
                <tr key={i}>
                  <td className="py-4 font-medium text-slate-700">{entry.movement}</td>
                  <td className="py-4 text-center">
                    <span className={`px-3 py-1 rounded-md text-xs font-bold ${getRomBadgeColors(entry.rom || entry.value)}`}>
                      {entry.rom || entry.value || '—'}
                    </span>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getPainDotColor(entry.pain)}`}></div>
                      <span className="text-slate-600">{entry.pain || '—'}</span>
                    </div>
                  </td>
                  {romType === 'prom' && (
                    <td className="py-4 text-slate-600">{entry.end_feel || entry.endFeel || '—'}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-slate-500 italic">No ROM data available</p>
      )}
      {endFeel && (
        <div className="mt-6 pt-6 border-t border-slate-100">
          <p className="text-sm font-bold text-slate-800">END FEEL: <span className="text-slate-400 font-medium uppercase">{endFeel}</span></p>
        </div>
      )}
    </div>
  )
}

/* ==========================
   FLEXIBILITY SECTION
   Tag pills + cards with images
========================== */
function FlexibilitySection({ section }) {
  const tags = section.tags || []
  const entries = section.entries || []

  return (
    <div className="car-flex">
      <h3 className="car-section-title">{section.title || 'Flexibility Findings'}</h3>

      {/* Tag pills */}
      {tags.length > 0 && (
        <div className="car-flex-tags">
          {tags.map((tag, i) => (
            <span key={i} className="car-flex-tag">{tag}</span>
          ))}
        </div>
      )}

      {/* Entry cards */}
      {entries.length > 0 && (
        <div className="car-flex-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          {entries.map((entry, i) => (
            <div key={i} className="car-flex-card" style={{ background: '#fff', textAlign: 'center' }}>
              <div className="car-flex-card-body" style={{ background: '#f8fafc', borderBottom: '1px solid var(--cf-border)', padding: '12px' }}>
                <div className="car-flex-card-label" style={{ fontSize: '14px', fontWeight: '700' }}>
                  {entry.label || entry.test_name}
                </div>
              </div>
              {entry.image_url && (
                <div className="car-flex-img-wrap" style={{ padding: '16px' }}>
                  <img
                    src={entry.image_url}
                    alt={entry.label || entry.test_name || 'Flexibility test'}
                    className="car-flex-img"
                    style={{ borderRadius: '8px' }}
                    loading="lazy"
                  />
                </div>
              )}
              {entry.result && (
                <div style={{ padding: '0 12px 16px', color: 'var(--cf-primary)', fontWeight: '600' }}>
                  {entry.result}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ==========================
   SPECIAL TESTS SECTION
   Cards with test name + positive/negative result
========================== */
function SpecialTestsSection({ section }) {
  const entries = section.entries || []

  const getResultClass = (result) => {
    if (!result) return ''
    const r = result.toLowerCase()
    if (r === 'positive' || r === 'pos' || r === '+') return 'car-test-positive'
    if (r === 'negative' || r === 'neg' || r === '-') return 'car-test-negative'
    return ''
  }

  return (
    <div className="car-special">
      <h3 className="car-section-title">{section.title || 'Special Tests'}</h3>
      {entries.length > 0 ? (
        <div className="car-special-list">
          {entries.map((entry, i) => (
            <div key={i} className="car-special-item">
              <span className="car-special-name">{entry.test_name}</span>
              <span className={`car-special-result ${getResultClass(entry.result)}`}>
                {entry.result || '—'}
              </span>
              {entry.notes && <span className="car-special-notes">{entry.notes}</span>}
              {entry.link && (
                <a href={entry.link} target="_blank" rel="noopener noreferrer" className="car-special-link">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                  </svg>
                </a>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="car-no-data">No special test data available</p>
      )}
    </div>
  )
}

/* ==========================
   INVESTIGATIONS SECTION
   Image + report text + conclusion
========================== */
function InvestigationsSection({ section }) {
  const entries = section.entries || []

  return (
    <div className="car-investigations">
      <h3 className="car-section-title">{section.title || 'Investigations'}</h3>
      {entries.length > 0 ? (
        <div className="car-inv-list space-y-8">
          {entries.map((entry, i) => (
            <div key={i} className="car-section-box p-0 overflow-hidden" style={{ background: '#fff', border: '1px solid var(--cf-border)', borderRadius: 'var(--cf-radius)' }}>
              <div className="bg-slate-50 px-6 py-3 border-b border-slate-100 flex justify-between items-center">
                <span className="font-bold text-slate-700 capitalize flex items-center gap-2">
                    <span className="text-xl">📷</span> {entry.modality || 'Imaging'}
                </span>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                {entry.image_url ? (
                  <div className="bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center p-4 border border-slate-200">
                    <img
                      src={entry.image_url}
                      alt={entry.modality || 'Investigation'}
                      className="max-h-64 object-contain rounded-lg shadow-sm"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="bg-slate-50 flex flex-col items-center justify-center rounded-xl h-64 text-slate-400 border-2 border-dashed border-slate-200">
                     <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                        <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                     </svg>
                     <span className="mt-2 text-sm font-medium">No Image Available</span>
                  </div>
                )}
                <div className="space-y-6">
                  {entry.report_text && (
                    <div>
                      <h6 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Report Details</h6>
                      <p className="text-sm text-slate-800 leading-relaxed font-medium">{entry.report_text}</p>
                    </div>
                  )}
                  {entry.conclusion && (
                    <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
                      <h6 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Conclusion</h6>
                      <p className="text-sm text-blue-900 font-bold leading-relaxed">{entry.conclusion}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="car-no-data">No investigation data available</p>
      )}
    </div>
  )
}

/* ==========================
   MMT SECTION (Manual Muscle Test)
========================== */
function MmtSection({ section }) {
  const entries = section.entries || []

  return (
    <div className="car-mmt">
      <h3 className="car-section-title">{section.title || 'Manual Muscle Test (MMT)'}</h3>
      {entries.length > 0 ? (
        <div className="car-mmt-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {entries.map((entry, i) => (
            <div key={i} className="history-card" style={{ padding: '16px', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="space-y-1">
                <div className="history-card-label" style={{ fontSize: '10px' }}>Muscle Group</div>
                <div className="history-card-value" style={{ fontSize: '15px' }}>{entry.muscle}</div>
                {entry.notes && <div className="text-[11px] text-slate-400 italic">{entry.notes}</div>}
              </div>
              <div className="text-center bg-blue-50 px-4 py-2 rounded-xl border border-blue-100">
                <div className="text-xl font-black text-blue-600 leading-none">{entry.grade}</div>
                <div className="text-[8px] uppercase text-blue-400 font-bold tracking-wider mt-1">/ 5</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="car-no-data">No MMT data available</p>
      )}
    </div>
  )
}

/* ==========================
   PALPATION SECTION
========================== */
function PalpationSection({ section }) {
  const entries = section.entries || []

  return (
    <div className="car-palpation">
      <h3 className="car-section-title">{section.title || 'Palpation'}</h3>
      {entries.length > 0 ? (
        <div className="car-palp-list space-y-4">
          {entries.map((entry, i) => (
            <div key={i} className="history-section-box" style={{ padding: '20px', display: 'flex', gap: '20px', alignItems: 'center' }}>
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-xl shrink-0">
                📍
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                    <div className="font-bold text-slate-900">{entry.location}</div>
                    {entry.severity && (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${
                            entry.severity.toLowerCase().includes('severe') ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'
                        }`}>
                            {entry.severity}
                        </span>
                    )}
                </div>
                <div className="text-sm text-slate-600 font-medium">{entry.finding}</div>
                {entry.notes && <div className="text-xs text-slate-400 mt-2 italic">Note: {entry.notes}</div>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="car-no-data">No palpation data available</p>
      )}
    </div>
  )
}

/* ==========================
   GENERIC / FALLBACK SECTION
========================== */
function GenericSection({ section }) {
  return (
    <div className="car-generic">
      <h3 className="car-section-title">{section.title || section.type || 'Section'}</h3>
      <pre className="car-generic-data">
        {JSON.stringify(section.data || section, null, 2)}
      </pre>
    </div>
  )
}
