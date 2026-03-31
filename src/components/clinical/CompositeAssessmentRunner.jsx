import React from 'react'
import McqStep from './McqStep'
import EssayStep from './EssayStep'

/**
 * CompositeAssessmentRunner
 * Renders ALL sub-tests of a single assessment Main Step on one scrollable page.
 * 
 * Props:
 *   step.content.sections[] - array of { type, title, ...data }
 *   step.content.clinicalTip - optional clinical tip text
 *   step.title - admin-given name of this Main Step
 */
export default function CompositeAssessmentRunner({ step, mcqProps, essayProps, hideHeader = false }) {
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
      {step.title && !hideHeader && (
        <h2 className="car-step-title">{step.title}</h2>
      )}

      {/* Render each section */}
      {sections.map((section, idx) => (
        <div key={idx} className="bg-white rounded-[24px] p-8 border border-slate-100 shadow-sm mb-6">
          {renderSection(section, mcqProps, essayProps)}
        </div>
      ))}

      {/* Clinical Tip Callout (Always visible) */}
      {/* 
      {clinicalTip && (
        <div className="bg-amber-50 border-2 border-dashed border-amber-200 rounded-[24px] p-8 flex flex-col md:flex-row gap-6 items-start animate-in fade-in slide-in-from-bottom-4 duration-700 mt-6">
           <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm text-3xl shrink-0">
             💡
           </div>
           <div className="flex-1">
             <h4 className="text-amber-900 font-black uppercase tracking-widest text-sm mb-3">Clinical Tip / Assessment Guide</h4>
             <div className="space-y-3 text-slate-700 font-bold leading-relaxed">
               {clinicalTip.split('\n').map((line, i) => (
                 <p key={i} className="flex items-start gap-2">
                   <span className="text-amber-400 mt-1.5">•</span>
                   <span>{line}</span>
                 </p>
               ))}
             </div>
           </div>
        </div>
      )}
      */}
    </div>
  )
}

function renderSection(section, mcqProps, essayProps) {
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
    case 'sensory_exam':
      return <SensoryExamSection section={section} />
    case 'palpation':
      return <PalpationSection section={section} />
    case 'cervical_curve':
      return <CervicalCurveSection section={section} />
    case 'mri_findings':
      return <MriFindingsSection section={section} />
    case 'mri_warnings':
      return <MriWarningsSection section={section} />
    case 'umnl_screening':
      return <UmnlScreeningSection section={section} />
    case 'mcq':
      return <McqStep step={section} {...mcqProps} />
    case 'essay':
      return <EssayStep step={section} {...essayProps} />
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
  const endFeelMode = section.endFeelMode || 'overall'
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

  const showPerMovementEndFeel = endFeelMode === 'per_movement' || (endFeelMode === 'overall' && romType === 'prom' && entries.some(e => e.end_feel))
  const colCount = showPerMovementEndFeel ? 6 : 5

  return (
    <div className="car-rom">
      <h3 className="font-bold text-slate-800 mb-6">
        {section.title || `Range of Motion${romType ? ` (${romType.toUpperCase()})` : ''}`}
      </h3>
      {entries.length > 0 ? (
        <div className="overflow-visible">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 border-b border-slate-100">
                <th className="w-[5%] md:w-[15%] lg:w-[20%]"></th>
                <th className="text-center py-4 font-bold uppercase tracking-wider">Movement</th>
                <th className="text-center py-4 font-bold uppercase tracking-wider">{romType === 'prom' ? 'Passive ROM' : 'Active ROM'}</th>
                <th className="text-center py-4 font-bold uppercase tracking-wider">Pain status</th>
                {showPerMovementEndFeel && <th className="text-center py-4 font-bold uppercase tracking-wider">End Feel</th>}
                <th className="w-[5%] md:w-[15%] lg:w-[20%]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {entries.map((entry, i) => (
                <tr key={i} className="group hover:bg-slate-50 transition-colors">
                  <td></td>
                  <td className="py-4 font-medium text-slate-700 text-center relative whitespace-nowrap">
                    {/* Hover Image */}
                    {entry.image_url && (
                      <div className="absolute top-1/2 -translate-y-1/2 -left-6 w-32 h-32 bg-white border-2 border-slate-100 rounded-xl shadow-2xl opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 z-50 pointer-events-none flex items-center justify-center overflow-hidden" style={{ transform: 'translate(-100%, -50%)' }}>
                        <img
                          src={entry.image_url}
                          alt={entry.movement}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}
                    {entry.movement}
                  </td>
                  <td className="py-4 text-center">
                    <span className={`px-3 py-1 rounded-md text-xs font-bold ${getRomBadgeColors(entry.rom || entry.value)}`}>
                      {entry.rom || entry.value || '—'}
                    </span>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center justify-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getPainDotColor(entry.pain)}`}></div>
                      <span className="text-slate-600 font-medium">{entry.pain || '—'}</span>
                    </div>
                  </td>
                  {showPerMovementEndFeel && (
                    <td className="py-4 text-slate-600 text-center font-medium">{entry.end_feel || entry.endFeel || '—'}</td>
                  )}
                  <td></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-slate-500 italic">No ROM data available</p>
      )}
      {endFeelMode === 'overall' && endFeel && !showPerMovementEndFeel && (
        <div className="mt-6 pt-6 border-t border-slate-100">
           <div className="flex">
              
              <p className="text-sm font-bold text-slate-800">END FEEL: <span className="text-slate-600 font-medium uppercase tracking-widest ml-1">{endFeel}</span></p>
           </div>
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
      <h3 className="car-section-title mb-6">{section.title || 'Flexibility Findings'}</h3>

      {/* Tag pills */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {tags.map((tag, i) => (
            <span key={i} className="px-5 py-2.5 bg-slate-50 border border-slate-100 text-slate-600 rounded-2xl text-[13px] font-bold shadow-sm">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Horizontal divider if tags exist */}
      {tags.length > 0 && entries.length > 0 && (
        <hr className="border-slate-50 mb-8" />
      )}

      {/* Entry cards - Strict 3-column grid */}
      {entries.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {entries.map((entry, i) => (
            <div key={i} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm flex flex-col hover:shadow-md transition-shadow">
              {/* Header bar */}
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-100">
                <div className="text-[13px] font-black text-slate-800 uppercase tracking-tight">
                  {entry.test_name || entry.label}
                </div>
              </div>

              {/* Image */}
              {entry.image_url && (
                <div className="aspect-[4/3] w-full bg-white flex items-center justify-center p-2">
                  <img
                    src={entry.image_url}
                    alt={entry.test_name || 'Flexibility test'}
                    className="h-full w-full object-cover rounded-lg"
                    loading="lazy"
                  />
                </div>
              )}

              {/* Result/Footer */}
              {(entry.result || entry.notes) && (
                <div className="p-4 bg-white border-t border-slate-50 space-y-1">
                   {entry.result && (
                     <div className="text-sm font-bold text-blue-600">{entry.result}</div>
                   )}
                   {entry.notes && (
                     <div className="text-[11px] text-slate-400 font-medium italic">{entry.notes}</div>
                   )}
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
    if (!result) return 'bg-slate-100 text-slate-500'
    const r = result.toLowerCase()
    if (r.includes('positive') || r === 'pos' || r === '+') return 'bg-rose-50 text-rose-600 border border-rose-100'
    if (r.includes('negative') || r === 'neg' || r === '-') return 'bg-emerald-50 text-emerald-600 border border-emerald-100'
    return 'bg-blue-50 text-blue-600 border border-blue-100'
  }

  return (
    <div className="car-special mb-8">
      <h3 className="text-xl font-black text-slate-800 mb-6 px-2">Special Tests:</h3>
      {entries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-2">
          {entries.map((entry, i) => (
            <div key={i} className="bg-white rounded-[1.5rem] border border-slate-200 p-6 flex flex-col items-center gap-4 transition-all hover:shadow-lg hover:border-blue-200" style={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)' }}>
              <div className="w-full text-left">
                <h4 className="font-bold text-slate-700 text-lg leading-tight">
                  {i + 1}. {entry.test_name}
                </h4>
              </div>

              <div className="w-full aspect-video bg-slate-50 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-100 shadow-inner group relative">
                {entry.image_url ? (
                  <img 
                    src={entry.image_url} 
                    alt={entry.test_name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  />
                ) : (
                  <div className="text-slate-300 flex flex-col items-center">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    <span className="text-[10px] font-bold uppercase tracking-widest mt-2">No Image</span>
                  </div>
                )}
                
                {entry.result && (
                  <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${getResultClass(entry.result)}`}>
                    {entry.result}
                  </div>
                )}
              </div>

              {entry.link && (
                <a 
                  href={entry.link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{
                                            border: "2px solid #F14722",
                                            boxShadow: "0px 2px 0px #F14722",
                                            borderRadius: "10px",
                                        }}
                  className="mt-2 flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-slate-800 font-bold text-sm transition-all hover:bg-rose-50 hover:scale-105"
                >
                  <svg width="20" height="20" viewBox="0 0 256 180" xmlns="http://www.w3.org/2000/svg">
                    <path fill="red" d="M250.346 28.075A32.18 32.18 0 0 0 227.69 5.418C207.824 0 127.87 0 127.87 0S47.912.164 28.046 5.582A32.18 32.18 0 0 0 5.39 28.24c-6.009 35.298-8.34 89.084.165 122.97a32.18 32.18 0 0 0 22.656 22.657c19.866 5.418 99.822 5.418 99.822 5.418s79.955 0 99.82-5.418a32.18 32.18 0 0 0 22.657-22.657c6.338-35.348 8.291-89.1-.164-123.134Z" />
                    <path fill="#FFF" d="m102.421 128.06 66.328-38.418-66.328-38.418z" />
                  </svg>
                  View
                </a>
              )}
              
              {entry.notes && (
                <p className="w-full text-center text-xs text-slate-400 italic mt-auto pt-2 border-t border-slate-50">
                  {entry.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="car-no-data px-2">No special test data available</p>
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
   SENSORY EXAM SECTION
========================== */
function SensoryExamSection({ section }) {
  const entries = section.entries || []

  return (
    <div className="car-sensory">
      <h3 className="car-section-title">{section.title || 'Sensory Examination - Dermatomes'}</h3>
      {entries.length > 0 ? (
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Level</th>
                <th className="px-6 py-4 text-right text-xs font-black text-slate-500 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {entries.map((entry, i) => {
                const isAbnormal = entry.status?.toLowerCase().includes('abnormal')
                
                return (
                  <tr key={i} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center justify-center min-w-[44px] px-3 py-1 bg-blue-50 text-blue-600 font-bold rounded-full text-[13px]">
                          {entry.level || '-'}
                        </span>
                        <span className="text-sm font-bold text-slate-600">
                           {entry.sense ? `(${entry.sense})` : ''}
                        </span>
                      </div>
                      {entry.notes && <div className="text-[10px] text-slate-400 italic mt-1 ml-[56px]">{entry.notes}</div>}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[13px] font-bold ${
                        isAbnormal 
                          ? 'bg-red-50 text-red-600 border border-red-100 shadow-sm' 
                          : 'bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm'
                      }`}>
                        {entry.status || 'N/A'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="car-no-data">No sensory data available</p>
      )}
    </div>
  )
}

/* ==========================
   MMT SECTION (Manual Muscle Test)
========================== */
function MmtSection({ section }) {
  const entries = section.entries || []

  const getGradeWindow = (grade) => {
    const g = parseInt(grade)
    if (isNaN(g)) return [3, 4, 5]
    if (g <= 1) return [0, 1, 2]
    if (g >= 4) return [3, 4, 5]
    return [g - 1, g, g + 1]
  }

  const getStatusColor = (status) => {
    if (!status) return 'text-slate-400'
    const s = status.toLowerCase()
    if (s.includes('normal')) return '#22c55e'
    if (s.includes('slight')) return '#f59e0b'
    if (s.includes('weak')) return '#ef4444'
    return 'text-slate-400'
  }

  return (
    <div className="car-mmt">
      <h3 className="car-section-title">{section.title || 'Motor Examination - Myotomes'}</h3>
      {entries.length > 0 ? (
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Level</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Muscle action</th>
                <th className="px-6 py-4 text-center text-xs font-black text-slate-500 uppercase tracking-widest">Grade ( 0-5 )</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {entries.map((entry, i) => {
                const gradeWindow = getGradeWindow(entry.grade)
                const statusColor = getStatusColor(entry.status)
                
                return (
                  <tr key={i} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center justify-center min-w-[40px] px-3 py-1 bg-blue-50 text-blue-600 font-bold rounded-full text-xs">
                        {entry.level || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-slate-700">{entry.muscle_action || entry.muscle || '-'}</div>
                      {entry.notes && <div className="text-[10px] text-slate-400 italic mt-0.5">{entry.notes}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1.5">
                        {gradeWindow.map(g => {
                          const isSelected = String(g) === String(entry.grade)
                          return (
                            <div 
                              key={g}
                              className={`w-7 h-7 flex items-center justify-center rounded-md text-xs font-bold transition-all ${
                                isSelected 
                                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200 scale-110' 
                                  : 'bg-white border border-slate-200 text-slate-400'
                              }`}
                            >
                              {g}
                            </div>
                          )
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-2.5 h-2.5 rounded-full" 
                          style={{ backgroundColor: statusColor !== 'text-slate-400' ? statusColor : '#cbd5e1' }}
                        />
                        <span className="text-sm font-bold text-slate-600">{entry.status || 'N/A'}</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
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
  const hasImage = !!section.image_url
  const statusOptions = section.status_options || []

  const getStatusLabel = (val) => {
    const opt = statusOptions.find(o => o.value === val)
    return opt ? opt.label : val
  }

  const getStatusBadgeClass = (val) => {
    const opt = statusOptions.find(o => o.value === val)
    if (!opt) return 'bg-slate-100 text-slate-600'
    
    switch (opt.type) {
        case 'normal': return 'bg-emerald-100 text-emerald-700'
        case 'mid': return 'bg-amber-100 text-amber-700'
        case 'extreme': return 'bg-rose-100 text-rose-700'
        default: return 'bg-slate-100 text-slate-600'
    }
  }

  return (
    <div className="car-palpation">
      <h3 className="car-section-title">{section.title || 'Palpation'}</h3>
      
      <div className={`flex flex-col ${hasImage ? 'lg:flex-row' : ''} gap-8 items-start`}>
        {hasImage && (
          <div className="w-full lg:w-1/2 shrink-0">
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-sm">
                <img src={section.image_url} alt="Palpation Reference" className="w-full h-auto object-cover" />
            </div>
          </div>
        )}

        <div className="flex-1 w-full overflow-x-auto">
          {entries.length > 0 ? (
            (() => {
              const hasAnyNotes = entries.some(e => e.notes && e.notes.trim() !== '');
              return (
                <table className="w-full text-left border-separate border-spacing-y-2">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest w-px whitespace-nowrap">Level</th>
                      <th className={`px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ${hasAnyNotes ? 'text-center' : 'text-right'}`}>
                        {section.status_title || 'Status'}
                      </th>
                      {hasAnyNotes && (
                        <th className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[30%] text-right font-inter">Notes</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((entry, i) => (
                      <tr key={i} className="bg-white border border-slate-100 shadow-sm rounded-xl">
                        <td className="px-4 py-4 first:rounded-l-xl border-y border-l border-slate-100 align-middle w-px whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-[13px] font-black text-indigo-600 border border-indigo-100 shadow-sm">
                              {entry.level || '-'}
                            </div>
                          </div>
                        </td>
                        <td className={`px-6 py-4 border-y border-slate-100 align-middle ${hasAnyNotes ? 'text-center' : 'text-right'}`}>
                          <span className={`px-5 py-2 rounded-full text-[13px] font-black uppercase tracking-wider shadow-sm inline-block ${getStatusBadgeClass(entry.status_value)}`}>
                            {getStatusLabel(entry.status_value)}
                          </span>
                        </td>
                        {hasAnyNotes && (
                          <td className="px-4 py-4 border-y border-r border-slate-100 text-[11px] text-slate-500 italic last:rounded-r-xl align-middle text-right font-inter">
                            <div className="max-w-[180px] ml-auto truncate font-medium">
                                {entry.notes || '-'}
                            </div>
                          </td>
                        )}
                        {!hasAnyNotes && (
                          <td className="border-y border-r border-slate-100 last:rounded-r-xl w-1"></td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              );
            })()
          ) : (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 font-medium font-inter">
                No palpation data recorded
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ==========================
   CERVICAL CURVE SECTION
   Visual selection grid with highlighting for detected finding
========================== */
function CervicalCurveSection({ section }) {
  const options = section.options || []
  const selectedId = section.selected_option_id

  const getDefaultImage = (title) => {
    const t = title?.toLowerCase() || ''
    if (t.includes('flattened')) return '/img/clinical/flattened.png'
    if (t.includes('normal')) return '/img/clinical/normal_lordosis.png'
    if (t.includes('reversed')) return '/img/clinical/reversed_curve.png'
    return null
  }

  return (
    <div className="car-cervical max-w-6xl mx-auto">
      <h3 className="car-section-title mb-10 text-center">{section.title || 'Cervical Curve Assessment'}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
        {options.map((opt, i) => {
          const isSelected = opt.id === selectedId
          const displayImage = opt.image_url || getDefaultImage(opt.title)

          return (
            <div 
              key={i} 
              className={`flex flex-col items-center transition-all duration-500 rounded-3xl p-5 border-2 ${
                isSelected 
                  ? 'bg-blue-50/50 border-blue-500 scale-105 shadow-xl shadow-blue-100 z-10' 
                  : 'border-slate-100 opacity-50 scale-[0.85]'
              }`}
            >
              {/* Header */}
              <h4 className={`text-lg font-black uppercase tracking-tight mb-8 text-center min-h-[56px] flex items-center justify-center ${
                isSelected ? 'text-blue-600' : 'text-slate-400'
              }`}>
                {opt.title}
              </h4>

              {/* Image Container */}
              <div className={`w-full aspect-square bg-white rounded-[2rem] overflow-hidden border mb-8 flex items-center justify-center p-6 transition-all duration-500 ${
                isSelected ? 'border-blue-200 shadow-inner' : 'border-slate-100'
              }`}>
                {displayImage ? (
                  <img 
                    src={displayImage} 
                    alt={opt.title} 
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <div className="text-slate-200">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                      <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Status Footer */}
              <div className="mt-auto pt-2 text-center">
                <p className={`text-[13px] font-black uppercase tracking-widest leading-relaxed ${
                  isSelected ? 'text-red-500' : 'text-slate-400'
                }`}>
                  {isSelected ? (opt.selected_footer_text || 'Detected in this patient') : (opt.footer_text || 'Not present')}
                </p>
                {isSelected && (
                   <div className="mt-3 h-1.5 w-12 bg-red-500 mx-auto rounded-full shadow-sm shadow-red-200"></div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {options.length === 0 && (
        <p className="car-no-data text-center py-10">No assessment options configured.</p>
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

/* ==========================
   MRI FINDINGS SECTION
========================== */
function MriFindingsSection({ section }) {
  const entries = section.entries || []
  const hasImage = !!section.image_url
  const statusOptions = section.status_options || []

  const getStatusLabel = (val) => {
    const opt = statusOptions.find(o => o.value === val)
    return opt ? opt.label : val
  }

  const getStatusBadgeClass = (val) => {
    const opt = statusOptions.find(o => o.value === val)
    if (!opt) return 'bg-slate-100 text-slate-600'
    
    switch (opt.type) {
        case 'normal': return 'bg-emerald-50 text-emerald-600 border border-emerald-100'
        case 'mid': return 'bg-amber-50 text-amber-600 border border-amber-100'
        case 'extreme': return 'bg-rose-50 text-rose-600 border border-rose-100'
        default: return 'bg-slate-100 text-slate-600 border border-slate-200'
    }
  }

  return (
    <div className="car-mri-findings">
      <h3 className="car-section-title">{section.title || 'MRI Findings'}</h3>
      
      <div className={`flex flex-col ${hasImage ? 'lg:flex-row' : ''} gap-8 items-stretch`}>
        {hasImage && (
          <div className="w-full lg:w-1/2 shrink-0 relative min-h-[350px] lg:min-h-0">
            <div className="absolute inset-0 rounded-2xl overflow-hidden border border-slate-200 bg-[#0f172a] shadow-sm p-3 flex items-center justify-center">
                <img src={section.image_url} alt="MRI Reference" className="w-full h-full object-fill rounded-xl" />
            </div>
          </div>
        )}

        <div className="flex-1 w-full overflow-x-auto mt-2">
          {entries.length > 0 ? (
            <table className="w-full text-left border-separate border-spacing-y-2">
              <thead>
                <tr>
                  <th className="px-5 py-2 text-[11px] font-black text-slate-400 uppercase tracking-widest w-px whitespace-nowrap">Level</th>
                  <th className="px-5 py-2 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">
                    {section.status_title || 'Status'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e, idx) => (
                  <tr key={idx} className="bg-white">
                    <td className="px-5 py-4 border border-slate-100 border-r-0 rounded-l-xl shadow-sm bg-slate-50/50">
                      <span className="inline-flex items-center justify-center min-w-[60px] whitespace-nowrap px-3 py-1 bg-white border border-slate-200 text-slate-700 font-bold rounded-full text-[13px] shadow-sm">
                        {e.level || '-'}
                      </span>
                    </td>
                    <td className="px-5 py-4 border border-slate-100 border-l-0 rounded-r-xl shadow-sm bg-slate-50/50 text-right">
                      {e.status_value ? (
                        <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[13px] font-bold shadow-sm ${getStatusBadgeClass(e.status_value)}`}>
                          {getStatusLabel(e.status_value)}
                        </span>
                      ) : <span className="text-slate-400 italic text-sm">-</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="car-no-data">No findings recorded</p>
          )}
        </div>
      </div>
    </div>
  )
}

/* ==========================
   MRI WARNINGS SECTION
========================== */
function MriWarningsSection({ section }) {
  const entries = section.entries || []
  const hasImage = !!section.image_url
  const statusOptions = section.status_options || []

  const getStatusLabel = (val) => {
    const opt = statusOptions.find(o => o.value === val)
    return opt ? opt.label : val
  }

  const getStatusBadgeClass = (val) => {
    const opt = statusOptions.find(o => o.value === val)
    if (!opt) return 'bg-slate-100 text-slate-600'
    
    switch (opt.type) {
        case 'normal': return 'bg-emerald-50 text-emerald-600 border border-emerald-100'
        case 'mid': return 'bg-amber-50 text-amber-600 border border-amber-100'
        case 'extreme': return 'bg-rose-50 text-rose-600 border border-rose-100'
        default: return 'bg-slate-100 text-slate-600 border border-slate-200'
    }
  }

  const warningEntries = entries.filter(e => e.is_warning && e.warning_text)

  return (
    <div className="car-mri-warnings relative">
      <h3 className="car-section-title">{section.title || 'MRI Warnings'}</h3>
      
      <div className={`flex flex-col ${hasImage ? 'lg:flex-row' : ''} gap-8 items-stretch`}>
        {hasImage && (
          <div className="w-full lg:w-1/2 shrink-0 relative min-h-[350px] lg:min-h-0">
            <div className="absolute inset-0 rounded-2xl overflow-hidden border border-slate-200 bg-[#0f172a] shadow-sm p-3 flex items-center justify-center">
                <img src={section.image_url} alt="MRI Reference" className="w-full h-full object-fill rounded-xl" />
            </div>
          </div>
        )}

        <div className="flex-1 w-full overflow-x-auto mt-2">
          {entries.length > 0 ? (
            <table className="w-full text-left border-separate border-spacing-y-2">
              <thead>
                <tr>
                  <th className="px-5 py-2 text-[11px] font-black text-slate-400 uppercase tracking-widest w-px whitespace-nowrap">Level</th>
                  <th className="px-5 py-2 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">
                    {section.status_title || 'Status'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e, idx) => {
                  const trBg = e.is_warning ? 'bg-rose-50/50' : 'bg-slate-50/50'
                  const tdBor = e.is_warning ? 'border-rose-100' : 'border-slate-100'
                  const levBor = e.is_warning ? 'border-rose-200 text-rose-700 bg-white' : 'border-slate-200 text-slate-700 bg-white'
                  
                  return (
                    <tr key={idx} className="bg-white">
                      <td className={`px-5 py-4 border ${tdBor} border-r-0 rounded-l-xl shadow-sm ${trBg}`}>
                        <span className={`inline-flex items-center justify-center min-w-[60px] whitespace-nowrap px-3 py-1 border font-bold rounded-full text-[13px] shadow-sm ${levBor}`}>
                          {e.is_warning && '⚠️ '}{e.level || '-'}
                        </span>
                      </td>
                      <td className={`px-5 py-4 border ${tdBor} border-l-0 rounded-r-xl shadow-sm ${trBg} text-right`}>
                        {e.status_value ? (
                          <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[13px] font-bold shadow-sm ${getStatusBadgeClass(e.status_value)} ${e.is_warning ? 'ring-2 ring-rose-200 ring-offset-1' : ''}`}>
                            {getStatusLabel(e.status_value)}
                          </span>
                        ) : <span className="text-slate-400 italic text-sm">-</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <p className="car-no-data">No findings recorded</p>
          )}
        </div>
      </div>

      {warningEntries.length > 0 && (
        <div className="mt-8 flex flex-col gap-4 relative z-10 w-full">
          {warningEntries.map((warn, i) => (
            <div key={i} className="bg-[#fff7ed] border border-[#ffedd5] rounded-2xl p-5 flex items-start gap-4 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-[#f97316]"></div>
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0 text-xl border border-[#ffedd5]">
                ⚠️
              </div>
              <div className="pt-0.5">
                <h4 className="font-bold text-[#c2410c] text-sm mb-1 uppercase tracking-widest leading-none mt-1">
                  Level {warn.level}
                </h4>
                <p className="text-[#9a3412] font-semibold text-[13.5px] leading-relaxed mt-2">{warn.warning_text}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ==========================
   UMNL SCREENING SECTION
========================== */
function UmnlScreeningSection({ section }) {
  const entries = section.entries || []
  
  const getBadgeClass = (opt, isSelected) => {
    if (!isSelected) return 'bg-white text-slate-400 border border-slate-200 opacity-50 font-medium'
    
    switch (opt.colorType) {
        case 'normal': return 'bg-emerald-500 text-white border-transparent shadow-md'
        case 'mid': return 'bg-amber-500 text-white border-transparent shadow-md'
        case 'extreme': return 'bg-rose-500 text-white border-transparent shadow-md'
        default: return 'bg-slate-500 text-white border-transparent shadow-md'
    }
  }

  const getOutcomeStyle = (type) => {
    switch(type) {
      case 'success': return { bg: 'bg-[#ecfdf5]', border: 'border-[#d1fae5]', iconBg: 'bg-white', iconColor: 'text-[#10b981]', icon: '✓', titleText: 'text-[#047857]', subText: 'text-[#065f46]' }
      case 'warning': return { bg: 'bg-[#fff1f2]', border: 'border-[#ffe4e6]', iconBg: 'bg-white', iconColor: 'text-[#e11d48]', icon: '!', titleText: 'text-[#be123c]', subText: 'text-[#9f1239]' }
      case 'neutral': return { bg: 'bg-[#eff6ff]', border: 'border-[#dbeafe]', iconBg: 'bg-white', iconColor: 'text-[#3b82f6]', icon: 'i', titleText: 'text-[#1d4ed8]', subText: 'text-[#1e40af]' }
      default: return { bg: 'bg-slate-50', border: 'border-slate-200', iconBg: 'bg-white', iconColor: 'text-slate-500', icon: '•', titleText: 'text-slate-800', subText: 'text-slate-600' }
    }
  }

  const outcomeStyle = getOutcomeStyle(section.outcome_type || 'success')

  return (
    <div className="car-umnl-screening">
      <h3 className="car-section-title">{section.title || 'Neurological Screening'}</h3>
      {section.subtitle && <p className="text-slate-500 font-medium mb-8 text-[15px]">{section.subtitle}</p>}

      <div className="space-y-4 mb-10">
        {entries.length > 0 ? entries.map((e, idx) => (
          <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-white border border-slate-200 rounded-2xl shadow-sm gap-4 transition-all hover:border-slate-300 hover:shadow-md">
            <div>
              <h4 className="font-bold text-slate-800 text-[15px] leading-snug">{e.title}</h4>
              {e.subtitle && <p className="text-sm font-medium text-slate-500 mt-1">{e.subtitle}</p>}
            </div>
            
            <div className="flex flex-wrap gap-2 shrink-0 md:justify-end">
              {(e.options || []).map((opt, oIdx) => {
                const isSelected = e.selected_value === opt.value
                return (
                  <span 
                    key={oIdx} 
                    className={`inline-flex items-center justify-center px-4 py-2 rounded-full text-[13px] border transition-all ${getBadgeClass(opt, isSelected)}`}
                  >
                    {opt.label}
                  </span>
                )
              })}
            </div>
          </div>
        )) : (
          <p className="car-no-data">No screening tests configured.</p>
        )}
      </div>

      {section.outcome_title && (
        <div className={`mt-8 ${outcomeStyle.bg} border-2 ${outcomeStyle.border} rounded-2xl p-6 flex items-start md:items-center gap-5 shadow-sm`}>
          <div className={`w-12 h-12 rounded-full ${outcomeStyle.iconBg} flex items-center justify-center shadow-sm shrink-0 border ${outcomeStyle.border}`}>
            <span className={`${outcomeStyle.iconColor} font-black text-2xl leading-none`}>{outcomeStyle.icon}</span>
          </div>
          <div className="flex-1 pt-1 md:pt-0">
            <h4 className={`font-black uppercase tracking-widest text-[13px] ${outcomeStyle.titleText} mb-1`}>{section.outcome_title}</h4>
            {section.outcome_subtitle && <p className={`${outcomeStyle.subText} font-bold text-[15px]`}>{section.outcome_subtitle}</p>}
          </div>
        </div>
      )}
    </div>
  )
}

