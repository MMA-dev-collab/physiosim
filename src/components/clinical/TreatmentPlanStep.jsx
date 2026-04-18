import React from 'react'

export default function TreatmentPlanStep({ step, hideHeader }) {
    const treatments = step?.content?.treatments || []

    // Helper to get YouTube ID from various URL formats
    const getYouTubeThumbnail = (url) => {
        if (!url) return null;
        let videoId = '';
        try {
            const raw = url.replace(/(>|<)/gi, '').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
            if (raw[2] !== undefined) {
                videoId = raw[2].split(/[^0-9a-z_\-]/i)[0];
            } else {
                videoId = raw[0];
            }
        } catch (e) {
            return null;
        }
        if (!videoId) return null;
        return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }

    return (
        <div className="treatment-plan-step w-full max-w-6xl mx-auto py-8">
            {!hideHeader && (
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-slate-800">
                        {step.title || 'Treatment plan'}
                    </h2>
                </div>
            )}
            
            <div className="flex flex-col gap-6">
                {treatments.map((treat, idx) => (
                    <div 
                        key={idx} 
                        className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100 transition-all hover:shadow-lg"
                    >
                        <div className="flex flex-col md:flex-row min-h-[220px]">
                            
                            {/* Left Side: Problem & Description */}
                            <div className="flex-1 p-6 md:p-8 flex flex-col md:border-r border-slate-100">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm flex-shrink-0">
                                        {idx + 1}
                                    </div>
                                    <div className="px-4 py-1.5 border border-orange-400 rounded-full text-orange-600 font-semibold text-sm shadow-sm bg-orange-50">
                                        {treat.problem_label || `Problem ${idx + 1}`}
                                    </div>
                                </div>
                                
                                <div className="mb-6 flex-grow">
                                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Goal</h4>
                                    <p className="text-slate-600 font-medium leading-relaxed">
                                        {treat.goal || 'No goal specified.'}
                                    </p>
                                </div>

                                {treat.dosages && treat.dosages.length > 0 && (
                                    <div>
                                        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Dosage / Tips</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {treat.dosages.map((dos, dIdx) => (
                                                <span key={dIdx} className="px-3 py-1.5 bg-blue-50 text-blue-600 font-semibold text-xs rounded-full shadow-sm">
                                                    {dos}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Side: Treatment & Video */}
                            <div className="w-full md:w-[45%] lg:w-[40%] bg-slate-50 p-6 md:p-8 flex flex-col items-center justify-center">
                                <div className="mb-6 w-full text-center">
                                    <div className="inline-block px-4 py-1.5 border border-emerald-400 rounded-full text-emerald-600 font-semibold text-sm shadow-sm bg-emerald-50 max-w-full truncate text-center">
                                        {treat.intervention || 'Treatment Technique'}
                                    </div>
                                </div>
                                
                                {treat.videoUrl ? (
                                    <a 
                                        href={treat.videoUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="group relative w-full aspect-video rounded-xl overflow-hidden shadow-md border-4 border-white cursor-pointer bg-black/5 flex items-center justify-center"
                                    >
                                        {getYouTubeThumbnail(treat.videoUrl) ? (
                                            <img 
                                                src={getYouTubeThumbnail(treat.videoUrl)} 
                                                alt="Video thumbnail" 
                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                                                <span className="text-slate-400 font-medium">Video Example</span>
                                            </div>
                                        )}
                                        
                                        {/* Red YouTube-style Play Button Overlay */}
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/10 transition-colors group-hover:bg-black/20">
                                            <div className="w-16 h-12 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110">
                                                <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M8 5v14l11-7z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </a>
                                ) : (
                                    <div className="w-full aspect-video rounded-xl bg-slate-200 border-4 border-white flex flex-col items-center justify-center text-slate-400 shadow-sm">
                                        <svg className="w-10 h-10 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                        <span className="text-sm font-medium">No video available</span>
                                    </div>
                                )}
                                <span className="text-xs font-semibold text-slate-400 mt-4 tracking-wider uppercase">Video Demonstration</span>
                            </div>

                        </div>
                    </div>
                ))}
                {treatments.length === 0 && (
                    <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 text-slate-400">
                        No treatments specified for this case.
                    </div>
                )}
            </div>
        </div>
    )
}
