'use client'

/**
 * Offline Indicator Component
 * Shows elegant offline state and reconnection status
 */

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WifiOff, Loader2 } from 'lucide-react'

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [showIndicator, setShowIndicator] = useState(false)

  useEffect(() => {
    // Check initial state
    setIsOnline(navigator.onLine)
    
    // Set up event listeners
    const handleOnline = () => {
      setIsOnline(true)
      // Keep indicator visible for 2 seconds after reconnection
      setTimeout(() => setShowIndicator(false), 2000)
    }
    
    const handleOffline = () => {
      setIsOnline(false)
      setShowIndicator(true)
    }
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // Initial check
    if (!navigator.onLine) {
      setShowIndicator(true)
    }
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <AnimatePresence>
      {showIndicator && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 left-0 right-0 z-50 safe-top"
        >
          <div className={`
            px-4 py-3 text-center text-sm font-medium
            ${isOnline 
              ? 'bg-green-500 text-white' 
              : 'bg-gray-900 text-white'
            }
          `}>
            <div className="flex items-center justify-center gap-2">
              {isOnline ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Reconnected</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4" />
                  <span>You're offline - Changes will sync when reconnected</span>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default OfflineIndicator