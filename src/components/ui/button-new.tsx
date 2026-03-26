import * as React from "react"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'error'
    size?: 'sm' | 'md' | 'lg' | 'icon'
    isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
        const variants = {
            primary: "bg-primary text-white hover:bg-primary-hover active:bg-primary-active shadow-sm",
            secondary: "bg-secondary text-secondary-foreground hover:bg-tertiary shadow-sm",
            outline: "border border-border bg-white text-text-primary hover:bg-bg-secondary hover:border-gray-400 shadow-sm",
            ghost: "text-text-secondary hover:bg-bg-secondary",
            error: "bg-error text-white hover:opacity-90 active:opacity-100 shadow-sm",
        }

        const sizes = {
            sm: "h-9 px-3 text-xs",
            md: "h-11 px-6 text-sm",
            lg: "h-14 px-8 text-base",
            icon: "h-11 w-11 p-2",
        }

        return (
            <button
                ref={ref}
                disabled={disabled || isLoading}
                className={cn(
                    "inline-flex items-center justify-center rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]",
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            >
                {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {children}
            </button>
        )
    }
)

Button.displayName = "Button"

export { Button }
