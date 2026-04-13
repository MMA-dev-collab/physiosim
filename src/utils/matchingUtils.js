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
