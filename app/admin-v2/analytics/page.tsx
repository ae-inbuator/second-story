'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3,
  TrendingUp,
  Users,
  Heart,
  Eye,
  Calendar,
  Clock,
  Download,
  Filter,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Package,
  Activity
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Chart } from '../components/shared/Chart'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface AnalyticsData {
  guestFlow: { hour: string; count: number }[]
  wishlistTrends: { day: string; count: number }[]
  lookEngagement: { name: string; views: number; wishes: number }[]
  conversionFunnel: { stage: string; count: number }[]
  topProducts: { name: string; wishes: number }[]
  demographics: { category: string; count: number }[]
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData>({
    guestFlow: [],
    wishlistTrends: [],
    lookEngagement: [],
    conversionFunnel: [],
    topProducts: [],
    demographics: []
  })
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'all'>('week')
  const [loading, setLoading] = useState(true)
  const [selectedMetric, setSelectedMetric] = useState<'guests' | 'wishes' | 'engagement'>('guests')

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  async function fetchAnalytics() {
    setLoading(true)
    try {
      // Fetch real data from Supabase
      const [guestsData, wishesData, looksData, productsData] = await Promise.all([
        supabase.from('guests').select('*'),
        supabase.from('wishlists').select('*'),
        supabase.from('looks').select('*'),
        supabase.from('products').select('*')
      ])

      // Process and generate analytics data
      // For demo, using simulated data
      const hours = ['9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm']
      const guestFlow = hours.map(hour => ({
        hour,
        count: Math.floor(Math.random() * 50) + 10
      }))

      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      const wishlistTrends = days.map(day => ({
        day,
        count: Math.floor(Math.random() * 100) + 20
      }))

      const lookEngagement = (looksData.data || []).slice(0, 5).map(look => ({
        name: `Look ${look.look_number}`,
        views: Math.floor(Math.random() * 200) + 50,
        wishes: Math.floor(Math.random() * 50) + 10
      }))

      const conversionFunnel = [
        { stage: 'Invited', count: 500 },
        { stage: 'Registered', count: 380 },
        { stage: 'Checked In', count: 250 },
        { stage: 'Engaged', count: 180 },
        { stage: 'Wished', count: 120 }
      ]

      const topProducts = (productsData.data || []).slice(0, 5).map(product => ({
        name: product.brand,
        wishes: Math.floor(Math.random() * 30) + 5
      }))

      const demographics = [
        { category: '18-24', count: 45 },
        { category: '25-34', count: 120 },
        { category: '35-44', count: 85 },
        { category: '45-54', count: 50 },
        { category: '55+', count: 30 }
      ]

      setData({
        guestFlow,
        wishlistTrends,
        lookEngagement,
        conversionFunnel,
        topProducts,
        demographics
      })
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
      toast.error('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  async function exportReport() {
    toast.success('Generating report...')
    // In real app, generate PDF or CSV report
    setTimeout(() => {
      toast.success('Report downloaded!')
    }, 2000)
  }

  // Calculate KPIs
  const totalGuests = data.conversionFunnel[0]?.count || 0
  const checkedIn = data.conversionFunnel[2]?.count || 0
  const totalWishes = data.wishlistTrends.reduce((sum, d) => sum + d.count, 0)
  const avgWishesPerGuest = checkedIn > 0 ? (totalWishes / checkedIn).toFixed(1) : '0'
  const conversionRate = totalGuests > 0 ? ((checkedIn / totalGuests) * 100).toFixed(1) : '0'
  const engagementRate = checkedIn > 0 ? ((data.conversionFunnel[3]?.count || 0) / checkedIn * 100).toFixed(1) : '0'

  const kpis = [
    {
      title: 'Conversion Rate',
      value: `${conversionRate}%`,
      change: 12.5,
      icon: TrendingUp,
      color: 'text-green-500',
      bg: 'bg-green-500/10'
    },
    {
      title: 'Avg Wishes/Guest',
      value: avgWishesPerGuest,
      change: 8.3,
      icon: Heart,
      color: 'text-luxury-gold',
      bg: 'bg-luxury-gold/10'
    },
    {
      title: 'Engagement Rate',
      value: `${engagementRate}%`,
      change: -2.1,
      icon: Activity,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    {
      title: 'Total Revenue',
      value: '$124.5K',
      change: 15.8,
      icon: DollarSign,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-luxury-gold"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-playfair">Analytics</h1>
          <p className="text-gray-500 mt-1">
            Track performance and insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Time Range Selector */}
          <div className="flex bg-gray-900 rounded-lg p-1">
            {(['today', 'week', 'month', 'all'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={cn(
                  "px-3 py-1.5 rounded text-sm capitalize transition-colors",
                  timeRange === range 
                    ? "bg-luxury-gold text-black" 
                    : "text-gray-400 hover:text-white"
                )}
              >
                {range === 'all' ? 'All Time' : range}
              </button>
            ))}
          </div>
          
          <button
            onClick={fetchAnalytics}
            className="p-2 hover:bg-gray-900 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-gray-400" />
          </button>
          
          <button
            onClick={exportReport}
            className="flex items-center gap-2 px-4 py-2 bg-luxury-gold text-black rounded-lg hover:bg-luxury-gold/80 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-950 border border-gray-900 rounded-lg p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={cn("p-2 rounded-lg", kpi.bg)}>
                <kpi.icon className={cn("w-5 h-5", kpi.color)} />
              </div>
              <div className={cn(
                "flex items-center gap-1 text-sm",
                kpi.change > 0 ? "text-green-500" : "text-red-500"
              )}>
                {kpi.change > 0 ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : (
                  <ArrowDownRight className="w-4 h-4" />
                )}
                {Math.abs(kpi.change)}%
              </div>
            </div>
            <div>
              <p className="text-2xl font-light">{kpi.value}</p>
              <p className="text-sm text-gray-500 mt-1">{kpi.title}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Guest Flow Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-950 border border-gray-900 rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Guest Flow</h3>
            <Users className="w-5 h-5 text-gray-500" />
          </div>
          <Chart
            type="area"
            data={data.guestFlow.map(d => d.count)}
            labels={data.guestFlow.map(d => d.hour)}
            colors={['#60A5FA']}
            height={250}
          />
        </motion.div>

        {/* Wishlist Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-950 border border-gray-900 rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Wishlist Trends</h3>
            <Heart className="w-5 h-5 text-gray-500" />
          </div>
          <Chart
            type="bar"
            data={data.wishlistTrends.map(d => d.count)}
            labels={data.wishlistTrends.map(d => d.day)}
            colors={['#D4AF37', '#F59E0B', '#EF4444', '#8B5CF6', '#3B82F6', '#10B981', '#EC4899']}
            height={250}
          />
        </motion.div>

        {/* Conversion Funnel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-950 border border-gray-900 rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Conversion Funnel</h3>
            <Filter className="w-5 h-5 text-gray-500" />
          </div>
          <div className="space-y-3">
            {data.conversionFunnel.map((stage, index) => {
              const percentage = (stage.count / data.conversionFunnel[0].count) * 100
              const dropoff = index > 0 
                ? ((data.conversionFunnel[index - 1].count - stage.count) / data.conversionFunnel[index - 1].count * 100).toFixed(1)
                : null
              
              return (
                <div key={stage.stage}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{stage.stage}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">{stage.count}</span>
                      {dropoff && (
                        <span className="text-xs text-red-500">-{dropoff}%</span>
                      )}
                    </div>
                  </div>
                  <div className="h-8 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-luxury-gold to-yellow-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Demographics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-950 border border-gray-900 rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Demographics</h3>
            <Users className="w-5 h-5 text-gray-500" />
          </div>
          <Chart
            type="donut"
            data={data.demographics.map(d => d.count)}
            labels={data.demographics.map(d => d.category)}
            colors={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']}
            height={250}
          />
        </motion.div>
      </div>

      {/* Look Engagement Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gray-950 border border-gray-900 rounded-lg p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Look Engagement</h3>
          <Eye className="w-5 h-5 text-gray-500" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-800">
              <tr>
                <th className="text-left py-3 text-sm font-medium text-gray-400">Look</th>
                <th className="text-right py-3 text-sm font-medium text-gray-400">Views</th>
                <th className="text-right py-3 text-sm font-medium text-gray-400">Wishes</th>
                <th className="text-right py-3 text-sm font-medium text-gray-400">Conversion</th>
                <th className="text-right py-3 text-sm font-medium text-gray-400">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {data.lookEngagement.map((look, index) => (
                <tr key={index} className="hover:bg-gray-900/50 transition-colors">
                  <td className="py-3 text-sm">{look.name}</td>
                  <td className="py-3 text-sm text-right">{look.views}</td>
                  <td className="py-3 text-sm text-right">{look.wishes}</td>
                  <td className="py-3 text-sm text-right">
                    {((look.wishes / look.views) * 100).toFixed(1)}%
                  </td>
                  <td className="py-3 text-sm text-right">
                    <span className={cn(
                      "inline-flex items-center gap-1",
                      index % 2 === 0 ? "text-green-500" : "text-red-500"
                    )}>
                      {index % 2 === 0 ? (
                        <ArrowUpRight className="w-3 h-3" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3" />
                      )}
                      {Math.floor(Math.random() * 20) + 5}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Top Products */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-gray-950 border border-gray-900 rounded-lg p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Top Products by Wishes</h3>
          <Package className="w-5 h-5 text-gray-500" />
        </div>
        <div className="space-y-3">
          {data.topProducts.map((product, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-gray-600">
                  #{index + 1}
                </span>
                <span className="font-medium">{product.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-luxury-gold" />
                  <span className="font-medium">{product.wishes}</span>
                </div>
                <div className="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-luxury-gold to-yellow-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${(product.wishes / data.topProducts[0].wishes) * 100}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}