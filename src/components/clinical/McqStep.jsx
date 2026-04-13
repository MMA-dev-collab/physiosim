import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'

export default function McqStep({ step, selectedOption, feedback, isCorrect, onAnswer, isReviewMode }) {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [localSelection, setLocalSelection] = useState(null)
  const [hintVisible, setHintVisible] = useState(false)

  const getOptionIcon = (index) => {
    const icons = ['📋', '🔬', '💊', '📝', '🏥', '💡']
    return icons[index % icons.length]
  }

  const handleOptionClick = (optionId) => {
    if (isReviewMode) return
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

  // Reset or restore submission state when step changes or when retry/load happens
  useEffect(() => {
    setHintVisible(false)
    if (selectedOption) {
      // Restoring from saved progress — mark as already submitted
      setLocalSelection(selectedOption)
      setIsSubmitted(true)
    } else {
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
  const displaySelection = isReviewMode ? selectedOption : (isSubmitted ? (selectedOption || localSelection) : localSelection)

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

            if (isSelected && (isSubmitted || isReviewMode)) {
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
                className={`mcq-option-card${opt.imageUrl ? ' mcq-rich-card' : ''}${statusClass}${isSelected ? ' selected' : ''}`}
                onClick={() => handleOptionClick(opt.id)}
                disabled={isSubmitted || isReviewMode}
              >
                {opt.imageUrl ? (
                   <div className="mcq-rich-content">
                     <div className="mcq-rich-header">{opt.text || opt.label}</div>
                     <div className="mcq-rich-image">
                       <img src={opt.imageUrl} alt={opt.text || opt.label} />
                     </div>
                     {(opt.subtext || opt.videoUrl) && (
                       <div className="mcq-rich-footer">
                         {opt.videoUrl ? (
                           <a href={opt.videoUrl} target="_blank" rel="noopener noreferrer" className="mcq-video-btn" onClick={(e) => e.stopPropagation()}>
                             <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" color="#ef4444">
                               <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                             </svg>
                             View
                           </a>
                         ) : (
                           <span className={`mcq-rich-subtext ${opt.subtext.toLowerCase().includes('detected') ? 'detected' : ''}`}>
                             {opt.subtext}
                           </span>
                         )}
                       </div>
                     )}
                   </div>
                ) : (
                  <>
                    <div className="mcq-option-icon">{getOptionIcon(index)}</div>
                    <div className="mcq-option-text">{opt.text || opt.label}</div>
                  </>
                )}
              </button>
            )
          })}
        </div>
        {!isSubmitted && !isReviewMode && (
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
        {(isSubmitted || isReviewMode) && isCorrect !== undefined && isCorrect !== null && (
          <div className={`mt-6 p-3.5 rounded-lg flex items-center gap-3 ${
            isCorrect ? 'bg-[#10b981] text-white' : 'bg-[#ef4444] text-white'
          }`}>
            <div className={`w-7 h-7 rounded-full bg-white flex items-center justify-center shrink-0 ${
              isCorrect ? 'text-[#10b981]' : 'text-[#ef4444]'
            }`}>
              {isCorrect ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              )}
            </div>
            <span className="text-[1.05rem] font-medium">
              {isCorrect ? 'Correct Answer' : 'Incorrect Answer'}
            </span>
          </div>
        )}
        {feedback && <div className="mcq-feedback mt-4">{feedback}</div>}
      </div>

      {hints.length > 0 && (
        <div 
          className="absolute -right-8 top-0 w-80 flex flex-col gap-4 z-[10] pointer-events-none"
          style={{ transform: 'translateX(10%) translateY(-20%)' }}
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
