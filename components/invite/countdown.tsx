'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TimeUnit {
  value: number
  label: string
  max?: number
}

interface CountdownProps {
  targetDate: Date | string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showLabels?: boolean
}

export function Countdown({ 
  targetDate, 
  className,
  size = 'md',
  showLabels = true 
}: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeUnit[]>([
    { value: 0, label: 'Days' },
    { value: 0, label: 'Hours', max: 24 },
    { value: 0, label: 'Minutes', max: 60 },
    { value: 0, label: 'Seconds', max: 60 }
  ])
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const target = new Date(targetDate).getTime()
      const now = new Date().getTime()
      const difference = target - now

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24))
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)

        setTimeLeft([
          { value: days, label: 'Days' },
          { value: hours, label: 'Hours', max: 24 },
          { value: minutes, label: 'Minutes', max: 60 },
          { value: seconds, label: 'Seconds', max: 60 }
        ])
        setIsExpired(false)
      } else {
        setTimeLeft([
          { value: 0, label: 'Days' },
          { value: 0, label: 'Hours', max: 24 },
          { value: 0, label: 'Minutes', max: 60 },
          { value: 0, label: 'Seconds', max: 60 }
        ])
        setIsExpired(true)
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [targetDate])

  const sizeClasses = {
    sm: {
      container: 'gap-2',
      number: 'text-2xl sm:text-3xl',
      label: 'text-xs',
      unit: 'p-3',
      width: 'w-16 h-16'
    },
    md: {
      container: 'gap-4',
      number: 'text-3xl sm:text-4xl lg:text-5xl',
      label: 'text-sm',
      unit: 'p-4',
      width: 'w-20 h-20 sm:w-24 sm:h-24'
    },
    lg: {
      container: 'gap-6',
      number: 'text-4xl sm:text-6xl lg:text-7xl',
      label: 'text-base',
      unit: 'p-6',
      width: 'w-24 h-24 sm:w-32 sm:h-32'
    }
  }

  const currentSize = sizeClasses[size]

  if (isExpired) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn("text-center", className)}
      >
        <div className="relative">
          <motion.div
            animate={{ 
              boxShadow: [
                "0 0 20px rgba(212, 175, 55, 0.3)",
                "0 0 40px rgba(212, 175, 55, 0.5)",
                "0 0 20px rgba(212, 175, 55, 0.3)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="bg-luxury-gold text-black px-8 py-4 rounded-lg inline-block"
          >
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6" />
              <span className="font-playfair text-xl font-bold tracking-wide">
                EVENT IS LIVE
              </span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className={cn("flex items-center justify-center", currentSize.container, className)}>
      {timeLeft.map((unit, index) => (
        <motion.div
          key={unit.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="text-center"
        >
          {/* Time Unit Display */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className={cn(
              "relative bg-black border border-gray-800 rounded-lg flex items-center justify-center",
              currentSize.unit,
              currentSize.width
            )}
          >
            {/* Animated Border */}
            <motion.div
              className="absolute inset-0 rounded-lg border-2 border-luxury-gold opacity-0"
              animate={{ opacity: [0, 0.5, 0] }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                delay: index * 0.2
              }}
            />
            
            {/* Number */}
            <motion.span
              key={unit.value}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "font-playfair font-bold text-luxury-gold tabular-nums",
                currentSize.number
              )}
            >
              {unit.value.toString().padStart(2, '0')}
            </motion.span>
            
            {/* Progress Ring for Hours/Minutes/Seconds */}
            {unit.max && unit.value > 0 && (
              <motion.div
                className="absolute inset-0 rounded-lg"
                style={{
                  background: `conic-gradient(from 0deg, transparent ${(unit.value / unit.max) * 360}deg, rgba(212, 175, 55, 0.1) ${(unit.value / unit.max) * 360}deg)`
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ duration: 0.5 }}
              />
            )}
          </motion.div>

          {/* Label */}
          {showLabels && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 + (index * 0.1) }}
              className={cn(
                "mt-2 text-gray-400 font-medium tracking-widest uppercase",
                currentSize.label
              )}
            >
              {unit.label}
            </motion.p>
          )}
          
          {/* Separator Colon */}
          {index < timeLeft.length - 1 && (
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className={cn(
                "absolute top-1/2 -translate-y-1/2 text-luxury-gold font-bold",
                currentSize.number,
                size === 'sm' ? 'right-[-8px]' : size === 'md' ? 'right-[-12px]' : 'right-[-16px]'
              )}
            >
              :
            </motion.div>
          )}
        </motion.div>
      ))}
    </div>
  )
}

// Preset countdown with event styling
export function EventCountdown() {
  // December 12, 2024 at 7:00 PM
  const eventDate = new Date('2024-12-12T19:00:00')
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2 mb-4"
        >
          <Clock className="w-5 h-5 text-luxury-gold" />
          <p className="text-luxury-gold text-sm tracking-[0.2em] uppercase">
            Event Begins In
          </p>
        </motion.div>
        
        <Countdown 
          targetDate={eventDate}
          size="lg"
          className="mb-6"
        />
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-sm text-gray-500"
        >
          <p>December 12, 2024 " 7:00 PM</p>
          <p className="mt-1">Don't miss this exclusive event</p>
        </motion.div>
      </div>
    </div>
  )
}