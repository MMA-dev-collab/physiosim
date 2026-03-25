import React, { useState, useEffect } from 'react'

export default function McqStep({ step, selectedOption, feedback, isCorrect, onAnswer }) {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [localSelection, setLocalSelection] = useState(null)
  const [hintVisible, setHintVisible] = useState(false)

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
  useEffect(() => {
    setHintVisible(false)
    if (!selectedOption) {
      setIsSubmitted(false)
      setLocalSelection(null)
    } else {
      setIsSubmitted(true)
    }

    // Hint Delay Logic
    let timeoutId
    const delay = step.hintDelaySeconds || 0
    if (step.hint) {
      if (delay > 0) {
        timeoutId = setTimeout(() => setHintVisible(true), delay * 1000)
      } else {
        setHintVisible(true)
      }
    }

    return () => timeoutId && clearTimeout(timeoutId)
  }, [step.id, selectedOption, step.hint, step.hintDelaySeconds])

  // Show hint immediately on wrong answer
  useEffect(() => {
    if (isCorrect === false) {
      setHintVisible(true)
    }
  }, [isCorrect])

  // Determine which selection to show: submitted answer or local selection
  const displaySelection = isSubmitted ? (selectedOption || localSelection) : localSelection

  return (
    <div className="mcq-step-container">
      <div className="section-title" style={{ marginBottom: '1.5rem' }}>
        {step.content?.prompt || step.prompt || step.question || step.title || 'Choose the best next step'}
      </div>
      <div className="mcq-options-grid">
        {(step.options || []).map((opt, index) => {
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
              <div className="mcq-option-text">{opt.text || opt.label}</div>
            </button>
          )
        })}
      </div>
      {!isSubmitted && (
        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
          <button
            className="cf-btn cf-btn-primary"
            
            disabled={!localSelection}
            onClick={handleSubmit}
          >
            Submit Answer
          </button>
        </div>
      )}
      {feedback && <div className="mcq-feedback">{feedback}</div>}

      {/* Delayed Hint */}
      {step.hint && hintVisible && (
        <div className="mt-6 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg animate-in fade-in slide-in-from-top-2 duration-500">
          <div className="flex items-start gap-3">
            <span className="text-xl">💡</span>
            <div>
              <p className="text-xs font-black text-amber-800 uppercase tracking-widest mb-1">Hint / Guidance</p>
              <p className="text-sm text-amber-900 font-medium leading-relaxed">{step.hint}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
