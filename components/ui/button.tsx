import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'luxury' | 'luxury-ghost' | 'luxury-outline' | 'destructive' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'luxury', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          // Base styles - minimal luxury with microanimations
          "relative overflow-hidden inline-flex items-center justify-center font-light transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 tracking-wider uppercase text-xs group",
          {
            // Luxury primary button - black with microanimations
            'bg-black text-white border border-black hover:shadow-lg hover:-translate-y-0.5 hover:scale-[1.02] active:translate-y-0 active:scale-[0.98]': variant === 'luxury',
            
            // Luxury ghost button - animated fill effect
            'border border-black text-black bg-transparent hover:text-white hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-md active:translate-y-0 active:scale-[0.98]': variant === 'luxury-ghost',
            
            // Luxury outline - subtle animations
            'border border-gray-800 text-gray-800 bg-transparent hover:text-white hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.98]': variant === 'luxury-outline',
            
            // Destructive - pulse effect
            'bg-white text-red-600 border border-red-600 hover:bg-red-50 hover:scale-[1.02] hover:shadow-md active:scale-[0.98]': variant === 'destructive',
            
            // Secondary - subtle lift
            'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 hover:-translate-y-0.5 hover:shadow-sm': variant === 'secondary',
            
            // Ghost - minimal
            'text-gray-600 hover:text-black hover:bg-gray-50': variant === 'ghost',
            
            // Link - text only
            'text-black underline-offset-4 hover:underline bg-transparent border-none': variant === 'link',
          },
          {
            'h-11 px-6 py-2': size === 'default',
            'h-9 px-4 py-1.5 text-xs': size === 'sm',
            'h-12 px-8 py-3 text-sm': size === 'lg',
            'h-10 w-10': size === 'icon',
          },
          className
        )}
        ref={ref}
        {...props}
      >
        {/* Shimmer effect for luxury buttons */}
        {(variant === 'luxury' || variant === 'luxury-ghost') && (
          <span className="absolute inset-0 -left-full group-hover:left-full transition-all duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        )}
        
        {/* Background fill animation for ghost button */}
        {variant === 'luxury-ghost' && (
          <span className="absolute inset-0 bg-black scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
        )}
        
        {/* Content wrapper to stay above animations */}
        <span className="relative z-10">
          {props.children}
        </span>
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button }