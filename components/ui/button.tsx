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
          // Base styles - luxury focused
          "inline-flex items-center justify-center font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-luxury-gold focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 tracking-wider uppercase text-xs",
          {
            // Luxury primary button - gold background
            'bg-luxury-gold text-black hover:bg-white hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl border border-luxury-gold': variant === 'luxury',
            
            // Luxury ghost button - transparent with gold border
            'border border-luxury-gold text-luxury-gold bg-transparent hover:bg-luxury-gold hover:text-black hover:scale-[1.02] active:scale-[0.98]': variant === 'luxury-ghost',
            
            // Luxury outline - white border
            'border border-white text-white bg-transparent hover:bg-white hover:text-black hover:scale-[1.02] active:scale-[0.98]': variant === 'luxury-outline',
            
            // Destructive - red tones
            'bg-red-500 text-white hover:bg-red-600 hover:scale-[1.02] active:scale-[0.98] border border-red-500': variant === 'destructive',
            
            // Secondary - muted
            'bg-gray-800 text-gray-200 hover:bg-gray-700 hover:text-white border border-gray-700 hover:border-gray-600': variant === 'secondary',
            
            // Ghost - minimal
            'text-gray-400 hover:text-white hover:bg-gray-900/50': variant === 'ghost',
            
            // Link - text only
            'text-luxury-gold underline-offset-4 hover:underline bg-transparent border-none': variant === 'link',
          },
          {
            'h-10 px-4 py-2 rounded-md': size === 'default',
            'h-8 px-3 py-1.5 rounded text-xs': size === 'sm',
            'h-12 px-8 py-3 rounded-lg text-sm': size === 'lg',
            'h-10 w-10 rounded-md': size === 'icon',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }