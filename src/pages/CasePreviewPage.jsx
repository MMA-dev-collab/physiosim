import React, { useEffect, useState, useMemo } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../config'
import MedicalLoader from '@/components/ui/MedicalLoader'
import CaseRunnerLayout from './CaseRunnerLayout'
import { StepRenderer } from '@/components/clinical'
import { PreviewProvider, usePreview } from '../context/PreviewContext'
import './CasePreviewPage.css'

function CasePreviewRunner({ onExit }) {
  const {
    mode,
    steps,
    caseData,
    currentStepIndex,
    setCurrentStepIndex,
    activeSubStepId,
    setActiveSubStepId,
    completedSubSteps,
    hubProgress,
    maxReachedIndex,
    answers,
    feedback,
    scores,
    isCompleted,
    finalSummary,
    submitAnswer,
    updateDraftAnswer,
    resetStep,
    goToNext,
    goToBack,
    handleSubStepView,
    setIsCompleted,
    setFinalSummary
  } = usePreview()

  const currentStep = steps[currentStepIndex]

  // Determine active sub-step for hubs
  const activeSubStep = useMemo(() => {
    if (currentStep?.type !== 'clinical_hub') return null
    const sub = currentStep.subSteps?.find(s => s.id === activeSubStepId) || currentStep.subSteps?.[0]
    return sub
  }, [currentStep, activeSubStepId])

  // Track viewed sub-step
  useEffect(() => {
    if (activeSubStepId && currentStep?.type === 'clinical_hub') {
      handleSubStepView(activeSubStepId)
    }
  }, [activeSubStepId, currentStep, handleSubStepView])

  // Auto-select first substep if not valid
  useEffect(() => {
    if (currentStep?.type === 'clinical_hub' && currentStep.subSteps?.length > 0) {
      const isCurrentActiveValid = currentStep.subSteps.some(s => s.id === activeSubStepId)
      if (!isCurrentActiveValid) {
        setActiveSubStepId(currentStep.subSteps[0].id)
      }
    } else {
      setActiveSubStepId(null)
    }
  }, [currentStepIndex, currentStep, activeSubStepId, setActiveSubStepId])

  // Check if MCQ exists in current/active step for try again rendering
  const checkHasMcq = (stepToCheck) => {
    if (!stepToCheck) return false;
    if (stepToCheck.type === 'mcq') return true;
    if (stepToCheck.type === 'clinical' && stepToCheck.content?.sections) {
      return stepToCheck.content.sections.some(s => s.type === 'mcq');
    }
    return false;
  }

  const activeStepForMcq = activeSubStep || currentStep
  const stepId = activeStepForMcq?.id
  let stepFeedback = feedback[stepId] || null
  let isCorrect = scores[stepId]?.isCorrect ?? null

  if (activeStepForMcq?.content?.sections) {
    activeStepForMcq.content.sections.forEach((sec, idx) => {
      const secId = sec.id || `${stepId}-section-${idx}`
      if (sec.type === 'mcq') {
        const secScore = scores[secId]
        if (secScore?.isCorrect === false) {
          isCorrect = false
          stepFeedback = feedback[secId] || stepFeedback
        }
      }
    })
  }

  const getIsStepCompleted = (s) => {
    if (!s) return true
    const stepId = s.id
    const stepType = s.category || s.type
    const answer = answers[stepId]
    const score = scores[stepId]

    if (stepType === 'mcq') {
      return answer?.selectedOptionId !== undefined && score?.isCorrect === true
    }
    if (stepType === 'essay') {
      return score?.score !== undefined && score?.score !== null
    }
    if (s.phase === 'diagnosis' || s.phase === 'problem_list') {
      return score?.score !== undefined && score?.score !== null
    }
    if (s.content?.sections) {
      const sections = s.content.sections
      for (let idx = 0; idx < sections.length; idx++) {
        const sec = sections[idx]
        const secId = sec.id || `${s.id}-section-${idx}`
        if (sec.type === 'mcq') {
          const secAnswer = answers[secId]
          const secScore = scores[secId]
          const mcqCorrect = secAnswer?.selectedOptionId !== undefined && secScore?.isCorrect === true
          if (!mcqCorrect) return false
        }
        if (sec.type === 'essay') {
          const secScore = scores[secId]
          const essayScored = secScore?.score !== undefined && secScore?.score !== null
          if (!essayScored) return false
        }
      }
    }
    return true
  }

  const canGoNext = useMemo(() => {
    if (mode === 'preview-review') return true
    if (isCompleted) return true
    if (!currentStep) return false

    if (currentStep.type === 'clinical_hub') {
      const activeSub = currentStep.subSteps?.find(s => s.id === activeSubStepId) || currentStep.subSteps?.[0]
      return getIsStepCompleted(activeSub)
    }

    return getIsStepCompleted(currentStep)
  }, [mode, isCompleted, currentStep, activeSubStepId, answers, scores])

  const handleNext = () => {
    goToNext()
  }

  const handleBack = () => {
    goToBack()
  }

  const handleTryAgain = () => {
    if (stepId) {
      resetStep(stepId)
    }
  }

  if (isCompleted && finalSummary) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6">
        {/* Preview Banner */}
        <div className="preview-top-bar">
          <div className="preview-indicator">
            <span className="pulsing-dot green"></span>
            <span>PREVIEW MODE: {mode === 'preview-review' ? 'REVIEW MODE' : 'USER MODE'}</span>
          </div>
          <button onClick={onExit} className="exit-preview-btn">Exit Preview</button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-2xl w-full text-center mt-12">
          <div className="mb-6 mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
             <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
             </svg>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Case Completed! (Preview)</h1>
          <p className="text-lg text-slate-600 mb-8">
            You have successfully completed <strong>{caseData.title}</strong>.
          </p>
          <div className="bg-slate-50 rounded-xl p-6 mb-8 flex justify-center space-x-12">
            <div className="text-center">
              <p className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-1">Final Score</p>
              <p className="text-4xl font-bold text-slate-900">{finalSummary.score}</p>
              <p className="text-xs text-slate-400 mt-1">out of {finalSummary.maxPossibleScore}</p>
            </div>
            <div className="text-center border-l pl-12 border-slate-200">
              <p className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-1">Duration</p>
              <p className="text-4xl font-bold text-slate-900">
                 —<span className="text-2xl text-slate-500 ml-1">m</span> —<span className="text-2xl text-slate-500 ml-1">s</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">Simulated Session</p>
            </div>
          </div>
          <div className="flex space-x-4 justify-center">
            <button 
              onClick={() => {
                setIsCompleted(false)
                setFinalSummary(null)
                setCurrentStepIndex(0)
              }} 
              className="px-6 py-3 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
            >
              Restart Preview
            </button>
            <button 
              onClick={onExit}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              Exit Preview
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Set selectedOption, feedback, isCorrect props from local context state for Mcq/Essay/etc.
  const mcqOption = answers[stepId]?.selectedOptionId || null
  const essayAnswer = answers[stepId]?.essayAnswer || ''
  const essayFeedback = feedback[stepId] || null
  const essayScore = scores[stepId]?.score ?? null

  return (
    <div className="case-preview-runner-wrapper">
      {/* Preview Banner */}
      <div className="preview-top-bar">
        <div className="preview-indicator">
          <span className="pulsing-dot green"></span>
          <span>PREVIEW: {mode === 'preview-review' ? 'REVIEW MODE (Free Navigation & Pre-filled Answers)' : 'USER MODE (Simulated Student Run)'}</span>
        </div>
        <button onClick={onExit} className="exit-preview-btn">Exit Preview</button>
      </div>

      <div className="page" style={{ padding: 0, marginTop: '50px' }}>
        <CaseRunnerLayout
          caseTitle={caseData.title}
          patientData={caseData.patientData || currentStep?.content}
          difficulty={caseData.difficulty}
          duration={caseData.duration}
          currentStepIndex={currentStepIndex}
          totalSteps={steps.length}
          steps={steps}
          isReviewMode={mode === 'preview-review'}
          onStepClick={(idx) => {
            if (mode === 'preview-review' || idx <= maxReachedIndex) {
              setCurrentStepIndex(idx)
            }
          }}
          onNext={handleNext}
          onBack={handleBack}
          isNextDisabled={!canGoNext}
          clinicalTip={activeSubStep?.content?.clinicalTip || currentStep?.content?.clinicalTip || currentStep?.logic?.reasoning}
          hideSidebar={currentStep?.phase === 'case_overview' || currentStep?.type === 'info'}
          activeSubStepId={activeSubStepId}
          onSubStepClick={setActiveSubStepId}
          hubProgress={hubProgress}
          maxReachedIndex={mode === 'preview-review' ? steps.length - 1 : maxReachedIndex}
          completedSubSteps={completedSubSteps}
        >
          <div className="animate-in fade-in duration-500 slide-in-from-bottom-4">
            {currentStep?.type === 'clinical_hub' ? (
              <div className="animate-in fade-in duration-300">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold text-slate-800">
                    {currentStep.title === 'Examination' ? 'Examination' : currentStep.title === 'Subjective Data' ? 'Subjective Data' : currentStep.title}
                  </h2>
                </div>
                <StepRenderer
                  step={activeSubStep}
                  caseData={caseData}
                  hideHeader={true}
                  selectedOption={mcqOption}
                  feedback={stepFeedback}
                  isCorrect={isCorrect}
                  essayAnswer={essayAnswer}
                  setEssayAnswer={(val) => updateDraftAnswer(stepId, val)}
                  essayFeedback={essayFeedback}
                  essayScore={essayScore}
                  stepInitialData={answers[stepId]?.answer_data || null}
                />
              </div>
            ) : (
              <StepRenderer
                step={currentStep}
                caseData={caseData}
                hideHeader={false}
                selectedOption={mcqOption}
                feedback={stepFeedback}
                isCorrect={isCorrect}
                essayAnswer={essayAnswer}
                setEssayAnswer={(val) => updateDraftAnswer(stepId, val)}
                essayFeedback={essayFeedback}
                essayScore={essayScore}
                stepInitialData={answers[stepId]?.answer_data || null}
              />
            )}

            {/* MCQ Retry button */}
            {stepFeedback && isCorrect === false && (checkHasMcq(activeSubStep) || checkHasMcq(currentStep)) && (
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
    </div>
  )
}

export default function CasePreviewPage({ auth }) {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const mode = searchParams.get('mode') || 'preview-user' // 'preview-user' or 'preview-review'

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [caseData, setCaseData] = useState(null)
  const [steps, setSteps] = useState([])

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError(null)
      try {
        // Fetch case details using admin endpoint (with complete answers/expected data)
        const caseRes = await fetch(`${API_BASE_URL}/api/admin/cases/${id}`, {
          headers: {
            Authorization: `Bearer ${auth.token}`,
            'ngrok-skip-browser-warning': 'true'
          }
        })
        if (!caseRes.ok) throw new Error('Failed to load case data')
        const caseObj = await caseRes.json()

        const stepsRes = await fetch(`${API_BASE_URL}/api/admin/cases/${id}/steps`, {
          headers: {
            Authorization: `Bearer ${auth.token}`,
            'ngrok-skip-browser-warning': 'true'
          }
        })
        if (!stepsRes.ok) throw new Error('Failed to load case steps')
        const stepsArr = await stepsRes.json()

        setCaseData(caseObj)
        setSteps(stepsArr)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id, auth])

  const handleExit = () => {
    // If opened in a new tab, try to close it, otherwise navigate back to editor
    try {
      window.close()
    } catch (e) {
      // close failed, navigate
    }
    navigate(`/admin/cases/${id}/edit`)
  }

  if (loading) {
    return (
      <MedicalLoader />
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6">
        <div className="text-red-500 font-bold text-lg mb-4">Error loading preview: {error}</div>
        <button onClick={handleExit} className="cf-btn cf-btn-secondary">Back to Editor</button>
      </div>
    )
  }

  return (
    <PreviewProvider mode={mode} initialSteps={steps} caseData={caseData} isSingleStep={false}>
      <CasePreviewRunner onExit={handleExit} />
    </PreviewProvider>
  )
}
