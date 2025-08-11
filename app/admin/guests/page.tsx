'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Mail,
  Calendar,
  Users,
  Download,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Upload,
  UserPlus,
  Send,
  Copy,
  QrCode,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { generateInvitationCode, generateWhatsAppLink, WhatsAppTemplates } from '@/lib/invitation-utils'

interface Guest {
  id: string
  name: string
  email: string
  phone_number?: string
  invitation_code?: string
  vip_level?: string
  created_at: string
  confirmed_at?: string
  checked_in_at?: string
  invitation_sent_at?: string
  registered_at?: string
}

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [filteredGuests, setFilteredGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'checked_in'>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [newGuest, setNewGuest] = useState({ name: '', phone_number: '', email: '', vip_level: 'standard' })
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'created_at'>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const ITEMS_PER_PAGE = 20

  useEffect(() => {
    fetchGuests()
  }, [])

  useEffect(() => {
    filterGuests()
  }, [guests, search, filter, sortBy, sortOrder])

  async function fetchGuests() {
    try {
      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setGuests(data || [])
    } catch (error) {
      console.error('Failed to fetch guests:', error)
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

    // Status filter
    if (filter !== 'all') {
      filtered = filtered.filter(guest => {
        switch (filter) {
          case 'invited':
            return guest.invite_sent_at !== null
          case 'accepted':
            return guest.invite_accepted_at !== null
          case 'checked_in':
            return guest.checked_in_at !== null
          default:
            return true
        }
      })
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortBy]
      let bVal = b[sortBy]
      
      if (sortBy === 'name') {
        aVal = a.name
        bVal = b.name
      }
      
      if (!aVal) aVal = ''
      if (!bVal) bVal = ''
      
      const result = aVal.localeCompare(bVal)
      return sortOrder === 'asc' ? result : -result
    })

    setFilteredGuests(filtered)
    setCurrentPage(1)
  }

  async function deleteGuest(guestId: string, guestName: string) {
    if (!confirm(`Are you sure you want to delete ${guestName}? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/guests/delete?id=${guestId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete guest')
      }

      toast.success('Guest deleted successfully')
      fetchGuests() // Refresh the list
    } catch (error) {
      console.error('Failed to delete guest:', error)
      toast.error('Failed to delete guest')
    }
  }

  async function exportGuests() {
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Registration Date', 'Invite Sent', 'Invite Accepted', 'Checked In'].join(','),
      ...filteredGuests.map(guest => [
        `"${guest.name}"`,

        `"${guest.email}"`,
        `"${guest.phone || ''}"`,
        `"${new Date(guest.created_at).toLocaleDateString()}"`,
        `"${guest.invite_sent_at ? new Date(guest.invite_sent_at).toLocaleDateString() : ''}"`,
        `"${guest.invite_accepted_at ? new Date(guest.invite_accepted_at).toLocaleDateString() : ''}"`,
        `"${guest.checked_in_at ? new Date(guest.checked_in_at).toLocaleDateString() : ''}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `guests-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const totalPages = Math.ceil(filteredGuests.length / ITEMS_PER_PAGE)
  const paginatedGuests = filteredGuests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-luxury-gold"></div>
      </div>
    )
  }

  return (
    <AdminLayout 
      title="Registered Guests"
      subtitle={`${filteredGuests.length} of ${guests.length} total`}
      showBackButton={true}
      backUrl="/admin"
    >
      {/* Export Button - Fixed at top */}
      <div className="bg-black border-b border-gray-900 px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-end">
          <button
            onClick={exportGuests}
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
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-3 py-2 bg-black border border-gray-800 rounded-lg text-white focus:border-luxury-gold focus:outline-none"
              >
                <option value="all">All Guests</option>
                <option value="invited">Invited</option>
                <option value="accepted">Accepted</option>
                <option value="checked_in">Checked In</option>
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
                <option value="created_at-desc">Newest First</option>
                <option value="created_at-asc">Oldest First</option>
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
                <option value="email-asc">Email A-Z</option>
                <option value="email-desc">Email Z-A</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total', value: guests.length, icon: Users },
            { label: 'Invited', value: guests.filter(g => g.invite_sent_at).length, icon: Mail },
            { label: 'Accepted', value: guests.filter(g => g.invite_accepted_at).length, icon: Calendar },
            { label: 'Checked In', value: guests.filter(g => g.checked_in_at).length, icon: Users }
          ].map((stat) => (
            <div key={stat.label} className="bg-gray-950 border border-gray-900 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <stat.icon className="w-5 h-5 text-luxury-gold" />
                <span className="text-2xl font-light">{stat.value}</span>
              </div>
              <p className="text-xs tracking-widest uppercase text-gray-600 mt-2">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Guests Table */}
        <div className="bg-gray-950 border border-gray-900 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Guest
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Registered
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
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
                      <div>
                        <p className="font-medium text-white">{guest.name}</p>
                        <p className="text-sm text-gray-400">{guest.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-white">{guest.email}</p>
                        {guest.phone && (
                          <p className="text-gray-400">{guest.phone}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {guest.checked_in_at && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                            Checked In
                          </span>
                        )}
                        {guest.invite_accepted_at && !guest.checked_in_at && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                            Accepted
                          </span>
                        )}
                        {guest.invite_sent_at && !guest.invite_accepted_at && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
                            Invited
                          </span>
                        )}
                        {!guest.invite_sent_at && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400">
                            Registered
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {new Date(guest.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => deleteGuest(guest.id, guest.name)}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete guest"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredGuests.length)} of {filteredGuests.length} guests
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
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-700" />
            <p className="text-gray-500">No guests found</p>
            {search || filter !== 'all' ? (
              <p className="text-sm text-gray-600 mt-2">Try adjusting your filters</p>
            ) : (
              <p className="text-sm text-gray-600 mt-2">No guests have registered yet</p>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}