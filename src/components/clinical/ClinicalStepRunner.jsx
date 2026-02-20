import React from 'react'
import { getCategoriesForPhase } from '../../config/clinicalPhases'
import { ClinicalCard, ClinicalTable, StatusBadge, KeyValueRow, SectionHeader } from './ClinicalComponents'
import './PhaseEditors.css' // Reuse styles but they might be overridden by Tailwind classes

export default function ClinicalStepRunner({ step }) {
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

        // Present History
        if (catId === 'present_history') {
            return (
                <div className="space-y-6">
                    {data.chief_complaint && (
                        <ClinicalCard title="Chief Complaint">
                            <p className="text-slate-800 text-lg leading-relaxed">{data.chief_complaint}</p>
                        </ClinicalCard>
                    )}
                    {data.chief_complaint_arabic && (
                        <ClinicalCard title="شكوى المريض" className="text-right" dir="rtl">
                            <p className="text-slate-800 text-lg leading-relaxed">{data.chief_complaint_arabic}</p>
                        </ClinicalCard>
                    )}
                    {data.notes && (
                        <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 text-amber-900 text-sm">
                            <strong>Notes:</strong> {data.notes}
                        </div>
                    )}
                    {!data.chief_complaint && !data.chief_complaint_arabic && <p className="text-slate-400 italic">No details provided.</p>}
                </div>
            )
        }

        // History of Pain
        if (catId === 'history_of_pain') {
            const pain = data.pain_history || data
            if (Object.keys(pain).length === 0) return <p className="text-slate-500">No pain history recorded.</p>

            return (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <ClinicalCard className="text-center">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Intensity</span>
                            <div className="flex items-baseline justify-center gap-1">
                                <span className={`text-3xl font-bold ${pain.intensity > 7 ? 'text-rose-600' : 'text-slate-800'}`}>
                                    {pain.intensity ?? '-'}
                                </span>
                                <span className="text-slate-400 font-medium">/ 10</span>
                            </div>
                        </ClinicalCard>
                        <ClinicalCard className="text-center">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Frequency</span>
                            <span className="text-lg font-medium text-slate-800 capitalize">{pain.frequency || '-'}</span>
                        </ClinicalCard>
                        <ClinicalCard className="text-center">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Onset</span>
                            <span className="text-lg font-medium text-slate-800 capitalize">{pain.onset?.replace('_', ' ') || '-'}</span>
                        </ClinicalCard>
                        <ClinicalCard className="text-center">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Course</span>
                            <span className="text-lg font-medium text-slate-800 capitalize">{pain.course || '-'}</span>
                        </ClinicalCard>
                    </div>

                    {pain.time_of_day && (
                        <ClinicalCard>
                            <KeyValueRow label="Time of Day" value={pain.time_of_day} />
                        </ClinicalCard>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ClinicalCard title="Aggravating Factors" className="border-l-4 border-l-rose-500">
                            {pain.aggravating_factors && pain.aggravating_factors.length > 0 ? (
                                <ul className="list-disc pl-5 space-y-2 text-slate-700">
                                    {pain.aggravating_factors.map((f, i) => <li key={i}>{f}</li>)}
                                </ul>
                            ) : <p className="text-slate-400 italic text-sm">None recorded</p>}
                        </ClinicalCard>

                        <ClinicalCard title="Relieving Factors" className="border-l-4 border-l-emerald-500">
                            {pain.relieving_factors && pain.relieving_factors.length > 0 ? (
                                <ul className="list-disc pl-5 space-y-2 text-slate-700">
                                    {pain.relieving_factors.map((f, i) => <li key={i}>{f}</li>)}
                                </ul>
                            ) : <p className="text-slate-400 italic text-sm">None recorded</p>}
                        </ClinicalCard>
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

        // Generic fallback
        return <ClinicalCard><pre className="text-xs text-slate-500">{JSON.stringify(data, null, 2)}</pre></ClinicalCard>
    }

    const renderDiagnosis = (data) => {
        const diagnoses = data.diagnoses || []

        // Handle legacy flat format if present
        if (!diagnoses.length && data.condition) {
            return (
                <ClinicalCard className="border-l-4 border-l-purple-500 bg-purple-50/30">
                    <h3 className="text-lg font-bold text-purple-900 mb-2">Primary Diagnosis</h3>
                    <p className="text-lg text-purple-800">{data.condition}</p>
                </ClinicalCard>
            )
        }

        if (diagnoses.length === 0) return <p className="text-slate-500 italic">No diagnosis recorded.</p>

        return (
            <div className="space-y-4">
                {diagnoses.map((d, i) => (
                    <ClinicalCard key={i} className="border-l-4 border-l-purple-500 shadow-md">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">{d.label}</h3>
                                {d.code && <span className="text-xs text-slate-400 font-mono bg-slate-100 px-2 py-1 rounded inline-block mt-1">{d.code}</span>}
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-black text-purple-600 leading-none">{d.confidence}%</div>
                                <div className="text-[10px] uppercase text-purple-400 font-bold tracking-wider mt-1">Confidence</div>
                            </div>
                        </div>

                        {d.supporting_findings && d.supporting_findings.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-slate-100">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-2">Supporting Findings</span>
                                <div className="flex flex-wrap gap-2">
                                    {d.supporting_findings.map((sf, idx) => (
                                        <span key={idx} className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm font-medium border border-purple-100">
                                            + {sf}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {d.notes && <p className="mt-4 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">{d.notes}</p>}
                    </ClinicalCard>
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
            <div className="mb-8">
                <span className="inline-block px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold uppercase tracking-wider mb-2 border border-teal-100">
                    {phase.replace('_', ' ')}
                </span>
                <SectionHeader
                    title={phaseInfo?.label || category?.replace(/_/g, ' ') || 'Clinical Step'}
                    subtitle={phaseInfo?.description}
                />
            </div>

            <div className="min-h-[200px]">
                {renderContent()}
            </div>

            {step.logic && (
                <div className="mt-12 p-6 bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-xl relative overflow-hidden shadow-sm">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <span className="text-8xl">💡</span>
                    </div>
                    <div className="relative z-10">
                        <h4 className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">
                            <span>🧪</span> Clinical Reasoning
                        </h4>
                        <p className="text-indigo-900/80 leading-relaxed text-sm font-medium max-w-2xl">{step.logic.reasoning}</p>
                    </div>
                </div>
            )}
        </div>
    )
}
