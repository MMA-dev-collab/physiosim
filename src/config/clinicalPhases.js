/**
 * Clinical Phases Configuration
 * Defines the 5 fixed clinical workflow phases and their categories
 * Based on PhysioSim Steps 1.0 specification
 */

// The 5 fixed clinical phases (in order)
export const CLINICAL_PHASES = [
    {
        id: 'history_presentation',
        label: 'History Presentation',
        shortLabel: 'History',
        icon: '📋',
        description: 'Capture subjective patient story and structured pain metadata',
        order: 1
    },
    {
        id: 'assessment',
        label: 'Assessment',
        shortLabel: 'Assessment',
        icon: '🔍',
        description: 'Objective exam — observations, palpation, ROM, tests, imaging',
        order: 2
    },
    {
        id: 'diagnosis',
        label: 'Diagnosis',
        shortLabel: 'Diagnosis',
        icon: '🎯',
        description: 'Clinical interpretation and working diagnosis',
        order: 3
    },
    {
        id: 'problem_list',
        label: 'Problem List',
        shortLabel: 'Problems',
        icon: '📝',
        description: 'Actionable problems mapped from findings',
        order: 4
    },
    {
        id: 'treatment',
        label: 'Treatment',
        shortLabel: 'Treatment',
        icon: '💊',
        description: 'Interventions linked to problem IDs',
        order: 5
    }
]

// Categories within each phase
export const PHASE_CATEGORIES = {
    history_presentation: [
        { id: 'present_history', label: 'Present History', inputMode: 'author_only', dataTypes: ['text', 'numbers'] },
        { id: 'history_of_pain', label: 'History of Pain', inputMode: 'author_only', dataTypes: ['text', 'numbers'] },
        { id: 'past_history', label: 'Past History', inputMode: 'author_only', dataTypes: ['text', 'numbers'] },
        { id: 'medication', label: 'Medication', inputMode: 'author_only', dataTypes: ['text', 'numbers'] }
    ],
    assessment: [
        { id: 'observation_anterior', label: 'Observation - Anterior View', inputMode: 'author_only', dataTypes: ['image', 'text'] },
        { id: 'observation_sagittal', label: 'Observation - Sagittal View', inputMode: 'author_only', dataTypes: ['image', 'text'] },
        { id: 'observation_posterior', label: 'Observation - Posterior View', inputMode: 'author_only', dataTypes: ['image', 'text'] },
        { id: 'observation_local', label: 'Local Observation', inputMode: 'author_only', dataTypes: ['image', 'text'] },
        { id: 'palpation_skin', label: 'Palpation - Skin', inputMode: 'author_only', dataTypes: ['text', 'image'] },
        { id: 'palpation_muscles', label: 'Palpation - Muscles', inputMode: 'author_only', dataTypes: ['text', 'image'] },
        { id: 'palpation_bone', label: 'Palpation - Bone', inputMode: 'author_only', dataTypes: ['text', 'image'] },
        { id: 'rom_arom', label: 'ROM - AROM', inputMode: 'author_only', dataTypes: ['numbers', 'text'] },
        { id: 'rom_prom', label: 'ROM - PROM', inputMode: 'author_only', dataTypes: ['numbers', 'text'] },
        { id: 'mmt', label: 'Manual Muscle Test', inputMode: 'author_only', dataTypes: ['text', 'numbers', 'links'] },
        { id: 'flexibility_test', label: 'Flexibility Test', inputMode: 'user_input', dataTypes: ['text', 'links'] },
        { id: 'special_tests', label: 'Special Tests', inputMode: 'user_input', dataTypes: ['text', 'links'] },
        { id: 'investigations', label: 'Investigations (Imaging)', inputMode: 'author_only', dataTypes: ['image', 'text', 'numbers'] }
    ],
    diagnosis: [
        { id: 'diagnosis_entry', label: 'Diagnosis', inputMode: 'user_input', dataTypes: ['text', 'numbers', 'image'] }
    ],
    problem_list: [
        { id: 'problem_entry', label: 'Problem List', inputMode: 'user_input', dataTypes: ['text', 'numbers'] }
    ],
    treatment: [
        { id: 'treatment_table', label: 'Treatment Table', inputMode: 'author_only', dataTypes: ['text', 'links'] }
    ]
}

// ROM Clinical Tip (static, displayed in UI)
export const ROM_CLINICAL_TIP = {
    title: 'ROM Clinical Assessment Guide',
    rules: [
        { condition: 'PROM > AROM by 5-10°', interpretation: 'Normal' },
        { condition: 'PROM > AROM by >10°', interpretation: 'Muscle weakness' },
        { condition: 'PROM & AROM both limited', interpretation: 'Joint stiffness' }
    ]
}

// Default data templates for each category
export const CATEGORY_TEMPLATES = {
    present_history: {
        chief_complaint: '',
        chief_complaint_arabic: '',
        notes: ''
    },
    history_of_pain: {
        intensity: null, // 0-10
        frequency: '', // persistent, intermittent, etc.
        time_of_day: '',
        aggravating_factors: [],
        relieving_factors: [],
        onset: '', // acute, chronic, acute on chronic
        course: '' // progressive, stable, improving
    },
    past_history: {
        conditions: [] // [{ condition, since, notes }]
    },
    medication: {
        medications: [] // [{ name, dose, frequency, notes }]
    },
    observation_anterior: {
        image_url: '',
        findings: [],
        notes: ''
    },
    observation_sagittal: {
        image_url: '',
        findings: [],
        notes: ''
    },
    observation_posterior: {
        image_url: '',
        findings: [],
        notes: ''
    },
    observation_local: {
        image_url: '',
        findings: [],
        notes: ''
    },
    palpation_skin: {
        entries: [] // [{ location, finding, severity, image_url, notes }]
    },
    palpation_muscles: {
        entries: []
    },
    palpation_bone: {
        entries: []
    },
    rom_arom: {
        entries: [] // [{ movement, value, pain, notes }]
    },
    rom_prom: {
        entries: [] // [{ movement, value, pain, end_feel, notes }]
    },
    mmt: {
        entries: [] // [{ muscle, grade (0-5), notes, link }]
    },
    flexibility_test: {
        entries: [] // [{ test_name, result, notes, link }]
    },
    special_tests: {
        entries: [] // [{ test_name, result (pos/neg/null), notes, link }]
    },
    investigations: {
        entries: [] // [{ modality, image_url, report_text, numeric_measures }]
    },
    diagnosis_entry: {
        diagnoses: [] // [{ code, label, confidence, supporting_findings, notes, image_url }]
    },
    problem_entry: {
        problems: [] // [{ id, label, severity, functional_impact, supporting_findings, priority }]
    },
    treatment_table: {
        treatments: [] // [{ problem_id, problem_label, intervention, benefit, links }]
    }
}

// Helper functions
export function getPhaseById(phaseId) {
    return CLINICAL_PHASES.find(p => p.id === phaseId)
}

export function getCategoriesForPhase(phaseId) {
    return PHASE_CATEGORIES[phaseId] || []
}

export function getCategoryById(phaseId, categoryId) {
    const categories = PHASE_CATEGORIES[phaseId] || []
    return categories.find(c => c.id === categoryId)
}

export function getDefaultTemplate(categoryId) {
    return CATEGORY_TEMPLATES[categoryId] || {}
}

// Map old step types to new phase/category
export const LEGACY_TYPE_MAPPING = {
    'info': { phase: 'history_presentation', category: 'present_history' },
    'history': { phase: 'history_presentation', category: 'history_of_pain' },
    'investigation': { phase: 'assessment', category: 'investigations' },
    'diagnosis': { phase: 'diagnosis', category: 'diagnosis_entry' },
    'treatment': { phase: 'treatment', category: 'treatment_table' },
    'mcq': { phase: 'assessment', category: null }, // MCQ can be in any phase
    'essay': { phase: 'assessment', category: null }
}
