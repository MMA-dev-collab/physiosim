import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { X, Plus, Check, AlertCircle, ListChecks } from 'lucide-react'
import { evaluateProblemList } from '@/utils/matchingUtils'
import { usePreview } from '../../context/PreviewContext'

/**
 * ProblemListStep — Interactive dynamic problem list with array‑based evaluation.
 */
export default function ProblemListStep({
  step,
  onSubmit,
  essayFeedback,
  essayScore,
  isReviewMode,
  initialValue
}) {
  const preview = usePreview()
  const mode = preview?.mode || 'production'
  const isPreview = mode !== 'production'

  const currentEssayScore = isPreview
    ? (mode === 'preview-review'
        ? (step.maxScore || 10)
        : (preview.scores[step.id]?.score ?? null))
    : essayScore

  const currentEssayFeedback = isPreview
    ? (mode === 'preview-review'
        ? 'Model answer provided for review.'
        : (preview.feedback[step.id] || null))
    : essayFeedback

  const currentIsReviewMode = isReviewMode || mode === 'preview-review'

  // ─── Expected problems from admin ─────────────
  const expectedProblems = useMemo(() => {
    const eqs = step?.essayQuestions || []
    return eqs.map(eq => ({
      label: eq.question_text || eq.question || (typeof eq === 'string' ? eq : ''),
      keywords: eq.keywords || [],
      synonyms: eq.synonyms || []
    }))
  }, [step])
  const maxScore = step?.maxScore || 10

  // ─── Local state ──────────────────────────────────────────────────────────
  const [items, setItems] = useState(() => {
    if (isPreview && mode === 'preview-review') {
      const expected = expectedProblems.map(p => p.label)
      return expected.length ? expected : ['']
    }
    return initialValue?.problemListItems?.length ? initialValue.problemListItems : ['']
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(() => {
    if (isPreview) return mode === 'preview-review' ? true : (preview.scores[step.id]?.score !== undefined)
    return essayScore !== null && essayScore !== undefined && !!initialValue?.problemListItems?.length
  })
  const [evalResult, setEvalResult] = useState(() => {
    if (isPreview) {
      if (mode === 'preview-review') {
        const expected = expectedProblems.map(p => p.label)
        return evaluateProblemList(expected, expectedProblems, maxScore)
      }
      return preview.answers[step.id]?.evalResult || null
    }
    return initialValue?.evalResult || null
  })

  // ─── Hydration effect ────────────────────────────────────────────────────────
  useEffect(() => {
    if (isPreview) {
      if (mode === 'preview-review') {
        const expected = expectedProblems.map(p => p.label)
        setItems(expected.length ? expected : [''])
        setSubmitted(true)
        setEvalResult(evaluateProblemList(expected, expectedProblems, maxScore))
      } else {
        const ad = preview.answers[step.id]
        if (ad?.problemListItems) {
          setItems(ad.problemListItems)
          setSubmitted(true)
        } else {
          setItems([''])
          setSubmitted(false)
        }
        if (ad?.evalResult) {
          setEvalResult(ad.evalResult)
        } else {
          setEvalResult(null)
        }
      }
    } else {
      if (!initialValue) return
      if (initialValue.problemListItems?.length) {
        setItems(initialValue.problemListItems)
      }
      if (initialValue.evalResult) {
        setEvalResult(initialValue.evalResult)
      }
      if (
        essayScore !== null &&
        essayScore !== undefined &&
        initialValue.problemListItems?.length
      ) {
        setSubmitted(true)
      }
    }
  }, [initialValue, essayScore, isPreview, mode, step.id, expectedProblems, maxScore])

  const isActuallySubmitted = submitted || currentIsReviewMode

  // ─── Item manipulation ────────────────────────
  const updateItem = useCallback((idx, value) => {
    setItems(prev => {
      const updated = [...prev]
      updated[idx] = value
      return updated
    })
  }, [])

  const addItem = useCallback(() => {
    setItems(prev => [...prev, ''])
  }, [])

  const removeItem = useCallback((idx) => {
    setItems(prev => prev.filter((_, i) => i !== idx))
  }, [])

  // ─── Validation ───────────────────────────────
  const filledItems = items.filter(i => i.trim().length > 0)
  const isValid = filledItems.length >= 2 // minimum 2 required

  // ─── Submit ───────────────────────────────────
  const handleSubmit = async () => {
    if (!isValid || isSubmitting) return
    setIsSubmitting(true)

    try {
      const result = evaluateProblemList(filledItems, expectedProblems, maxScore)
      setEvalResult(result)

      if (isPreview) {
        preview.submitAnswer(step, {
          essayAnswer: filledItems.join(', '),
          problemListItems: filledItems,
          evalResult: result
        })
      } else {
        await onSubmit({
          essayAnswer: filledItems.join(', '),
          problemListItems: filledItems,
          evalResult: result
        })
      }

      setSubmitted(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Use evalResult for display, fall back to essayScore/feedback from backend
  const displayScore = evalResult?.score ?? currentEssayScore
  const isPassed = displayScore !== null && displayScore >= maxScore * 0.6

  return (
    <div className="problem-list-step">
      {/* Header */}
      <div className="problem-list-step__header">
        <h2 className="problem-list-step__title">
          <ListChecks size={28} className="problem-list-step__title-icon" />
          {step?.content?.title || step?.title || 'Problem List'}
        </h2>
        <p className="problem-list-step__subtitle">
          List all the clinical problems you identified for this patient. Add each problem separately.
        </p>
      </div>

      {/* Dynamic List Card */}
      <div className="problem-list-step__card">
        <div className="problem-list-step__items">
          {items.map((item, idx) => (
            <div key={idx} className={`problem-list-step__item ${submitted ? (evalResult?.matched.some(m => m.userItem === item) ? 'problem-list-step__item--matched' : 'problem-list-step__item--extra') : ''}`}>
              <span className="problem-list-step__item-number">{idx + 1}</span>
              <input
                type="text"
                className="problem-list-step__item-input"
                placeholder="Enter clinical problem"
                value={item}
                onChange={(e) => updateItem(idx, e.target.value)}
                disabled={isActuallySubmitted}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addItem()
                  }
                }}
              />
              {!isActuallySubmitted && items.length > 1 && (
                <button
                  onClick={() => removeItem(idx)}
                  className="problem-list-step__item-remove"
                  type="button"
                  aria-label={`Remove problem ${idx + 1}`}
                >
                  <X size={16} />
                </button>
              )}
              {isActuallySubmitted && evalResult && (
                <span className="problem-list-step__item-status">
                  {evalResult.matched.some(m => m.userItem === item) ? (
                    <Check size={18} className="text-green-500" />
                  ) : (
                    <X size={18} className="text-red-400" />
                  )}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Add Row Button */}
        {!isActuallySubmitted && (
          <button
            onClick={addItem}
            className="problem-list-step__add-row"
            type="button"
          >
            <Plus size={16} /> Add Problem
          </button>
        )}
      </div>

      {/* Minimum Items Notice */}
      {!isActuallySubmitted && filledItems.length < 2 && (
        <div className="problem-list-step__notice">
          <AlertCircle size={16} />
          Please enter at least 2 problems before submitting.
        </div>
      )}

      {/* Submit Button */}
      {!isActuallySubmitted && (
        <div className="problem-list-step__actions">
          <button
            className="cf-btn cf-btn-primary"
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? 'Evaluating...' : 'Submit Problem List'}
          </button>
        </div>
      )}

      {/* Score & Results */}
      {isActuallySubmitted && displayScore !== null && (
        <div className={`problem-list-step__feedback ${isPassed ? 'problem-list-step__feedback--pass' : 'problem-list-step__feedback--fail'}`}>
          <div className="problem-list-step__feedback-header">
            <span className="problem-list-step__feedback-icon">
              {isPassed ? <Check size={22} /> : <AlertCircle size={22} />}
            </span>
            <span className="problem-list-step__feedback-score">
              Score: {displayScore} / {maxScore}
            </span>
          </div>
          {currentEssayFeedback && (
            <p className="problem-list-step__feedback-text">{currentEssayFeedback}</p>
          )}
          {evalResult && (
            <div className="problem-list-step__result-details">
              <div className="problem-list-step__result-row">
                <span className="problem-list-step__result-label">✓ Matched ({evalResult.matched.length})</span>
                <div className="problem-list-step__result-tags">
                  {evalResult.matched.map((m, i) => (
                    <span key={i} className="problem-list-step__result-tag problem-list-step__result-tag--matched">
                      {m.expectedLabel}
                    </span>
                  ))}
                </div>
              </div>
              {evalResult.missing.length > 0 && (
                <div className="problem-list-step__result-row">
                  <span className="problem-list-step__result-label">✗ Missing ({evalResult.missing.length})</span>
                  <div className="problem-list-step__result-tags">
                    {evalResult.missing.map((m, i) => (
                      <span key={i} className="problem-list-step__result-tag problem-list-step__result-tag--missing">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {evalResult.extra.length > 0 && (
                <div className="problem-list-step__result-row">
                  <span className="problem-list-step__result-label">⚠ Extra ({evalResult.extra.length})</span>
                  <div className="problem-list-step__result-tags">
                    {evalResult.extra.map((m, i) => (
                      <span key={i} className="problem-list-step__result-tag problem-list-step__result-tag--extra">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Correct Answer (Expected) */}
      {isActuallySubmitted && expectedProblems.length > 0 && (
        <div className="problem-list-step__correct-answer">
          <div className="problem-list-step__correct-answer-header">
            <span>📋</span> Expected Problems
          </div>
          <ol className="problem-list-step__correct-answer-list">
            {expectedProblems.map((p, i) => (
              <li key={i}>{p.label}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}
