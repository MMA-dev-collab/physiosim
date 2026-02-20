import React, { useMemo } from 'react'

export default function CaseRunnerLayout({
    caseTitle,
    patientInfo,
    currentStepIndex,
    totalSteps,
    steps = [],
    children,
    onStepClick, // Optional: if we allow navigating back
    isReviewMode = false
}) {

    const progressPercent = Math.round(((currentStepIndex + 1) / totalSteps) * 100)

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-800">

            {/* Sidebar - Timeline */}
            <aside className="w-full md:w-72 bg-white border-r border-slate-200 flex flex-col h-auto md:h-screen md:sticky md:top-0 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] z-10">
                {/* Logo / Brand Area */}
                <div className="p-5 border-b border-slate-100 flex items-center gap-3">
                    <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center text-white font-bold shadow-teal-200 shadow-md">
                        P
                    </div>
                    <div className="font-bold text-slate-800 tracking-tight">PhysioSim <span className="text-teal-600">Runner</span></div>
                </div>

                {/* Case Info */}
                <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Current Case</div>
                    <h1 className="font-bold text-slate-900 leading-tight mb-2">{caseTitle || 'Untitled Case'}</h1>
                    {isReviewMode && (
                        <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded border border-amber-100">
                            <span>👁️</span> Review Mode
                        </div>
                    )}
                </div>

                {/* Steps Timeline */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    <div className="space-y-0.5 relative">
                        {/* Vertical Line */}
                        <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-slate-100 -z-10"></div>

                        {steps.map((step, idx) => {
                            const isCompleted = idx < currentStepIndex
                            const isCurrent = idx === currentStepIndex
                            const isFuture = idx > currentStepIndex

                            // Step Type Icon
                            let icon = '○'
                            if (step.type === 'history') icon = 'h'
                            if (step.type === 'clinical') icon = 'c'
                            if (step.type === 'mcq') icon = '?'
                            if (step.type === 'diagnosis') icon = 'd'
                            if (isCompleted) icon = '✓'

                            return (
                                <div
                                    key={idx}
                                    onClick={() => (isCompleted || isReviewMode) && onStepClick && onStepClick(idx)}
                                    className={`
                                group flex items-start gap-3 p-2 rounded-lg transition-all duration-200
                                ${isCurrent ? 'bg-teal-50 shadow-sm ring-1 ring-teal-100 translate-x-1' : ''}
                                ${(isCompleted || isReviewMode) && onStepClick ? 'cursor-pointer hover:bg-slate-50' : 'cursor-default opacity-60'}
                            `}
                                >
                                    {/* Icon Bubble */}
                                    <div className={`
                                w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 z-10 border-2 transition-colors
                                ${isCurrent ? 'bg-teal-600 border-teal-600 text-white shadow-md' : ''}
                                ${isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : ''}
                                ${isFuture ? 'bg-white border-slate-200 text-slate-300' : ''}
                            `}>
                                        {isCompleted ? '✓' : (idx + 1)}
                                    </div>

                                    {/* Text */}
                                    <div className="flex-1 pt-1">
                                        <div className={`text-sm font-semibold leading-none mb-1 ${isCurrent ? 'text-teal-900' : 'text-slate-700'}`}>
                                            {getStepLabel(step)}
                                        </div>
                                        <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">
                                            {getStepTypeLabel(step)}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Patient Mini-Card (Bottom Sidebar) */}
                {patientInfo && (
                    <div className="p-4 border-t border-slate-200 bg-slate-50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border border-slate-300 shrink-0">
                                {patientInfo.imageUrl ? <img src={patientInfo.imageUrl} className="w-full h-full object-cover" alt="Patient" /> : <span className="flex items-center justify-center w-full h-full text-xs">👤</span>}
                            </div>
                            <div>
                                <div className="font-bold text-slate-800 text-sm">{patientInfo.patientName || 'Patient'}</div>
                                <div className="text-xs text-slate-500">{patientInfo.age} yrs • {patientInfo.gender}</div>
                            </div>
                        </div>
                    </div>
                )}
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Top Header (Mobile specific or Global Actions) */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 md:pl-8">
                    <div className="flex items-center gap-4">
                        {/* Breadcrumbs or Status could go here */}
                        <div className="text-sm font-medium text-slate-500">
                            Step {currentStepIndex + 1} of {totalSteps}
                        </div>

                        {/* Progress Bar */}
                        <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-teal-500 transition-all duration-500 ease-out" style={{ width: `${progressPercent}%` }}></div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="text-slate-400 hover:text-slate-600 transition-colors">
                            <span className="sr-only">Help</span>
                            ❓
                        </button>
                    </div>
                </header>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 md:p-8 scroll-smooth">
                    <div className="max-w-4xl mx-auto pb-20"> {/* pb-20 for bottom clearance */}
                        {children}
                    </div>
                </div>
            </main>
        </div>
    )
}

// Helpers
function getStepLabel(step) {
    if (step.type === 'clinical') {
        return step.category?.replace(/_/g, ' ') || 'Clinical Step'
    }
    if (step.type === 'history') {
        return step.content?.title || 'History'
    }
    return step.title || step.type?.toUpperCase() || 'Step'
}

function getStepTypeLabel(step) {
    const map = {
        'info': 'Patient Info',
        'history': 'History Taking',
        'clinical': 'Examination',
        'diagnosis': 'Clinical Reasoning',
        'treatment': 'Management',
        'mcq': 'Decision Point',
        'investigation': 'Tests & Imaging'
    }
    return map[step.type] || step.type
}
