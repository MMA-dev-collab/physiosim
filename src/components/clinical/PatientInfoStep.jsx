import React from 'react'
import ImageWithWatermark from '@/components/common/ImageWithWatermark'

export default function PatientInfoStep({ content, watermarkEnabled = false }) {
  if (!content) return null
  return (
    <div className="flex flex-col lg:flex-row gap-8 items-stretch justify-center mx-auto mt-4 px-4 h-full min-h-[500px] w-full max-w-[1200px]">
      {/* Left: Patient Card */}
      <div className="w-full lg:w-[40%] shrink-0 bg-white border border-slate-200 rounded-2xl p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col gap-6">
        <div>
          <h3 className="text-[#1e293b] font-bold uppercase tracking-widest text-sm mb-6">Patient Card</h3>
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-slate-100 shadow-sm overflow-hidden shrink-0 flex items-center justify-center">
               {content.patientImageUrl || content.imageUrl ? (
                  <ImageWithWatermark src={content.patientImageUrl || content.imageUrl} alt="Avatar" className="w-full h-full object-cover" watermarkEnabled={watermarkEnabled} wrapperClassName="w-full h-full" />
               ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-xl">
                    {(content.patientName || 'P').charAt(0).toUpperCase()}
                  </div>
               )}
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[#1e293b] font-semibold text-lg leading-none">{content.patientName || 'Patient'}</span>
              <span className="text-slate-600 font-medium text-[15px] leading-none">
                {content.gender}{content.gender && content.age ? ', ' : ''}{content.age ? `${content.age} years old` : ''}
              </span>
            </div>
          </div>
        </div>

        {content.chiefComplaint && (
          <div className="mt-4">
            <h3 className="text-[#1e293b] font-bold uppercase tracking-widest text-sm mb-4">Chief Complaint</h3>
            <div className="border border-slate-200 rounded-xl p-6 bg-white text-right text-slate-800 text-[19px] leading-relaxed shadow-sm font-semibold" dir="rtl">
              {content.chiefComplaint}
            </div>
          </div>
        )}
      </div>

      {/* Right: Main Image */}
      <div className="w-full lg:w-[60%] flex shrink-0 rounded-2xl overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-200 bg-white min-h-[400px]">
         {content.illustrationUrl || content.imageUrl ? (
            <ImageWithWatermark src={content.illustrationUrl || content.imageUrl} alt="Case Illustration" className="w-full h-full object-cover" watermarkEnabled={watermarkEnabled} wrapperClassName="w-full h-full" />
         ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-400 font-medium">
               Image / Diagram
            </div>
         )}
      </div>
    </div>
  )
}
