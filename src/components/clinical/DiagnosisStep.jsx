import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { X, Plus, ChevronRight, Check, AlertCircle, Sparkles } from 'lucide-react'
import { matchKeywords } from '@/utils/matchingUtils'
import { usePreview } from '../../context/PreviewContext'

/**
 * DiagnosisStep — Interactive structured diagnosis builder.
 *
 * Fields:
 *  1. Condition  (text / select)
 *  2. Levels     (multi‑tag input)
 *  3. Findings   (multi‑tag input)
 *
 * On submit → sends { essayAnswer, structuredAnswer } to CaseRunnerPage.
 */
export default function DiagnosisStep({
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

  // ─── Local state ──────────────────────────────
  const [condition, setCondition] = useState(() => {
    if (isPreview && mode === 'preview-review') return step?.essayQuestions?.[0]?.perfect_answer || step?.perfect_answer || ''
    return initialValue?.structuredAnswer?.condition || ''
  })
  const [levels, setLevels] = useState(() => initialValue?.structuredAnswer?.levels || [])
  const [findings, setFindings] = useState(() => initialValue?.structuredAnswer?.findings || [])
  const [levelInput, setLevelInput] = useState('')
  const [findingInput, setFindingInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(() => {
    if (isPreview) return mode === 'preview-review' ? true : (preview.scores[step.id]?.score !== undefined)
    return essayScore !== null
  })

  // ─── Re-hydrate from initialValue when it changes (navigation/refresh) ────
  useEffect(() => {
    if (isPreview) {
      if (mode === 'preview-review') {
        setCondition(step?.essayQuestions?.[0]?.perfect_answer || step?.perfect_answer || '')
        setLevels([])
        setFindings([])
        setSubmitted(true)
      } else {
        const ad = preview.answers[step.id]
        if (ad?.structuredAnswer) {
          setCondition(ad.structuredAnswer.condition || '')
          setLevels(ad.structuredAnswer.levels || [])
          setFindings(ad.structuredAnswer.findings || [])
          setSubmitted(true)
        } else {
          setCondition('')
          setLevels([])
          setFindings([])
          setSubmitted(false)
        }
      }
    } else {
      if (initialValue?.structuredAnswer) {
        setCondition(initialValue.structuredAnswer.condition || '')
        setLevels(initialValue.structuredAnswer.levels || [])
        setFindings(initialValue.structuredAnswer.findings || [])
      }
    }
  }, [initialValue, isPreview, mode, step.id])

  // ─── Sync submitted state with essayScore ────
  useEffect(() => {
    if (!isPreview) {
      if (essayScore !== null && essayScore !== undefined) {
        setSubmitted(true)
      }
    }
  }, [essayScore, isPreview])

  const isActuallySubmitted = submitted || currentIsReviewMode

  // ─── Derive expected data from step.essayQuestions ────
  const expectedData = useMemo(() => {
    const eq = step?.essayQuestions?.[0] || {}
    return {
      keywords: eq.keywords || [],
      synonyms: eq.synonyms || [],
      perfectAnswer: eq.perfect_answer || ''
    }
  }, [step])

  // ─── Auto‑generate sentence ───────────────────
  const generatedSentence = useMemo(() => {
    if (!condition) return ''
    let sentence = condition
    if (levels.length > 0) {
      sentence += ` at ${levels.join(', ')}`
    }
    if (findings.length > 0) {
      sentence += ` with ${findings.join(' and ')}`
    }
    return sentence
  }, [condition, levels, findings])

  // ─── Tag helpers ──────────────────────────────
  const addLevel = useCallback(() => {
    const v = levelInput.trim()
    if (v && !levels.includes(v)) {
      setLevels(prev => [...prev, v])
    }
    setLevelInput('')
  }, [levelInput, levels])

  const removeLevel = (idx) => setLevels(prev => prev.filter((_, i) => i !== idx))

  const addFinding = useCallback(() => {
    const v = findingInput.trim()
    if (v && !findings.includes(v)) {
      setFindings(prev => [...prev, v])
    }
    setFindingInput('')
  }, [findingInput, findings])

  const removeFinding = (idx) => setFindings(prev => prev.filter((_, i) => i !== idx))

  // ─── Key handler for tag inputs ───────────────
  const handleKeyDown = (e, addFn) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addFn()
    }
  }

  // ─── Submit ───────────────────────────────────
  const handleSubmit = async () => {
    if (!generatedSentence || isSubmitting) return
    setIsSubmitting(true)
    try {
      if (isPreview) {
        preview.submitAnswer(step, {
          essayAnswer: generatedSentence,
          structuredAnswer: { condition, levels, findings }
        })
      } else {
        await onSubmit({
          essayAnswer: generatedSentence,
          structuredAnswer: { condition, levels, findings }
        })
      }
      setSubmitted(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  // ─── Post‑submit match analysis ───────────────
  const matchResults = useMemo(() => {
    if (!isActuallySubmitted) return null
    return matchKeywords(generatedSentence, expectedData.keywords, expectedData.synonyms)
  }, [isActuallySubmitted, generatedSentence, expectedData])

  const maxScore = step?.maxScore || 10
  const isPassed = currentEssayScore !== null && currentEssayScore >= maxScore * 0.6

  // ─── Is form valid? (for external isStepCompleted) ────
  const isValid = condition.trim().length > 0 && levels.length > 0

  return (
    <div className="diagnosis-step">
      {/* Header */}
      <div className="diagnosis-step__header">
        <h2 className="diagnosis-step__title">
          {step?.content?.title || step?.title || 'Diagnosis'}
        </h2>
        <p className="diagnosis-step__subtitle">
          Build your diagnosis by selecting the condition, affected levels, and associated findings.
        </p>
      </div>

      {/* Form Card */}
      <div className="diagnosis-step__card">
        {/* Condition */}
        <div className="diagnosis-step__field">
          <label className="diagnosis-step__label">
            <span className="diagnosis-step__label-icon">🏥</span>
            Condition
          </label>
          <input
            type="text"
            className="diagnosis-step__input"
            placeholder="Enter clinical condition"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            disabled={isActuallySubmitted}
          />
        </div>

        {/* Levels */}
        <div className="diagnosis-step__field">
          <label className="diagnosis-step__label">
            <span className="diagnosis-step__label-icon">📍</span>
            Levels
          </label>
          <div className="diagnosis-step__tag-input-wrap">
            <div className="diagnosis-step__tags">
              {levels.map((lv, idx) => (
                <span key={idx} className="diagnosis-step__tag">
                  {lv}
                  {!isActuallySubmitted && (
                    <button
                      onClick={() => removeLevel(idx)}
                      className="diagnosis-step__tag-remove"
                      aria-label={`Remove ${lv}`}
                    >
                      <X size={12} />
                    </button>
                  )}
                </span>
              ))}
            </div>
            {!isActuallySubmitted && (
              <div className="diagnosis-step__tag-input-row">
                <input
                  type="text"
                  className="diagnosis-step__input diagnosis-step__input--tag"
                  placeholder="Enter level"
                  value={levelInput}
                  onChange={(e) => setLevelInput(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, addLevel)}
                />
                <button
                  onClick={addLevel}
                  className="diagnosis-step__add-btn"
                  disabled={!levelInput.trim()}
                  type="button"
                >
                  <Plus size={16} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Associated Findings */}
        <div className="diagnosis-step__field">
          <label className="diagnosis-step__label">
            <span className="diagnosis-step__label-icon">🔍</span>
            Associated Findings
          </label>
          <div className="diagnosis-step__tag-input-wrap">
            <div className="diagnosis-step__tags">
              {findings.map((f, idx) => (
                <span key={idx} className="diagnosis-step__tag diagnosis-step__tag--finding">
                  {f}
                  {!isActuallySubmitted && (
                    <button
                      onClick={() => removeFinding(idx)}
                      className="diagnosis-step__tag-remove"
                      aria-label={`Remove ${f}`}
                    >
                      <X size={12} />
                    </button>
                  )}
                </span>
              ))}
            </div>
            {!isActuallySubmitted && (
              <div className="diagnosis-step__tag-input-row">
                <input
                  type="text"
                  className="diagnosis-step__input diagnosis-step__input--tag"
                  placeholder="Enter clinical finding"
                  value={findingInput}
                  onChange={(e) => setFindingInput(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, addFinding)}
                />
                <button
                  onClick={addFinding}
                  className="diagnosis-step__add-btn"
                  disabled={!findingInput.trim()}
                  type="button"
                >
                  <Plus size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Generated Preview */}
      {condition.trim() && (
        <div className={`diagnosis-step__preview ${isActuallySubmitted ? 'diagnosis-step__preview--submitted' : ''}`} style={{ background: 'white', borderRadius: '12px', border: '1px solid #3b4cca', padding: '24px', marginTop: '24px' }}>
          <div style={{ color: '#3b4cca', fontWeight: 800, fontSize: '1.2rem', marginBottom: '16px' }}>
            Diagnosis
          </div>
          <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '1.15rem' }}>
            {condition.trim()} {levels.length > 0 && levels.map(l => `(${l})`).join(' ')}
          </div>
          {findings.length > 0 && (
            <div style={{ color: '#64748b', fontSize: '1rem', marginTop: '6px' }}>
              with {findings.join(' and ')}
            </div>
          )}
        </div>
      )}

      {/* Submit Button */}
      {!isActuallySubmitted && (
        <div className="diagnosis-step__actions">
          <button
            className="cf-btn cf-btn-primary"
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Diagnosis'}
            {!isSubmitting && <ChevronRight size={18} />}
          </button>
        </div>
      )}

      {/* Score Feedback */}
      {currentEssayScore !== null && (
        <div className={`diagnosis-step__feedback ${isPassed ? 'diagnosis-step__feedback--pass' : 'diagnosis-step__feedback--fail'}`}>
          <div className="diagnosis-step__feedback-header">
            <span className="diagnosis-step__feedback-icon">
              {isPassed ? <Check size={22} /> : <AlertCircle size={22} />}
            </span>
            <span className="diagnosis-step__feedback-score">
              Score: {currentEssayScore} / {maxScore}
            </span>
          </div>
          {currentEssayFeedback && (
            <div className="diagnosis-step__feedback-body">
              {currentEssayFeedback}
            </div>
          )}
          {matchResults && (
            <div className="diagnosis-step__keyword-grid">
              {matchResults.matched.map((kw, i) => (
                <span key={`m-${i}`} className="diagnosis-step__kw-tag diagnosis-step__kw-tag--matched">
                  <Check size={12} /> {kw}
                </span>
              ))}
              {matchResults.missed.map((kw, i) => (
                <span key={`x-${i}`} className="diagnosis-step__kw-tag diagnosis-step__kw-tag--missed">
                  <X size={12} /> {kw}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Supporting Evidence - Moved to Bottom */}
      {step.content?.supporting_evidence && step.content.supporting_evidence.length > 0 && (
        <div style={{ marginTop: '32px', background: 'white', borderRadius: '12px', border: '1px solid #f1f5f9', padding: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '16px' }}>
            Supporting evidence to diagnose the case
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {step.content.supporting_evidence.map((ev, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', background: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
                <div style={{ 
                  width: '12px', height: '12px', borderRadius: '50%', background: '#3b4cca', flexShrink: 0, marginTop: '6px' 
                }} />
                <div>
                  <span style={{ fontWeight: 700, color: '#334155' }}>{ev.title}: </span>
                  <span style={{ color: '#475569', lineHeight: 1.5 }}>{ev.text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Correct Answer */}
      {isActuallySubmitted && expectedData.perfectAnswer && (
        <div className="diagnosis-step__correct-answer">
          <div className="diagnosis-step__correct-answer-header">
            <span>📝</span> Correct Answer
          </div>
          <div className="diagnosis-step__correct-answer-body">
            {expectedData.perfectAnswer}
          </div>
        </div>
      )}
    </div>
  )
}
