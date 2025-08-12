'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Heart, 
  Eye, 
  Activity,
  TrendingUp,
  Radio,
  Package,
  Sparkles,
  Calendar,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  RefreshCw
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

// Widget Components
import { StatsGrid } from './components/widgets/StatsGrid'
import { LiveActivityFeed } from './components/widgets/LiveActivityFeed'
import { ShowStatusWidget } from './components/widgets/ShowStatusWidget'
import { QuickActions } from './components/widgets/QuickActions'
import { RecentGuests } from './components/widgets/RecentGuests'
import { WishlistTrends } from './components/widgets/WishlistTrends'

interface DashboardStats {
  guests: {
    total: number
    checkedIn: number
    activeNow: number
    trend: number
  }
  wishes: {
    total: number
    todayCount: number
    avgPerGuest: number
    trend: number
  }
  show: {
    status: string
    currentLook: number
    totalLooks: number
    duration: string
  }
  products: {
    total: number
    inLooks: number
    wished: number
  }
}

export default function AdminV2Dashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    guests: { total: 0, checkedIn: 0, activeNow: 0, trend: 0 },
    wishes: { total: 0, todayCount: 0, avgPerGuest: 0, trend: 0 },
    show: { status: 'preparing', currentLook: 0, totalLooks: 0, duration: '0:00' },
    products: { total: 0, inLooks: 0, wished: 0 }
  })
  const [isLoading, setIsLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  useEffect(() => {
    fetchDashboardData()
    const interval = setInterval(fetchDashboardData, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])

  async function fetchDashboardData() {
    try {
      const [
        guestsResponse,
        wishesResponse,
        looksResponse,
        productsResponse,
        eventResponse
      ] = await Promise.all([
        supabase.from('guests').select('*', { count: 'exact' }),
        supabase.from('wishlists').select('*', { count: 'exact' }),
        supabase.from('looks').select('*').order('look_number'),
        supabase.from('products').select('*', { count: 'exact' }),
        supabase.from('events').select('*').eq('status', 'upcoming').single()
      ])

      const guests = guestsResponse.data || []
      const checkedIn = guests.filter(g => g.checked_in_at).length
      const wishes = wishesResponse.count || 0
      const looks = looksResponse.data || []
      const activeLook = looks.find(l => l.active)
      const products = productsResponse.count || 0

      setStats({
        guests: {
          total: guests.length,
          checkedIn,
          activeNow: Math.floor(checkedIn * 0.7), // Simulated for now
          trend: 12.5
        },
        wishes: {
          total: wishes,
          todayCount: Math.floor(wishes * 0.3),
          avgPerGuest: checkedIn > 0 ? wishes / checkedIn : 0,
          trend: 8.2
        },
        show: {
          status: eventResponse.data?.show_status || 'preparing',
          currentLook: activeLook?.look_number || 0,
          totalLooks: looks.length,
          duration: '1:45'
        },
        products: {
          total: products,
          inLooks: Math.floor(products * 0.8),
          wished: Math.floor(products * 0.6)
        }
      })
      
      setLastRefresh(new Date())
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const mainStats = [
    {
      title: 'Total Guests',
      value: stats.guests.total,
      change: stats.guests.trend,
      icon: Users,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      href: '/admin-v2/guests'
    },
    {
      title: 'Checked In',
      value: stats.guests.checkedIn,
      change: 15.3,
      icon: Eye,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
      href: '/admin-v2/checkins'
    },
    {
      title: 'Active Now',
      value: stats.guests.activeNow,
      change: -2.4,
      icon: Activity,
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10',
      live: true
    },
    {
      title: 'Total Wishes',
      value: stats.wishes.total,
      change: stats.wishes.trend,
      icon: Heart,
      color: 'text-luxury-gold',
      bg: 'bg-luxury-gold/10',
      href: '/admin-v2/wishes'
    }
  ]

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-900 rounded w-1/4 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-900 rounded-lg" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-96 bg-gray-900 rounded-lg" />
            <div className="h-96 bg-gray-900 rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-playfair">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Welcome back! Here's what's happening with your show today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </span>
          <button
            onClick={fetchDashboardData}
            className="p-2 hover:bg-gray-900 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mainStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => stat.href && router.push(stat.href)}
            className={cn(
              "bg-gray-950 border border-gray-900 rounded-lg p-6",
              stat.href && "cursor-pointer hover:border-gray-700 transition-all"
            )}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={cn("p-2 rounded-lg", stat.bg)}>
                <stat.icon className={cn("w-5 h-5", stat.color)} />
              </div>
              <button className="p-1 hover:bg-gray-900 rounded">
                <MoreVertical className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-1">
              <p className="text-3xl font-light">{stat.value.toLocaleString()}</p>
              <p className="text-sm text-gray-500">{stat.title}</p>
            </div>
            
            <div className="flex items-center gap-2 mt-4">
              {stat.change > 0 ? (
                <>
                  <ArrowUpRight className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-500">+{stat.change}%</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-500">{stat.change}%</span>
                </>
              )}
              <span className="text-sm text-gray-600">vs last show</span>
              {stat.live && (
                <span className="ml-auto flex items-center gap-1 text-xs text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Live
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Show Control & Activity */}
        <div className="lg:col-span-2 space-y-6">
          <ShowStatusWidget 
            status={stats.show.status}
            currentLook={stats.show.currentLook}
            totalLooks={stats.show.totalLooks}
            duration={stats.show.duration}
          />
          <LiveActivityFeed />
        </div>
        
        {/* Right Column - Quick Actions & Trends */}
        <div className="space-y-6">
          <QuickActions />
          <WishlistTrends />
          <RecentGuests />
        </div>
      </div>

      {/* Bottom Grid - Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-950 border border-gray-900 rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Products</h3>
            <Package className="w-5 h-5 text-gray-500" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Total Products</span>
              <span className="font-medium">{stats.products.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">In Looks</span>
              <span className="font-medium">{stats.products.inLooks}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Wished</span>
              <span className="font-medium text-luxury-gold">{stats.products.wished}</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-950 border border-gray-900 rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Engagement</h3>
            <TrendingUp className="w-5 h-5 text-gray-500" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Avg Wishes/Guest</span>
              <span className="font-medium">{stats.wishes.avgPerGuest.toFixed(1)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Conversion Rate</span>
              <span className="font-medium">
                {stats.guests.total > 0 
                  ? ((stats.guests.checkedIn / stats.guests.total) * 100).toFixed(1) 
                  : 0}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Active Rate</span>
              <span className="font-medium text-green-500">
                {stats.guests.checkedIn > 0 
                  ? ((stats.guests.activeNow / stats.guests.checkedIn) * 100).toFixed(1) 
                  : 0}%
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gray-950 border border-gray-900 rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Next Event</h3>
            <Calendar className="w-5 h-5 text-gray-500" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm">December 12, 2024</span>
            </div>
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-gray-500" />
              <span className="text-sm">7:00 PM - 10:00 PM</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gray-500" />
              <span className="text-sm">{stats.show.totalLooks} Looks Ready</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}