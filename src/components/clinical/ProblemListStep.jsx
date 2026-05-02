import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { X, Plus, Check, AlertCircle, ListChecks } from 'lucide-react'
import { evaluateProblemList } from '@/utils/matchingUtils'

/**
 * ProblemListStep — Interactive dynamic problem list with array‑based evaluation.
 *
 * Users add / remove problems. On submit the list is evaluated against the
 * admin‑defined expected problems using the matching utilities (front‑end).
 * The result is then optionally forwarded to the backend for logging.
 */
export default function ProblemListStep({
  step,
  onSubmit,
  essayFeedback,
  essayScore,
  isReviewMode,
  initialValue
}) {
  // ─── Local state ──────────────────────────────────────────────────────────
  // Use lazy initialisers so that if props are already populated on first render
  // (e.g. after a page refresh that rehydrates from cache), state is correct
  // immediately without needing an extra effect cycle.
  const [items, setItems] = useState(() =>
    initialValue?.problemListItems?.length ? initialValue.problemListItems : ['']
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  // "submitted" is only true when we have BOTH a numeric score AND saved items.
  // Relying on essayScore alone caused a race: the score could arrive before
  // items were hydrated, locking the form in a broken submitted state.
  const [submitted, setSubmitted] = useState(() =>
    essayScore !== null && essayScore !== undefined && !!initialValue?.problemListItems?.length
  )
  const [evalResult, setEvalResult] = useState(() => initialValue?.evalResult || null)

  // ─── Hydration effect ────────────────────────────────────────────────────────
  // Re-runs whenever the parent provides a new `initialValue` (e.g. navigating
  // back to this step in review mode). The `key={step.id}` prop on the parent
  // already guarantees a fresh component instance per step, so there is no risk
  // of an infinite loop — we simply don't need a one-shot guard here.
  useEffect(() => {
    if (!initialValue) return

    if (initialValue.problemListItems?.length) {
      setItems(initialValue.problemListItems)
    }
    if (initialValue.evalResult) {
      setEvalResult(initialValue.evalResult)
    }
    // Lock as submitted only when BOTH the score AND saved items are present
    // so the form is never disabled with an empty list.
    if (
      essayScore !== null &&
      essayScore !== undefined &&
      initialValue.problemListItems?.length
    ) {
      setSubmitted(true)
    }
  }, [initialValue, essayScore])

  const isActuallySubmitted = submitted || isReviewMode

  // ─── Expected problems from admin ─────────────
  const expectedProblems = useMemo(() => {
    const eqs = step?.essayQuestions || []
    // Each essay question represents one expected problem
    return eqs.map(eq => ({
      label: eq.question_text || eq.question || (typeof eq === 'string' ? eq : ''),
      keywords: eq.keywords || [],
      synonyms: eq.synonyms || []
    }))
  }, [step])
  const maxScore = step?.maxScore || 10

  // ─── Auto-evaluate on load ────────────────────
  React.useEffect(() => {
    if (isActuallySubmitted && !evalResult && items.length > 0) {
      const filled = items.filter(i => i.trim().length > 0)
      if (filled.length > 0) {
        setEvalResult(evaluateProblemList(filled, expectedProblems, maxScore))
      }
    }
  }, [isActuallySubmitted, evalResult, items, expectedProblems, maxScore])

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
      // Run front‑end evaluation
      const result = evaluateProblemList(filledItems, expectedProblems, maxScore)
      setEvalResult(result)

      // Forward to parent (which may optionally call backend)
      await onSubmit({
        essayAnswer: filledItems.join(', '),
        problemListItems: filledItems,
        evalResult: result
      })

      setSubmitted(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Use evalResult for display, fall back to essayScore/feedback from backend
  const displayScore = evalResult?.score ?? essayScore
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
                placeholder={`Problem ${idx + 1}...`}
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
          {essayFeedback && (
            <p className="problem-list-step__feedback-text">{essayFeedback}</p>
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
