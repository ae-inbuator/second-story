import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'luxury' | 'luxury-underline' | 'luxury-minimal' | 'standard'
  error?: boolean
  label?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant = 'luxury', type, error, label, ...props }, ref) => {
    const id = React.useId()
    const inputId = props.id || id

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-300 mb-2 tracking-wider uppercase"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          type={type}
          className={cn(
            // Base styles
            "w-full transition-all duration-300 outline-none font-medium placeholder:text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed",
            {
              // Luxury boxed input - dark theme with gold accents
              'px-4 py-3 bg-black border border-gray-800 rounded-md text-white focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold/20 hover:border-gray-700': variant === 'luxury',
              
              // Luxury underline - minimalist style
              'px-2 py-3 bg-transparent border-b-2 border-gray-700 text-white focus:border-luxury-gold text-center tracking-widest placeholder:text-center': variant === 'luxury-underline',
              
              // Luxury minimal - ultra clean
              'px-4 py-2 bg-transparent border border-gray-800 rounded text-white focus:border-white hover:border-gray-600': variant === 'luxury-minimal',
              
              // Standard input
              'px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:border-gray-900 focus:ring-1 focus:ring-gray-900/20': variant === 'standard',
            },
            // Error states
            error && {
              'border-red-500 focus:border-red-500 focus:ring-red-500/20': variant === 'luxury' || variant === 'luxury-minimal' || variant === 'standard',
              'border-b-red-500 focus:border-b-red-500': variant === 'luxury-underline',
            },
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-400">
            Please check your input
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }