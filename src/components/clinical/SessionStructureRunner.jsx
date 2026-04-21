import React, { useState } from 'react'

export default function SessionStructureRunner({ step, notes, setNotes, onSubmit, isReviewMode }) {
    const content = step.content || {}
    const sessionPlan = content.session_plan || {}

    // Destructure admin inputs safely
    const freqVal = sessionPlan.frequency?.value || ''
    const freqUnit = sessionPlan.frequency?.unit || 'per week'

    const durVal = sessionPlan.duration?.value || ''
    const durUnit = sessionPlan.duration?.unit || 'minutes'

    const reassessVal = sessionPlan.reassess?.value || ''
    const reassessUnit = sessionPlan.reassess?.unit || 'weeks'

    const objectives = sessionPlan.objectives || []

    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleFinishClick = async () => {
        setIsSubmitting(true)
        await onSubmit()
        setIsSubmitting(false)
    }

    return (
        <div className="session-structure-runner animate-in fade-in duration-500 bg-white p-6 rounded-3xl border border-slate-100">
            {/* Header Title */}
            <h2 className="text-xl font-bold text-slate-800 mb-8">
                Session Structure — {reassessVal && reassessUnit ? `Phase 1 (${reassessVal} ${reassessUnit})` : 'Treatment Phase'}
            </h2>
            
            {/* 3 Containers Row - Light Green Background */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {/* Frequency */}
                <div className="bg-[#f0f9f4] border border-[#e2f2e9] rounded-2xl p-6 flex flex-col items-start shadow-sm min-h-[140px]">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Frequency</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-[#1e293b]">{freqVal}</span>
                        <span className="text-xl font-black text-[#1e293b] lowercase">×/{freqUnit === 'per week' ? 'week' : freqUnit === 'per day' ? 'day' : 'month'}</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-400 mt-1">Sessions per {freqUnit.split(' ')[1] || 'week'}</span>
                </div>
                
                {/* Duration */}
                <div className="bg-[#f0f9f4] border border-[#e2f2e9] rounded-2xl p-6 flex flex-col items-start shadow-sm min-h-[140px]">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Duration</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-[#1e293b]">{durVal}</span>
                        <span className="text-xl font-black text-[#1e293b] lowercase">min</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-400 mt-1">Per session</span>
                </div>

                {/* Phase Duration (Reassess) */}
                <div className="bg-[#f0f9f4] border border-[#e2f2e9] rounded-2xl p-6 flex flex-col items-start shadow-sm min-h-[140px]">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Phase Duration</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-[#1e293b]">{reassessVal}</span>
                        <span className="text-xl font-black text-[#1e293b] lowercase">{reassessUnit}</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-400 mt-1">Then reassess</span>
                </div>
            </div>

            {/* Session Order Section */}
            <div className="mb-10">
                <h3 className="text-sm font-bold text-slate-900 mb-6 uppercase tracking-tight">
                    Session Order:
                </h3>
                
                {objectives.length > 0 ? (
                    <div className="space-y-4">
                        {objectives.map((obj, idx) => (
                            <div key={idx} className="flex gap-4 items-center">
                                {/* Blue Circle with White Number */}
                                <div className="w-6 h-6 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center font-bold text-[11px] shrink-0 shadow-sm">
                                    {idx + 1}
                                </div>
                                <div className="text-slate-700 font-medium text-[15px] leading-snug">
                                    {obj}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 text-center font-medium">
                        No specific objectives defined for this session.
                    </div>
                )}
            </div>

            {/* Additional Notes / Feedback Section */}
            <div className="mb-12">
                <h3 className="text-sm font-black text-slate-900 mb-4 uppercase tracking-tight">Your Feedback / Notes</h3>
                <textarea 
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    disabled={isReviewMode}
                    placeholder="Add any additional clinical notes, precautions, or customisations..."
                    rows={4}
                    className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium text-slate-600 text-sm resize-y shadow-sm"
                />
            </div>

            {/* Case Complete Banner - Styled per Screenshot */}
            {!isReviewMode && (
                <div className="bg-[#f0fdf4] border border-[#dcfce7] rounded-2xl p-6 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-[#22c55e] rounded-full flex items-center justify-center text-white shadow-md shadow-green-100">
                             <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                             </svg>
                        </div>
                        <div className="flex flex-col">
                            <h4 className="text-xl font-black text-[#166534]">Case Complete!</h4>
                            <p className="text-[#3f6212] text-sm font-semibold opacity-80">You have successfully reviewed all steps of this case. Well done!</p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleFinishClick}
                        disabled={isSubmitting}
                        className="px-8 py-3 bg-[#22c55e] hover:bg-[#16a34a] text-white text-base font-black rounded-xl transition-all shadow-md shadow-green-100 flex items-center gap-2"
                    >
                        {isSubmitting ? 'Finishing...' : 'Finish Case'}
                    </button>
                </div>
            )}
        </div>
    )
}

