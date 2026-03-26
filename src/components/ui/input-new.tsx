import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: string | boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, error, type, ...props }, ref) => {
        return (
            <div className="w-full">
                <input
                    type={type}
                    className={cn(
                        "flex h-11 w-full rounded-md border border-border bg-white px-4 py-2 text-sm text-text-primary transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50",
                        error ? "border-error focus-visible:ring-error" : "focus-visible:ring-primary",
                        className
                    )}
                    ref={ref}
                    {...props}
                />
                {typeof error === 'string' && error && (
                    <p className="mt-1.5 text-xs font-medium text-error">{error}</p>
                )}
            </div>
        )
    }
)

Input.displayName = "Input"

export { Input }
