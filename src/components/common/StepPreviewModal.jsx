import React, { useState, useDeferredValue } from 'react'
import { X } from 'lucide-react'
import { PreviewProvider, usePreview } from '../../context/PreviewContext'
import StepRenderer from '../clinical/StepRenderer'
import './StepPreviewModal.css'

function SingleStepPreviewRunner() {
  const preview = usePreview()
  if (!preview) return null

  const {
    mode,
    steps,
    caseData,
    answers,
    feedback,
    scores,
    updateDraftAnswer,
    resetStep
  } = preview

  const step = steps[0]
  if (!step) return null

  const stepId = step.id
  const stepFeedback = feedback[stepId] || null
  const stepScore = scores[stepId]
  const isCorrect = stepScore?.isCorrect ?? null

  const checkHasMcq = (stepToCheck) => {
    if (!stepToCheck) return false;
    if (stepToCheck.type === 'mcq') return true;
    if (stepToCheck.type === 'clinical' && stepToCheck.content?.sections) {
      return stepToCheck.content.sections.some(s => s.type === 'mcq');
    }
    return false;
  }

  const handleTryAgain = () => {
    resetStep(stepId)
  }

  const mcqOption = answers[stepId]?.selectedOptionId || null
  const essayAnswer = answers[stepId]?.essayAnswer || ''
  const essayFeedback = feedback[stepId] || null
  const essayScore = scores[stepId]?.score ?? null

  return (
    <div className="single-step-preview-content animate-in fade-in duration-300">
      <StepRenderer
        step={step}
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

      {stepFeedback && isCorrect === false && checkHasMcq(step) && (
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
  )
}

export default function StepPreviewModal({ isOpen, onClose, step, caseData }) {
  const [mode, setMode] = useState('preview-user') // 'preview-user' | 'preview-review'

  // Defer rendering changes on the step data to keep editor typing fluid
  const deferredStep = useDeferredValue(step)

  if (!isOpen) return null

  return (
    <div className="step-preview-modal-overlay" onClick={onClose}>
      <div className="step-preview-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="step-preview-modal-header">
          <div className="step-preview-header-left">
            <span className="step-preview-badge">Live Preview</span>
            <h3>{deferredStep?.title || deferredStep?.category?.replace(/_/g, ' ') || deferredStep?.type?.toUpperCase()}</h3>
          </div>
          
          <div className="step-preview-header-actions">
            {/* Mode Switcher */}
            <div className="step-preview-mode-selector">
              <button 
                className={`mode-btn ${mode === 'preview-user' ? 'active' : ''}`}
                onClick={() => setMode('preview-user')}
              >
                User Mode
              </button>
              <button 
                className={`mode-btn ${mode === 'preview-review' ? 'active' : ''}`}
                onClick={() => setMode('preview-review')}
              >
                Review Mode
              </button>
            </div>

            <button className="step-preview-close-btn" onClick={onClose} aria-label="Close Preview">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="step-preview-modal-body bg-slate-50">
          <PreviewProvider 
            key={mode} /* Key by mode resets state upon switching modes */
            mode={mode} 
            initialSteps={[deferredStep]} 
            caseData={caseData} 
            isSingleStep={true}
          >
            <SingleStepPreviewRunner />
          </PreviewProvider>
        </div>
        
        {/* Optional small helper text footer */}
        <div className="step-preview-modal-footer">
          <p>💡 Edits made in the form are reflected here in real-time. Typing is optimized to prevent lag.</p>
        </div>
      </div>
    </div>
  )
}
