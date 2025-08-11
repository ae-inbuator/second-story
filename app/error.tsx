'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { 
  RefreshCw, 
  Home, 
  AlertTriangle,
  ArrowLeft,
  Sparkles
} from 'lucide-react'
import { LuxuryImage } from '@/components/ui/luxury-image'
import { cn } from '@/lib/utils'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  const [scrollY, setScrollY] = useState(0)
  const [isResetting, setIsResetting] = useState(false)

  useEffect(() => {
    // Log error to console for debugging
    console.error('Application Error:', error)
    
    // Parallax scroll effect
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    window.addEventListener('scroll', handleScroll)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [error])

  const handleReset = async () => {
    setIsResetting(true)
    
    // Add a small delay for better UX
    setTimeout(() => {
      reset()
      setIsResetting(false)
    }, 1000)
  }

  // Extract error info
  const errorMessage = error.message || 'An unexpected error occurred'
  const isNetworkError = errorMessage.toLowerCase().includes('network') || 
                         errorMessage.toLowerCase().includes('fetch') ||
                         errorMessage.toLowerCase().includes('connection')
  
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Parallax Background */}
      <div 
        className="absolute inset-0 opacity-15"
        style={{ transform: `translateY(${scrollY * 0.5}px)` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black via-red-950/20 to-black z-10" />
        <LuxuryImage
          src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&h=1080&fit=crop"
          alt="Abstract luxury background"
          fill
          priority
          className="object-cover"
        />
      </div>
      
      {/* Content */}
      <div className="relative z-20 min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl mx-auto"
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="mb-6"
          >
            <Image 
              src="/logo.png" 
              alt="Second Story" 
              width={200} 
              height={60} 
              className="mx-auto opacity-70"
              priority
            />
          </motion.div>
          
          {/* Error Icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-8"
          >
            <div className="relative inline-block">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 0.5, delay: 1 }}
                className="w-24 h-24 mx-auto mb-6 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center"
              >
                <AlertTriangle className="w-12 h-12 text-red-400" />
              </motion.div>
              
              {/* Decorative rings */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.3 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="absolute inset-0 w-32 h-32 -m-4 border border-red-500/20 rounded-full"
              />
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.2 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="absolute inset-0 w-40 h-40 -m-8 border border-red-500/10 rounded-full"
              />
            </div>
          </motion.div>
          
          {/* Error Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mb-8"
          >
            <p className="text-red-400 text-sm tracking-[0.3em] uppercase mb-4">
              {isNetworkError ? 'Connection Error' : 'Application Error'}
            </p>
            <h1 className="font-playfair text-4xl sm:text-5xl lg:text-6xl mb-6">
              Something Went Wrong
            </h1>
            <p className="text-xl text-gray-300 font-light leading-relaxed max-w-lg mx-auto mb-4">
              {isNetworkError 
                ? "We're having trouble connecting to our servers. Please check your connection and try again."
                : "An unexpected error interrupted your experience. We apologize for the inconvenience."
              }
            </p>
            
            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && (
              <motion.details
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-6 text-left max-w-md mx-auto"
              >
                <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-400 mb-2">
                  Error Details (Development)
                </summary>
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-xs font-mono text-gray-400 overflow-auto max-h-32">
                  <p className="text-red-400 mb-2">Error: {error.message}</p>
                  {error.digest && <p>Digest: {error.digest}</p>}
                  {error.stack && (
                    <pre className="whitespace-pre-wrap text-xs mt-2 opacity-70">
                      {error.stack.split('\n').slice(0, 5).join('\n')}
                    </pre>
                  )}
                </div>
              </motion.details>
            )}
          </motion.div>
          
          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleReset}
              disabled={isResetting}
              className={cn(
                "btn-luxury px-6 py-3 bg-luxury-gold text-black hover:bg-white flex items-center justify-center gap-3",
                isResetting && "opacity-75 cursor-not-allowed"
              )}
            >
              {isResetting ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <RefreshCw className="w-5 h-5" />
                </motion.div>
              ) : (
                <RefreshCw className="w-5 h-5" />
              )}
              <span>{isResetting ? 'Retrying...' : 'Try Again'}</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.history.back()}
              className="btn-luxury-ghost px-6 py-3 text-white border-white hover:bg-white hover:text-black flex items-center justify-center gap-3"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Go Back</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = '/'}
              className="btn-luxury-ghost px-6 py-3 text-luxury-gold border-luxury-gold hover:bg-luxury-gold hover:text-black flex items-center justify-center gap-3"
            >
              <Home className="w-5 h-5" />
              <span>Home</span>
            </motion.button>
          </motion.div>
          
          {/* Help Text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="text-center"
          >
            <p className="text-sm text-gray-500 mb-4">
              If the problem persists, you can:
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <button 
                onClick={() => window.location.reload()}
                className="text-gray-400 hover:text-luxury-gold transition-colors duration-200"
              >
                Refresh Page
              </button>
              <span className="text-gray-700">•</span>
              <button 
                onClick={() => window.location.href = '/show'}
                className="text-gray-400 hover:text-luxury-gold transition-colors duration-200"
              >
                Enter Show
              </button>
              {isNetworkError && (
                <>
                  <span className="text-gray-700">•</span>
                  <span className="text-gray-400">Check Connection</span>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Bottom Decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent z-10" />
      
      {/* Floating Error Elements */}
      <motion.div
        animate={{ 
          y: [0, -10, 0],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{ 
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-1/3 left-1/5 w-1 h-1 bg-red-400/50 rounded-full"
      />
      
      <motion.div
        animate={{ 
          y: [0, 15, 0],
          opacity: [0.05, 0.15, 0.05]
        }}
        transition={{ 
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
        className="absolute top-2/3 right-1/4 w-2 h-2 bg-red-500/30 rounded-full"
      />
    </div>
  )
}