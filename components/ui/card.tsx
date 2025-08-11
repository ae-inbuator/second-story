import * as React from "react"
import { cn } from "@/lib/utils"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'luxury' | 'luxury-glass' | 'luxury-dark' | 'standard'
  hover?: boolean
}

export function Card({ className, variant = 'luxury', hover = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "transition-all duration-500 rounded-lg overflow-hidden",
        {
          // Luxury card - dark theme with gold accents
          'bg-gray-950 border border-gray-900 shadow-2xl': variant === 'luxury',
          
          // Luxury glass - frosted glass effect
          'bg-black/50 backdrop-blur-xl border border-white/10 shadow-2xl': variant === 'luxury-glass',
          
          // Luxury dark - deep black with subtle borders
          'bg-black border border-gray-800 shadow-xl': variant === 'luxury-dark',
          
          // Standard card
          'bg-white border border-gray-200 shadow-lg': variant === 'standard',
        },
        hover && "hover:scale-[1.02] hover:shadow-2xl cursor-pointer",
        className
      )}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col space-y-2 p-6", className)}
      {...props}
    />
  )
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "text-xl font-playfair text-white tracking-wide leading-tight",
        className
      )}
      {...props}
    />
  )
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm text-gray-400 tracking-wider", className)}
      {...props}
    />
  )
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-6 pt-0", className)} {...props} />
  )
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center p-6 pt-0 border-t border-gray-800", className)}
      {...props}
    />
  )
}