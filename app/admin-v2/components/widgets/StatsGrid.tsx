'use client'
import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCard {
  title: string
  value: number | string
  change?: number
  icon: LucideIcon
  color: string
  bg: string
  live?: boolean
  onClick?: () => void
}

interface StatsGridProps {
  stats: StatCard[]
  columns?: 2 | 3 | 4
}

export function StatsGrid({ stats, columns = 4 }: StatsGridProps) {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  }

  return (
    <div className={cn('grid gap-4', gridCols[columns])}>
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          onClick={stat.onClick}
          className={cn(
            "bg-gray-950 border border-gray-900 rounded-lg p-6",
            stat.onClick && "cursor-pointer hover:border-gray-700 transition-all"
          )}
        >
          <div className="flex items-start justify-between mb-4">
            <div className={cn("p-2 rounded-lg", stat.bg)}>
              <stat.icon className={cn("w-5 h-5", stat.color)} />
            </div>
            {stat.live && (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Live
              </span>
            )}
          </div>
          
          <div className="space-y-1">
            <p className="text-3xl font-light">
              {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
            </p>
            <p className="text-sm text-gray-500">{stat.title}</p>
          </div>
          
          {stat.change !== undefined && (
            <div className="flex items-center gap-2 mt-4">
              <span className={cn(
                "text-sm",
                stat.change > 0 ? "text-green-500" : "text-red-500"
              )}>
                {stat.change > 0 ? '+' : ''}{stat.change}%
              </span>
              <span className="text-sm text-gray-600">vs last show</span>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  )
}