import React from 'react'

// --- Primitives ---

export const ClinicalCard = ({ title, children, action, className = '' }) => (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden ${className}`}>
        {(title || action) && (
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                {title && <h3 className="font-semibold text-slate-800 text-lg">{title}</h3>}
                {action && <div>{action}</div>}
            </div>
        )}
        <div className="p-6">
            {children}
        </div>
    </div>
)

export const ClinicalTable = ({ headers, children }) => (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-xs font-semibold">
                <tr>
                    {headers.map((h, i) => (
                        <th key={i} className="px-4 py-3 border-b border-slate-200">{h}</th>
                    ))}
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
                {children}
            </tbody>
        </table>
    </div>
)

export const StatusBadge = ({ status, type = 'neutral' }) => {
    const styles = {
        neutral: 'bg-slate-100 text-slate-600',
        success: 'bg-emerald-50 text-emerald-700 border border-emerald-100', // For normal/negative results
        warning: 'bg-amber-50 text-amber-700 border border-amber-100', // For mild/moderate
        danger: 'bg-rose-50 text-rose-700 border border-rose-100', // For abnormal/positive/severe
        info: 'bg-sky-50 text-sky-700 border border-sky-100'
    }

    // Auto-detect type if not provided based on common keywords
    let finalType = type
    if (type === 'neutral' && status) {
        const s = status.toString().toLowerCase()
        if (s.includes('positive') || s === 'high' || s.includes('severe')) finalType = 'danger'
        if (s.includes('moderate')) finalType = 'warning'
        if (s.includes('negative') || s === 'normal' || s === 'low') finalType = 'success'
    }

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${styles[finalType]}`}>
            {status}
        </span>
    )
}

export const KeyValueRow = ({ label, value, subtext }) => (
    <div className="flex justify-between items-start py-2 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors px-2 rounded">
        <div className="text-sm font-medium text-slate-500">{label}</div>
        <div className="text-sm text-slate-800 text-right font-medium">
            {value}
            {subtext && <div className="text-xs text-slate-400 font-normal mt-0.5">{subtext}</div>}
        </div>
    </div>
)

export const SectionHeader = ({ icon, title, subtitle }) => (
    <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            {icon && <span className="text-2xl">{icon}</span>}
            {title}
        </h2>
        {subtitle && <p className="text-slate-500 mt-1 text-sm">{subtitle}</p>}
    </div>
)
