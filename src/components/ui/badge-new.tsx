import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'success' | 'warning' | 'error' | 'info' | 'default'
    size?: 'sm' | 'md'
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
    ({ className, variant = 'default', size = 'sm', children, ...props }, ref) => {
        const variants = {
            default: "bg-tertiary text-text-secondary",
            success: "bg-success/10 text-success border border-success/20",
            warning: "bg-warning/10 text-warning border border-warning/20",
            error: "bg-error/10 text-error border border-error/20",
            info: "bg-primary/10 text-primary border border-primary/20",
        }

        const sizes = {
            sm: "px-2.5 py-0.5 text-xs font-semibold",
            md: "px-3 py-1 text-sm font-semibold",
        }

        return (
            <div
                ref={ref}
                className={cn(
                    "inline-flex items-center rounded-full transition-colors",
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            >
                {children}
            </div>
        )
    }
)

Badge.displayName = "Badge"

export { Badge }
