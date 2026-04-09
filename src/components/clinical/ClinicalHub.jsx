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
    const isImaging = step.phase === 'imaging'
    const isTreatment = step.phase === 'treatment'
    
    let defaultTitle = 'Examination'
    if (isHistory) defaultTitle = 'Subjective Data'
    else if (isImaging) defaultTitle = 'Imagery'
    else if (isTreatment) defaultTitle = 'Treatment Plan'
    
    const hubTitle = step.title || defaultTitle
    const hubIcon = isHistory ? '📋' : isImaging ? '📸' : isTreatment ? '💊' : '🔍'

    // If there is ONLY ONE step inside the hub, skip the hub sidebar layout completely and render the content directly
    if (step.subSteps.length === 1) {
        return (
            <div className="animate-in fade-in duration-300">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold text-slate-800">{hubTitle}</h2>
                </div>
                <ClinicalStepRunner step={currentSubStep} hideHeader={true} />
            </div>
        )
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 180px)', background: '#fff', borderRadius: 'var(--cf-radius)', border: '1px solid var(--cf-border)', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ background: '#f8fafc', borderBottom: '1px solid var(--cf-border)', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--cf-text)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '24px' }}>{hubIcon}</span> {hubTitle}
                    </h2>
                    <p style={{ fontSize: '13px', color: 'var(--cf-text-muted)', marginTop: '4px', fontWeight: '500' }}>Select an assessment item to view detailed findings</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div className="flex items-center gap-4">
                        <div style={{ width: '120px', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                            <div
                                style={{ height: '100%', background: 'var(--cf-primary)', transition: 'all 0.5s ease', width: `${progress}%` }}
                            />
                        </div>
                        <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--cf-primary)' }}>{Math.round(progress)}%</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                <div className="w-72 bg-slate-50 border-r border-slate-200 overflow-y-auto" style={{ padding: '16px' }}>
                    <div className="space-y-3">
                        {step.subSteps.map((subStep) => {
                            const isSelected = subStep.id === selectedStepId
                            const isViewed = viewedSubSteps.has(subStep.id)
                            const categoryLabel = subStep.category?.replace(/_/g, ' ') || 'Step'

                            const phaseInfo = getCategoriesForPhase(subStep.phase)?.find(c => c.id === subStep.category)
                            const label = phaseInfo?.label || categoryLabel

                            return (
                                <button
                                    key={subStep.id}
                                    onClick={() => setSelectedStepId(subStep.id)}
                                    className={`w-full text-left p-4 rounded-xl text-sm transition-all duration-300 flex items-center justify-between group
                                        ${isSelected
                                            ? 'bg-white shadow-md border-l-4 border-l-primary font-bold text-slate-900'
                                            : 'text-slate-500 hover:bg-white/50 border-l-4 border-l-transparent'
                                        }`}
                                    style={isSelected ? { borderColor: 'var(--cf-primary)' } : {}}
                                >
                                    <span className="capitalize truncate">{label}</span>
                                    {isViewed && (
                                        <div style={{ backgroundColor: isSelected ? 'var(--cf-primary)' : '#cbd5e1', borderRadius: '50%', padding: '2px' }}>
                                             <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4">
                                                <path d="M20 6L9 17l-5-5" />
                                             </svg>
                                        </div>
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
