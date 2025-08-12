'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Activity, 
  User, 
  Heart, 
  Eye, 
  LogIn,
  Package,
  Bell,
  Filter,
  RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ActivityItem {
  id: string
  type: 'checkin' | 'wish' | 'view' | 'register'
  user: string
  message: string
  timestamp: Date
  icon: any
  color: string
}

export function LiveActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [filter, setFilter] = useState<'all' | 'checkin' | 'wish' | 'view'>('all')
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    // Simulate real-time activity
    const generateActivity = () => {
      const types = ['checkin', 'wish', 'view', 'register']
      const names = ['Isabella R.', 'Sofia M.', 'Carmen L.', 'Ana P.', 'Maria G.']
      const products = ['Vintage Chanel Bag', 'Gucci Loafers', 'YSL Dress', 'Hermès Scarf']
      
      const type = types[Math.floor(Math.random() * types.length)] as ActivityItem['type']
      const name = names[Math.floor(Math.random() * names.length)]
      
      let message = ''
      let icon = User
      let color = 'text-gray-400'
      
      switch (type) {
        case 'checkin':
          message = `${name} checked in`
          icon = LogIn
          color = 'text-green-400'
          break
        case 'wish':
          message = `${name} added ${products[Math.floor(Math.random() * products.length)]} to wishlist`
          icon = Heart
          color = 'text-luxury-gold'
          break
        case 'view':
          message = `${name} is viewing Look ${Math.floor(Math.random() * 10) + 1}`
          icon = Eye
          color = 'text-blue-400'
          break
        case 'register':
          message = `${name} just registered`
          icon = User
          color = 'text-purple-400'
          break
      }
      
      const newActivity: ActivityItem = {
        id: Math.random().toString(36).substring(7),
        type,
        user: name,
        message,
        timestamp: new Date(),
        icon,
        color
      }
      
      setActivities(prev => [newActivity, ...prev].slice(0, 20))
    }

    // Initial activities
    for (let i = 0; i < 5; i++) {
      setTimeout(() => generateActivity(), i * 200)
    }

    // Simulate real-time updates
    let interval: NodeJS.Timeout
    if (autoRefresh) {
      interval = setInterval(generateActivity, 5000)
    }

    return () => clearInterval(interval)
  }, [autoRefresh])

  const filteredActivities = filter === 'all' 
    ? activities 
    : activities.filter(a => a.type === filter)

  return (
    <div className="bg-gray-950 border border-gray-900 rounded-lg">
      {/* Header */}
      <div className="p-4 border-b border-gray-900">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-luxury-gold" />
            <h3 className="font-medium">Live Activity</h3>
            <div className="flex items-center gap-1 px-2 py-0.5 bg-green-500/20 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-green-400">Live</span>
            </div>
          </div>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={cn(
              "p-1.5 rounded transition-colors",
              autoRefresh 
                ? "bg-green-500/20 text-green-400" 
                : "bg-gray-900 text-gray-500 hover:text-white"
            )}
          >
            <RefreshCw className={cn("w-4 h-4", autoRefresh && "animate-spin")} />
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {['all', 'checkin', 'wish', 'view'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={cn(
                "px-3 py-1 text-xs rounded-lg transition-colors capitalize",
                filter === f
                  ? "bg-luxury-gold/20 text-luxury-gold"
                  : "bg-gray-900 text-gray-500 hover:text-white"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Activity List */}
      <div className="p-4 max-h-96 overflow-y-auto space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredActivities.length > 0 ? (
            filteredActivities.map((activity) => (
              <motion.div
                key={activity.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-start gap-3 group"
              >
                <div className={cn(
                  "p-2 rounded-lg bg-gray-900 group-hover:bg-gray-800 transition-colors"
                )}>
                  <activity.icon className={cn("w-4 h-4", activity.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{activity.message}</p>
                  <p className="text-xs text-gray-500">
                    {formatTimeAgo(activity.timestamp)}
                  </p>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Bell className="w-8 h-8 mx-auto mb-2 text-gray-700" />
              <p className="text-sm">No activity yet</p>
              <p className="text-xs mt-1">Activities will appear here in real-time</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
  
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}