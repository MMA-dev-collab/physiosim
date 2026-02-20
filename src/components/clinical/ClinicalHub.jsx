import React, { useState, useEffect } from 'react'
import ClinicalStepRunner from './ClinicalStepRunner'
import { getCategoriesForPhase } from '../../config/clinicalPhases'

export default function ClinicalHub({ step, viewedSubSteps = new Set(), onStepViewed }) {
    // step.subSteps contains the array of actual steps
    const [selectedStepId, setSelectedStepId] = useState(step.subSteps?.[0]?.id)

    // Auto-select first unviewed step if available, or just keep first
    useEffect(() => {
        if (!selectedStepId && step.subSteps?.length > 0) {
            setSelectedStepId(step.subSteps[0].id)
        }
    }, [step.subSteps, selectedStepId])

    const currentSubStep = step.subSteps?.find(s => s.id === selectedStepId)

    // Notify parent when a step is selected/viewed
    useEffect(() => {
        if (selectedStepId && onStepViewed) {
            onStepViewed(selectedStepId)
        }
    }, [selectedStepId, onStepViewed])

    if (!step.subSteps || step.subSteps.length === 0) {
        return <div className="p-4 bg-red-50 text-red-600">No steps available in this hub.</div>
    }

    // Calculate progress
    const totalSteps = step.subSteps.length
    const viewedCount = step.subSteps.filter(s => viewedSubSteps.has(s.id)).length
    const progress = Math.round((viewedCount / totalSteps) * 100)
    const isComplete = viewedCount === totalSteps

    // Determine Hub Title & Icon based on phase
    const isHistory = step.phase === 'history_presentation'
    const hubTitle = step.title || (isHistory ? 'Patient History' : 'Physical Assessment')
    const hubIcon = isHistory ? '📋' : '🔍'

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] max-h-[800px] bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="bg-slate-50 border-b border-slate-200 p-4 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <span>{hubIcon}</span> {hubTitle}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">Select an item to view details</p>
                </div>
                <div className="text-right">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Progress</div>
                    <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-teal-500 transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <span className="text-sm font-bold text-slate-700">{Math.round(progress)}%</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <div className="w-64 bg-slate-50 border-r border-slate-200 overflow-y-auto">
                    <div className="p-2 space-y-1">
                        {step.subSteps.map((subStep) => {
                            const isSelected = subStep.id === selectedStepId
                            const isViewed = viewedSubSteps.has(subStep.id)
                            const categoryLabel = subStep.category?.replace(/_/g, ' ') || 'Step'

                            // Try to get a nicer label
                            const phaseInfo = getCategoriesForPhase(subStep.phase)?.find(c => c.id === subStep.category)
                            const label = phaseInfo?.label || categoryLabel

                            return (
                                <button
                                    key={subStep.id}
                                    onClick={() => setSelectedStepId(subStep.id)}
                                    className={`w-full text-left p-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-between group
                                        ${isSelected
                                            ? 'bg-white shadow-sm ring-1 ring-slate-200 text-teal-700'
                                            : 'text-slate-600 hover:bg-slate-100'
                                        }`}
                                >
                                    <span className="capitalize truncate">{label}</span>
                                    {isViewed && (
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-teal-100 text-teal-700' : 'bg-slate-200 text-slate-500'}`}>
                                            ✓
                                        </span>
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto bg-white p-6">
                    {currentSubStep ? (
                        <div className="animate-in fade-in duration-300 slide-in-from-right-4">
                            <ClinicalStepRunner step={currentSubStep} />
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-slate-400 italic">
                            Select an item from the menu to view details
                        </div>
                    )}
                </div>
            </div>

            {/* Footer / CTA inside hub */}
            {isComplete && (
                <div className="p-3 bg-teal-50 border-t border-teal-100 text-center text-sm text-teal-800 font-medium animate-in slide-in-from-bottom-2">
                    All items viewed. You can now proceed to the next step.
                </div>
            )}
        </div>
    )
}
