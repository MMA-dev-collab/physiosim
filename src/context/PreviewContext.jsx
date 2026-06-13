import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { evaluateMcq, evaluateEssay } from '../utils/matchingUtils';

const PreviewContext = createContext(null);

export const usePreview = () => {
    return useContext(PreviewContext);
};

export function processStepsForRunner(rawSteps) {
  if (!rawSteps) return []
  const processed = []
  let i = 0
  while (i < rawSteps.length) {
    const step = rawSteps[i]

    // Group Assessment Steps (only clinical type, not MCQ/Essay)
    if (step.phase === 'assessment' && step.type === 'clinical') {
      const group = []
      while (i < rawSteps.length && rawSteps[i].phase === 'assessment' && rawSteps[i].type === 'clinical') {
        group.push(rawSteps[i])
        i++
      }
      const hubTitle = group.length === 1 
        ? (group[0].title || (group[0].category === 'composite_imaging' ? 'Imagery' : 'Examination'))
        : 'Examination'
      processed.push({
        id: `assessment-hub-${group[0].id}`,
        type: 'clinical_hub',
        phase: 'assessment',
        title: hubTitle,
        subSteps: group,
        content: { title: hubTitle }
      })
      continue;
    }

    // Group History Steps (only clinical type)
    if (step.phase === 'history_presentation' && step.type === 'clinical') {
      const group = []
      while (i < rawSteps.length && rawSteps[i].phase === 'history_presentation' && rawSteps[i].type === 'clinical') {
        group.push(rawSteps[i])
        i++
      }
      const hubTitle = group.length === 1 && group[0].title ? group[0].title : 'Subjective Data'
      processed.push({
        id: `history-hub-${group[0].id}`,
        type: 'clinical_hub',
        phase: 'history_presentation',
        title: hubTitle,
        subSteps: group,
        content: { title: hubTitle }
      })
      continue;
    }

    processed.push(step)
    i++
  }
  return processed
}

export const PreviewProvider = ({ children, mode = 'production', initialSteps = [], caseData = null, isSingleStep = false }) => {
    const isPreview = mode !== 'production';

    const steps = useMemo(() => {
        if (isSingleStep) return initialSteps || [];
        return processStepsForRunner(initialSteps);
    }, [initialSteps, isSingleStep]);

    // Isolated preview session state
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [activeSubStepId, setActiveSubStepId] = useState(null);
    const [completedSubSteps, setCompletedSubSteps] = useState({});
    const [hubProgress, setHubProgress] = useState({});
    const [maxReachedIndex, setMaxReachedIndex] = useState(0);

    const [answers, setAnswers] = useState({}); // { [stepId]: answerData }
    const [feedback, setFeedback] = useState({}); // { [stepId]: string }
    const [scores, setScores] = useState({}); // { [stepId]: { score, isCorrect } }
    const [isCompleted, setIsCompleted] = useState(false);
    const [finalSummary, setFinalSummary] = useState(null);

    const updateDraftAnswer = useCallback((stepId, value) => {
        setAnswers(prev => ({
            ...prev,
            [stepId]: {
                ...(prev[stepId] || {}),
                essayAnswer: value
            }
        }));
    }, []);

    const submitAnswer = useCallback((step, data) => {
        const stepId = step.id;
        const stepType = step.category || step.type;

        if (stepType === 'mcq') {
            const result = evaluateMcq(step, data); // data is optionId
            setAnswers(prev => ({
                ...prev,
                [stepId]: { selectedOptionId: data }
            }));
            setFeedback(prev => ({
                ...prev,
                [stepId]: result.feedback
            }));
            setScores(prev => ({
                ...prev,
                [stepId]: { score: result.isCorrect ? (step.maxScore || 10) : 0, isCorrect: result.isCorrect }
            }));

            // Mark sub-step completed if MCQ is correct and we are in a hub
            if (result.isCorrect && isSingleStep === false) {
                // Find parent hub if active
                const parentHub = steps.find(s => s.type === 'clinical_hub' && s.subSteps?.some(sub => sub.id === stepId));
                if (parentHub) {
                    setCompletedSubSteps(prev => {
                        const hubId = parentHub.id;
                        const existing = prev[hubId] ? [...prev[hubId]] : [];
                        if (!existing.includes(stepId)) existing.push(stepId);
                        return { ...prev, [hubId]: existing };
                    });
                }
            }
        } 
        else if (stepType === 'essay' || step.phase === 'diagnosis') {
            // data is essayAnswer text or { essayAnswer, structuredAnswer }
            const answerText = typeof data === 'string' ? data : (data?.essayAnswer || '');
            const result = evaluateEssay(step, answerText);
            
            const newAnswerObj = { essayAnswer: answerText };
            if (data && typeof data === 'object' && data.structuredAnswer) {
                newAnswerObj.structuredAnswer = data.structuredAnswer;
            }
            newAnswerObj.answer_data = { ...newAnswerObj };

            setAnswers(prev => ({
                ...prev,
                [stepId]: newAnswerObj
            }));
            setFeedback(prev => ({
                ...prev,
                [stepId]: result.feedback
            }));
            setScores(prev => ({
                ...prev,
                [stepId]: { score: result.score, isCorrect: result.isCorrect }
            }));

            // Mark sub-step completed if in a hub
            if (isSingleStep === false) {
                const parentHub = steps.find(s => s.type === 'clinical_hub' && s.subSteps?.some(sub => sub.id === stepId));
                if (parentHub) {
                    setCompletedSubSteps(prev => {
                        const hubId = parentHub.id;
                        const existing = prev[hubId] ? [...prev[hubId]] : [];
                        if (!existing.includes(stepId)) existing.push(stepId);
                        return { ...prev, [hubId]: existing };
                    });
                }
            }
        }
        else if (step.phase === 'problem_list') {
            // data is { essayAnswer, problemListItems, evalResult }
            const { essayAnswer, problemListItems, evalResult } = data;
            
            const newAnswerObj = {
                essayAnswer,
                problemListItems,
                evalResult,
                answer_data: { essayAnswer, problemListItems, essayScore: evalResult.score, evalResult }
            };

            setAnswers(prev => ({
                ...prev,
                [stepId]: newAnswerObj
            }));
            
            const isCorrect = evalResult.score >= (step.maxScore || 10) * 0.6;
            const feedbackText = isCorrect
                ? `Great job! You matched ${evalResult.matched.length} out of ${evalResult.matched.length + evalResult.missing.length} expected problems.`
                : `You matched ${evalResult.matched.length} out of ${evalResult.matched.length + evalResult.missing.length} expected problems. Review the missing items and try to improve.`;

            setFeedback(prev => ({
                ...prev,
                [stepId]: feedbackText
            }));
            setScores(prev => ({
                ...prev,
                [stepId]: { score: evalResult.score, isCorrect }
            }));

            if (isSingleStep === false) {
                const parentHub = steps.find(s => s.type === 'clinical_hub' && s.subSteps?.some(sub => sub.id === stepId));
                if (parentHub) {
                    setCompletedSubSteps(prev => {
                        const hubId = parentHub.id;
                        const existing = prev[hubId] ? [...prev[hubId]] : [];
                        if (!existing.includes(stepId)) existing.push(stepId);
                        return { ...prev, [hubId]: existing };
                    });
                }
            }
        }
    }, [steps, isSingleStep]);

    const resetStep = useCallback((stepId) => {
        const cleanupKeys = (prev) => {
            const next = { ...prev };
            delete next[stepId];
            Object.keys(next).forEach(key => {
                if (key.startsWith(`${stepId}-`)) {
                    delete next[key];
                }
            });
            return next;
        };
        setAnswers(cleanupKeys);
        setFeedback(cleanupKeys);
        setScores(cleanupKeys);
    }, []);

    const finishCase = useCallback(() => {
        // Compute final scores client-side
        const SCORABLE_PHASES = new Set(['diagnosis', 'problem_list']);
        let totalScore = 0;
        let maxPossibleScore = 0;

        for (const step of steps) {
            let isScorable = false;
            if (step.type === 'mcq' || step.type === 'essay') {
                isScorable = true;
            } else if (step.type === 'clinical') {
                if (SCORABLE_PHASES.has(step.phase)) {
                    isScorable = true;
                } else if (step.content?.sections?.some(s => s.type === 'mcq' || s.type === 'essay')) {
                    isScorable = true;
                }
            }

            if (isScorable) {
                const stepMax = step.maxScore || 10;
                maxPossibleScore += stepMax;

                const getStepScore = (s, maxS) => {
                    if (s.content?.sections) {
                        let compositeScore = 0;
                        s.content.sections.forEach((sec, idx) => {
                            if (sec.type === 'mcq' || sec.type === 'essay') {
                                const secId = sec.id || `${s.id}-section-${idx}`;
                                const secAttempt = scores[secId];
                                if (secAttempt?.score !== undefined) {
                                    compositeScore += secAttempt.score;
                                }
                            }
                        });
                        return Math.min(compositeScore, maxS);
                    }
                    const attempt = scores[s.id];
                    return attempt?.score !== undefined ? Math.min(attempt.score, maxS) : 0;
                };

                // Standalone or sub-steps
                if (step.type === 'clinical_hub' && step.subSteps) {
                    for (const sub of step.subSteps) {
                        totalScore += Math.round(getStepScore(sub, sub.maxScore || 10));
                    }
                } else {
                    totalScore += Math.round(getStepScore(step, stepMax));
                }
            }
        }

        setFinalSummary({
            score: totalScore,
            maxPossibleScore,
            completedAt: new Date()
        });
        setIsCompleted(true);
    }, [steps, scores]);

    const goToNext = useCallback(() => {
        if (isSingleStep) return;
        const currentStep = steps[currentStepIndex];

        if (currentStep?.type === 'clinical_hub' && currentStep.subSteps?.length > 0) {
            const subIndex = currentStep.subSteps.findIndex(s => s.id === activeSubStepId);
            if (subIndex !== -1 && subIndex < currentStep.subSteps.length - 1) {
                const nextSubId = currentStep.subSteps[subIndex + 1].id;
                
                // For non-MCQ/Essay/etc., automatically complete sub-step on transition
                const subStep = currentStep.subSteps[subIndex];
                if (subStep && subStep.type !== 'mcq' && subStep.category !== 'mcq' && subStep.type !== 'essay') {
                    setCompletedSubSteps(prev => {
                        const hubId = currentStep.id;
                        const existing = prev[hubId] ? [...prev[hubId]] : [];
                        if (!existing.includes(subStep.id)) existing.push(subStep.id);
                        return { ...prev, [hubId]: existing };
                    });
                }
                
                setActiveSubStepId(nextSubId);
                return;
            }
        }

        if (currentStepIndex < steps.length - 1) {
            const nextIdx = currentStepIndex + 1;
            setCurrentStepIndex(nextIdx);
            setMaxReachedIndex(prev => Math.max(prev, nextIdx));
            setActiveSubStepId(null);
        } else {
            // Finish case preview
            finishCase();
        }
    }, [steps, currentStepIndex, activeSubStepId, isSingleStep, finishCase]);

    const goToBack = useCallback(() => {
        if (isSingleStep) return;
        const currentStep = steps[currentStepIndex];

        if (currentStep?.type === 'clinical_hub' && currentStep.subSteps?.length > 0) {
            const subIndex = currentStep.subSteps.findIndex(s => s.id === activeSubStepId);
            if (subIndex > 0) {
                setActiveSubStepId(currentStep.subSteps[subIndex - 1].id);
                return;
            }
        }

        if (currentStepIndex > 0) {
            const prevIdx = currentStepIndex - 1;
            setCurrentStepIndex(prevIdx);
            
            const prevStep = steps[prevIdx];
            if (prevStep?.type === 'clinical_hub' && prevStep.subSteps?.length > 0) {
                setActiveSubStepId(prevStep.subSteps[prevStep.subSteps.length - 1].id);
            } else {
                setActiveSubStepId(null);
            }
        }
    }, [steps, currentStepIndex, activeSubStepId, isSingleStep]);

    const handleSubStepView = useCallback((subStepId) => {
        if (isSingleStep) return;
        const currentStep = steps[currentStepIndex];
        if (currentStep?.type !== 'clinical_hub') return;

        setHubProgress(prev => {
            const hubId = currentStep.id;
            const currentViewed = prev[hubId] || [];
            if (currentViewed.includes(subStepId)) return prev;
            return {
                ...prev,
                [hubId]: [...currentViewed, subStepId]
            };
        });
    }, [steps, currentStepIndex, isSingleStep]);

    const value = useMemo(() => {
        if (!isPreview) return null;
        return {
            mode,
            isPreview,
            steps,
            caseData,
            isSingleStep,
            // Navigation state
            currentStepIndex,
            setCurrentStepIndex,
            activeSubStepId,
            setActiveSubStepId,
            completedSubSteps,
            setCompletedSubSteps,
            hubProgress,
            maxReachedIndex,
            // Response state
            answers,
            feedback,
            scores,
            isCompleted,
            finalSummary,
            // Actions
            updateDraftAnswer,
            submitAnswer,
            resetStep,
            goToNext,
            goToBack,
            finishCase,
            handleSubStepView,
            setFinalSummary,
            setIsCompleted
        };
    }, [
        mode,
        isPreview,
        steps,
        caseData,
        isSingleStep,
        currentStepIndex,
        activeSubStepId,
        completedSubSteps,
        hubProgress,
        maxReachedIndex,
        answers,
        feedback,
        scores,
        isCompleted,
        finalSummary,
        updateDraftAnswer,
        submitAnswer,
        resetStep,
        goToNext,
        goToBack,
        finishCase,
        handleSubStepView
    ]);

    return (
        <PreviewContext.Provider value={value}>
            {children}
        </PreviewContext.Provider>
    );
};
