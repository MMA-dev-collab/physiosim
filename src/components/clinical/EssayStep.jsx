import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'

export default function EssayStep({ step, essayAnswer, setEssayAnswer, essayFeedback, essayScore, onSubmit, isReviewMode }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hintVisible, setHintVisible] = useState(false)

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

  // Show all hints immediately on low score (< 60%)
  useEffect(() => {
    if (essayScore !== null && essayScore !== undefined) {
      const maxScore = step.maxScore || 10
      if (essayScore < maxScore * 0.6) {
        setVisibleHints(new Array(hints.length).fill(true))
      }
    }
  }, [essayScore, step.maxScore, hints.length])

  const handleSubmit = async () => {
    setIsSubmitting(true)
    await onSubmit()
    setIsSubmitting(false)
  }

  const essayQuestions = (step.essayQuestions && step.essayQuestions.length > 0)
    ? step.essayQuestions
    : [{ question_text: step.question || step.prompt || '' }]

  return (
    <div className="relative w-full">
      <div className="essay-step-container">
        <div className="section-title" style={{ marginBottom: '1rem' }}>
          {step.content?.title || step.title || 'Essay Question'}
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
                {eq.question_text || eq.question || eq}
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
                  {essayAnswer?.length || 0} / 1000 characters
                </div>
              </>
            )}
          </div>
        ))}

        {essayScore === null && !isReviewMode && (
          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
            <button
              className="cf-btn cf-btn-primary"
              
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
            background: essayScore >= ((step.maxScore || 10) * 0.6) ? '#f0fdf4' : '#fef2f2',
            border: `2px solid ${essayScore >= ((step.maxScore || 10) * 0.6) ? '#86efac' : '#fca5a5'}`,
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1rem',
              fontSize: '1.1rem',
              fontWeight: 600,
              color: essayScore >= ((step.maxScore || 10) * 0.6) ? '#166534' : '#991b1b'
            }}>
              <span style={{ fontSize: '1.5rem' }}>
                {essayScore >= ((step.maxScore || 10) * 0.6) ? '✓' : '⚠️'}
              </span>
              Score: {essayScore} / {(step.maxScore || 10)}
            </div>
            <div style={{
              color: essayScore >= ((step.maxScore || 10) * 0.6) ? '#166534' : '#991b1b',
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
