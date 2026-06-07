import React from 'react'
import PatientInfoStep from './PatientInfoStep'
import HistoryStep from './HistoryStep'
import McqStep from './McqStep'
import EssayStep from './EssayStep'
import DiagnosisStep from './DiagnosisStep'
import ProblemListStep from './ProblemListStep'
import TreatmentPlanStep from './TreatmentPlanStep'
import InvestigationsStep from './InvestigationsStep'
import ClinicalStepRunner from './ClinicalStepRunner'
import CompositeAssessmentRunner from './CompositeAssessmentRunner'
import SessionStructureRunner from './SessionStructureRunner'
import { usePreview } from '../../context/PreviewContext'

export default function StepRenderer({
  step,
  caseData,
  hideHeader = false,
  
  // MCQ props
  selectedOption,
  feedback,
  isCorrect,
  onAnswer,
  
  // Essay props
  essayAnswer,
  setEssayAnswer,
  essayFeedback,
  essayScore,
  onSubmit,
  
  // Handlers
  onDiagnosisSubmit,
  onProblemListSubmit,
  onSessionStructureSubmit,
  
  // Initial Value
  stepInitialData,
  isReviewMode
}) {
  const preview = usePreview()
  const mode = preview?.mode || 'production'
  const isPreview = mode !== 'production'

  if (!step) return null

  // Determine actual isReviewMode
  const currentIsReviewMode = isReviewMode || mode === 'preview-review' || (isPreview && preview.isCompleted)

  switch (step.type) {
    case 'info':
      return <PatientInfoStep content={step.content} watermarkEnabled={!!caseData?.watermarkEnabled} />
      
    case 'history':
      return <HistoryStep step={step} />
      
    case 'mcq':
      return (
        <McqStep
          step={step}
          selectedOption={selectedOption}
          feedback={feedback}
          isCorrect={isCorrect}
          onAnswer={onAnswer}
          isReviewMode={currentIsReviewMode}
        />
      )
      
    case 'essay':
      return (
        <EssayStep
          step={step}
          essayAnswer={essayAnswer}
          setEssayAnswer={setEssayAnswer}
          essayFeedback={essayFeedback}
          essayScore={essayScore}
          isReviewMode={currentIsReviewMode}
          onSubmit={onSubmit}
        />
      )
      
    case 'diagnosis':
      return (
        <DiagnosisStep
          step={step}
          essayFeedback={essayFeedback}
          essayScore={essayScore}
          isReviewMode={currentIsReviewMode}
          initialValue={stepInitialData}
          onSubmit={onDiagnosisSubmit}
        />
      )
      
    case 'problem_list':
      return (
        <ProblemListStep
          key={step.id}
          step={step}
          essayFeedback={essayFeedback}
          essayScore={essayScore}
          isReviewMode={currentIsReviewMode}
          initialValue={stepInitialData}
          onSubmit={onProblemListSubmit}
        />
      )
      
    case 'treatment':
      return <TreatmentPlanStep step={step} hideHeader={hideHeader} />
      
    case 'investigation':
      return <InvestigationsStep step={step} watermarkEnabled={!!caseData?.watermarkEnabled} />
      
    case 'clinical':
      if (step.phase === 'case_overview') {
        return (
          <div className="animate-in fade-in duration-700 slide-in-from-bottom-6">
             <h1 className="text-4xl font-black text-slate-900 mb-8 tracking-tight">
                {caseData?.title || 'Case Overview'}
             </h1>
             <PatientInfoStep content={{ 
                ...(caseData?.patientData || {}), 
                patientImageUrl: caseData?.patientData?.imageUrl,
                illustrationUrl: step.content?.imageUrl 
             }} watermarkEnabled={!!caseData?.watermarkEnabled} />
          </div>
        )
      }
      if (step.category === 'composite_history') {
        return (
          <div className="animate-in fade-in duration-500">
             {!hideHeader && <h2 className="text-3xl font-bold text-slate-800 mb-8">Subjective Data</h2>}
             <ClinicalStepRunner 
               step={step} 
               hideHeader={true} 
               watermarkEnabled={!!caseData?.watermarkEnabled} 
               mcqProps={{ selectedOption, feedback, isCorrect, onAnswer }}
               essayProps={{ essayAnswer, setEssayAnswer, essayFeedback, essayScore, onSubmit, isReviewMode: currentIsReviewMode }}
             />
          </div>
        )
      }
      if (step.content?.sections) {
        return (
          <CompositeAssessmentRunner 
              step={step} 
              mcqProps={{ selectedOption, feedback, isCorrect, onAnswer }}
              essayProps={{ essayAnswer, setEssayAnswer, essayFeedback, essayScore, onSubmit, isReviewMode: currentIsReviewMode }}
              hideHeader={hideHeader}
              initialValue={stepInitialData}
          />
        )
      }
      if (step.phase === 'diagnosis') {
        return (
          <DiagnosisStep
            step={step}
            essayFeedback={essayFeedback}
            essayScore={essayScore}
            isReviewMode={currentIsReviewMode}
            initialValue={stepInitialData}
            onSubmit={onDiagnosisSubmit}
          />
        )
      }
      if (step.phase === 'problem_list') {
        return (
          <ProblemListStep
            key={step.id}
            step={step}
            essayFeedback={essayFeedback}
            essayScore={essayScore}
            isReviewMode={currentIsReviewMode}
            initialValue={stepInitialData}
            onSubmit={onProblemListSubmit}
          />
        )
      }
      if (step.phase === 'treatment') {
        return <TreatmentPlanStep step={step} hideHeader={hideHeader} />
      }
      if (step.phase === 'session_structure') {
        return (
           <SessionStructureRunner 
              step={step}
              notes={essayAnswer}
              setNotes={setEssayAnswer}
              onSubmit={onSessionStructureSubmit}
              isReviewMode={currentIsReviewMode}
           />
        )
      }
      return (
          <ClinicalStepRunner 
              step={step} 
              hideHeader={hideHeader} 
              mcqProps={{ selectedOption, feedback, isCorrect, onAnswer }}
              essayProps={{ essayAnswer, setEssayAnswer, essayFeedback, essayScore, onSubmit, isReviewMode: currentIsReviewMode }}
          />
      )
      
    default:
      return null
  }
}
