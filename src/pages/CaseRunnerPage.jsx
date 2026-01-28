import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { API_BASE_URL } from '../config'
import Loader from '@/components/ui/loader-12'
import { useIdleTimer } from '../hooks/useIdleTimer'
import HintModal from '@/components/common/HintModal'

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
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, auth])

  const steps = caseData?.steps || []
  const currentStep = steps[currentStepIndex]

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
        setSelectedOption(progress.selectedOptionId)
        setIsCorrect(progress.isCorrect)

        // Find feedback for the selected option
        const selectedOpt = currentStep.options?.find(o => o.id === progress.selectedOptionId)
        if (selectedOpt) {
          setFeedback(selectedOpt.feedback)
        }
      } else {
        setSelectedOption(null)
        setIsCorrect(null)
        setFeedback(null)
      }
    } else {
      setSelectedOption(null)
      setFeedback(null)
      setIsCorrect(null)
    }
  }, [currentStepIndex, caseData])

  // Default expected times by step type (in ms)
  const STEP_TYPE_IDLE_TIMES = {
    'mcq': 45000,
    'history': 90000,
    'diagnosis': 120000,
    'treatment': 90000,
    'info': 30000,
    'investigation': 60000
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
    if (!currentStep?.id || currentStep.type !== 'mcq') return
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
    enabled: currentStep?.type === 'mcq' && !isCorrect && !showHint && (currentStep?.hint_enabled !== false)
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

  // For MCQ steps, can go next only after answer is submitted AND Correct
  // For non-MCQ steps, can always go next
  const canGoNext =
    caseData?.isCompleted || currentStep?.type !== 'mcq' || (selectedOption !== null && isCorrect === true)

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((i) => i + 1)
    }
  }

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
    <div className="page">
      {/* Hint Modal */}
      <HintModal
        isOpen={showHint}
        hint={currentHint}
        onClose={() => setShowHint(false)}
      />

      <div className="page-header">
        {caseData.isCompleted && (
          <div style={{
            background: '#fef9c3',
            border: '1px solid #fde047',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1.5rem',
            color: '#854d0e',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span>👁️</span>
            <strong>Review Mode:</strong> You are viewing your past attempt. Answers are read-only.
          </div>
        )}
        <div className="page-eyebrow">Case</div>
        <h1 className="page-title">{caseData.title}</h1>
        <p className="page-subtitle">
          Follow the steps, choose appropriate actions, and reflect on the feedback.
        </p>
      </div>

      <div className="card">
        <div className="step-header">
          <div>
            <div className="step-title">
              Step {currentStepIndex + 1} of {steps.length}{' '}
              {currentStep?.type === 'info' && ' – Patient information'}
              {currentStep?.type === 'mcq' && ' – Decision point'}
              {currentStep?.type === 'investigation' && ' – Investigations & imaging'}
            </div>
          </div>
          <div style={{ minWidth: '160px' }}>
            <div className="progress-track">
              <div
                className="progress-bar"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

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

        {currentStep?.type === 'investigation' && (
          <InvestigationsStep step={currentStep} />
        )}

        <div className="step-actions">
          <button
            className="btn-secondary"
            type="button"
            onClick={() => setCurrentStepIndex((i) => Math.max(0, i - 1))}
            disabled={currentStepIndex === 0}
          >
            Previous step
          </button>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {feedback && currentStep?.type === 'mcq' && (
              <button className="btn-secondary" type="button" onClick={handleTryAgain}>
                Try again
              </button>
            )}
            {currentStepIndex < steps.length - 1 && (
              <button
                className="btn-primary"
                type="button"
                disabled={!canGoNext}
                onClick={handleNext}
              >
                Next step
              </button>
            )}
            {currentStepIndex === steps.length - 1 && caseData.isCompleted && !finalSummary && (
              <button className="btn-primary" type="button" onClick={() => navigate('/cases')}>
                Done – back to cases
              </button>
            )}
          </div>
        </div>
      </div>

      {finalSummary && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <div className="section-title">Case completed</div>
          <p className="section-description">
            Great work. Here is a quick summary for this case and your overall progress.
          </p>
          <div className="stat-row">
            <div className="stat">
              <div className="stat-label">Score for this case</div>
              <div className="stat-value">{finalSummary.score}</div>
            </div>
            <div className="stat">
              <div className="stat-label">Cases completed overall</div>
              <div className="stat-value">
                {finalSummary.stats?.casesCompleted ?? 0}
              </div>
            </div>
            <div className="stat">
              <div className="stat-label">Total score</div>
              <div className="stat-value">
                {finalSummary.stats?.totalScore ?? 0}
              </div>
            </div>
          </div>
          <div style={{ marginTop: '1.2rem', display: 'flex', gap: '0.7rem' }}>
            <button className="btn-primary" onClick={() => navigate('/cases')}>
              Done – back to cases
            </button>
          </div>
        </div>
      )}
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
      <div className="section-title" style={{ marginBottom: '1rem' }}>
        {step.content?.title || 'History of Pain'}
      </div>
      <p className="section-description" style={{ marginBottom: '1.5rem' }}>
        {step.content?.description || 'Questions you should ask and patient answers'}
      </p>
      <div className="history-questions">
        {questions.map((q, index) => (
          <div key={index} className="history-question-card">
            <div className="history-question-header">
              <div className="history-question-number">{index + 1}</div>
              <div className="history-question-icon">{q.icon || '❓'}</div>
              <div className="history-question-text">{q.question}</div>
            </div>
            <div className="history-answer-box">
              <div className="history-answer-label">Answer:</div>
              <div className="history-answer-text">{q.answer}</div>
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


