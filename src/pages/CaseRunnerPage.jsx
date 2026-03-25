import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { API_BASE_URL } from '../config'
import Loader from '@/components/ui/loader-12'
import { useIdleTimer } from '../hooks/useIdleTimer'
import HintModal from '@/components/common/HintModal'
import { ClinicalStepRunner } from '@/components/clinical'
import ClinicalHub from '@/components/clinical/ClinicalHub'
import CompositeAssessmentRunner from '@/components/clinical/CompositeAssessmentRunner'
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

  const handleAnswer = async (optionId) => {
    if (!caseData || !currentStep || !optionId) return
    setSelectedOption(optionId)

    // Calculate time spent on this step
    const timeSpent = Math.floor((Date.now() - stepStartTimeRef.current) / 1000)

    try {
      const isFinal = currentStepIndex === steps.length - 1
      const res = await fetch(
        `${API_BASE_URL}/api/cases/${caseData.id}/steps/${currentStep.id}/answer`,
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

  // Logic to check if user can proceed
  const canGoNext = useMemo(() => {
    if (caseData?.isCompleted) return true
    if (!currentStep) return false

    // MCQ: Must select correct option
    if (currentStep.type === 'mcq') {
      return selectedOption !== null && isCorrect === true
    }

    // Essay: Must submit
    if (currentStep.type === 'essay') {
      return essayScore !== null
    }

    // Clinical Hub: the Next button just progresses through sub-steps then advances
    if (currentStep.type === 'clinical_hub') {
      return true
    }

    // Default: Open
    return true
  }, [caseData, currentStep, selectedOption, isCorrect, essayScore, hubProgress])

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
        clinicalTip={currentStep?.content?.clinicalTip || currentStep?.logic?.reasoning}
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

          {/* Special Header for non-clinical steps that still need context */}
          {(currentStep?.type !== 'clinical' && currentStep?.type !== 'clinical_hub') && (
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                {currentStep?.content?.title ||
                  (currentStep?.type === 'mcq' ? 'Clinical Decision' :
                    currentStep?.type === 'history' ? 'History Taking' :
                      currentStep?.type === 'investigation' ? 'Investigations' :
                        currentStep?.type === 'essay' ? 'Essay Question' :
                          'Step Content')}
              </h2>
            </div>
          )}

          {currentStep?.type === 'info' && (
            <PatientInfoStep content={currentStep.content} />
          )}

          {currentStep?.type === 'history' && (
            <HistoryStep step={currentStep} />
          )}

          {currentStep?.type === 'mcq' && (
            <McqStep
              step={currentStep}
              selectedOption={selectedOption}
              feedback={feedback}
              isCorrect={isCorrect}
              onAnswer={handleAnswer}
            />
          )}

          {currentStep?.type === 'clinical' && currentStep?.category === 'composite_history' && (
            <div className="animate-in fade-in duration-500">
               <h2 className="text-3xl font-bold text-slate-800 mb-8">Subjective History</h2>
               <ClinicalStepRunner step={currentStep} hideHeader={true} />
            </div>
          )}

          {currentStep?.type === 'clinical' && currentStep?.category !== 'composite_history' && !currentStep?.content?.sections && (
            <ClinicalStepRunner step={currentStep} />
          )}

          {currentStep?.type === 'clinical_hub' && (
            <div className="animate-in fade-in duration-300">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold text-slate-800">
                      {currentStep.title === 'Physical Assessment' ? 'Objective Examination' : currentStep.title === 'Patient History' ? 'Subjective History' : currentStep.title}
                    </h2>
                </div>
                {/* Render the specific sub-step directly */}
                {(() => {
                   const sub = currentStep.subSteps?.find(s => s.id === activeSubStepId) || currentStep.subSteps?.[0];
                   return sub ? <ClinicalStepRunner step={sub} hideHeader={true} /> : null
                })()}
            </div>
          )}

          {currentStep?.type === 'investigation' && (
            <InvestigationsStep step={currentStep} />
          )}

          {/* Composite Assessment (new: sections-based) */}
          {currentStep?.type === 'clinical' && currentStep?.content?.sections && (
            <CompositeAssessmentRunner step={currentStep} />
          )}

          {currentStep?.type === 'essay' && (
            <EssayStep
              step={currentStep}
              essayAnswer={essayAnswer}
              setEssayAnswer={setEssayAnswer}
              essayFeedback={essayFeedback}
              essayScore={essayScore}
              isReviewMode={caseData.isCompleted}
              onSubmit={async () => {
                if (caseData.isCompleted) return // Block submission in review mode
                const timeSpent = Math.floor((Date.now() - stepStartTimeRef.current) / 1000)
                try {
                  const isFinal = currentStepIndex === steps.length - 1
                  const res = await fetch(
                    `${API_BASE_URL}/api/cases/${caseData.id}/steps/${currentStep.id}/answer-essay`,
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
                  if (!res.ok) {
                    throw new Error(data.message || 'Failed to submit answer')
                  }

                  setEssayScore(data.score)
                  setEssayFeedback(data.feedback)
                  setIsCorrect(data.correct)
                  if (data.final) {
                    setFinalSummary(data)
                  }
                } catch (e) {
                  setEssayFeedback(e.message)
                }
              }}
            />
          )}

          {/* MCQ Retry button */}
          {feedback && currentStep?.type === 'mcq' && (
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
    <div className="patient-card">
      <div className="patient-details">
        <div className="patient-label">Patient</div>
        <div className="patient-text">
          {content.patientName} • {content.age} years • {content.gender}
        </div>
        <div className="patient-label">Brief</div>
        <div className="patient-text">{content.description}</div>
        <div className="patient-label">Chief complaint (Arabic)</div>
        <div className="patient-quote">{content.chiefComplaint}</div>
      </div>
      <div className="patient-image-shell">
        {content.imageUrl ? (
          <img src={content.imageUrl} alt="Patient" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '1rem' }} />
        ) : (
          <div style={{ color: '#9ca3af', fontSize: '0.8rem' }}>Patient illustration / knee diagram</div>
        )}
      </div>
    </div>
  )
}

function McqStep({ step, selectedOption, feedback, isCorrect, onAnswer }) {
  const [isSubmitted, setIsSubmitted] = React.useState(false)
  const [localSelection, setLocalSelection] = React.useState(null)

  const getOptionIcon = (index) => {
    const icons = ['📋', '🔬', '💊', '📝', '🏥', '💡']
    return icons[index % icons.length]
  }

  const handleOptionClick = (optionId) => {
    if (!isSubmitted) {
      setLocalSelection(optionId)
    }
  }

  const handleSubmit = () => {
    if (localSelection && !isSubmitted) {
      setIsSubmitted(true)
      onAnswer(localSelection)
    }
  }

  // Reset submission state when step changes or when retry/load happens
  React.useEffect(() => {
    if (!selectedOption) {
      setIsSubmitted(false)
      setLocalSelection(null)
    } else {
      setIsSubmitted(true)
    }
  }, [step.id, selectedOption])

  // Determine which selection to show: submitted answer or local selection
  const displaySelection = isSubmitted ? (selectedOption || localSelection) : localSelection

  return (
    <div>
      <div className="section-title" style={{ marginBottom: '1.5rem' }}>
        {step.content?.prompt || step.question || 'Choose the best next step'}
      </div>
      <div className="mcq-options-grid">
        {step.options.map((opt, index) => {
          const isSelected = displaySelection === opt.id
          let statusClass = ''

          if (isSelected && isSubmitted) {
            if (isCorrect === false) {
              statusClass = ' wrong'
            } else if (isCorrect === true) {
              statusClass = ' correct'
            }
          }

          return (
            <button
              key={opt.id}
              type="button"
              className={`mcq-option-card${statusClass}${isSelected ? ' selected' : ''}`}
              onClick={() => handleOptionClick(opt.id)}
              disabled={isSubmitted}
            >
              <div className="mcq-option-icon">{getOptionIcon(index)}</div>
              <div className="mcq-option-text">{opt.label}</div>
            </button>
          )
        })}
      </div>
      {!isSubmitted && (
        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
          <button
            className="btn-primary"
            style={{ minWidth: '200px' }}
            disabled={!localSelection}
            onClick={handleSubmit}
          >
            Submit Answer
          </button>
        </div>
      )}
      {feedback && <div className="mcq-feedback">{feedback}</div>}
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

function EssayStep({ step, essayAnswer, setEssayAnswer, essayFeedback, essayScore, onSubmit, isReviewMode }) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    await onSubmit()
    setIsSubmitting(false)
  }

  const essayQuestions = step.essayQuestions || []

  return (
    <div className="essay-step">
      <div className="section-title" style={{ marginBottom: '1rem' }}>
        Essay Questions
      </div>
      <p className="section-description" style={{ marginBottom: '1.5rem' }}>
        Please provide a detailed answer to the following question(s). Your answer will be automatically scored based on key concepts.
      </p>

      {essayQuestions.map((eq, idx) => (
        <div key={idx} style={{ marginBottom: '2rem' }}>
          <div style={{
            background: '#f8fafc',
            padding: '1.5rem',
            borderRadius: '12px',
            marginBottom: '1rem',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ fontWeight: 600, fontSize: '1.05rem', marginBottom: '0.5rem', color: '#1e293b' }}>
              Question {idx + 1}
            </div>
            <div style={{ color: '#475569', lineHeight: '1.6' }}>
              {eq.question_text}
            </div>
          </div>

          {isReviewMode ? (
            <div style={{
              padding: '1.5rem',
              borderRadius: '12px',
              background: '#f1f5f9',
              border: '2px solid #e2e8f0',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem',
                fontSize: '1.05rem',
                fontWeight: 600,
                color: '#334155'
              }}>
                <span style={{ fontSize: '1.3rem' }}>👤</span>
                Your Submitted Answer
              </div>
              <div style={{
                color: '#475569',
                lineHeight: '1.7',
                whiteSpace: 'pre-wrap',
                fontSize: '0.95rem'
              }}>
                {essayAnswer || <span style={{ fontStyle: 'italic', color: '#94a3b8' }}>No answer submitted.</span>}
              </div>
            </div>
          ) : (
            <>
              <textarea
                value={essayAnswer}
                onChange={(e) => setEssayAnswer(e.target.value)}
                rows={10}
                placeholder="Type your answer here... (Maximum 1000 characters)"
                maxLength={1000}
                disabled={essayScore !== null}
                style={{
                  width: '100%',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: '2px solid #e2e8f0',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                  lineHeight: '1.6',
                  resize: 'vertical',
                  minHeight: '200px',
                  opacity: essayScore !== null ? 0.6 : 1,
                  cursor: essayScore !== null ? 'not-allowed' : 'text'
                }}
              />
              <div style={{
                textAlign: 'right',
                fontSize: '0.875rem',
                color: '#64748b',
                marginTop: '0.5rem'
              }}>
                {essayAnswer.length} / 1000 characters
              </div>
            </>
          )}
        </div>
      ))}

      {essayScore === null && !isReviewMode && (
        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
          <button
            className="btn-primary"
            style={{ minWidth: '200px' }}
            onClick={handleSubmit}
            disabled={!essayAnswer || essayAnswer.trim().length === 0 || isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Answer'}
          </button>
        </div>
      )}

      {essayFeedback && (
        <div style={{
          marginTop: '1.5rem',
          padding: '1.5rem',
          borderRadius: '12px',
          background: essayScore >= (step.maxScore * 0.6) ? '#f0fdf4' : '#fef2f2',
          border: `2px solid ${essayScore >= (step.maxScore * 0.6) ? '#86efac' : '#fca5a5'}`,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1rem',
            fontSize: '1.1rem',
            fontWeight: 600,
            color: essayScore >= (step.maxScore * 0.6) ? '#166534' : '#991b1b'
          }}>
            <span style={{ fontSize: '1.5rem' }}>
              {essayScore >= (step.maxScore * 0.6) ? '✓' : '⚠️'}
            </span>
            Score: {essayScore} / {step.maxScore}
          </div>
          <div style={{
            color: essayScore >= (step.maxScore * 0.6) ? '#166534' : '#991b1b',
            lineHeight: '1.6'
          }}>
            {essayFeedback}
          </div>
        </div>
      )}

      {(essayScore !== null || isReviewMode) && essayQuestions.length > 0 && essayQuestions[0].perfect_answer && (
        <div style={{
          marginTop: '1.5rem',
          padding: '1.5rem',
          borderRadius: '12px',
          background: '#f8fafc',
          border: '2px solid #e2e8f0',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem',
            fontSize: '1.05rem',
            fontWeight: 600,
            color: '#1e293b'
          }}>
            <span style={{ fontSize: '1.3rem' }}>📝</span>
            Perfect Answer
          </div>
          <div style={{
            color: '#475569',
            lineHeight: '1.7',
            whiteSpace: 'pre-wrap',
            fontSize: '0.95rem'
          }}>
            {essayQuestions[0].perfect_answer}
          </div>
          <div style={{
            marginTop: '1rem',
            padding: '0.75rem',
            background: '#e0e7ff',
            borderRadius: '8px',
            fontSize: '0.85rem',
            color: '#3730a3',
            fontStyle: 'italic'
          }}>
            💡 Compare your answer with this model answer to identify areas for improvement.
          </div>
        </div>
      )}
    </div>
  )
}

export default CaseRunnerPage


