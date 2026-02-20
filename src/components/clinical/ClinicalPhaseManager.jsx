import React, { useState, useEffect } from 'react'
import { Reorder } from 'framer-motion'
import { CLINICAL_PHASES, PHASE_CATEGORIES, getCategoriesForPhase } from '../../config/clinicalPhases'
import { ClinicalStepEditor } from './ClinicalStepEditor'
import StepEditor from '../StepEditor'
import './ClinicalPhaseManager.css'

/**
 * ClinicalPhaseManager - Organizes case steps by clinical phases
 * Replaces the flat step list with phase-grouped accordion view
 */
export default function ClinicalPhaseManager({
    caseId,
    steps,
    onAddStep,
    onUpdateStep,
    onDeleteStep,
    onReorderSteps,
    auth
}) {
    const [expandedPhase, setExpandedPhase] = useState('history_presentation')
    const [editingStepId, setEditingStepId] = useState(null)
    const [addingCategory, setAddingCategory] = useState(null)

    // Reorder Mode State
    const [isReordering, setIsReordering] = useState(false)
    const [phaseGroups, setPhaseGroups] = useState([]) // For draggable phases
    const [historySteps, setHistorySteps] = useState([])
    const [openReorderGroups, setOpenReorderGroups] = useState({}) // Toggle collapse state

    // Initialize groups when entering reorder mode
    useEffect(() => {
        if (isReordering) {
            // 1. Separate History (Pinned)
            const hSteps = steps
                .filter(s => s.phase === 'history_presentation')
                .sort((a, b) => a.stepIndex - b.stepIndex)
            setHistorySteps(hSteps)

            // 2. Build a mixed list of phase groups + standalone MCQ/Essay steps
            // ordered by their actual stepIndex position
            const otherPhases = CLINICAL_PHASES.filter(p => p.id !== 'history_presentation')
            const eduSteps = steps.filter(s => s.type === 'mcq' || s.type === 'essay')

            // Create phase group items
            const phaseItems = otherPhases.map(phase => {
                const pSteps = steps
                    .filter(s => s.phase === phase.id && s.type === 'clinical')
                    .sort((a, b) => a.stepIndex - b.stepIndex)

                const startIndex = pSteps.length > 0 ? pSteps[0].stepIndex : Infinity

                return {
                    itemType: 'phase',
                    id: phase.id,
                    ...phase,
                    steps: pSteps,
                    startIndex
                }
            })

            // Create standalone educational step items
            const eduItems = eduSteps.map(s => ({
                itemType: 'educational',
                id: `edu-${s.id}`,
                step: s,
                startIndex: s.stepIndex
            }))

            // Merge and sort by position
            const mixed = [...phaseItems, ...eduItems]
            mixed.sort((a, b) => {
                if (a.startIndex === Infinity && b.startIndex === Infinity) return 0
                return a.startIndex - b.startIndex
            })

            setPhaseGroups(mixed)

            // Default expand all phase groups that have steps
            const initialOpen = {}
            mixed.forEach(g => {
                if (g.itemType === 'phase' && g.steps.length > 0) initialOpen[g.id] = true
            })
            if (hSteps.length > 0) initialOpen['history_presentation'] = true

            setOpenReorderGroups(initialOpen)
        }
    }, [isReordering, steps])

    // Group steps by phase (for non-reorder view)
    const stepsByPhase = CLINICAL_PHASES.reduce((acc, phase) => {
        acc[phase.id] = steps.filter(s => s.phase === phase.id)
        return acc
    }, {})

    // Count steps in each phase
    const getPhaseProgress = (phaseId) => {
        const categories = getCategoriesForPhase(phaseId)
        const phaseSteps = stepsByPhase[phaseId] || []
        const filledCategories = new Set(phaseSteps.map(s => s.category))
        return {
            filled: filledCategories.size,
            total: categories.length
        }
    }

    // Handle adding a step with phase/category
    const handleAddClinicalStep = async (phase, category) => {
        const categoryInfo = getCategoriesForPhase(phase).find(c => c.id === category)
        const newStep = {
            stepIndex: steps.length,
            type: 'clinical', // New type for clinical steps
            phase,
            category,
            input_mode: categoryInfo?.inputMode || 'author_only',
            content: {},
            logic: null
        }
        await onAddStep(newStep)
        setAddingCategory(null)
    }

    // Handle step save
    const handleStepSave = async (editedStep) => {
        await onUpdateStep(editedStep)
        setEditingStepId(null)
    }

    // Check if category already has a step
    const hasStepForCategory = (phaseId, categoryId) => {
        return steps.some(s => s.phase === phaseId && s.category === categoryId)
    }

    // Get step for a category
    const getStepForCategory = (phaseId, categoryId) => {
        return steps.find(s => s.phase === phaseId && s.category === categoryId)
    }

    const toggleGroup = (groupId) => {
        setOpenReorderGroups(prev => ({
            ...prev,
            [groupId]: !prev[groupId]
        }))
    }

    const updatePhaseSteps = (phaseId, newSteps) => {
        setPhaseGroups(prev => prev.map(g =>
            g.id === phaseId ? { ...g, steps: newSteps } : g
        ))
    }

    const saveReorder = async () => {
        // Flatten everything
        // 1. History Steps
        const flatList = [...historySteps]

        // 2. Mixed items (phase groups + educational steps) in their new order
        phaseGroups.forEach(item => {
            if (item.itemType === 'educational') {
                flatList.push(item.step)
            } else {
                flatList.push(...item.steps)
            }
        })

        // Create update payload
        const updates = flatList.map((step, index) => ({
            id: step.id,
            stepIndex: index
        }))

        await onReorderSteps(updates)
        setIsReordering(false)
    }


    if (isReordering) {
        return (
            <div className="clinical-phase-manager">
                <div className="manager-header">
                    <h2>Reorder Steps</h2>
                    <div className="header-actions">
                        <button className="btn-secondary" onClick={() => setIsReordering(false)}>Cancel</button>
                        <button className="btn-primary" onClick={saveReorder}>Save Order</button>
                    </div>
                </div>

                <div className="reorder-list">
                    {/* 1. Pinned History Steps */}
                    <div className="pinned-section">
                        <div
                            className="pinned-header"
                            onClick={() => toggleGroup('history_presentation')}
                            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <span>{openReorderGroups['history_presentation'] ? '▼' : '▶'}</span>
                            🔒 History Phase (Pinned to Start)
                        </div>

                        {openReorderGroups['history_presentation'] && (
                            <div className="phase-group-content">
                                {historySteps.length === 0 ? (
                                    <div className="empty-phase-msg">No steps in History</div>
                                ) : (
                                    historySteps.map(step => (
                                        <div key={step.id} className="reorder-item pinned">
                                            <span className="step-icon">📋</span>
                                            <span className="step-label">{step.category || step.type}</span>
                                            {step.content?.title && <span className="step-subtitle"> - {step.content.title}</span>}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* 2. Draggable Phase Groups */}
                    <div className="draggable-section">
                        <div className="draggable-header">⇅ Reorder Phases & Logic</div>

                        <Reorder.Group axis="y" values={phaseGroups} onReorder={setPhaseGroups}>
                            {phaseGroups.map(item => {
                                // Render standalone educational step
                                if (item.itemType === 'educational') {
                                    return (
                                        <Reorder.Item
                                            key={item.id}
                                            value={item}
                                            className="reorder-item draggable"
                                            transition={{ duration: 0 }}
                                        >
                                            <span className="drag-handle">::</span>
                                            <div className="step-info">
                                                <span className="step-phase-badge" style={{
                                                    background: item.step.type === 'mcq' ? '#eef2ff' : '#ccfbf1',
                                                    color: item.step.type === 'mcq' ? '#4338ca' : '#0f766e'
                                                }}>
                                                    {item.step.type === 'mcq' ? '🧠 MCQ' : '📝 Essay'}
                                                </span>
                                                <span className="step-label">
                                                    {item.step.type === 'mcq'
                                                        ? (item.step.content?.prompt || item.step.question || 'MCQ Step')
                                                        : `Essay (${item.step.essayQuestions?.length || 0} questions)`
                                                    }
                                                </span>
                                            </div>
                                        </Reorder.Item>
                                    )
                                }

                                // Render phase group
                                const group = item
                                return (
                                    <Reorder.Item
                                        key={group.id}
                                        value={group}
                                        className="phase-group-item"
                                        transition={{ duration: 0 }}
                                    >
                                        <div className="phase-group-header">
                                            <div className="phase-drag-handle" title="Drag to reorder phase">::</div>
                                            <div
                                                className="phase-toggle"
                                                onClick={() => toggleGroup(group.id)}
                                            >
                                                <span className="toggle-icon">{openReorderGroups[group.id] ? '▼' : '▶'}</span>
                                                <span className="phase-icon">{group.icon}</span>
                                                <span className="phase-name">{group.label}</span>
                                                <span className="step-count">({group.steps.length} steps)</span>
                                            </div>
                                        </div>

                                        {openReorderGroups[group.id] && (
                                            <div className="phase-group-content">
                                                {group.steps.length === 0 ? (
                                                    <div className="empty-phase-msg">No steps in this phase</div>
                                                ) : (
                                                    <Reorder.Group
                                                        axis="y"
                                                        values={group.steps}
                                                        onReorder={(newSteps) => updatePhaseSteps(group.id, newSteps)}
                                                    >
                                                        {group.steps.map(step => (
                                                            <Reorder.Item
                                                                key={step.id}
                                                                value={step}
                                                                className="reorder-item draggable"
                                                                transition={{ duration: 0 }}
                                                            >
                                                                <span className="drag-handle">::</span>
                                                                <div className="step-info">
                                                                    <span className="step-label">{step.category || step.type}</span>
                                                                    {step.content?.title && <span className="step-subtitle"> - {step.content.title}</span>}
                                                                </div>
                                                            </Reorder.Item>
                                                        ))}
                                                    </Reorder.Group>
                                                )}
                                            </div>
                                        )}
                                    </Reorder.Item>
                                )
                            })}
                        </Reorder.Group>
                    </div>
                </div>
            </div>
        )
    }

    // 1. Sort Phases based on steps
    const sortedPhases = [...CLINICAL_PHASES].sort((a, b) => {
        // Pins History to top
        if (a.id === 'history_presentation') return -1
        if (b.id === 'history_presentation') return 1

        const stepsA = steps.filter(s => s.phase === a.id)
        const stepsB = steps.filter(s => s.phase === b.id)

        const minIndexA = stepsA.length > 0 ? Math.min(...stepsA.map(s => s.stepIndex)) : Infinity
        const minIndexB = stepsB.length > 0 ? Math.min(...stepsB.map(s => s.stepIndex)) : Infinity

        if (minIndexA === Infinity && minIndexB === Infinity) {
            return 0 // Keep default order
        }
        return minIndexA - minIndexB
    })

    return (
        <div className="clinical-phase-manager">
            <div className="manager-header">
                <div>
                    <h2>Clinical Case Steps</h2>
                    <p>Build your case following the 5 clinical phases</p>
                </div>
                <button
                    className="btn-secondary"
                    onClick={() => setIsReordering(true)}
                    title="Change order of steps"
                >
                    ⇅ Reorder Steps
                </button>
            </div>

            <div className="phase-accordion">
                {sortedPhases.map((phase, idx) => {
                    const progress = getPhaseProgress(phase.id)
                    const isExpanded = expandedPhase === phase.id

                    // 2. Sort Categories within Phase
                    const rawCategories = getCategoriesForPhase(phase.id)
                    const sortedCategories = [...rawCategories].sort((a, b) => {
                        const stepA = getStepForCategory(phase.id, a.id)
                        const stepB = getStepForCategory(phase.id, b.id)

                        const idxA = stepA ? stepA.stepIndex : Infinity
                        const idxB = stepB ? stepB.stepIndex : Infinity

                        if (idxA === Infinity && idxB === Infinity) return 0
                        return idxA - idxB
                    })

                    return (
                        <div key={phase.id} className={`phase-panel ${isExpanded ? 'expanded' : ''}`}>
                            <button
                                className="phase-panel-header"
                                onClick={() => setExpandedPhase(isExpanded ? null : phase.id)}
                            >
                                <div className="phase-info">
                                    <span className="phase-number">{idx + 1}</span>
                                    <span className="phase-icon">{phase.icon}</span>
                                    <span className="phase-label">{phase.label}</span>
                                </div>
                                <div className="phase-meta">
                                    <span className="progress-badge">
                                        {progress.filled}/{progress.total}
                                    </span>
                                    {progress.filled === progress.total && progress.total > 0 && (
                                        <span className="complete-badge">✓</span>
                                    )}
                                    <span className={`expand-icon ${isExpanded ? 'rotated' : ''}`}>▾</span>
                                </div>
                            </button>

                            {isExpanded && (
                                <div className="phase-panel-content">
                                    <p className="phase-description">{phase.description}</p>

                                    <div className="categories-grid">
                                        {sortedCategories.map(cat => {
                                            const existingStep = getStepForCategory(phase.id, cat.id)
                                            const isEditing = editingStepId === existingStep?.id

                                            return (
                                                <div key={cat.id} className={`category-card ${existingStep ? 'has-content' : ''}`}>
                                                    <div className="category-header">
                                                        <span className="category-label">{cat.label}</span>
                                                        {cat.inputMode === 'user_input' && (
                                                            <span className="user-input-badge-small">User Input</span>
                                                        )}
                                                        {existingStep && (
                                                            <span className="filled-indicator">✓</span>
                                                        )}
                                                    </div>

                                                    {existingStep ? (
                                                        <>
                                                            {isEditing ? (
                                                                <div className="category-editor-wrapper">
                                                                    <ClinicalStepEditor
                                                                        step={existingStep}
                                                                        onSave={handleStepSave}
                                                                        onCancel={() => setEditingStepId(null)}
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <div className="category-actions">
                                                                    <button
                                                                        className="btn-edit"
                                                                        onClick={() => setEditingStepId(existingStep.id)}
                                                                    >
                                                                        ✏️ Edit
                                                                    </button>
                                                                    <button
                                                                        className="btn-delete"
                                                                        onClick={() => onDeleteStep(existingStep.id)}
                                                                    >
                                                                        🗑
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <button
                                                            className="btn-add-category"
                                                            onClick={() => handleAddClinicalStep(phase.id, cat.id)}
                                                        >
                                                            + Add {cat.label}
                                                        </button>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>

                                    {/* Phase completion hint */}
                                    {progress.filled === 0 && (
                                        <div className="phase-hint">
                                            💡 Click on any category above to add content for this phase.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Educational Steps Section (MCQ / Essay) */}
            <div className="educational-steps-section">
                <div className="educational-header">
                    <div>
                        <h3>✏️ Educational Steps</h3>
                        <p>Add MCQ or Essay questions anywhere in the case flow</p>
                    </div>
                    <div className="educational-actions">
                        <button
                            className="btn-add-mcq"
                            onClick={() => onAddStep('mcq')}
                        >
                            + MCQ Step
                        </button>
                        <button
                            className="btn-add-essay"
                            onClick={() => onAddStep('essay')}
                        >
                            + Essay Step
                        </button>
                    </div>
                </div>

                {/* List existing MCQ/Essay steps */}
                {(() => {
                    const eduSteps = steps.filter(s => s.type === 'mcq' || s.type === 'essay')
                    if (eduSteps.length === 0) return (
                        <div className="edu-empty-state">
                            No educational steps yet. Add MCQ or Essay steps to test student knowledge.
                        </div>
                    )
                    return (
                        <div className="edu-steps-list">
                            {eduSteps
                                .sort((a, b) => a.stepIndex - b.stepIndex)
                                .map(step => (
                                    <div key={step.id} className={`edu-step-card ${step.type}`}>
                                        {editingStepId === step.id ? (
                                            <div className="category-editor-wrapper">
                                                <StepEditor
                                                    step={step}
                                                    onSave={handleStepSave}
                                                    onCancel={() => setEditingStepId(null)}
                                                />
                                            </div>
                                        ) : (
                                            <>
                                                <div className="edu-step-info">
                                                    <span className="edu-step-type-badge">
                                                        {step.type === 'mcq' ? '🧠 MCQ' : '📝 Essay'}
                                                    </span>
                                                    <span className="edu-step-index">
                                                        Step {step.stepIndex + 1}
                                                    </span>
                                                    <span className="edu-step-preview">
                                                        {step.type === 'mcq'
                                                            ? (step.content?.prompt || step.question || 'No question set')
                                                            : `${step.essayQuestions?.length || 0} essay question(s)`
                                                        }
                                                    </span>
                                                    {step.type === 'mcq' && (
                                                        <span className="edu-step-meta">
                                                            {step.options?.length || 0} options · Score: {step.maxScore || 10}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="edu-step-actions">
                                                    <button
                                                        className="btn-edit"
                                                        onClick={() => setEditingStepId(step.id)}
                                                    >
                                                        ✏️ Edit
                                                    </button>
                                                    <button
                                                        className="btn-delete"
                                                        onClick={() => onDeleteStep(step.id)}
                                                    >
                                                        🗑
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                        </div>
                    )
                })()}
            </div>

            {/* Quick stats */}
            <div className="manager-stats">
                <div className="stat">
                    <span className="stat-value">{steps.filter(s => s.phase).length}</span>
                    <span className="stat-label">Clinical Steps</span>
                </div>
                <div className="stat">
                    <span className="stat-value">
                        {steps.filter(s => s.type === 'mcq' || s.type === 'essay').length}
                    </span>
                    <span className="stat-label">Educational Steps</span>
                </div>
                <div className="stat">
                    <span className="stat-value">
                        {CLINICAL_PHASES.filter(p => {
                            const prog = getPhaseProgress(p.id)
                            return prog.filled === prog.total && prog.total > 0
                        }).length}
                    </span>
                    <span className="stat-label">Phases Complete</span>
                </div>
            </div>
        </div>
    )
}
