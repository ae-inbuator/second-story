'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Clock,
  User,
  MapPin,
  Download,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Users
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { AdminLayout } from '@/components/admin/AdminLayout'

interface CheckedInGuest {
  id: string
  name: string
  email: string
  phone?: string
  created_at: string
  checked_in_at: string
  invite_sent_at?: string
  invite_accepted_at?: string
}

export default function CheckInsPage() {
  const [guests, setGuests] = useState<CheckedInGuest[]>([])
  const [filteredGuests, setFilteredGuests] = useState<CheckedInGuest[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'last_hour' | 'last_30min'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState<'checked_in_at' | 'name'>('checked_in_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const ITEMS_PER_PAGE = 20

  useEffect(() => {
    fetchCheckedInGuests()
    
    // Refresh data every 30 seconds for real-time updates
    const interval = setInterval(fetchCheckedInGuests, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    filterGuests()
  }, [guests, search, timeFilter, sortBy, sortOrder])

  async function fetchCheckedInGuests() {
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

  function filterGuests() {
    let filtered = [...guests]

    // Search filter
    if (search) {
      filtered = filtered.filter(guest =>
        guest.name.toLowerCase().includes(search.toLowerCase()) ||
        guest.email.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Time filter
    if (timeFilter !== 'all') {
      const now = new Date()
      let cutoff: Date

      switch (timeFilter) {
        case 'today':
          cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case 'last_hour':
          cutoff = new Date(now.getTime() - 60 * 60 * 1000)
          break
        case 'last_30min':
          cutoff = new Date(now.getTime() - 30 * 60 * 1000)
          break
        default:
          cutoff = new Date(0)
      }

      filtered = filtered.filter(guest => 
        new Date(guest.checked_in_at) >= cutoff
      )
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortBy]
      let bVal = b[sortBy]
      
      if (!aVal) aVal = ''
      if (!bVal) bVal = ''
      
      const result = sortBy === 'checked_in_at' 
        ? new Date(aVal).getTime() - new Date(bVal).getTime()
        : aVal.localeCompare(bVal)
      
      return sortOrder === 'asc' ? result : -result
    })

    setFilteredGuests(filtered)
    setCurrentPage(1)
  }

  async function exportCheckIns() {
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Check-in Time', 'Registration Date'].join(','),
      ...filteredGuests.map(guest => [
        `"${guest.name}"`,

        `"${guest.email}"`,
        `"${guest.phone || ''}"`,
        `"${new Date(guest.checked_in_at).toLocaleString()}"`,
        `"${new Date(guest.created_at).toLocaleDateString()}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `checkins-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  function formatTimeAgo(dateString: string) {
    const now = new Date()
    const checkIn = new Date(dateString)
    const diffMs = now.getTime() - checkIn.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  const totalPages = Math.ceil(filteredGuests.length / ITEMS_PER_PAGE)
  const paginatedGuests = filteredGuests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const todayCheckIns = guests.filter(g => {
    const today = new Date()
    const checkInDate = new Date(g.checked_in_at)
    return checkInDate.toDateString() === today.toDateString()
  }).length

  const lastHourCheckIns = guests.filter(g => {
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000)
    return new Date(g.checked_in_at) >= hourAgo
  }).length

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-luxury-gold"></div>
      </div>
    )
  }

  return (
    <AdminLayout 
      title="Guest Check-ins"
      subtitle={`${filteredGuests.length} check-ins • ${todayCheckIns} today • ${lastHourCheckIns} last hour`}
      showBackButton={true}
      backUrl="/admin"
    >
      {/* Status Bar */}
      <div className="bg-black border-b border-gray-900 px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/20 text-green-400 text-xs">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Live Updates</span>
          </div>
          <button
            onClick={exportCheckIns}
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

            {/* Time Filter */}
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value as any)}
                className="px-3 py-2 bg-black border border-gray-800 rounded-lg text-white focus:border-luxury-gold focus:outline-none"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="last_hour">Last Hour</option>
                <option value="last_30min">Last 30 Minutes</option>
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
                <option value="checked_in_at-desc">Latest Check-ins</option>
                <option value="checked_in_at-asc">Earliest Check-ins</option>
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Check-ins', value: guests.length, icon: Users, color: 'text-green-400' },
            { label: 'Today', value: todayCheckIns, icon: Calendar, color: 'text-blue-400' },
            { label: 'Last Hour', value: lastHourCheckIns, icon: Clock, color: 'text-yellow-400' },
            { label: 'Average/Hour', value: guests.length > 0 ? Math.round(guests.length / ((Date.now() - new Date(guests[guests.length - 1]?.checked_in_at || Date.now()).getTime()) / 3600000)) : 0, icon: MapPin, color: 'text-luxury-gold' }
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

        {/* Check-ins Table */}
        <div className="bg-gray-950 border border-gray-900 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Guest
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Check-in Time
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Time Ago
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Registered
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
                        <div className="w-10 h-10 bg-luxury-gold/20 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-luxury-gold" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{guest.name}</p>
                          <p className="text-sm text-gray-400">{guest.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-white">
                          {new Date(guest.checked_in_at).toLocaleDateString()}
                        </p>
                        <p className="text-gray-400">
                          {new Date(guest.checked_in_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                        new Date(guest.checked_in_at).getTime() > Date.now() - 30 * 60 * 1000
                          ? "bg-green-500/20 text-green-400"
                          : new Date(guest.checked_in_at).getTime() > Date.now() - 60 * 60 * 1000
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-gray-500/20 text-gray-400"
                      )}>
                        {formatTimeAgo(guest.checked_in_at)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {new Date(guest.created_at).toLocaleDateString()}
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
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredGuests.length)} of {filteredGuests.length} check-ins
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
            <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-700" />
            <p className="text-gray-500">No check-ins found</p>
            {search || timeFilter !== 'all' ? (
              <p className="text-sm text-gray-600 mt-2">Try adjusting your filters</p>
            ) : (
              <p className="text-sm text-gray-600 mt-2">No guests have checked in yet</p>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}