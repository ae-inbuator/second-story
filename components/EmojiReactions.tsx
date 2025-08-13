'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FloatingReaction {
  id: string
  emoji: string
  x: number
  timestamp: number
  isOwn?: boolean
}

interface EmojiReactionsProps {
  onSendReaction?: (emoji: string) => void
  incomingReaction?: { emoji: string; guestId: string } | null
  isConnected?: boolean
  className?: string
}

const EMOJI_OPTIONS = ['❤️', '✨', '👏', '😍', '🔥', '💎']

export function EmojiReactions({ 
  onSendReaction, 
  incomingReaction, 
  isConnected = true,
  className 
}: EmojiReactionsProps) {
  const [showPicker, setShowPicker] = useState(false)
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([])
  const [recentlySent, setRecentlySent] = useState<string | null>(null)

  // Handle incoming reactions from other users
  useEffect(() => {
    if (incomingReaction) {
      const newReaction: FloatingReaction = {
        id: `${Date.now()}-${Math.random()}`,
        emoji: incomingReaction.emoji,
        x: Math.random() * 60 + 20, // Random position between 20% and 80%
        timestamp: Date.now(),
        isOwn: false
      }
      setFloatingReactions(prev => [...prev, newReaction])
    }
  }, [incomingReaction])

  // Clean up old reactions
  useEffect(() => {
    const interval = setInterval(() => {
      setFloatingReactions(prev => 
        prev.filter(r => Date.now() - r.timestamp < 4000)
      )
    }, 500)
    return () => clearInterval(interval)
  }, [])

  const sendReaction = useCallback((emoji: string) => {
    // Add floating reaction locally
    const newReaction: FloatingReaction = {
      id: `own-${Date.now()}`,
      emoji,
      x: 50, // Center for own reactions
      timestamp: Date.now(),
      isOwn: true
    }
    setFloatingReactions(prev => [...prev, newReaction])
    
    // Visual feedback
    setRecentlySent(emoji)
    setTimeout(() => setRecentlySent(null), 500)
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(30)
    }
    
    // Send to server
    onSendReaction?.(emoji)
    
    // Close picker
    setShowPicker(false)
  }, [onSendReaction])

  return (
    <>
      {/* Floating Reactions Display */}
      <div className="fixed inset-x-0 bottom-20 pointer-events-none z-30">
        <AnimatePresence>
          {floatingReactions.map((reaction) => (
            <motion.div
              key={reaction.id}
              initial={{ 
                y: 0, 
                opacity: 1, 
                scale: reaction.isOwn ? 1.2 : 1,
                x: `${reaction.x}%`
              }}
              animate={{ 
                y: -200,
                opacity: 0,
                scale: reaction.isOwn ? 1.5 : 1.2
              }}
              exit={{ opacity: 0 }}
              transition={{ 
                duration: 3,
                ease: "easeOut"
              }}
              className="absolute bottom-0 text-4xl"
              style={{ left: `${reaction.x}%`, transform: 'translateX(-50%)' }}
            >
              <motion.span
                initial={{ rotate: -10 }}
                animate={{ rotate: 10 }}
                transition={{
                  repeat: Infinity,
                  repeatType: "reverse",
                  duration: 0.5
                }}
              >
                {reaction.emoji}
              </motion.span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Emoji Button and Picker */}
      <div className={cn("fixed bottom-8 right-4 z-40", className)}>
        {/* Picker */}
        <AnimatePresence>
          {showPicker && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-30"
                onClick={() => setShowPicker(false)}
              />
              
              {/* Emoji Options */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                transition={{ type: "spring", bounce: 0.3 }}
                className="absolute bottom-16 right-0 bg-white rounded-2xl shadow-2xl border border-gray-200 p-3 z-40"
              >
                <div className="flex gap-2">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <motion.button
                      key={emoji}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => sendReaction(emoji)}
                      className={cn(
                        "w-12 h-12 flex items-center justify-center text-2xl rounded-xl",
                        "hover:bg-gray-100 transition-colors",
                        recentlySent === emoji && "bg-gray-100"
                      )}
                    >
                      {emoji}
                    </motion.button>
                  ))}
                </div>
                <div className="text-center mt-2">
                  <p className="text-xs text-gray-500">Tap to react</p>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Button */}
        <motion.button
          onClick={() => setShowPicker(!showPicker)}
          className={cn(
            "relative w-14 h-14 bg-black text-white rounded-full",
            "shadow-lg hover:shadow-xl transition-all",
            "flex items-center justify-center group",
            !isConnected && "opacity-50 cursor-not-allowed"
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={!isConnected}
        >
          {showPicker ? (
            <span className="text-xl">×</span>
          ) : (
            <motion.div
              animate={recentlySent ? { rotate: [0, -10, 10, -10, 10, 0] } : {}}
              transition={{ duration: 0.5 }}
            >
              <Heart className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </motion.div>
          )}
          
          {/* Pulse animation when connected */}
          {isConnected && !showPicker && (
            <motion.div
              className="absolute inset-0 rounded-full bg-black"
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: "easeOut"
              }}
            />
          )}
          
          {/* Connection indicator */}
          {!isConnected && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
          )}
        </motion.button>

        {/* Tooltip */}
        {!showPicker && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 2 }}
            className="absolute right-16 top-1/2 -translate-y-1/2 bg-black text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap pointer-events-none"
          >
            React with emojis
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-0 h-0 border-t-4 border-b-4 border-l-4 border-transparent border-l-black" />
          </motion.div>
        )}
      </div>
    </>
  )
}