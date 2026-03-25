import React, { useState, useEffect } from 'react'

export default function EssayStep({ step, essayAnswer, setEssayAnswer, essayFeedback, essayScore, onSubmit, isReviewMode }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hintVisible, setHintVisible] = useState(false)

  // Hint Delay Logic
  useEffect(() => {
    setHintVisible(false)
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
  }, [step.id, step.hint, step.hintDelaySeconds])

  // Show hint immediately on low score (< 60%)
  useEffect(() => {
    if (essayScore !== null && essayScore !== undefined) {
      const maxScore = step.maxScore || 10
      if (essayScore < maxScore * 0.6) {
        setHintVisible(true)
      }
    }
  }, [essayScore, step.maxScore])

  const handleSubmit = async () => {
    setIsSubmitting(true)
    await onSubmit()
    setIsSubmitting(false)
  }

  const essayQuestions = (step.essayQuestions && step.essayQuestions.length > 0)
    ? step.essayQuestions
    : [{ question_text: step.question || step.prompt || '' }]

  return (
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
      {/* Delayed Hint */}
      {step.hint && hintVisible && (
        <div className="mt-8 p-6 bg-amber-50 border-l-4 border-amber-400 rounded-r-2xl animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-start gap-4">
            <span className="text-2xl">💡</span>
            <div>
              <p className="text-xs font-black text-amber-800 uppercase tracking-widest mb-1.5">Hint / Guidance</p>
              <p className="text-base text-amber-900 font-medium leading-relaxed">{step.hint}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
