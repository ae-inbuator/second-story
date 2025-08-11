'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Search, 
  Activity,
  User,
  Clock,
  Wifi,
  WifiOff,
  Download,
  ChevronLeft,
  ChevronRight,
  Eye,
  Heart,
  Zap
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useWebSocket } from '@/hooks/useWebSocket'
import { AdminLayout } from '@/components/admin/AdminLayout'

interface ActiveGuest {
  id: string
  name: string
  email: string
  checked_in_at: string
  last_active?: string
  current_look?: string
  wishes_count?: number
  session_duration?: number
  connection_status: 'online' | 'idle' | 'offline'
}

export default function ActiveGuestsPage() {
  const [activeGuests, setActiveGuests] = useState<ActiveGuest[]>([])
  const [filteredGuests, setFilteredGuests] = useState<ActiveGuest[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'idle' | 'offline'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState<'last_active' | 'name' | 'session_duration'>('last_active')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const { socket, isConnected, on, off } = useWebSocket()

  const ITEMS_PER_PAGE = 20

  useEffect(() => {
    fetchActiveGuests()
    
    // Refresh data every 10 seconds for real-time updates
    const interval = setInterval(fetchActiveGuests, 10000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!socket) return

    const handleGuestActivity = (data: any) => {
      setActiveGuests(prev => prev.map(guest => 
        guest.id === data.guestId 
          ? { 
              ...guest, 
              last_active: new Date().toISOString(),
              connection_status: 'online',
              current_look: data.currentLook || guest.current_look 
            }
          : guest
      ))
    }

    const handleGuestDisconnect = (data: any) => {
      setActiveGuests(prev => prev.map(guest => 
        guest.id === data.guestId 
          ? { ...guest, connection_status: 'offline' }
          : guest
      ))
    }

    on('guest:activity', handleGuestActivity)
    on('guest:disconnect', handleGuestDisconnect)

    return () => {
      off('guest:activity', handleGuestActivity)
      off('guest:disconnect', handleGuestDisconnect)
    }
  }, [socket, on, off])

  useEffect(() => {
    filterGuests()
  }, [activeGuests, search, statusFilter, sortBy, sortOrder])

  async function fetchActiveGuests() {
    try {
      // Get checked-in guests with their wishlist counts
      const { data: guests, error: guestsError } = await supabase
        .from('guests')
        .select(`
          id,
          name,
          email,
          checked_in_at
        `)
        .not('checked_in_at', 'is', null)

      if (guestsError) throw guestsError

      // Get wishlist counts for each guest
      const { data: wishlists, error: wishlistError } = await supabase
        .from('wishlists')
        .select('guest_id')

      if (wishlistError) throw wishlistError

      // Process guest data
      const processedGuests: ActiveGuest[] = (guests || []).map(guest => {
        const wishCount = wishlists?.filter(w => w.guest_id === guest.id).length || 0
        const checkInTime = new Date(guest.checked_in_at)
        const now = new Date()
        const sessionDuration = Math.floor((now.getTime() - checkInTime.getTime()) / (1000 * 60)) // in minutes
        
        // Simulate activity status (in a real app, this would come from WebSocket/real-time data)
        const lastActiveMinutes = Math.floor(Math.random() * 30) // 0-30 minutes ago
        const lastActive = new Date(now.getTime() - lastActiveMinutes * 60 * 1000)
        
        let connectionStatus: 'online' | 'idle' | 'offline' = 'online'
        if (lastActiveMinutes > 5) connectionStatus = 'idle'
        if (lastActiveMinutes > 15) connectionStatus = 'offline'

        return {
          id: guest.id,
          name: guest.name,
          email: guest.email,
          checked_in_at: guest.checked_in_at,
          last_active: lastActive.toISOString(),
          wishes_count: wishCount,
          session_duration: sessionDuration,
          connection_status: connectionStatus,
          current_look: `Look ${Math.floor(Math.random() * 20) + 1}` // Simulated
        }
      })

      setActiveGuests(processedGuests)
    } catch (error) {
      console.error('Failed to fetch active guests:', error)
    } finally {
      setLoading(false)
    }
  }

  function filterGuests() {
    let filtered = [...activeGuests]

    // Search filter
    if (search) {
      filtered = filtered.filter(guest =>
        guest.name.toLowerCase().includes(search.toLowerCase()) ||
        guest.email.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(guest => guest.connection_status === statusFilter)
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortBy]
      let bVal = b[sortBy]
      
      if (sortBy === 'name') {
        aVal = a.name
        bVal = b.name
        const result = (aVal || '').localeCompare(bVal || '')
        return sortOrder === 'asc' ? result : -result
      }
      
      if (sortBy === 'last_active') {
        const result = new Date(a.last_active || 0).getTime() - new Date(b.last_active || 0).getTime()
        return sortOrder === 'asc' ? result : -result
      }
      
      if (sortBy === 'session_duration') {
        const result = (a.session_duration || 0) - (b.session_duration || 0)
        return sortOrder === 'asc' ? result : -result
      }
      
      return 0
    })

    setFilteredGuests(filtered)
    setCurrentPage(1)
  }

  async function exportActiveGuests() {
    const csvContent = [
      ['Name', 'Email', 'Status', 'Last Active', 'Session Duration (min)', 'Wishes', 'Current Look'].join(','),
      ...filteredGuests.map(guest => [
        `"${guest.name}"`,

        `"${guest.email}"`,
        `"${guest.connection_status}"`,
        `"${guest.last_active ? new Date(guest.last_active).toLocaleString() : 'Unknown'}"`,
        `"${guest.session_duration || 0}"`,
        `"${guest.wishes_count || 0}"`,
        `"${guest.current_look || 'Unknown'}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `active-guests-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  function formatLastActive(dateString: string | undefined) {
    if (!dateString) return 'Unknown'
    
    const now = new Date()
    const lastActive = new Date(dateString)
    const diffMs = now.getTime() - lastActive.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffSecs = Math.floor(diffMs / 1000)

    if (diffSecs < 30) return 'Just now'
    if (diffMins < 1) return `${diffSecs}s ago`
    if (diffMins < 60) return `${diffMins}m ago`
    return `${Math.floor(diffMins / 60)}h ago`
  }

  function formatSessionDuration(minutes: number | undefined) {
    if (!minutes) return '0m'
    if (minutes < 60) return `${minutes}m`
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`
  }

  const totalPages = Math.ceil(filteredGuests.length / ITEMS_PER_PAGE)
  const paginatedGuests = filteredGuests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const onlineCount = activeGuests.filter(g => g.connection_status === 'online').length
  const idleCount = activeGuests.filter(g => g.connection_status === 'idle').length
  const avgSessionDuration = activeGuests.length > 0 
    ? Math.round(activeGuests.reduce((sum, g) => sum + (g.session_duration || 0), 0) / activeGuests.length)
    : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-luxury-gold"></div>
      </div>
    )
  }

  return (
    <AdminLayout 
      title="Active Guests"
      subtitle={`${onlineCount} online • ${idleCount} idle • Real-time monitoring`}
      showBackButton={true}
      backUrl="/admin"
    >
      {/* Status Bar */}
      <div className="bg-black border-b border-gray-900 px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs",
            isConnected 
              ? "bg-green-500/20 text-green-400" 
              : "bg-red-500/20 text-red-400"
          )}>
            {isConnected ? (
              <>
                <Wifi className="w-3 h-3" />
                <span>Live Updates</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3" />
                <span>Offline</span>
              </>
            )}
          </div>
          <button
            onClick={exportActiveGuests}
            className="btn-luxury flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Filters */}
        <div className="bg-gray-950 border border-gray-900 rounded-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-black border border-gray-800 rounded-lg text-white placeholder:text-gray-600 focus:border-luxury-gold focus:outline-none"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 bg-black border border-gray-800 rounded-lg text-white focus:border-luxury-gold focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="online">Online</option>
                <option value="idle">Idle</option>
                <option value="offline">Offline</option>
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-')
                  setSortBy(field as any)
                  setSortOrder(order as any)
                }}
                className="px-3 py-2 bg-black border border-gray-800 rounded-lg text-white focus:border-luxury-gold focus:outline-none"
              >
                <option value="last_active-desc">Most Recent Activity</option>
                <option value="last_active-asc">Least Recent Activity</option>
                <option value="session_duration-desc">Longest Session</option>
                <option value="session_duration-asc">Shortest Session</option>
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Online', value: onlineCount, icon: Wifi, color: 'text-green-400' },
            { label: 'Idle', value: idleCount, icon: Clock, color: 'text-yellow-400' },
            { label: 'Total Active', value: activeGuests.length, icon: Activity, color: 'text-blue-400' },
            { label: 'Avg Session', value: `${avgSessionDuration}m`, icon: Zap, color: 'text-luxury-gold' }
          ].map((stat) => (
            <div key={stat.label} className="bg-gray-950 border border-gray-900 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <stat.icon className={cn("w-5 h-5", stat.color)} />
                <span className="text-2xl font-light">{stat.value}</span>
              </div>
              <p className="text-xs tracking-widest uppercase text-gray-600 mt-2">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Active Guests Table */}
        <div className="bg-gray-950 border border-gray-900 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Guest
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Last Active
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Session
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Activity
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {paginatedGuests.map((guest, idx) => (
                  <motion.tr
                    key={guest.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-gray-900/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center",
                          guest.connection_status === 'online' 
                            ? 'bg-green-500/20' 
                            : guest.connection_status === 'idle'
                            ? 'bg-yellow-500/20'
                            : 'bg-gray-500/20'
                        )}>
                          <User className={cn(
                            "w-5 h-5",
                            guest.connection_status === 'online' 
                              ? 'text-green-400' 
                              : guest.connection_status === 'idle'
                              ? 'text-yellow-400'
                              : 'text-gray-400'
                          )} />
                        </div>
                        <div>
                          <p className="font-medium text-white">{guest.name}</p>
                          <p className="text-sm text-gray-400">{guest.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          guest.connection_status === 'online' 
                            ? 'bg-green-500 animate-pulse'
                            : guest.connection_status === 'idle'
                            ? 'bg-yellow-500'
                            : 'bg-gray-500'
                        )} />
                        <span className={cn(
                          "text-sm capitalize",
                          guest.connection_status === 'online' 
                            ? 'text-green-400'
                            : guest.connection_status === 'idle'
                            ? 'text-yellow-400'
                            : 'text-gray-400'
                        )}>
                          {guest.connection_status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {formatLastActive(guest.last_active)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-white">{formatSessionDuration(guest.session_duration)}</p>
                        <p className="text-gray-400">
                          Since {new Date(guest.checked_in_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4 text-luxury-gold" />
                          <span className="text-gray-400">{guest.wishes_count || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4 text-blue-400" />
                          <span className="text-gray-400">{guest.current_look || 'Unknown'}</span>
                        </div>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-900/30 border-t border-gray-800">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredGuests.length)} of {filteredGuests.length} active guests
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  <span className="px-3 py-1 text-sm bg-gray-800 rounded">
                    {currentPage} of {totalPages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Empty State */}
        {filteredGuests.length === 0 && !loading && (
          <div className="bg-gray-950 border border-gray-900 rounded-lg p-12 text-center">
            <Activity className="w-12 h-12 mx-auto mb-4 text-gray-700" />
            <p className="text-gray-500">No active guests found</p>
            {search || statusFilter !== 'all' ? (
              <p className="text-sm text-gray-600 mt-2">Try adjusting your filters</p>
            ) : (
              <p className="text-sm text-gray-600 mt-2">No guests are currently active</p>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}