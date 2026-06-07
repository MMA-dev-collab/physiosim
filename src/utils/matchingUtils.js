/**
 * matchingUtils.js
 * Reusable text‑normalisation, keyword matching, and problem‑list evaluation
 * utilities for the PhysioSim Case Runner.
 *
 * Design goals:
 *  - Pure functions (no side‑effects)
 *  - Decoupled from UI + API layers
 *  - Easy to extend with semantic / AI matching later
 */

/* ────────────────────────────────────────────────
   1. TEXT NORMALISATION
   ──────────────────────────────────────────────── */

/**
 * Strip punctuation, collapse whitespace, lowercase, trim.
 * @param {string} text
 * @returns {string}
 */
export function normalizeText(text) {
  if (!text || typeof text !== 'string') return ''
  return text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()'"]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/* ────────────────────────────────────────────────
   2. KEYWORD MATCHING
   ──────────────────────────────────────────────── */

/**
 * Check whether **any** keyword (or its synonyms) appears in the given answer.
 *
 * @param {string}   answer   – the user‑supplied text (will be normalised)
 * @param {string[]} keywords – expected keywords
 * @param {string[]} [synonyms=[]] – optional synonyms (any synonym matching counts)
 * @returns {{ matched: string[], missed: string[] }}
 */
export function matchKeywords(answer, keywords = [], synonyms = []) {
  const norm = normalizeText(answer)
  const matched = []
  const missed = []

  for (const kw of keywords) {
    const normKw = normalizeText(kw)
    if (!normKw) continue

    const kwFound = norm.includes(normKw)
    const synFound = synonyms.some(s => norm.includes(normalizeText(s)))

    if (kwFound || synFound) {
      matched.push(kw)
    } else {
      missed.push(kw)
    }
  }

  return { matched, missed }
}

/* ────────────────────────────────────────────────
   3. SINGLE PROBLEM ITEM MATCHING
   ──────────────────────────────────────────────── */

/**
 * Attempt to match a single user‑entered problem against a single expected
 * problem definition. Uses keyword / synonym overlap.
 *
 * @param {string} userItem          – what the user typed
 * @param {{ label: string, keywords?: string[], synonyms?: string[] }} expected
 * @returns {boolean}
 */
export function matchProblemItem(userItem, expected) {
  if (!userItem || !expected) return false

  const normUser = normalizeText(userItem)
  if (!normUser) return false

  // Direct label match
  const normLabel = normalizeText(expected.label)
  if (normLabel && normUser.includes(normLabel)) return true
  if (normLabel && normLabel.includes(normUser) && normUser.length >= 3) return true

  // Keyword match
  const keywords = expected.keywords || []
  for (const kw of keywords) {
    const normKw = normalizeText(kw)
    if (normKw && normUser.includes(normKw)) return true
  }

  // Synonym match
  const synonyms = expected.synonyms || []
  for (const syn of synonyms) {
    const normSyn = normalizeText(syn)
    if (normSyn && normUser.includes(normSyn)) return true
  }

  return false
}

/* ────────────────────────────────────────────────
   4. FULL PROBLEM LIST EVALUATION
   ──────────────────────────────────────────────── */

/**
 * Compare a user's list of problems against the admin‑defined expected list.
 *
 * Rules:
 *  - Each expected problem can only be matched **once**.
 *  - Each user item can only match **one** expected problem.
 *  - Order‑independent.
 *
 * @param {string[]} userItems
 * @param {{ label: string, keywords?: string[], synonyms?: string[] }[]} expectedItems
 * @returns {{
 *   matched:  { userItem: string, expectedLabel: string }[],
 *   missing:  string[],          // expected labels not matched
 *   extra:    string[],          // user items that didn't match anything
 *   score:    number,            // (matched / totalExpected) * maxScore
 *   maxScore: number
 * }}
 */
export function evaluateProblemList(userItems = [], expectedItems = [], maxScore = 10) {
  const matched = []
  const usedExpected = new Set()
  const usedUser = new Set()

  // For each user item, try to find the best expected match
  for (let i = 0; i < userItems.length; i++) {
    const userItem = userItems[i]
    if (!userItem || !normalizeText(userItem)) continue

    for (let j = 0; j < expectedItems.length; j++) {
      if (usedExpected.has(j)) continue

      if (matchProblemItem(userItem, expectedItems[j])) {
        matched.push({
          userItem,
          expectedLabel: expectedItems[j].label
        })
        usedExpected.add(j)
        usedUser.add(i)
        break // move to next user item
      }
    }
  }

  // Missing = expected items that were never matched
  const missing = expectedItems
    .filter((_, idx) => !usedExpected.has(idx))
    .map(e => e.label)

  // Extra = user items that didn't match anything
  const extra = userItems.filter((_, idx) => !usedUser.has(idx)).filter(Boolean)

  const totalExpected = expectedItems.length || 1
  const score = Math.round((matched.length / totalExpected) * maxScore)

  return { matched, missing, extra, score, maxScore }
}

/* ────────────────────────────────────────────────
   5. MCQ & ESSAY EVALUATION FOR PREVIEW / CLIENT
   ──────────────────────────────────────────────── */

/**
 * Evaluate MCQ step answer
 * @param {object} step - the step object
 * @param {number|string} optionId - the selected option ID
 * @returns {{ isCorrect: boolean, feedback: string|null }}
 */
export function evaluateMcq(step, optionId) {
  if (!step || !optionId) return { isCorrect: false, feedback: null }

  // Check standalone options
  if (step.options && step.options.length > 0) {
    const opt = step.options.find(o => String(o.id) === String(optionId))
    if (opt) {
      return {
        isCorrect: !!opt.isCorrect,
        feedback: opt.feedback || null
      }
    }
  }

  // Check composite assessment section options
  if (step.content?.sections) {
    for (const sec of step.content.sections) {
      if (sec.type === 'mcq' && sec.options) {
        const opt = sec.options.find(o => String(o.id) === String(optionId))
        if (opt) {
          const isCorrect = !!opt.isCorrect
          return {
            isCorrect,
            feedback: isCorrect
              ? (sec.explanationOnSuccess || null)
              : (sec.explanationOnFail || null)
          }
        }
      }
    }
  }

  return { isCorrect: false, feedback: null }
}

/**
 * Calculate similarity between two strings using Levenshtein distance.
 * @param {string} str1
 * @param {string} str2
 * @returns {number} similarity percentage (0-100)
 */
export function calculateSimilarity(str1, str2) {
  const normalize = (str) => str
    ? String(str)
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    : ''

  const s1 = normalize(str1)
  const s2 = normalize(str2)

  if (s1 === s2) return 100
  if (s1.length === 0 || s2.length === 0) return 0

  const matrix = []
  for (let i = 0; i <= s2.length; i++) {
    matrix[i] = [i]
  }
  for (let j = 0; j <= s1.length; j++) {
    matrix[0][j] = j
  }
  for (let i = 1; i <= s2.length; i++) {
    for (let j = 1; j <= s1.length; j++) {
      if (s2.charAt(i - 1) === s1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }

  const distance = matrix[s2.length][s1.length]
  const maxLength = Math.max(s1.length, s2.length)
  return ((maxLength - distance) / maxLength) * 100
}

/**
 * Evaluate essay answer using keywords and Levenshtein similarity.
 * @param {object} step - the step object (with essayQuestions / content.sections)
 * @param {string} answer - the user's answer text
 * @returns {{ score: number, maxScore: number, isCorrect: boolean, feedback: string, matchedKeywords: string[], totalKeywords: number }}
 */
export function evaluateEssay(step, answer) {
  let essayQuestions = []

  // Check standalone essay questions
  if (step.essayQuestions && step.essayQuestions.length > 0) {
    essayQuestions = step.essayQuestions
  } else if (step.content?.sections) {
    // Check composite sections
    const essaySections = step.content.sections.filter(s => s.type === 'essay')
    if (essaySections.length > 0) {
      essayQuestions = essaySections.map(sec => ({
        question_text: sec.question || '',
        keywords: sec.expectedKeywords || [],
        synonyms: [],
        perfect_answer: sec.perfectAnswer || '',
        max_score: 10
      }))
    }
  }

  if (essayQuestions.length === 0) {
    // Fallback if no questions are found
    const questionText = step.question || step.prompt || ''
    const keywords = step.keywords || []
    const perfectAnswer = step.perfect_answer || step.perfectAnswer || ''
    essayQuestions = [{
      question_text: questionText,
      keywords: Array.isArray(keywords) ? keywords : String(keywords).split(',').map(s => s.trim()).filter(Boolean),
      synonyms: [],
      perfect_answer: perfectAnswer,
      max_score: 10
    }]
  }

  const stepMaxScore = step.maxScore || 10
  let totalScore = 0
  let allMatchedKeywords = []
  let totalKeywords = 0
  let isPerfectMatch = false

  for (const eq of essayQuestions) {
    const safeParseList = (data) => {
      if (!data) return []
      if (Array.isArray(data)) return data
      try {
        const parsed = JSON.parse(data)
        if (Array.isArray(parsed)) return parsed
        return []
      } catch (e) {
        return String(data).split(',').map(s => s.trim()).filter(Boolean)
      }
    }

    const keywords = safeParseList(eq.keywords)
    const synonyms = safeParseList(eq.synonyms)
    totalKeywords += keywords.length

    // Check similarity (85% threshold)
    if (eq.perfect_answer && eq.perfect_answer.trim()) {
      const similarity = calculateSimilarity(answer, eq.perfect_answer)
      if (similarity >= 85) {
        totalScore += (eq.max_score || 10)
        allMatchedKeywords.push(...keywords)
        isPerfectMatch = true
        continue
      }
    }

    // Keyword match
    const { matched } = matchKeywords(answer, keywords, synonyms)
    allMatchedKeywords.push(...matched)

    const questionScore = keywords.length > 0
      ? Math.round((matched.length / keywords.length) * (eq.max_score || 10))
      : (eq.max_score || 10)

    totalScore += questionScore
  }

  const finalScore = Math.round(Math.min(totalScore, stepMaxScore))
  const isCorrect = finalScore >= (stepMaxScore * 0.6)

  const feedbackText = isPerfectMatch
    ? `🎉 Perfect! Your answer matches the model answer. Excellent work!`
    : (totalKeywords === 0)
      ? `Answer recorded successfully.`
      : isCorrect
        ? `Great job! You matched ${allMatchedKeywords.length} out of ${totalKeywords} key concepts.`
        : `You matched ${allMatchedKeywords.length} out of ${totalKeywords} key concepts. Review the material and try to include more relevant terms.`

  return {
    score: finalScore,
    maxScore: stepMaxScore,
    isCorrect,
    feedback: feedbackText,
    matchedKeywords: allMatchedKeywords,
    totalKeywords
  }
}
