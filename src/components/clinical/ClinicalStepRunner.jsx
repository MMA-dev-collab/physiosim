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
            if (entries.length === 0) return <p className="text-slate-500 italic">No entries recorded.</p>

            return (
                <ClinicalTable headers={['Location', 'Finding', 'Severity', 'Notes']}>
                    {entries.map((e, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 font-medium text-slate-900">{e.location}</td>
                            <td className="px-4 py-3 text-slate-600">{e.finding}</td>
                            <td className="px-4 py-3">
                                {e.severity && <StatusBadge status={e.severity} />}
                            </td>
                            <td className="px-4 py-3 text-slate-500 italic text-xs max-w-xs truncate">{e.notes}</td>
                        </tr>
                    ))}
                </ClinicalTable>
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

        // MMT
        if (catId === 'mmt') {
            const entries = data.entries || []
            if (entries.length === 0) return <p className="text-slate-500 italic">No MMT entries.</p>
            return (
                <ClinicalTable headers={['Muscle', 'Grade (0-5)', 'Notes']}>
                    {entries.map((e, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 font-medium text-slate-900">{e.muscle}</td>
                            <td className="px-4 py-3 font-bold text-slate-800 text-lg">{e.grade}</td>
                            <td className="px-4 py-3 text-slate-500 italic text-sm">{e.notes}</td>
                        </tr>
                    ))}
                </ClinicalTable>
            )
        }

        // Special Tests & Flexibility
        if (catId === 'special_tests' || catId === 'flexibility_test') {
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
