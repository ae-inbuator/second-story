'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Eye,
  Users,
  Clock,
  Calendar,
  User,
  Activity,
  MapPin,
  CheckCircle
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { DataTable, Column } from '../components/shared/DataTable'
import { cn } from '@/lib/utils'

interface CheckedInGuest {
  id: string
  name: string
  email: string
  phone_number?: string
  checked_in_at: string
  created_at: string
  vip_level?: string
}

export default function CheckinsPage() {
  const [guests, setGuests] = useState<CheckedInGuest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCheckedInGuests()
    
    // Refresh every 30 seconds for real-time updates
    const interval = setInterval(fetchCheckedInGuests, 30000)
    return () => clearInterval(interval)
  }, [])

  async function fetchCheckedInGuests() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .not('checked_in_at', 'is', null)
        .order('checked_in_at', { ascending: false })

      if (error) throw error
      setGuests(data || [])
    } catch (error) {
      console.error('Failed to fetch checked-in guests:', error)
    } finally {
      setLoading(false)
    }
  }

  function formatTimeAgo(dateString: string) {
    const now = new Date()
    const checkIn = new Date(dateString)
    const diffMs = now.getTime() - checkIn.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return new Date(dateString).toLocaleDateString()
  }

  // Stats calculations
  const todayCheckIns = guests.filter(g => {
    const today = new Date()
    const checkInDate = new Date(g.checked_in_at)
    return checkInDate.toDateString() === today.toDateString()
  }).length

  const lastHourCheckIns = guests.filter(g => {
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000)
    return new Date(g.checked_in_at) >= hourAgo
  }).length

  const vipCheckIns = guests.filter(g => g.vip_level && g.vip_level !== 'standard').length

  // Table columns
  const columns: Column<CheckedInGuest>[] = [
    {
      key: 'guest',
      header: 'Guest',
      accessor: (guest) => guest.name,
      sortable: true,
      searchable: true,
      render: (name, guest) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-luxury-gold/20 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-luxury-gold" />
          </div>
          <div>
            <p className="font-medium text-white">{name}</p>
            <p className="text-sm text-gray-400">{guest.email}</p>
            {guest.vip_level && guest.vip_level !== 'standard' && (
              <span className="text-xs text-luxury-gold">VIP {guest.vip_level}</span>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'checkin_time',
      header: 'Check-in Time',
      accessor: (guest) => guest.checked_in_at,
      sortable: true,
      render: (datetime) => (
        <div className="text-sm">
          <p className="text-white">{new Date(datetime).toLocaleDateString()}</p>
          <p className="text-gray-400">{new Date(datetime).toLocaleTimeString()}</p>
        </div>
      )
    },
    {
      key: 'time_ago',
      header: 'Time Ago',
      accessor: (guest) => guest.checked_in_at,
      render: (datetime) => {
        const isRecent = new Date(datetime).getTime() > Date.now() - 30 * 60 * 1000
        return (
          <span className={cn(
            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
            isRecent
              ? "bg-green-500/20 text-green-400"
              : "bg-gray-500/20 text-gray-400"
          )}>
            {formatTimeAgo(datetime)}
          </span>
        )
      }
    },
    {
      key: 'registered',
      header: 'Registered',
      accessor: (guest) => guest.created_at,
      render: (date) => (
        <div className="text-sm text-gray-400">
          {new Date(date).toLocaleDateString()}
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-playfair">Check-ins</h1>
          <p className="text-gray-500 mt-1">
            Real-time guest check-in tracking
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/20 text-green-400 text-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span>Live Updates</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Check-ins',
            value: guests.length,
            icon: Users,
            color: 'text-green-500',
            bg: 'bg-green-500/10'
          },
          {
            label: 'Today',
            value: todayCheckIns,
            icon: Calendar,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10'
          },
          {
            label: 'Last Hour',
            value: lastHourCheckIns,
            icon: Clock,
            color: 'text-yellow-500',
            bg: 'bg-yellow-500/10'
          },
          {
            label: 'VIP Guests',
            value: vipCheckIns,
            icon: CheckCircle,
            color: 'text-luxury-gold',
            bg: 'bg-luxury-gold/10'
          }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-950 border border-gray-900 rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div className={cn("p-2 rounded-lg", stat.bg)}>
                <stat.icon className={cn("w-5 h-5", stat.color)} />
              </div>
              <span className="text-2xl font-light">{stat.value}</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Check-ins Table */}
      <DataTable
        data={guests}
        columns={columns}
        searchPlaceholder="Search by name or email..."
        filters={[
          { label: 'All Time', value: 'all' },
          { label: 'Today', value: 'today' },
          { label: 'Last Hour', value: 'last_hour' },
          { label: 'VIP Only', value: 'vip' }
        ]}
        exportFilename="checkins"
        refreshable
        onRefresh={fetchCheckedInGuests}
        loading={loading}
        emptyMessage="No check-ins found"
        emptyIcon={Eye}
        pageSize={25}
      />

      {/* Real-time Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-950 border border-gray-900 rounded-lg p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-luxury-gold" />
          <h3 className="text-lg font-medium">Recent Check-ins</h3>
        </div>
        
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {guests.slice(0, 10).map((guest, index) => (
            <motion.div
              key={guest.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-3 p-2 hover:bg-gray-900/50 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-luxury-gold/20 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-luxury-gold" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{guest.name}</p>
                <p className="text-xs text-gray-500">
                  Checked in {formatTimeAgo(guest.checked_in_at)}
                </p>
              </div>
              {guest.vip_level && guest.vip_level !== 'standard' && (
                <span className="px-2 py-0.5 bg-luxury-gold/20 text-luxury-gold text-xs rounded-full">
                  VIP
                </span>
              )}
            </motion.div>
          ))}
        </div>
        
        {guests.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-700" />
            <p className="text-sm">No check-ins yet</p>
            <p className="text-xs mt-1">Check-ins will appear here in real-time</p>
          </div>
        )}
      </motion.div>
    </div>
  )
}