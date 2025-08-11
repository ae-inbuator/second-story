'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Sparkles } from 'lucide-react'

interface CountdownTimerProps {
  targetDate: Date | null
  onEventStart?: () => void
  className?: string
}

interface TimeUnit {
  value: number
  label: string
  show: boolean
}

export function CountdownTimer({ targetDate, onEventStart, className = '' }: CountdownTimerProps) {
  const [timeUnits, setTimeUnits] = useState<TimeUnit[]>([])
  const [message, setMessage] = useState('')
  const [isUrgent, setIsUrgent] = useState(false)
  const [isPulsing, setIsPulsing] = useState(false)

  useEffect(() => {
    if (!targetDate) return

    const calculateTime = () => {
      const now = new Date()
      const diff = targetDate.getTime() - now.getTime()
      
      if (diff <= 0) {
        setTimeUnits([])
        setMessage('EXPERIENCE LIVE NOW')
        setIsUrgent(true)
        setIsPulsing(true)
        onEventStart?.()
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      
      const units: TimeUnit[] = []
      let statusMessage = ''
      let urgent = false
      let pulse = false

      // Smart display logic based on time remaining
      if (days > 7) {
        // More than a week - just show days
        units.push({ value: days, label: days === 1 ? 'DAY' : 'DAYS', show: true })
        statusMessage = 'THE COUNTDOWN BEGINS'
      } else if (days > 0) {
        // Less than a week - show days and hours
        units.push({ value: days, label: days === 1 ? 'DAY' : 'DAYS', show: true })
        units.push({ value: hours, label: hours === 1 ? 'HOUR' : 'HOURS', show: true })
        statusMessage = days === 1 ? 'TOMORROW AWAITS' : 'APPROACHING FAST'
      } else if (hours > 0) {
        // Less than 24 hours
        units.push({ value: hours, label: hours === 1 ? 'HOUR' : 'HOURS', show: true })
        units.push({ value: minutes, label: 'MIN', show: true })
        statusMessage = hours < 6 ? "TONIGHT'S THE NIGHT" : 'TODAY IS THE DAY'
        urgent = hours < 2
      } else if (minutes > 0) {
        // Less than 1 hour
        units.push({ value: minutes, label: 'MIN', show: true })
        units.push({ value: seconds, label: 'SEC', show: true })
        statusMessage = minutes < 30 ? 'MOMENTS AWAY' : 'FINAL HOUR'
        urgent = true
        pulse = minutes < 5
      } else {
        // Less than 1 minute
        units.push({ value: seconds, label: 'SECONDS', show: true })
        statusMessage = 'DOORS OPENING'
        urgent = true
        pulse = true
      }

      setTimeUnits(units)
      setMessage(statusMessage)
      setIsUrgent(urgent)
      setIsPulsing(pulse)
    }

    calculateTime()
    const timer = setInterval(calculateTime, 1000)

    return () => clearInterval(timer)
  }, [targetDate, onEventStart])

  if (!targetDate) return null

  return (
    <div className={`relative ${className}`}>
      {/* Status Message */}
      <AnimatePresence mode="wait">
        <motion.div
          key={message}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.3 }}
          className="text-center mb-3"
        >
          <p className={`text-xs tracking-[0.3em] uppercase transition-colors duration-500 ${
            isUrgent ? 'text-black font-semibold' : 'text-gray-500'
          } ${isPulsing ? 'animate-pulse' : ''}`}>
            {message}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Time Display */}
      {timeUnits.length > 0 ? (
        <div className="flex items-center justify-center gap-4 md:gap-6">
          {/* Icon */}
          <motion.div
            animate={{ rotate: isUrgent ? [0, 10, -10, 0] : 0 }}
            transition={{ duration: 0.5, repeat: isPulsing ? Infinity : 0 }}
          >
            {isPulsing ? (
              <Sparkles className="w-5 h-5 text-black" />
            ) : (
              <Clock className="w-5 h-5 text-black" />
            )}
          </motion.div>

          {/* Time Units */}
          <div className="flex items-center gap-3 md:gap-4">
            {timeUnits.map((unit, index) => (
              <motion.div
                key={unit.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className="text-center">
                  {/* Number with animation */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${unit.label}-${unit.value}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="relative"
                    >
                      <div className={`text-3xl md:text-4xl font-light ${
                        isUrgent ? 'text-black' : 'text-gray-900'
                      }`}>
                        {String(unit.value).padStart(2, '0')}
                      </div>
                      {/* Subtle gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5 pointer-events-none rounded" />
                    </motion.div>
                  </AnimatePresence>
                  
                  {/* Label */}
                  <p className="text-[10px] tracking-[0.2em] text-gray-500 mt-1 uppercase">
                    {unit.label}
                  </p>
                </div>

                {/* Separator */}
                {index < timeUnits.length - 1 && (
                  <div className="absolute -right-2 md:-right-2.5 top-1/3 -translate-y-1/2">
                    <motion.div
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-gray-400 text-xl font-light"
                    >
                      ·
                    </motion.div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        /* Event Live Message */
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: [0.95, 1.05, 0.95] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex items-center justify-center gap-3"
        >
          <Sparkles className="w-6 h-6 text-black animate-spin" />
          <span className="text-xl md:text-2xl font-light tracking-wider text-black">
            {message}
          </span>
          <Sparkles className="w-6 h-6 text-black animate-spin" />
        </motion.div>
      )}

      {/* Subtle background effect for urgent states */}
      {isUrgent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.05 }}
          className="absolute inset-0 -z-10 blur-3xl"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-gray-400 to-black rounded-full" />
        </motion.div>
      )}
    </div>
  )
}