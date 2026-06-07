import React from 'react'

export default function HistoryStep({ step }) {
  const questions = step.content?.questions || []

  return (
    <div className="history-step">
      <div className="section-title" style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>
        {step.content?.title || 'History of Pain'}
      </div>
      <p className="section-description" style={{ color: 'var(--cf-text-muted)', marginBottom: '32px' }}>
        {step.content?.description || 'Questions you should ask and patient answers'}
      </p>
      <div className="history-questions space-y-4">
        {questions.map((q, index) => (
          <div key={index} className="history-section-box">
             <div className="flex items-start gap-4">
               <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-lg shadow-sm">
                 {q.icon || '❓'}
               </div>
               <div className="flex-1">
                 <div className="history-section-title" style={{ fontSize: '15px', color: 'var(--cf-text-muted)', marginBottom: '4px' }}>Question {index + 1}</div>
                 <div className="history-section-content" style={{ fontSize: '17px', fontWeight: '600', marginBottom: '16px' }}>{q.question}</div>
                 
                 <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Patient Answer</div>
                    <div className="text-slate-800 font-medium">{q.answer}</div>
                 </div>
               </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  )
}
