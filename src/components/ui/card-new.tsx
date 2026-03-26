import * as React from "react"
import { cn } from "@/lib/utils"

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'interactive' | 'highlighted'
    padding?: 'none' | 'sm' | 'md' | 'lg'
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = 'default', padding = 'md', children, ...props }, ref) => {
        const variants = {
            default: "bg-white border border-border shadow-sm",
            interactive: "bg-white border border-border shadow-sm hover:shadow-md hover:border-primary/20 transition-all cursor-pointer",
            highlighted: "bg-white border-2 border-primary shadow-md",
        }

        const paddings = {
            none: "p-0",
            sm: "p-4",
            md: "p-6",
            lg: "p-10",
        }

        return (
            <div
                ref={ref}
                className={cn(
                    "rounded-lg",
                    variants[variant],
                    paddings[padding],
                    className
                )}
                {...props}
            >
                {children}
            </div>
        )
    }
)

Card.displayName = "Card"

const CardHeader = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("mb-4", className)} {...props}>{children}</div>
)

const CardTitle = ({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className={cn("text-lg font-bold text-text-primary", className)} {...props}>{children}</h3>
)

const CardDescription = ({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className={cn("text-sm text-text-muted", className)} {...props}>{children}</p>
)

const CardContent = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("", className)} {...props}>{children}</div>
)

const CardFooter = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("mt-6 pt-6 border-t border-border", className)} {...props}>{children}</div>
)

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
