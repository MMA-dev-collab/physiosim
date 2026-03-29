import React from 'react'
import { getCategoriesForPhase } from '../../config/clinicalPhases'
import { ClinicalCard, ClinicalTable, StatusBadge, KeyValueRow, SectionHeader } from './ClinicalComponents'
import CompositeAssessmentRunner from './CompositeAssessmentRunner'
import CompositeHistoryRunner from './CompositeHistoryRunner'
import './PhaseEditors.css'

export default function ClinicalStepRunner({ step, hideHeader = false }) {
    const { phase, category, content } = step

    // Helper to render specific content types
    const renderContent = () => {
        switch (phase) {
            case 'history_presentation':
                return renderHistory(category, content)
            case 'assessment':
                return renderAssessment(category, content)
            case 'diagnosis':
                return renderDiagnosis(content)
            case 'problem_list':
                return renderProblemList(content)
            case 'treatment':
            case 'treatment_plan': // Handle legacy
                return renderTreatment(content)
            default:
                return (
                    <ClinicalCard title="Unknown Phase" className="border-red-200 bg-red-50">
                        <p className="text-red-600">Unknown clinical phase: {phase}</p>
                    </ClinicalCard>
                )
        }
    }

    const renderHistory = (catId, data) => {
        if (!data) return <p className="text-slate-500 italic p-4">No history data recorded.</p>

        if (catId === 'composite_history') {
            return <CompositeHistoryRunner step={{ content: data }} />
        }

        // Present History
        if (catId === 'present_history') {
            return (
                <div className="space-y-6">
                    {(data.chief_complaint || data.chief_complaint_arabic) && (
                        <div className="history-section-box">
                            <div className="history-section-title">Chief Complaint</div>
                            <div className="history-section-content" style={{ fontSize: '18px', fontWeight: '500' }}>
                                {data.chief_complaint}
                            </div>
                            {data.chief_complaint_arabic && (
                                <div className="history-section-content mt-4 text-right" dir="rtl" style={{ fontSize: '20px', fontFamily: 'inherit' }}>
                                    {data.chief_complaint_arabic}
                                </div>
                            )}
                        </div>
                    )}
                    {data.notes && (
                        <div className="history-section-box" style={{ background: '#fffbeb', borderColor: '#fef3c7' }}>
                            <div className="history-section-title" style={{ color: '#92400e' }}>Notes</div>
                            <div className="history-section-content" style={{ color: '#92400e' }}>{data.notes}</div>
                        </div>
                    )}
                </div>
            )
        }

        // History of Pain
        if (catId === 'history_of_pain') {
            const pain = data.pain_history || data
            if (Object.keys(pain).length === 0) return <p className="text-slate-500">No pain history recorded.</p>

            return (
                <div className="space-y-8">
                    <div className="history-cards-grid">
                        <div className="history-card">
                            <span className="history-card-label">Intensity</span>
                            <div className="flex items-baseline gap-1">
                                <span className="history-card-value" style={{ color: pain.intensity > 7 ? 'var(--cf-danger)' : 'var(--cf-primary)' }}>
                                    {pain.intensity ?? '-'}
                                </span>
                                <span className="text-slate-400 font-medium">/ 10</span>
                            </div>
                        </div>
                        <div className="history-card">
                            <span className="history-card-label">Frequency</span>
                            <span className="history-card-value text-slate-800">{pain.frequency || '-'}</span>
                        </div>
                        <div className="history-card">
                            <span className="history-card-label">Onset</span>
                            <span className="history-card-value text-slate-800">{pain.onset?.replace('_', ' ') || '-'}</span>
                        </div>
                        <div className="history-card">
                            <span className="history-card-label">Course</span>
                            <span className="history-card-value text-slate-800">{pain.course || '-'}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="history-section-box" style={{ borderLeft: '4px solid var(--cf-danger)' }}>
                            <div className="history-section-title">Aggravating Factors</div>
                            {pain.aggravating_factors && pain.aggravating_factors.length > 0 ? (
                                <ul className="list-disc pl-5 space-y-2 text-slate-700">
                                    {pain.aggravating_factors.map((f, i) => <li key={i}>{f}</li>)}
                                </ul>
                            ) : <p className="text-slate-400 italic text-sm">None recorded</p>}
                        </div>

                        <div className="history-section-box" style={{ borderLeft: '4px solid var(--cf-success)' }}>
                            <div className="history-section-title">Relieving Factors</div>
                            {pain.relieving_factors && pain.relieving_factors.length > 0 ? (
                                <ul className="list-disc pl-5 space-y-2 text-slate-700">
                                    {pain.relieving_factors.map((f, i) => <li key={i}>{f}</li>)}
                                </ul>
                            ) : <p className="text-slate-400 italic text-sm">None recorded</p>}
                        </div>
                    </div>
                </div>
            )
        }

        // Past History
        if (catId === 'past_history') {
            const conditions = data.conditions || []
            if (conditions.length === 0) return <p className="text-slate-500 italic">No past history recorded.</p>
            return (
                <div className="space-y-4">
                    {conditions.map((c, i) => (
                        <ClinicalCard key={i} className="border-l-4 border-l-indigo-500">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-slate-800 text-lg">{c.condition}</h4>
                                {c.since && <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded uppercase tracking-wide">Since: {c.since}</span>}
                            </div>
                            {c.notes && <p className="text-slate-600 text-sm leading-relaxed">{c.notes}</p>}
                        </ClinicalCard>
                    ))}
                </div>
            )
        }

        // Medication
        if (catId === 'medication') {
            const meds = data.medications || []
            if (meds.length === 0) return <p className="text-slate-500 italic">No medications recorded.</p>
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {meds.map((m, i) => (
                        <ClinicalCard key={i}>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl">💊</div>
                                <div>
                                    <div className="font-bold text-slate-900">{m.name}</div>
                                    <div className="text-xs text-slate-500 uppercase font-semibold">{m.dose} • {m.frequency}</div>
                                </div>
                            </div>
                            {m.notes && <div className="text-sm text-slate-600 border-t border-slate-100 pt-2 mt-2">{m.notes}</div>}
                        </ClinicalCard>
                    ))}
                </div>
            )
        }

        // Fallback for flat items (Legacy support)
        if (data.items && Array.isArray(data.items)) {
            return (
                <div className="space-y-4">
                    {data.items.map((item, i) => (
                        <ClinicalCard key={i}>
                            <h4 className="font-bold text-slate-900 mb-2">{item.question}</h4>
                            <p className="text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">{item.answer}</p>
                        </ClinicalCard>
                    ))}
                </div>
            )
        }

        return <p className="text-slate-400">No structured data for {catId}</p>
    }

    const renderAssessment = (catId, data) => {
        if (!data || Object.keys(data).length === 0) return <p className="text-slate-500 italic">No assessment data.</p>

        // Observations
        if (catId?.startsWith('observation_')) {
            const findings = data.findings || []
            return (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {data.image_url && (
                            <div className="lg:col-span-1">
                                <img src={data.image_url} alt="Observation" className="w-full rounded-lg shadow-md border border-slate-200" />
                            </div>
                        )}
                        <div className={data.image_url ? 'lg:col-span-2' : 'col-span-full'}>
                            <ClinicalCard title="Key Findings">
                                {findings.length > 0 ? (
                                    <ul className="space-y-3">
                                        {findings.map((f, i) => (
                                            <li key={i} className="flex items-start gap-2 text-slate-700">
                                                <span className="text-teal-500 mt-1">•</span>
                                                {f}
                                            </li>
                                        ))}
                                    </ul>
                                ) : <p className="text-slate-400 italic">No specific findings listed.</p>}
                            </ClinicalCard>
                        </div>
                    </div>
                    {data.notes && (
                        <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 text-amber-900 text-sm">
                            <strong>Global Notes:</strong> {data.notes}
                        </div>
                    )}
                </div>
            )
        }

        // Palpation
        if (catId?.startsWith('palpation_')) {
            const entries = data.entries || []
            const hasImage = !!data.image_url
            const statusOptions = data.status_options || []

            const getStatusLabel = (val) => {
                const opt = statusOptions.find(o => o.value === val)
                return opt ? opt.label : val
            }

            const getStatusBadgeClass = (val) => {
                const opt = statusOptions.find(o => o.value === val)
                if (!opt) return 'bg-slate-100 text-slate-600'
                
                switch (opt.type) {
                    case 'normal': return 'bg-emerald-100 text-emerald-700'
                    case 'mid': return 'bg-amber-100 text-amber-700'
                    case 'extreme': return 'bg-rose-100 text-rose-700'
                    default: return 'bg-slate-100 text-slate-600'
                }
            }

            return (
                <div className="car-palpation mb-8">
                    <div className={`flex flex-col ${hasImage ? 'lg:flex-row' : ''} gap-8 items-start px-2`}>
                        {hasImage && (
                            <div className="w-full lg:w-1/2 shrink-0">
                                <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-sm">
                                    <img src={data.image_url} alt="Palpation Reference" className="w-full h-auto object-cover" />
                                </div>
                            </div>
                        )}

                        <div className="flex-1 w-full overflow-x-auto">
                            {entries.length > 0 ? (
                                (() => {
                                    const hasAnyNotes = entries.some(e => e.notes && e.notes.trim() !== '');
                                    return (
                                        <table className="w-full text-left border-separate border-spacing-y-2">
                                            <thead>
                                                <tr>
                                                    <th className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest w-px whitespace-nowrap">Level</th>
                                                    <th className={`px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ${hasAnyNotes ? 'text-center' : 'text-right'}`}>
                                                        {data.status_title || 'Status'}
                                                    </th>
                                                    {hasAnyNotes && (
                                                        <th className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[30%] text-right font-inter">Notes</th>
                                                    )}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {entries.map((entry, i) => (
                                                    <tr key={i} className="bg-white border border-slate-100 shadow-sm rounded-xl">
                                                        <td className="px-4 py-4 first:rounded-l-xl border-y border-l border-slate-100 align-middle w-px whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-[13px] font-black text-indigo-600 border border-indigo-100 shadow-sm">
                                                                    {entry.level || '-'}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className={`px-6 py-4 border-y border-slate-100 align-middle ${hasAnyNotes ? 'text-center' : 'text-right'}`}>
                                                            <span className={`px-5 py-2 rounded-full text-[13px] font-black uppercase tracking-wider shadow-sm inline-block ${getStatusBadgeClass(entry.status_value)}`}>
                                                                {getStatusLabel(entry.status_value)}
                                                            </span>
                                                        </td>
                                                        {hasAnyNotes && (
                                                            <td className="px-4 py-4 border-y border-r border-slate-100 text-[11px] text-slate-500 italic last:rounded-r-xl align-middle text-right font-inter">
                                                                <div className="max-w-[180px] ml-auto truncate font-medium">
                                                                    {entry.notes || '-'}
                                                                </div>
                                                            </td>
                                                        )}
                                                        {!hasAnyNotes && (
                                                            <td className="border-y border-r border-slate-100 last:rounded-r-xl w-1"></td>
                                                        )}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    );
                                })()
                            ) : (
                                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 font-medium font-inter">
                                    No entries recorded.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )
        }

        // ROM
        if (catId?.startsWith('rom_')) {
            const entries = data.entries || []
            if (entries.length === 0) return <p className="text-slate-500 italic">No ROM entries.</p>
            const headers = ['Movement', 'Value', 'Pain', ...(catId.includes('prom') ? ['End Feel'] : []), 'Notes']

            return (
                <ClinicalTable headers={headers}>
                    {entries.map((e, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 font-medium text-slate-900">{e.movement}</td>
                            <td className="px-4 py-3 font-bold text-slate-800">{e.value}</td>
                            <td className="px-4 py-3">
                                {e.pain ?
                                    <StatusBadge status="Yes" type="danger" /> :
                                    <span className="text-slate-400 text-xs">No</span>
                                }
                            </td>
                            {catId.includes('prom') && (
                                <td className="px-4 py-3 capitalize text-slate-600">{e.end_feel?.replace('_', ' ') || '-'}</td>
                            )}
                            <td className="px-4 py-3 text-slate-500 italic text-xs max-w-xs truncate">{e.notes}</td>
                        </tr>
                    ))}
                </ClinicalTable>
            )
        }

        // MMT (Manual Muscle Test)
        if (catId === 'mmt') {
            const entries = data.entries || []
            if (entries.length === 0) return <p className="text-slate-500 italic px-2">No MMT entries recorded.</p>

            const getGradeWindow = (grade) => {
                const g = parseInt(grade)
                if (isNaN(g)) return [3, 4, 5]
                if (g <= 1) return [0, 1, 2]
                if (g >= 4) return [3, 4, 5]
                return [g - 1, g, g + 1]
            }

            const getStatusColor = (status) => {
                if (!status) return '#cbd5e1'
                const s = status.toLowerCase()
                if (s.includes('normal')) return '#22c55e'
                if (s.includes('slight')) return '#f59e0b'
                if (s.includes('weak')) return '#ef4444'
                return '#cbd5e1'
            }

            return (
                <div className=" car-mmt px-2 mb-8">
                    <h3 className="text-xl font-black text-slate-800 mb-6">Motor Examination - Myotomes:</h3>
                    <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Level</th>
                                    <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Muscle action</th>
                                    <th className="px-6 py-4 text-center text-xs font-black text-slate-500 uppercase tracking-widest">Grade ( 0-5 )</th>
                                    <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {entries.map((entry, i) => {
                                    const gradeWindow = getGradeWindow(entry.grade)
                                    const statusColor = getStatusColor(entry.status)
                                    
                                    return (
                                        <tr key={i} className="hover:bg-slate-50/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center justify-center min-w-[40px] px-3 py-1 bg-blue-50 text-blue-600 font-bold rounded-full text-xs">
                                                    {entry.level || '-'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-bold text-slate-700">{entry.muscle_action || entry.muscle || '-'}</div>
                                                {entry.notes && <div className="text-[10px] text-slate-400 italic mt-0.5">{entry.notes}</div>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    {gradeWindow.map(g => {
                                                        const isSelected = String(g) === String(entry.grade)
                                                        return (
                                                            <div 
                                                                key={g}
                                                                className={`w-7 h-7 flex items-center justify-center rounded-md text-xs font-bold transition-all ${
                                                                    isSelected 
                                                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-200 scale-110' 
                                                                        : 'bg-white border border-slate-200 text-slate-400'
                                                                }`}
                                                            >
                                                                {g}
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div 
                                                        className="w-2.5 h-2.5 rounded-full" 
                                                        style={{ backgroundColor: statusColor }}
                                                    />
                                                    <span className="text-sm font-bold text-slate-600">{entry.status || 'N/A'}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )
        }

        // Sensory Examination
        if (catId === 'sensory_exam') {
            const entries = data.entries || []
            if (entries.length === 0) return <p className="text-slate-500 italic px-2">No sensory entries recorded.</p>

            return (
                <div className="car-sensory px-2 mb-8">
                    <h3 className="text-xl font-black text-slate-800 mb-6">Sensory Examination - Dermatomes:</h3>
                    <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Level</th>
                                    <th className="px-6 py-4 text-right text-xs font-black text-slate-500 uppercase tracking-widest">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {entries.map((entry, i) => {
                                    const isAbnormal = entry.status?.toLowerCase().includes('abnormal')
                                    return (
                                        <tr key={i} className="hover:bg-slate-50/30 transition-colors">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <span className="inline-flex items-center justify-center min-w-[44px] px-3 py-1 bg-blue-50 text-blue-600 font-bold rounded-full text-[13px]">
                                                        {entry.level || '-'}
                                                    </span>
                                                    <span className="text-sm font-bold text-slate-600">
                                                        {entry.sense ? `(${entry.sense})` : ''}
                                                    </span>
                                                </div>
                                                {entry.notes && <div className="text-[10px] text-slate-400 italic mt-1 ml-[56px]">{entry.notes}</div>}
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[13px] font-bold ${
                                                    isAbnormal 
                                                        ? 'bg-red-50 text-red-600 border border-red-100 shadow-sm' 
                                                        : 'bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm'
                                                }`}>
                                                    {entry.status || 'N/A'}
                                                </span>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )
        }

        // Cervical Curve Assessment
        if (catId === 'cervical_curve') {
            const options = data.options || []
            const selectedId = data.selected_option_id

            const getDefaultImage = (title) => {
                const t = title?.toLowerCase() || ''
                if (t.includes('flattened')) return '/img/clinical/flattened.png'
                if (t.includes('normal')) return '/img/clinical/normal_lordosis.png'
                if (t.includes('reversed')) return '/img/clinical/reversed_curve.png'
                return null
            }

            return (
                <div className="car-cervical mt-4 px-2 mb-10 max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
                        {options.map((opt, i) => {
                            const isSelected = opt.id === selectedId
                            const displayImage = opt.image_url || getDefaultImage(opt.title)

                            return (
                                <div 
                                    key={i} 
                                    className={`flex flex-col items-center transition-all duration-500 rounded-3xl p-5 border-2 ${
                                        isSelected 
                                            ? 'bg-blue-50/50 border-blue-500 scale-105 shadow-xl shadow-blue-100 z-10' 
                                            : 'border-slate-100 opacity-50 scale-[0.85]'
                                    }`}
                                >
                                    {/* Header */}
                                    <h4 className={`text-lg font-black uppercase tracking-tight mb-8 text-center min-h-[56px] flex items-center justify-center ${
                                        isSelected ? 'text-blue-600' : 'text-slate-400'
                                    }`}>
                                        {opt.title}
                                    </h4>

                                    {/* Image Container */}
                                    <div className={`w-full aspect-square bg-white rounded-[2rem] overflow-hidden border mb-8 flex items-center justify-center p-6 transition-all duration-500 ${
                                        isSelected ? 'border-blue-200 shadow-inner' : 'border-slate-100'
                                    }`}>
                                        {displayImage ? (
                                            <img 
                                                src={displayImage} 
                                                alt={opt.title} 
                                                className="max-w-full max-h-full object-contain"
                                            />
                                        ) : (
                                            <div className="text-slate-200">
                                                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                                    <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>

                                    {/* Status Footer */}
                                    <div className="mt-auto pt-2 text-center">
                                        <p className={`text-[13px] font-black uppercase tracking-widest leading-relaxed ${
                                            isSelected ? 'text-red-500' : 'text-slate-400'
                                        }`}>
                                            {isSelected ? (opt.selected_footer_text || 'Detected in this patient') : (opt.footer_text || 'Not present')}
                                        </p>
                                        {isSelected && (
                                            <div className="mt-3 h-1.5 w-12 bg-red-500 mx-auto rounded-full shadow-sm shadow-red-200"></div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )
        }

        // Special Tests
        if (catId === 'special_tests') {
            const entries = data.entries || []
            if (entries.length === 0) return <p className="text-slate-500 italic">No tests found.</p>

            const getResultClass = (result) => {
                if (!result) return 'bg-slate-100 text-slate-500'
                const r = result.toLowerCase()
                if (r.includes('positive') || r === 'pos' || r === '+') return 'bg-rose-50 text-rose-600 border border-rose-100'
                if (r.includes('negative') || r === 'neg' || r === '-') return 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                return 'bg-blue-50 text-blue-600 border border-blue-100'
            }

            return (
                <div className="car-special mb-8">
                    <h3 className="text-xl font-black text-slate-800 mb-6 px-2">Special Tests:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-2">
                        {entries.map((e, i) => (
                            <div key={i} className="bg-white rounded-[1.5rem] border border-slate-200 p-6 flex flex-col items-center gap-4 transition-all hover:shadow-lg hover:border-blue-200" style={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)' }}>
                                <div className="w-full text-left">
                                    <h4 className="font-bold text-slate-700 text-lg leading-tight">
                                        {i + 1}. {e.test_name}
                                    </h4>
                                </div>

                                <div className="w-full aspect-video bg-slate-50 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-100 shadow-inner group relative">
                                    {e.image_url ? (
                                        <img
                                            src={e.image_url}
                                            alt={e.test_name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="text-slate-300 flex flex-col items-center">
                                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                                <circle cx="8.5" cy="8.5" r="1.5" />
                                                <polyline points="21 15 16 10 5 21" />
                                            </svg>
                                            <span className="text-[10px] font-bold uppercase tracking-widest mt-2">No Image</span>
                                        </div>
                                    )}

                                    {e.result && (
                                        <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${getResultClass(e.result)}`}>
                                            {e.result}
                                        </div>
                                    )}
                                </div>

                                {e.link && (
                                    <a
                                        href={e.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            border: "2px solid #F14722",
                                            boxShadow: "0px 2px 0px #F14722",
                                            borderRadius: "10px",
                                        }}
                                        className="mt-2 flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-slate-800 font-bold text-sm transition-all hover:bg-rose-50 hover:scale-105"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 256 180" xmlns="http://www.w3.org/2000/svg">
                                            <path fill="red" d="M250.346 28.075A32.18 32.18 0 0 0 227.69 5.418C207.824 0 127.87 0 127.87 0S47.912.164 28.046 5.582A32.18 32.18 0 0 0 5.39 28.24c-6.009 35.298-8.34 89.084.165 122.97a32.18 32.18 0 0 0 22.656 22.657c19.866 5.418 99.822 5.418 99.822 5.418s79.955 0 99.82-5.418a32.18 32.18 0 0 0 22.657-22.657c6.338-35.348 8.291-89.1-.164-123.134Z" />
                                            <path fill="#FFF" d="m102.421 128.06 66.328-38.418-66.328-38.418z" />
                                        </svg>
                                        View
                                    </a>
                                )}

                                {e.notes && (
                                    <p className="w-full text-center text-xs text-slate-400 italic mt-auto pt-2 border-t border-slate-50">
                                        {e.notes}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )
        }

        // Flexibility Test
        if (catId === 'flexibility_test') {
            const entries = data.entries || []
            if (entries.length === 0) return <p className="text-slate-500 italic">No tests found.</p>
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {entries.map((e, i) => (
                        <ClinicalCard key={i} className={e.result?.includes('positive') ? 'border-rose-100 bg-rose-50/30' : ''}>
                            <div className="flex justify-between items-start mb-2">
                                <h5 className="font-bold text-slate-800">{e.test_name}</h5>
                                <StatusBadge status={e.result || 'Pending'} />
                            </div>
                            {e.notes && <p className="text-sm text-slate-600 mb-3">{e.notes}</p>}
                            {e.link && (
                                <a href={e.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-xs font-bold text-teal-600 hover:text-teal-700 uppercase tracking-wide">
                                    Reference ↗
                                </a>
                            )}
                        </ClinicalCard>
                    ))}
                </div>
            )
        }

        // Investigations
        if (catId === 'investigations') {
            const entries = data.entries || []
            if (entries.length === 0) return <p className="text-slate-500 italic">No investigations found.</p>
            return (
                <div className="space-y-6">
                    {entries.map((e, i) => (
                        <ClinicalCard key={i} className="overflow-hidden p-0">
                            <div className="bg-slate-50 px-6 py-3 border-b border-slate-100 flex justify-between items-center">
                                <span className="font-bold text-slate-700 capitalize flex items-center gap-2">
                                    <span>📷</span> {e.modality || 'Imaging'}
                                </span>
                            </div>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                {e.image_url ? (
                                    <div className="bg-black/5 rounded-lg overflow-hidden border border-black/10 flex items-center justify-center">
                                        <img src={e.image_url} alt={e.modality} className="max-h-64 object-contain" />
                                    </div>
                                ) : (
                                    <div className="bg-slate-50 flex items-center justify-center rounded-lg h-40 text-slate-400 text-sm border-2 border-dashed border-slate-200">
                                        No Image Available
                                    </div>
                                )}
                                <div className="space-y-4">
                                    {e.report_text && (
                                        <div>
                                            <h6 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Report</h6>
                                            <p className="text-sm text-slate-800 whitespace-pre-line leading-relaxed">{e.report_text}</p>
                                        </div>
                                    )}
                                    {e.conclusion && (
                                        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                                            <h6 className="text-xs font-bold text-indigo-800 uppercase tracking-wide mb-1">Conclusion</h6>
                                            <p className="text-sm text-indigo-900 font-medium">{e.conclusion}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </ClinicalCard>
                    ))}
                </div>
            )
        }

        // Composite / Multi-section support
        if (data.sections && Array.isArray(data.sections)) {
            return <CompositeAssessmentRunner step={{ content: data }} />
        }

        // Generic fallback
        return (
            <div className="car-section-box p-6 bg-slate-50 border border-slate-200 rounded-xl">
                 <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Raw Data (Fallback)</div>
                 <pre className="text-[11px] text-slate-500 overflow-auto max-h-96">
                    {JSON.stringify(data, null, 2)}
                 </pre>
            </div>
        )
    }

    const renderDiagnosis = (data) => {
        const diagnoses = data.diagnoses || []

        if (diagnoses.length === 0) return <p className="text-slate-500 italic">No diagnosis recorded.</p>

        return (
            <div className="space-y-6">
                {diagnoses.map((d, i) => (
                    <div key={i} className="history-section-box p-0 overflow-hidden" style={{ borderLeft: '6px solid var(--cf-primary)' }}>
                        <div className="px-8 py-6 flex justify-between items-start">
                            <div className="space-y-2">
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Diagnosis {i + 1}</div>
                                <h3 className="text-2xl font-black text-slate-900">{d.label}</h3>
                                {d.code && <span className="text-xs text-slate-400 font-mono bg-slate-100 px-2 py-1 rounded inline-block">{d.code}</span>}
                            </div>
                            <div className="text-center bg-slate-50 p-4 rounded-2xl border border-slate-100 min-w-[100px]">
                                <div className="text-3xl font-black text-primary leading-none" style={{ color: 'var(--cf-primary)' }}>{d.confidence}%</div>
                                <div className="text-[10px] uppercase text-slate-400 font-bold tracking-wider mt-1">Confidence</div>
                            </div>
                        </div>

                        {d.supporting_findings && d.supporting_findings.length > 0 && (
                            <div className="px-8 py-4 bg-slate-50 border-t border-slate-100">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-3">Supporting Findings</span>
                                <div className="flex flex-wrap gap-2">
                                    {d.supporting_findings.map((sf, idx) => (
                                        <span key={idx} className="bg-white text-slate-700 px-4 py-1.5 rounded-full text-xs font-bold border border-slate-200 shadow-sm">
                                            + {sf}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {d.notes && (
                            <div className="px-8 py-4 border-t border-slate-100">
                                <p className="text-sm text-slate-500 italic leading-relaxed">{d.notes}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        )
    }

    const renderProblemList = (data) => {
        const problems = data.problems || []
        if (problems.length === 0) return <p className="text-slate-600 italic">No problems listed.</p>

        return (
            <div className="space-y-3">
                {problems.map((prob, i) => (
                    <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                            <span className="font-bold text-slate-800 text-lg block">{prob.label}</span>
                            {prob.functional_impact && <span className="text-sm text-slate-500 block mt-1">Impact: {prob.functional_impact}</span>}
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <div className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Severity</div>
                                <div className="font-bold text-slate-800">{prob.severity}/5</div>
                            </div>
                            <StatusBadge status={prob.priority || 'Medium'} />
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    const renderTreatment = (data) => {
        const treatments = data.treatments || []
        if (treatments.length === 0) return <p className="text-slate-500 italic">No treatment plan.</p>

        return (
            <ClinicalTable headers={['Problem', 'Intervention', 'Expected Benefit']}>
                {treatments.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-4 align-top font-medium text-slate-900 w-1/4">{row.problem_label}</td>
                        <td className="px-4 py-4 align-top text-slate-600">
                            <div className="font-semibold text-slate-800 mb-1">{row.intervention}</div>
                            {row.links && row.links.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {row.links.map((link, lIdx) => (
                                        <a key={lIdx} href={link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-white bg-teal-500 hover:bg-teal-600 px-2 py-1 rounded transition-colors">
                                            Link {lIdx + 1} ↗
                                        </a>
                                    ))}
                                </div>
                            )}
                        </td>
                        <td className="px-4 py-4 align-top text-slate-600">{row.benefit}</td>
                    </tr>
                ))}
            </ClinicalTable>
        )
    }

    // Get Phase Label
    const phaseInfo = getCategoriesForPhase(phase).find(c => c.id === category)

    return (
        <div className="w-full">
            {!hideHeader && (
                <div className="mb-8">
                    <span className="inline-block px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold uppercase tracking-wider mb-2 border border-teal-100">
                        {phase.replace('_', ' ')}
                    </span>
                    <SectionHeader
                        title={phaseInfo?.label || category?.replace(/_/g, ' ') || 'Clinical Step'}
                        subtitle={phaseInfo?.description}
                    />
                </div>
            )}

            <div className="min-h-[200px]">
                {renderContent()}
            </div>

        </div>
    )
}
