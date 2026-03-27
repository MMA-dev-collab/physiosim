import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'

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
    }
  }, [selectedOption])

  const hints = step.hints || (step.hint ? [{ text: step.hint, delaySeconds: step.hintDelaySeconds || 0 }] : [])
  const [visibleHints, setVisibleHints] = useState([])

  // Hint Delay Logic
  useEffect(() => {
    setVisibleHints(new Array(hints.length).fill(false))
    const timeouts = []

    hints.forEach((hint, idx) => {
      const delay = hint.delaySeconds || 0
      if (delay > 0) {
        const tid = setTimeout(() => {
          setVisibleHints(prev => {
            const next = [...prev]
            next[idx] = true
            return next
          })
        }, delay * 1000)
        timeouts.push(tid)
      } else {
        setVisibleHints(prev => {
          const next = [...prev]
          next[idx] = true
          return next
        })
      }
    })

    return () => timeouts.forEach(clearTimeout)
  }, [step.id, JSON.stringify(hints)])

  // Show all hints immediately on wrong answer
  useEffect(() => {
    if (isCorrect === false) {
      setVisibleHints(new Array(hints.length).fill(true))
    }
  }, [isCorrect, hints.length])

  // Determine which selection to show: submitted answer or local selection
  const displaySelection = isSubmitted ? (selectedOption || localSelection) : localSelection

  return (
    <div className="relative w-full">
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
      </div>

      {hints.length > 0 && (
        <div 
          className="absolute -right-8 top-0 w-80 flex flex-col gap-4 z-[10] pointer-events-none"
          style={{ transform: 'translateX(10%)',transform:"translateY(-20%)" }}
        >
          {hints.map((hint, idx) => {
            if (!visibleHints[idx]) return null;
            return (
              <div key={idx} className="bg-[#dbeafe] p-5 rounded-2xl shadow-xl border border-[#bfdbfe]/50 animate-in fade-in slide-in-from-right-8 duration-700 pointer-events-auto relative">
                <button
                  onClick={() => {
                    setVisibleHints(prev => {
                      const next = [...prev]
                      next[idx] = false
                      return next
                    })
                  }}
                  className="absolute top-4 right-4 p-1 rounded-full hover:bg-[#bfdbfe]/50 text-[#1e40af] transition-colors"
                  aria-label="Close hint"
                >
                  <X size={18} strokeWidth={2.5} />
                </button>
                <div className="flex gap-3 items-center mb-3">
                  <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#2563eb] shadow-sm border border-[#dbeafe]">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>
                  </div>
                  <div className="text-[1rem] font-bold text-[#1e3a8a] tracking-tight">{idx + 1}- Hint for you</div>
                </div>
                <div className="text-[0.95rem] text-[#1e40af] font-medium leading-relaxed whitespace-pre-wrap pr-6">
                  {hint.text}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
