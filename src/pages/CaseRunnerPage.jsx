import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { API_BASE_URL } from '../config'
import Loader from '@/components/ui/loader-12'
import { useIdleTimer } from '../hooks/useIdleTimer'
import HintModal from '@/components/common/HintModal'
import { ClinicalStepRunner } from '@/components/clinical'
import ClinicalHub from '@/components/clinical/ClinicalHub'
import CompositeAssessmentRunner from '@/components/clinical/CompositeAssessmentRunner'
import McqStep from '@/components/clinical/McqStep'
import EssayStep from '@/components/clinical/EssayStep'
import CaseRunnerLayout from './CaseRunnerLayout'
import WatermarkOverlay from '@/components/common/WatermarkOverlay'

function CaseRunnerPage({ auth }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [caseData, setCaseData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [isCorrect, setIsCorrect] = useState(null)
  const [finalSummary, setFinalSummary] = useState(null)
  const [essayAnswer, setEssayAnswer] = useState('')
  const [essayFeedback, setEssayFeedback] = useState(null)
  const [essayScore, setEssayScore] = useState(null)

  // Progress state for Clinical Hubs 
  const [hubProgress, setHubProgress] = useState({})
  
  // Track active sub-step for hubs so Layout accordion can control it
  const [activeSubStepId, setActiveSubStepId] = useState(null)

  // Adaptive feedback state
  const [showHint, setShowHint] = useState(false)
  const [currentHint, setCurrentHint] = useState(null)
  const [hintShown, setHintShown] = useState(false)
  const [attemptNumber, setAttemptNumber] = useState(1)
  const stepStartTimeRef = useRef(Date.now())

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`${API_BASE_URL}/api/cases/${id}`, {
          headers: {
            Authorization: `Bearer ${auth.token}`,
            'ngrok-skip-browser-warning': 'true'
          },
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.message || 'Failed to load case')
        }
        const data = await res.json()
        setCaseData(data)
        // Resume from saved step index
        if (data.currentStepIndex && data.currentStepIndex > 0 && !data.isCompleted) {
          setCurrentStepIndex(data.currentStepIndex)
        }
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, auth])

  // Pre-process steps to merge consecutive 'assessment' and 'history' steps
  const steps = useMemo(() => {
    if (!caseData?.steps) return []
    const rawSteps = caseData.steps
    const processed = []
    let i = 0
    while (i < rawSteps.length) {
      const step = rawSteps[i]

      // Group Assessment Steps (only clinical type, not MCQ/Essay)
      if (step.phase === 'assessment' && step.type === 'clinical') {
        const group = []
        while (i < rawSteps.length && rawSteps[i].phase === 'assessment' && rawSteps[i].type === 'clinical') {
          group.push(rawSteps[i])
          i++
        }
        processed.push({
          id: `assessment-hub-${group[0].id}`,
          type: 'clinical_hub',
          phase: 'assessment',
          title: 'Physical Assessment',
          subSteps: group,
          content: { title: 'Physical Assessment' }
        })
        continue;
      }

      // Group History Steps (only clinical type)
      if (step.phase === 'history_presentation' && step.type === 'clinical') {
        const group = []
        while (i < rawSteps.length && rawSteps[i].phase === 'history_presentation' && rawSteps[i].type === 'clinical') {
          group.push(rawSteps[i])
          i++
        }
        processed.push({
          id: `history-hub-${group[0].id}`,
          type: 'clinical_hub',
          phase: 'history_presentation',
          title: 'Patient History',
          subSteps: group,
          content: { title: 'Patient History' }
        })
        continue;
      }

      processed.push(step)
      i++
    }
    return processed
  }, [caseData])

  const currentStep = steps[currentStepIndex]

  // Track viewed sub-steps for hubs
  const handleSubStepView = useCallback((subStepId) => {
    if (currentStep?.type !== 'clinical_hub') return

    setHubProgress(prev => {
      const hubId = currentStep.id
      const currentViewed = prev[hubId] || []
      if (currentViewed.includes(subStepId)) return prev

      return {
        ...prev,
        [hubId]: [...currentViewed, subStepId]
      }
    })
  }, [currentStep])

  // When currentStepIndex changes, safely determine the initial active subStep if it's a hub
  useEffect(() => {
    if (!currentStep) return
    
    // Auto-select first substep if it's a hub and activeSubStepId is not within this hub
    if (currentStep.type === 'clinical_hub' && currentStep.subSteps?.length > 0) {
      const isCurrentActiveValid = currentStep.subSteps.some(s => s.id === activeSubStepId)
      if (!isCurrentActiveValid) {
        setActiveSubStepId(currentStep.subSteps[0].id)
      }
    } else {
      setActiveSubStepId(null)
    }
  }, [currentStepIndex, currentStep, activeSubStepId])

  // Track viewed sub-steps
  useEffect(() => {
    if (activeSubStepId && currentStep?.type === 'clinical_hub') {
      handleSubStepView(activeSubStepId)
    }
  }, [activeSubStepId, currentStep, handleSubStepView])

  useEffect(() => {
    // Reset state first
    setShowHint(false)
    setCurrentHint(null)
    setHintShown(false)
    setAttemptNumber(1)
    stepStartTimeRef.current = Date.now()

    // Load saved progress if available (Review Mode)
    if (caseData?.userProgress && currentStep?.id) {
      const progress = caseData.userProgress[currentStep.id]
      if (progress) {
        if (currentStep.type === 'mcq') {
          setSelectedOption(progress.selectedOptionId)
          setIsCorrect(progress.isCorrect)

          // Find feedback for the selected option
          const selectedOpt = currentStep.options?.find(o => o.id === progress.selectedOptionId)
          if (selectedOpt) {
            setFeedback(selectedOpt.feedback)
          }
        } else if (currentStep.type === 'essay') {
          setEssayAnswer(progress.essay_answer || progress.answer || '')
          setEssayScore(progress.score)
          setEssayFeedback(progress.feedback)
          setIsCorrect(progress.isCorrect)
        }
      } else {
        setSelectedOption(null)
        setIsCorrect(null)
        setFeedback(null)
        setEssayAnswer('')
        setEssayFeedback(null)
        setEssayScore(null)
      }
    } else {
      setSelectedOption(null)
      setFeedback(null)
      setIsCorrect(null)
      setEssayAnswer('')
      setEssayFeedback(null)
      setEssayScore(null)
    }
  }, [currentStepIndex, caseData])

  // Default expected times by step type (in ms)
  const STEP_TYPE_IDLE_TIMES = {
    'mcq': 45000,
    'history': 90000,
    'diagnosis': 120000,
    'treatment': 90000,
    'info': 30000,
    'investigation': 60000,
    'clinical_hub': 120000
  }

  // Get idle timeout for current step
  const getIdleTimeout = useCallback(() => {
    const defaultTime = STEP_TYPE_IDLE_TIMES[currentStep?.type] || 60000
    if (!currentStep) return defaultTime

    // Defensive parsing: ensure it's a valid number and > 0
    const customTime = Number(currentStep.expected_time)
    const threshold = (customTime > 0) ? customTime * 1000 : defaultTime

    return threshold
  }, [currentStep, currentStepIndex])

  // Fetch hint for current step
  const fetchHint = useCallback(async () => {
    if (!currentStep?.id || (currentStep.type !== 'mcq' && currentStep.type !== 'essay')) return
    // Check if hints are enabled for this step
    if (currentStep.hint_enabled === false) return

    try {
      const res = await fetch(`${API_BASE_URL}/api/steps/${currentStep.id}/hint`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
          'ngrok-skip-browser-warning': 'true'
        }
      })
      if (res.ok) {
        const data = await res.json()
        if (data.hint) {
          setCurrentHint(data.hint)
          setShowHint(true)
          setHintShown(true)
        }
      }
    } catch (err) {
      console.error('Failed to fetch hint:', err)
    }
  }, [currentStep, auth.token])

  // Idle timer hook
  const { resetTimer } = useIdleTimer({
    idleTimeout: getIdleTimeout(),
    onIdle: fetchHint,
    enabled: (currentStep?.type === 'mcq' || currentStep?.type === 'essay') && !isCorrect && !showHint && (currentStep?.hint_enabled !== false) && essayScore === null
  })

  const progressPercent = useMemo(() => {
    if (!steps.length) return 0
    return Math.round(((currentStepIndex + 1) / steps.length) * 100)
  }, [steps.length, currentStepIndex])

  const activeSubStep = useMemo(() => {
    if (currentStep?.type !== 'clinical_hub') return null
    const sub = currentStep.subSteps?.find(s => s.id === activeSubStepId) || currentStep.subSteps?.[0]
    return sub
  }, [currentStep, activeSubStepId])

  // Reset MCQ/Essay state on sub-step change
  useEffect(() => {
    if (activeSubStepId) {
      setSelectedOption(null)
      setFeedback(null)
      setIsCorrect(null)
      setEssayAnswer('')
      setEssayFeedback(null)
      setEssayScore(null)
    }
  }, [activeSubStepId])

  const renderStepContent = (step, hideHeader = false) => {
    if (!step) return null

    switch (step.type) {
      case 'info':
        return <PatientInfoStep content={step.content} />
      case 'history':
        return <HistoryStep step={step} />
      case 'mcq':
        return (
          <McqStep
            step={step}
            selectedOption={selectedOption}
            feedback={feedback}
            isCorrect={isCorrect}
            onAnswer={handleAnswer}
          />
        )
      case 'essay':
        return (
          <EssayStep
            step={step}
            essayAnswer={essayAnswer}
            setEssayAnswer={setEssayAnswer}
            essayFeedback={essayFeedback}
            essayScore={essayScore}
            isReviewMode={caseData?.isCompleted}
            onSubmit={handleEssaySubmit}
          />
        )
      case 'investigation':
        return <InvestigationsStep step={step} />
      case 'clinical':
        if (step.phase === 'case_overview') {
          return (
            <div className="animate-in fade-in duration-700 slide-in-from-bottom-6">
               <h1 className="text-4xl font-black text-slate-900 mb-8 tracking-tight">
                  {caseData.title}
               </h1>
               <PatientInfoStep content={{ 
                  ...(caseData.patientData || {}), 
                  patientImageUrl: caseData.patientData?.imageUrl,
                  illustrationUrl: step.content?.imageUrl 
               }} />
            </div>
          )
        }
        if (step.category === 'composite_history') {
             return (
               <div className="animate-in fade-in duration-500">
                  {!hideHeader && <h2 className="text-3xl font-bold text-slate-800 mb-8">Subjective History</h2>}
                  <ClinicalStepRunner step={step} hideHeader={true} />
               </div>
             )
        }
        if (step.content?.sections) {
          return (
            <CompositeAssessmentRunner 
                step={step} 
                mcqProps={{ selectedOption, feedback, isCorrect, onAnswer: handleAnswer }}
                essayProps={{ essayAnswer, setEssayAnswer, essayFeedback, essayScore, onSubmit: handleEssaySubmit, isReviewMode: caseData?.isCompleted }}
                hideHeader={hideHeader}
            />
          )
        }
        return <ClinicalStepRunner step={step} hideHeader={hideHeader} />
      default:
        return null
    }
  }

  const handleEssaySubmit = async () => {
    if (caseData.isCompleted) return
    const currentStepToSubmit = activeSubStep || currentStep
    const timeSpent = Math.floor((Date.now() - stepStartTimeRef.current) / 1000)
    try {
      const isFinal = currentStepIndex === steps.length - 1
      const res = await fetch(
        `${API_BASE_URL}/api/cases/${caseData.id}/steps/${currentStepToSubmit.id}/answer-essay`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth.token}`,
            'ngrok-skip-browser-warning': 'true'
          },
          body: JSON.stringify({
            essayAnswer,
            isFinalStep: isFinal,
            timeSpent,
            hintShown,
            attemptNumber
          }),
        }
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to submit answer')

      setEssayScore(data.score)
      setEssayFeedback(data.feedback)
      setIsCorrect(data.correct)
      if (data.final) setFinalSummary(data)
    } catch (e) {
      setEssayFeedback(e.message)
    }
  }

  const handleAnswer = async (optionId) => {
    if (!caseData || !currentStep || !optionId) return
    setSelectedOption(optionId)

    // Calculate time spent on this step
    const timeSpent = Math.floor((Date.now() - stepStartTimeRef.current) / 1000)

    try {
      const isFinal = currentStepIndex === steps.length - 1
      const currentStepToSubmit = activeSubStep || currentStep
      const res = await fetch(
        `${API_BASE_URL}/api/cases/${caseData.id}/steps/${currentStepToSubmit.id}/answer`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth.token}`,
            'ngrok-skip-browser-warning': 'true'
          },
          body: JSON.stringify({
            selectedOptionId: optionId,
            isFinalStep: isFinal,
            timeSpent,
            hintShown,
            attemptNumber
          }),
        }
      )
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || 'Failed to submit answer')
      }

      setIsCorrect(data.correct)
      if (!data.correct) {
        setFeedback(data.feedback || currentStep.explanationOnFail)
      } else if (data.final) {
        setFinalSummary(data)
      } else {
        setFeedback(null)
      }
    } catch (e) {
      setFeedback(e.message)
      setIsCorrect(false)
    }
  }

  const isStepCompleted = useCallback((step) => {
    if (!step) return true
    
    // Check main types
    if (step.type === 'mcq') {
      return selectedOption !== null && isCorrect === true
    }
    if (step.type === 'essay') {
      return essayScore !== null
    }

    // Check Composite Assessment sections
    if (step.content?.sections) {
      const sections = step.content.sections
      const hasMcq = sections.some(s => s.type === 'mcq')
      const hasEssay = sections.some(s => s.type === 'essay')

      if (hasMcq && (selectedOption === null || isCorrect !== true)) return false
      if (hasEssay && essayScore === null) return false
    }

    return true
  }, [selectedOption, isCorrect, essayScore])

  // Logic to check if user can proceed
  const canGoNext = useMemo(() => {
    if (caseData?.isCompleted) return true
    if (!currentStep) return false

    // If we're in a hub, the sub-step must be completed
    if (currentStep.type === 'clinical_hub') {
      return isStepCompleted(activeSubStep)
    }

    // Standard check
    return isStepCompleted(currentStep)
  }, [caseData, currentStep, activeSubStep, isStepCompleted])

  const handleNext = () => {
    // If we're in a clinical_hub, check if there are more sub-steps to view
    if (currentStep?.type === 'clinical_hub' && currentStep.subSteps?.length > 0) {
      const subIndex = currentStep.subSteps.findIndex(s => s.id === activeSubStepId)
      if (subIndex !== -1 && subIndex < currentStep.subSteps.length - 1) {
        // Go to next sub-step
        setActiveSubStepId(currentStep.subSteps[subIndex + 1].id)
        return
      }
    }

    if (currentStepIndex < steps.length - 1) {
      const nextIdx = currentStepIndex + 1
      setCurrentStepIndex(nextIdx)
      // Persist progress for mid-case resume
      saveProgress(nextIdx)
    }
  }

  const handleBack = () => {
    // If we're in a clinical_hub, check if there are previous sub-steps to view
    if (currentStep?.type === 'clinical_hub' && currentStep.subSteps?.length > 0) {
      const subIndex = currentStep.subSteps.findIndex(s => s.id === activeSubStepId)
      if (subIndex > 0) {
        // Go to previous sub-step
        setActiveSubStepId(currentStep.subSteps[subIndex - 1].id)
        return
      }
    }

    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1
      setCurrentStepIndex(prevIdx)
      
      // If returning to a hub, auto-select its LAST sub-step
      const prevStep = steps[prevIdx]
      if (prevStep?.type === 'clinical_hub' && prevStep.subSteps?.length > 0) {
        setActiveSubStepId(prevStep.subSteps[prevStep.subSteps.length - 1].id)
      }
    }
  }

  // Save currentStepIndex to backend (non-blocking)
  const saveProgress = useCallback(async (stepIdx) => {
    try {
      await fetch(`${API_BASE_URL}/api/cases/${id}/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ currentStepIndex: stepIdx })
      })
    } catch (err) {
      console.error('Failed to save progress:', err)
    }
  }, [id, auth.token])

  const handleTryAgain = () => {
    setSelectedOption(null)
    setFeedback(null)
    setIsCorrect(null)
    setAttemptNumber(prev => prev + 1)
    stepStartTimeRef.current = Date.now()
    resetTimer()
    // Stay on current step to retry
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100%' }}>
      <Loader />
    </div>
  )
  if (error)
    return (
      <div className="page">
        <div style={{ color: '#ef4444', fontWeight: 500 }}>{error}</div>
      </div>
    )
  if (!caseData) return null


  return (
    <div className="page" style={{ padding: 0 }}> {/* Reset padding for full-screen layout */}
      <HintModal
        isOpen={showHint}
        hint={currentHint}
        onClose={() => setShowHint(false)}
      />

      <CaseRunnerLayout
        caseTitle={caseData.title}
        patientData={caseData.patientData || currentStep?.content}
        difficulty={caseData.difficulty}
        duration={caseData.duration}
        currentStepIndex={currentStepIndex}
        totalSteps={steps.length}
        steps={steps}
        isReviewMode={caseData.isCompleted}
        onStepClick={(idx) => setCurrentStepIndex(idx)}
        onNext={handleNext}
        onBack={handleBack}
        isNextDisabled={!canGoNext}
        clinicalTip={activeSubStep?.content?.clinicalTip || currentStep?.content?.clinicalTip || currentStep?.logic?.reasoning}
        hideSidebar={currentStep?.phase === 'case_overview' || currentStep?.type === 'info'}
        // Sub-step accordion props
        activeSubStepId={activeSubStepId}
        onSubStepClick={setActiveSubStepId}
        hubProgress={hubProgress}
      >
        {/* Watermark — absolute inside the case content box */}
        {/* <WatermarkOverlay
          userId={auth.user.id || auth.user._id || ''}
          userEmail={auth.user.email || ''}
        /> */}
        {/* Step Content */}
        <div className="animate-in fade-in duration-500 slide-in-from-bottom-4">

          {currentStep?.type === 'clinical_hub' ? (
            <div className="animate-in fade-in duration-300">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold text-slate-800">
                      {currentStep.title === 'Physical Assessment' ? 'Objective Examination' : currentStep.title === 'Patient History' ? 'Subjective History' : currentStep.title}
                    </h2>
                </div>
                {renderStepContent(activeSubStep, true)}
            </div>
          ) : (
            renderStepContent(currentStep)
          )}

          {/* MCQ Retry button */}
          {feedback && (currentStep?.type === 'mcq' || activeSubStep?.type === 'mcq') && (
            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <button
                className="cf-btn cf-btn-secondary"
                type="button"
                onClick={handleTryAgain}
              >
                Try Again
              </button>
            </div>
          )}
        </div>


      </CaseRunnerLayout>
    </div>
  )
}



function PatientInfoStep({ content }) {
  if (!content) return null
  return (
    <div className="flex flex-col lg:flex-row gap-8 items-stretch justify-center mx-auto mt-4 px-4 h-full min-h-[500px] w-full max-w-[1200px]">
      {/* Left: Patient Card */}
      <div className="w-full lg:w-[40%] shrink-0 bg-white border border-slate-200 rounded-2xl p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col gap-6">
        <div>
          <h3 className="text-[#1e293b] font-bold uppercase tracking-widest text-sm mb-6">Patient Card</h3>
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-slate-100 shadow-sm overflow-hidden shrink-0 flex items-center justify-center">
               {content.patientImageUrl || content.imageUrl ? (
                  <img src={content.patientImageUrl || content.imageUrl} alt="Avatar" className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-xl">
                   {(content.patientName || 'P').charAt(0).toUpperCase()}
                 </div>
               )}
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[#1e293b] font-semibold text-lg leading-none">{content.patientName || 'Patient'}</span>
              <span className="text-slate-600 font-medium text-[15px] leading-none">
                {content.gender}{content.gender && content.age ? ', ' : ''}{content.age ? `${content.age} years old` : ''}
              </span>
            </div>
          </div>
        </div>

        {content.chiefComplaint && (
          <div className="mt-4">
            <h3 className="text-[#1e293b] font-bold uppercase tracking-widest text-sm mb-4">Chief Complaint</h3>
            <div className="border border-slate-200 rounded-xl p-6 bg-white text-right text-slate-800 text-[19px] leading-relaxed shadow-sm font-semibold" dir="rtl">
              {content.chiefComplaint}
            </div>
          </div>
        )}
      </div>

      {/* Right: Main Image */}
      <div className="w-full lg:w-[60%] flex shrink-0 rounded-2xl overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-200 bg-white min-h-[400px]">
         {content.illustrationUrl || content.imageUrl ? (
            <img src={content.illustrationUrl || content.imageUrl} alt="Case Illustration" className="w-full h-full object-cover" />
         ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-400 font-medium">
               Image / Diagram
            </div>
         )}
      </div>
    </div>
  )
}


function HistoryStep({ step }) {
  const questions = step.content?.questions || []

  return (
    <div className="history-step">
      <div className="section-title" style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>
        {step.content?.title || 'History of Pain'}
      </div>
      <p className="section-description" style={{ color: 'var(--cf-text-muted)', marginBottom: '32px' }}>
        {step.content?.description || 'Questions you should ask and patient answers'}
      </p>
      <div className="history-questions space-y-4">
        {questions.map((q, index) => (
          <div key={index} className="history-section-box">
             <div className="flex items-start gap-4">
               <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-lg shadow-sm">
                 {q.icon || '❓'}
               </div>
               <div className="flex-1">
                 <div className="history-section-title" style={{ fontSize: '15px', color: 'var(--cf-text-muted)', marginBottom: '4px' }}>Question {index + 1}</div>
                 <div className="history-section-content" style={{ fontSize: '17px', fontWeight: '600', marginBottom: '16px' }}>{q.question}</div>
                 
                 <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Patient Answer</div>
                    <div className="text-slate-800 font-medium">{q.answer}</div>
                 </div>
               </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function InvestigationsStep({ step }) {
  const groupedTests = {}
  step.investigations?.forEach((inv) => {
    if (!groupedTests[inv.groupLabel]) {
      groupedTests[inv.groupLabel] = []
    }
    groupedTests[inv.groupLabel].push(inv)
  })

  const getVideoEmbedUrl = (url) => {
    if (!url) return null
    // Convert YouTube URLs to embed format
    if (url.includes('youtube.com/watch')) {
      const videoId = url.split('v=')[1]?.split('&')[0]
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0]
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null
    }
    // For other video URLs, return as-is (assuming they're already embeddable)
    return url
  }

  return (
    <div className="investigations-step">
      <div className="section-title" style={{ marginBottom: '0.5rem' }}>
        Investigations
      </div>
      <p className="section-description" style={{ marginBottom: '1.5rem' }}>
        Investigations you should consider and patient-friendly explanations
      </p>

      <div className="investigations-sections">
        {Object.entries(groupedTests).map(([groupLabel, tests]) => (
          <div key={groupLabel} className="investigation-section">
            <div className="investigation-section-title">
              <span>📋</span> {groupLabel}
            </div>
            <div className="investigation-tests-grid">
              {tests.map((inv) => {
                const embedUrl = getVideoEmbedUrl(inv.videoUrl)
                const isPositive = inv.result?.toLowerCase().includes('positive')
                const isNegative = inv.result?.toLowerCase().includes('negative')

                return (
                  <div key={inv.id} className="investigation-test-card">
                    <div className="investigation-test-header">
                      <div className="investigation-test-name">{inv.testName}</div>
                      <div className={`investigation-result ${isPositive ? 'positive' : isNegative ? 'negative' : ''}`}>
                        {isPositive ? '✓' : isNegative ? '✗' : ''}
                      </div>
                    </div>
                    <div className="investigation-test-description">{inv.description}</div>
                    {inv.result && (
                      <div className="investigation-test-result">
                        Result: <strong>{inv.result}</strong>
                      </div>
                    )}
                    {embedUrl && (
                      <div className="investigation-video-container">
                        <iframe
                          src={embedUrl}
                          title={inv.testName}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {step.xrays && step.xrays.length > 0 && (
        <div className="xray-section" style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #e5e7eb' }}>
          <div className="section-title" style={{ marginBottom: '1rem' }}>X-ray Findings</div>
          <div className="xray-findings-grid">
            {step.xrays.map((x) => {
              const hasImage = x.imageUrl && x.imageUrl.trim() !== '';

              return (
                <div key={x.id} className="xray-finding-card">
                  {hasImage ? (
                    <img
                      src={x.imageUrl}
                      alt={x.label}
                      className="xray-image"
                      onError={(e) => {
                        console.error('Failed to load X-ray image:', {
                          label: x.label,
                          imageUrl: x.imageUrl?.substring(0, 100),
                          fullUrl: x.imageUrl
                        });
                        e.target.style.display = 'none';
                      }}

                    />
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '150px',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '0.75rem',
                      color: '#9ca3af',
                      fontSize: '0.85rem'
                    }}>
                      No image
                    </div>
                  )}
                  <div className="xray-finding-label">
                    {x.icon && <span>{x.icon} </span>}
                    {x.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  )
}


export default CaseRunnerPage


