import React from 'react'
import './PhaseEditors.css'

/**
 * CompositeHistoryRunner
 * Unified Subjective History view matching the high-fidelity design.
 * 
 * Props:
 *   step.content - { chief_complaint, key_findings, lifestyle, pain_characteristics, past_history, medication }
 */
export default function CompositeHistoryRunner({ step }) {
  const content = step?.content || {}
  const { 
    chief_complaint, 
    key_findings = [], 
    lifestyle = {}, 
    pain_characteristics = {},
    present_history = {},
    past_history = [],
    medication = []
  } = content

  // Conditional Helpers
  const hasLifestyle = lifestyle.occupational || lifestyle.household
  const hasPain = pain_characteristics.intensity || pain_characteristics.pain_type || pain_characteristics.relief || pain_characteristics.aggravating || pain_characteristics.history_of_pain || pain_characteristics.frequency || pain_characteristics.time_of_day
  const hasPresentHistory = present_history.onset || present_history.course || present_history.duration
  const hasPastHistory = Array.isArray(past_history) && past_history.length > 0
  const hasMedication = Array.isArray(medication) && medication.length > 0

  return (
    <div className="composite-history-runner space-y-8 animate-in fade-in duration-700 pb-12">
      
      {/* 1. ROW 1: Chief Complaint (Always visible if exists) */}
      <div className="bg-white rounded-[24px] p-8 border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-xl font-bold text-slate-800">History of pain</h3>
        </div>
        
        {chief_complaint && (
          <div className="mb-8" dir="rtl">
            <p className="text-xl font-medium text-slate-700 leading-relaxed text-right font-arabic">
              “ {chief_complaint} ”
            </p>
          </div>
        )}

        {/* Key Findings Tags */}
        <div className="flex flex-wrap gap-2">
          {key_findings.map((tag, idx) => (
            <span 
              key={idx} 
              className="px-4 py-1.5 bg-blue-50 text-blue-500 rounded-full text-sm font-bold border border-blue-100 shadow-sm transition-all hover:scale-105"
            >
              {tag}
            </span>
          ))}
          {key_findings.length === 0 && <span className="text-slate-400 italic text-sm">No findings recorded.</span>}
        </div>
      </div>

      {/* 2. DYNAMIC GRID: All other sections flow here as independent col-6 items */}
      <div className="grid grid-cols-1 min-[1090px]:grid-cols-2 gap-8 items-start">
        
        {/* Card: Lifestyle Factors */}
        {hasLifestyle && (
          <div className="bg-white rounded-[24px] p-8 border border-slate-100 shadow-sm space-y-6 flex flex-col h-full">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-bold text-slate-800">Life style factors</h3>
              <div className="flex items-center gap-2">
                 <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-xl shadow-sm border border-slate-100">👩‍💼</div>
                 <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-xl shadow-sm border border-slate-100">🚶‍♀️</div>
              </div>
            </div>
            <div className="space-y-4">
              {lifestyle.occupational && (
                <div>
                  <span className="text-slate-900 font-bold block mb-1">Occupational :</span>
                  <span className="text-slate-600 font-medium">{lifestyle.occupational}</span>
                </div>
              )}
              {lifestyle.household && (
                <div>
                  <span className="text-slate-900 font-bold block mb-1">Household :</span>
                  <span className="text-slate-600 font-medium">{lifestyle.household}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Card: Pain Characteristics */}
        {hasPain && (
          <div className="bg-white rounded-[24px] p-8 border border-slate-100 shadow-sm space-y-6 flex flex-col h-full">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-bold text-slate-800">Pain characteristics</h3>
              <div className="flex items-center gap-2">
                 <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-xl shadow-sm border border-slate-100">🧠</div>
                 <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-xl shadow-sm border border-slate-100">🖐️</div>
              </div>
            </div>
            <div className="space-y-4">
              {pain_characteristics.intensity && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-900 font-bold">Intensity :</span>
                  <span className="text-slate-600 font-bold bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                    {pain_characteristics.intensity}/10
                  </span>
                </div>
              )}
              {pain_characteristics.pain_type && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-900 font-bold">Type :</span>
                  <span className="text-slate-600 font-medium">{pain_characteristics.pain_type}</span>
                </div>
              )}
              {pain_characteristics.history_of_pain && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-900 font-bold">History of Pain :</span>
                  <span className="text-slate-600 font-medium">{pain_characteristics.history_of_pain}</span>
                </div>
              )}
              {pain_characteristics.frequency && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-900 font-bold">Frequency :</span>
                  <span className="text-slate-600 font-medium">{pain_characteristics.frequency}</span>
                </div>
              )}
              {pain_characteristics.time_of_day && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-900 font-bold">Time of Day :</span>
                  <span className="text-slate-600 font-medium">{pain_characteristics.time_of_day}</span>
                </div>
              )}
              {pain_characteristics.relief && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-900 font-bold">Relief :</span>
                  <span className="text-slate-600 font-medium">{pain_characteristics.relief}</span>
                </div>
              )}
              {pain_characteristics.aggravating && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-900 font-bold">Aggravating :</span>
                  <span className="text-slate-600 font-medium line-clamp-1">{pain_characteristics.aggravating}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Card: Present History */}
        {hasPresentHistory && (
          <div className="bg-white rounded-[24px] p-8 border border-slate-100 shadow-sm space-y-6 flex flex-col h-full">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-bold text-slate-800">Present History</h3>
              <div className="flex items-center gap-2">
                 <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-xl shadow-sm border border-slate-100">📅</div>
                 <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-xl shadow-sm border border-slate-100">⏱️</div>
              </div>
            </div>
            <div className="space-y-4">
              {present_history.onset && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-900 font-bold">Onset :</span>
                  <span className="text-slate-600 font-medium">{present_history.onset}</span>
                </div>
              )}
              {present_history.course && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-900 font-bold">Course :</span>
                  <span className="text-slate-600 font-medium">{present_history.course}</span>
                </div>
              )}
              {present_history.duration && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-900 font-bold">Duration :</span>
                  <span className="text-slate-600 font-medium">{present_history.duration}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Card: Past History */}
        {hasPastHistory && (
          <div className="bg-white rounded-[24px] p-8 border border-slate-100 shadow-sm space-y-6 flex flex-col h-full">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-bold text-slate-800">Past History</h3>
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-xl shadow-sm border border-slate-100">📜</div>
            </div>
            <div className="flex flex-col gap-4">
              {past_history.map((item, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-100 transition-hover hover:bg-slate-100/50">
                  <div className="flex justify-between mb-1">
                    <span className="font-bold text-slate-800">{item.condition}</span>
                    <span className="text-sm text-slate-500 font-bold">{item.since}</span>
                  </div>
                  {item.notes && <p className="text-sm text-slate-600 mt-1 whitespace-pre-line leading-relaxed">{item.notes}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Card: Medication */}
        {hasMedication && (
          <div className="bg-white rounded-[24px] p-8 border border-slate-100 shadow-sm space-y-6 flex flex-col h-full">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-bold text-slate-800">Medication</h3>
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-xl shadow-sm border border-slate-100">💊</div>
            </div>
            <div className="flex flex-col gap-4">
              {medication.map((item, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-100 transition-hover hover:bg-slate-100/50">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-slate-800">{item.name}</span>
                    <div className="flex gap-2">
                      {item.dose && <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-slate-100 font-bold text-blue-600 uppercase tracking-tight">{item.dose}</span>}
                      {item.frequency && <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-slate-100 font-bold text-slate-500 uppercase tracking-tight">{item.frequency}</span>}
                    </div>
                  </div>
                  {item.notes && <p className="text-xs text-slate-500 mt-1 italic">“ {item.notes} ”</p>}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
