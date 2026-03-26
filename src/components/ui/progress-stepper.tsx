import * as React from "react"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

export interface Step {
    label: string
    description?: string
}

export interface ProgressStepperProps {
    steps: Step[]
    currentStep: number // 0-indexed
    className?: string
}

const ProgressStepper: React.FC<ProgressStepperProps> = ({ steps, currentStep, className }) => {
    return (
        <div className={cn("w-full py-4", className)}>
            <div className="flex items-center justify-between w-full">
                {steps.map((step, index) => {
                    const isCompleted = index < currentStep
                    const isActive = index === currentStep
                    const isLast = index === steps.length - 1

                    return (
                        <React.Fragment key={index}>
                            <div className="flex flex-col items-center relative group">
                                {/* Circle */}
                                <div
                                    className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                                        isCompleted ? "bg-primary border-primary text-white" : "",
                                        isActive ? "border-primary bg-white text-primary shadow-md ring-4 ring-primary/10" : "",
                                        !isCompleted && !isActive ? "bg-white border-border text-text-muted" : ""
                                    )}
                                >
                                    {isCompleted ? (
                                        <Check className="w-5 h-5" />
                                    ) : (
                                        <span className="text-sm font-bold">{index + 1}</span>
                                    )}
                                </div>
                                
                                {/* Labels */}
                                <div className="absolute top-12 flex flex-col items-center min-w-[max-content]">
                                    <span className={cn(
                                        "text-xs font-bold transition-colors",
                                        isActive || isCompleted ? "text-text-primary" : "text-text-muted"
                                    )}>
                                        {step.label}
                                    </span>
                                </div>
                            </div>

                            {/* Line */}
                            {!isLast && (
                                <div className="flex-1 h-[2px] mx-4 transition-colors duration-300 bg-border overflow-hidden">
                                    <div 
                                        className={cn(
                                            "h-full bg-primary transition-all duration-500",
                                            isCompleted ? "w-full" : "w-0",
                                            isActive ? "w-0" : "" // Should match index < currentStep
                                        )}
                                    />
                                </div>
                            )}
                        </React.Fragment>
                    )
                })}
            </div>
            {/* Legend / Spacing buffer for absolute labels */}
            <div className="h-10"></div>
        </div>
    )
}

export { ProgressStepper }
