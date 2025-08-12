'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Radio, 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack,
  Clock,
  Sparkles,
  ChevronRight,
  Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface ShowStatusWidgetProps {
  status: string
  currentLook: number
  totalLooks: number
  duration: string
}

export function ShowStatusWidget({ status, currentLook, totalLooks, duration }: ShowStatusWidgetProps) {
  const router = useRouter()
  const [isExpanded, setIsExpanded] = useState(false)

  const statusConfig = {
    preparing: { color: 'text-gray-400', bg: 'bg-gray-500/20', label: 'Preparing' },
    doors_open: { color: 'text-blue-400', bg: 'bg-blue-500/20', label: 'Doors Open' },
    live: { color: 'text-green-400', bg: 'bg-green-500/20', label: 'Live' },
    paused: { color: 'text-yellow-400', bg: 'bg-yellow-500/20', label: 'Intermission' },
    ended: { color: 'text-red-400', bg: 'bg-red-500/20', label: 'Ended' }
  }

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.preparing

  return (
    <motion.div
      layout
      className="bg-gray-950 border border-gray-900 rounded-lg overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-900">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Radio className="w-6 h-6 text-luxury-gold" />
            <h2 className="text-xl font-playfair">Show Control</h2>
            <div className={cn("px-3 py-1 rounded-full text-xs font-medium", config.bg, config.color)}>
              {config.label}
            </div>
          </div>
          <button
            onClick={() => router.push('/admin-v2/show-control')}
            className="flex items-center gap-2 px-3 py-1.5 bg-luxury-gold text-black rounded-lg hover:bg-luxury-gold/80 transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span className="text-sm font-medium">Full Control</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Current Look */}
        <div className="bg-black/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Current Look</p>
              <p className="text-2xl font-playfair">
                {currentLook > 0 ? `Look ${currentLook}` : 'No Active Look'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Progress</p>
              <p className="text-lg">
                {currentLook} / {totalLooks}
              </p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-luxury-gold to-yellow-500"
                initial={{ width: 0 }}
                animate={{ width: `${(currentLook / totalLooks) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Controls */}
      <div className="p-6">
        <div className="grid grid-cols-4 gap-3">
          <button className="flex flex-col items-center gap-2 p-3 bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors">
            <SkipBack className="w-5 h-5" />
            <span className="text-xs">Previous</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-3 bg-luxury-gold text-black hover:bg-luxury-gold/80 rounded-lg transition-colors">
            {status === 'live' ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            <span className="text-xs">{status === 'live' ? 'Pause' : 'Start'}</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-3 bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors">
            <SkipForward className="w-5 h-5" />
            <span className="text-xs">Next</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-3 bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors">
            <Clock className="w-5 h-5" />
            <span className="text-xs">{duration}</span>
          </button>
        </div>

        {/* Upcoming Looks Preview */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full mt-4 p-3 bg-gray-900/50 hover:bg-gray-900 rounded-lg transition-all flex items-center justify-between group"
        >
          <span className="text-sm text-gray-400 group-hover:text-white">
            View upcoming looks
          </span>
          <ChevronRight className={cn(
            "w-4 h-4 text-gray-500 transition-transform",
            isExpanded && "rotate-90"
          )} />
        </button>

        <motion.div
          initial={false}
          animate={{ height: isExpanded ? 'auto' : 0 }}
          className="overflow-hidden"
        >
          <div className="mt-3 space-y-2">
            {[...Array(Math.min(3, totalLooks - currentLook))].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-2 bg-gray-900/30 rounded">
                <div className="w-8 h-8 bg-gray-800 rounded flex items-center justify-center">
                  <span className="text-xs font-bold">{currentLook + i + 1}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm">Look {currentLook + i + 1}</p>
                  <p className="text-xs text-gray-500">Ready</p>
                </div>
                <Sparkles className="w-4 h-4 text-gray-600" />
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}