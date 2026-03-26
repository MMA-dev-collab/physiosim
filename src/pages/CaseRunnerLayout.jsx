import React from 'react'
import '../styles/caseflow.css'

/**
 * CaseRunnerLayout — New 3-column layout
 * Left:    Patient Card (persistent)
 * Center:  Step content (scrollable)
 * Right:   Progress Stepper
 * Bottom:  Navigation footer (fixed)
 */
export default function CaseRunnerLayout({
  caseTitle,
  patientData,
  difficulty,
  duration,
  currentStepIndex,
  totalSteps,
  steps = [],
  children,
  onStepClick,
  onNext,
  onBack,
  isNextDisabled = false,
  isReviewMode = false,
  clinicalTip,
  activeSubStepId,
  onSubStepClick,
  hubProgress,
  hideSidebar = false
}) {
  const painIntensity = patientData?.painIntensity || 0
  const painPercent = Math.min((painIntensity / 10) * 100, 100)
  const painColor = painIntensity <= 3 ? 'var(--cf-success)' : painIntensity <= 6 ? 'var(--cf-warning)' : 'var(--cf-danger)'

  const [expandedHubs, setExpandedHubs] = React.useState({})

  // Automatically expand current step if it has sub-steps
  React.useEffect(() => {
    const currentStep = steps[currentStepIndex]
    if (currentStep?.type === 'clinical_hub') {
      setExpandedHubs(prev => ({ ...prev, [currentStep.id]: true }))
    }
  }, [currentStepIndex, steps])

  const toggleHub = (e, hubId) => {
    e.stopPropagation()
    setExpandedHubs(prev => ({ ...prev, [hubId]: !prev[hubId] }))
  }

  return (
    <div className="cf-page-wrapper flex flex-col min-h-screen bg-[#f8fafc]">
      <div className="cf-layout flex-1 overflow-hidden" style={{ minHeight: '0', background: 'transparent' }}>
        {/* ─── LEFT SIDEBAR: Patient Card ─── */}
        {!hideSidebar && (
          <aside className="cf-sidebar bg-white">
            <div className="cf-patient-card text-left">
              {/* Header */}
              <h3 className="text-[#1e293b] font-bold uppercase tracking-widest text-sm mb-4">Patient Card</h3>
              
              <div className="flex gap-4 mb-6" style={{alignItems : "start" , flexDirection: "column"}}>
                {/* Avatar */}
                <div className="cf-patient-avatar shrink-0 m-0" style={{ width: '64px', height: '64px', border: '3px solid #fff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                  {patientData?.imageUrl ? (
                    <img src={patientData.imageUrl} alt={patientData.patientName || 'Patient'} />
                  ) : (
                    (patientData?.patientName || 'P').charAt(0).toUpperCase()
                  )}
                </div>

                {/* Name & Demographics */}
                <div className="flex flex-col text-left">
                  <div className="cf-patient-name text-left m-0 text-slate-800 text-lg">{patientData?.patientName || 'Patient'}</div>
                  <div className="cf-patient-info justify-start m-0 mt-1 text-slate-600 font-semibold text-sm">
                    {patientData?.gender && <span>{patientData.gender},</span>}
                    {patientData?.age && <span>{patientData.age} years old</span>}
                  </div>
                </div>
              </div>

              <hr className="cf-patient-divider" />

              {/* Chief Complaint */}
              {patientData?.chiefComplaint && (
                <div className="cf-patient-field">
                  <div className="cf-patient-field-label">Chief Complaint</div>
                  <div className="cf-patient-field-value" style={{ border: '1px solid var(--cf-border)', padding: '12px 8px', borderRadius: '8px', marginTop: '8px', textAlign: 'right' }}>
                    {patientData.chiefComplaint}
                  </div>
                </div>
              )}

          {/* Description */}
          {patientData?.description && (
            <div className="cf-patient-field mt-4">
              <div className="cf-patient-field-label">Description</div>
              <div className="cf-patient-field-value" style={{ color: 'var(--cf-text-muted)', fontSize: '15px' }}>{patientData.description}</div>
            </div>
          )}

          {/* Pain Intensity */}
          {painIntensity > 0 && (
            <div className="cf-patient-field mt-6">
              <div className="flex items-center border border-slate-100 rounded-2xl p-6 bg-white shadow-sm overflow-hidden" style={{ minHeight: '220px' }}>
                <div style={{ transform: 'rotate(-90deg)', whiteSpace: 'nowrap', fontSize: '14px', fontWeight: 'bold', color: '#334155', width: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  Intensity of Pain
                </div>
                <div className="relative" style={{ width: '36px', height: '160px', borderRadius: '20px', background: '#fff', border: '1px solid #fecaca', margin: '0 24px 0 32px' }}>
                  <div
                    className="absolute bottom-0 left-0 w-full rounded-b-full transition-all duration-500"
                    style={{ height: `${painPercent}%`, background: 'linear-gradient(to top, #ef4444, #f87171)' }}
                  />
                </div>
                <div className="text-red-600 font-bold text-xl">
                  {painIntensity}/10
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ─── CLINICAL TIP ─── */}
        {clinicalTip && (
          <div className="bg-[#fff9e6] border border-[#fde68a] rounded-2xl p-5 m-4 mt-2 mb-6 flex flex-col gap-4 animate-in slide-in-from-left-4 duration-500 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-amber-500 shrink-0 text-xl">
                💡
              </div>
              <h4 className="font-black text-[#92400e] uppercase tracking-widest text-[11px]">Clinical Tip</h4>
            </div>
            <div className="space-y-2 text-[13px] font-bold text-slate-700">
              {clinicalTip.split('\n').map((line, i) => {
                const parts = line.split('=')
                if (parts.length === 2) {
                  return (
                    <p key={i} className="leading-tight">
                      <span className="text-slate-800">{parts[0]} =</span>
                      <span className="text-blue-600 ml-1.5">{parts[1]}</span>
                    </p>
                  )
                }
                return <p key={i} className="leading-tight">{line}</p>
              })}
            </div>
          </div>
        )}
      </aside>
      )}

      {/* ─── CENTER: Step Content ─── */}
      <div className="cf-main">
        <div className="cf-main-scroll">
          {children}
        </div>
      </div>

      {/* ─── RIGHT SIDEBAR: Progress Stepper ─── */}
      <aside className="cf-stepper-col bg-white">
        <div className="px-4 py-4 border-b border-slate-100 mb-2">
            <h3 className="text-[#1e293b] font-bold uppercase tracking-widest text-sm mb-4">Progress</h3>
            <div className="flex items-center gap-4">
                {difficulty && (
                    <span className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full border ${
                        difficulty.toLowerCase() === 'beginner' ? 'bg-sky-50 text-sky-600 border-sky-100' :
                        difficulty.toLowerCase() === 'normal' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        difficulty.toLowerCase() === 'intermediate' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        'bg-slate-50 text-slate-600 border-slate-100'
                    }`}>
                        {difficulty}
                    </span>
                )}
                {duration && (
                    <div className="flex items-center gap-1.5 text-[13px] font-medium text-slate-600">
                        <svg className="text-slate-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        {duration} min
                    </div>
                )}
            </div>
        </div>

        <ul className="cf-step-list">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentStepIndex
            const isCurrent = idx === currentStepIndex
            const icon = getStepIcon(step)
            const hasSubSteps = step.type === 'clinical_hub' && step.subSteps?.length > 0
            const isExpanded = expandedHubs[step.id]

            return (
              <React.Fragment key={idx}>
                <li
                  className={`cf-step-item ${isCurrent ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                  onClick={() => {
                    if (isCompleted || isReviewMode) onStepClick?.(idx)
                    if (hasSubSteps) setExpandedHubs(prev => ({ ...prev, [step.id]: true }))
                  }}
                >
                  <div className="cf-step-dot">
                    {isCompleted ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    ) : isCurrent ? (
                      <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--cf-primary)' }} />
                    ) : null}
                  </div>
                  <div className="cf-step-info flex-1 flex items-center justify-between pointer-events-none">
                     <div>
                       <div className="cf-step-title">{step.title || getStepLabel(step)}</div>
                       {isCurrent && <div className="cf-step-status">In Progress</div>}
                     </div>
                     {hasSubSteps && (
                       <button 
                         onClick={(e) => toggleHub(e, step.id)} 
                         className="p-1 pointer-events-auto text-slate-400 hover:text-slate-700 transition-transform duration-200"
                         style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                       >
                         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                           <path d="M6 9l6 6 6-6" />
                         </svg>
                       </button>
                     )}
                  </div>
                </li>

                {/* Sub-steps Accordion */}
                {hasSubSteps && (
                  <div 
                    className={`overflow-hidden transition-all duration-300 ease-in-out`}
                    style={{ maxHeight: isExpanded ? '1000px' : '0' }}
                  >
                    <ul className="pl-[26px] pr-2 py-2 space-y-4 relative before:absolute before:left-[11px] before:top-0 before:bottom-0 before:w-[2px] before:bg-slate-100">
                      {step.subSteps.map((sub, sIdx) => {
                        const isSubActive = activeSubStepId === sub.id
                        const isSubCompleted = hubProgress?.[step.id]?.includes(sub.id)
                        return (
                          <li 
                            key={sub.id}
                            className={`flex items-center gap-3 text-[13px] font-medium cursor-pointer transition-colors ${isSubActive ? 'text-blue-600 font-bold' : isSubCompleted ? 'text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
                            onClick={() => {
                              if (isCurrent || isCompleted || isReviewMode) {
                                if (!isCurrent) onStepClick?.(idx);
                                onSubStepClick?.(sub.id);
                              }
                            }}
                          >
                            <div className={`w-2.5 h-2.5 shrink-0 rounded-full border z-10 bg-white ${isSubActive ? 'border-[3px] border-blue-600 bg-white' : isSubCompleted ? 'bg-slate-300 border-slate-300' : 'border-slate-300'}`} />
                            <span className="truncate">{sub.title || sub.category?.replace(/_/g, ' ') || `Sub Step ${sIdx + 1}`}</span>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )}
              </React.Fragment>
            )
          })}
        </ul>
      </aside>

      {/* ─── FOOTER: Navigation ─── */}
      <div className="cf-footer" style={{ left: hideSidebar ? 0 : undefined }}>
        <div className="cf-footer-progress">
          <div className="cf-footer-progress-text">
            Step {currentStepIndex + 1} of {totalSteps} <span>( {steps[currentStepIndex]?.title || getStepLabel(steps[currentStepIndex])} )</span>
          </div>
          <div className="cf-footer-dots">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`cf-footer-line ${idx === currentStepIndex ? 'active' : ''} ${idx < currentStepIndex ? 'completed' : ''}`}
                style={{ 
                  height: '6px', 
                  borderRadius: '3px', 
                  transition: 'all 0.5s ease',
                  width: idx === currentStepIndex ? '48px' : '32px',
                  background: idx <= currentStepIndex ? 'var(--cf-primary)' : '#f1f5f9'
                }}
              />
            ))}
          </div>
        </div>
        <div className="cf-footer-nav">
          <button
            className="cf-btn cf-btn-secondary"
            onClick={onBack}
            disabled={currentStepIndex === 0}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <button
            className="cf-btn cf-btn-primary bg-[#2563eb] text-white hover:bg-blue-700"
            onClick={onNext}
            disabled={isNextDisabled}
          >
            {currentStepIndex === 0 && (steps[0]?.type === 'info' || steps[0]?.phase === 'case_overview') ? 'Start Assessment' : currentStepIndex === totalSteps - 1 ? 'Finish' : 'Next Step'}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      </div>
    </div>
  )
}

function getStepIcon(step) {
  const type = step.type
  if (step.phase === 'case_overview' || type === 'info') return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 11V16M12 7H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" /></svg>
  if (type === 'history') return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" /></svg>
  if (type === 'clinical' || type === 'clinical_hub') return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2M9 22h6M12 11h.01M12 15h.01M12 18h.01M8 11h.01M8 15h.01M8 18h.01M16 11h.01M16 15h.01M16 18h.01" /></svg>
  if (type === 'diagnosis') return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3" /></svg>
  if (type === 'treatment') return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 14l-7 7-7-7m14-8l-7 7-7-7" /></svg>
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
}

function getStepLabel(step) {
  if (!step) return ''
  if (step.phase === 'case_overview' || step.type === 'info') return 'Case Overview'
  if (step.type === 'history') return step.content?.title || 'Subjective'
  if (step.type === 'clinical') return step.category?.replace(/_/g, ' ') || 'Objective'
  if (step.type === 'clinical_hub') return 'Assessment'
  if (step.type === 'mcq') return 'Decision Point'
  if (step.type === 'essay') return 'Written Response'
  if (step.type === 'investigation') return 'Investigation'
  if (step.type === 'diagnosis') return 'Diagnosis'
  if (step.type === 'treatment') return 'Treatment'
  return step.type?.charAt(0).toUpperCase() + step.type?.slice(1) || 'Step'
}
