import React, { useState, useDeferredValue } from 'react'
import { X, RefreshCw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
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
    <div className="single-step-preview-content">
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
  
  // Professional loading state: detection of stall while deferring
  const isStale = step !== deferredStep

  if (!isOpen) return null

  return (
    <div className="step-preview-modal-overlay" onClick={onClose}>
      <div className="step-preview-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="step-preview-modal-header">
          <div className="step-preview-header-left">
            <span className="step-preview-badge">Live Preview</span>
            <h3>{deferredStep?.title || deferredStep?.category?.replace(/_/g, ' ') || deferredStep?.type?.toUpperCase()}</h3>
            
            <AnimatePresence>
              {isStale && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="step-preview-updating-tag"
                >
                  <RefreshCw size={12} className="animate-spin" />
                  <span>Updating...</span>
                </motion.div>
              )}
            </AnimatePresence>
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

        {/* Loading Bar Container */}
        <div className="step-preview-progress-container">
          <AnimatePresence>
            {isStale && (
              <motion.div 
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: '100%', opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="step-preview-progress-bar"
              />
            )}
          </AnimatePresence>
        </div>

        {/* Body */}
        <div className={`step-preview-modal-body bg-slate-50 ${isStale ? 'is-stale' : ''}`}>
          <motion.div
            animate={{ opacity: isStale ? 0.6 : 1 }}
            transition={{ duration: 0.2 }}
          >
            <PreviewProvider 
              key={mode} /* Key by mode resets state upon switching modes */
              mode={mode} 
              initialSteps={[deferredStep]} 
              caseData={caseData} 
              isSingleStep={true}
            >
              <SingleStepPreviewRunner />
            </PreviewProvider>
          </motion.div>
        </div>
        
        {/* Optional small helper text footer */}
        <div className="step-preview-modal-footer">
          <p>💡 Edits made in the form are reflected here in real-time. Typing is optimized to prevent lag.</p>
        </div>
      </div>
    </div>
  )
}
