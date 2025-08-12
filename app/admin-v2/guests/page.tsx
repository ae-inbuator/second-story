'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users,
  UserPlus,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  Clock,
  Send,
  Upload,
  Download,
  QrCode,
  Copy,
  Trash2
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { DataTable, Column, Action } from '../components/shared/DataTable'
import { cn } from '@/lib/utils'

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
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newGuest, setNewGuest] = useState({
    name: '',
    email: '',
    phone_number: '',
    vip_level: 'standard'
  })

  useEffect(() => {
    fetchGuests()
  }, [])

  async function fetchGuests() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setGuests(data || [])
    } catch (error) {
      console.error('Failed to fetch guests:', error)
      toast.error('Failed to load guests')
    } finally {
      setLoading(false)
    }
  }

  async function deleteGuest(guest: Guest) {
    if (!confirm(`Delete ${guest.name}?`)) return

    try {
      const { error } = await supabase
        .from('guests')
        .delete()
        .eq('id', guest.id)

      if (error) throw error

      toast.success('Guest deleted')
      fetchGuests()
    } catch (error) {
      toast.error('Failed to delete guest')
    }
  }

  async function sendInvitation(guest: Guest) {
    if (!guest.phone_number) {
      toast.error('Guest has no phone number')
      return
    }

    // Simulate sending invitation
    const message = `Hi ${guest.name.split(' ')[0]}! You're invited to Second Story. Your code: ${guest.invitation_code}`
    const whatsappLink = `https://wa.me/${guest.phone_number}?text=${encodeURIComponent(message)}`
    window.open(whatsappLink, '_blank')

    // Update invitation sent timestamp
    await supabase
      .from('guests')
      .update({ invitation_sent_at: new Date().toISOString() })
      .eq('id', guest.id)
    
    toast.success('WhatsApp opened with invitation')
    fetchGuests()
  }

  async function bulkSendInvitations(selected: Guest[]) {
    const withPhone = selected.filter(g => g.phone_number)
    if (withPhone.length === 0) {
      toast.error('No guests with phone numbers selected')
      return
    }

    for (const guest of withPhone) {
      await sendInvitation(guest)
    }
  }

  function copyInvitationLink(guest: Guest) {
    const link = `${window.location.origin}/i/${guest.invitation_code}`
    navigator.clipboard.writeText(link)
    toast.success('Link copied!')
  }

  function getStatusBadge(guest: Guest) {
    if (guest.checked_in_at) {
      return { label: 'Checked In', color: 'text-green-400 bg-green-500/20' }
    }
    if (guest.confirmed_at) {
      return { label: 'Confirmed', color: 'text-blue-400 bg-blue-500/20' }
    }
    if (guest.invitation_sent_at) {
      return { label: 'Invited', color: 'text-yellow-400 bg-yellow-500/20' }
    }
    return { label: 'Pending', color: 'text-gray-400 bg-gray-500/20' }
  }

  // Table columns
  const columns: Column<Guest>[] = [
    {
      key: 'name',
      header: 'Guest',
      accessor: (guest) => guest.name,
      sortable: true,
      searchable: true,
      render: (name, guest) => (
        <div>
          <p className="font-medium text-white">{name}</p>
          <p className="text-xs text-gray-500">{guest.email}</p>
          {guest.vip_level && guest.vip_level !== 'standard' && (
            <span className="text-xs text-luxury-gold">VIP {guest.vip_level}</span>
          )}
        </div>
      )
    },
    {
      key: 'phone',
      header: 'Contact',
      accessor: (guest) => guest.phone_number,
      searchable: true,
      render: (phone) => phone ? (
        <div className="flex items-center gap-1 text-sm text-gray-400">
          <Phone className="w-3 h-3" />
          {phone}
        </div>
      ) : (
        <span className="text-gray-600">-</span>
      )
    },
    {
      key: 'code',
      header: 'Invitation Code',
      accessor: (guest) => guest.invitation_code,
      render: (code, guest) => code ? (
        <div className="flex items-center gap-2">
          <code className="px-2 py-1 bg-gray-900 rounded text-xs font-mono">
            {code}
          </code>
          <button
            onClick={(e) => {
              e.stopPropagation()
              copyInvitationLink(guest)
            }}
            className="p-1 hover:bg-gray-800 rounded"
          >
            <Copy className="w-3 h-3 text-gray-500" />
          </button>
        </div>
      ) : (
        <span className="text-gray-600">-</span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (guest) => getStatusBadge(guest).label,
      render: (_, guest) => {
        const badge = getStatusBadge(guest)
        return (
          <span className={cn("px-2 py-1 rounded-full text-xs", badge.color)}>
            {badge.label}
          </span>
        )
      }
    },
    {
      key: 'registered',
      header: 'Registered',
      accessor: (guest) => guest.created_at,
      sortable: true,
      render: (date) => (
        <div className="text-sm text-gray-400">
          {new Date(date).toLocaleDateString()}
        </div>
      )
    }
  ]

  // Actions
  const actions: Action<Guest>[] = [
    {
      label: 'Send Invitation',
      icon: Send,
      onClick: sendInvitation,
      show: (guest) => !guest.invitation_sent_at && !!guest.phone_number
    },
    {
      label: 'Copy Link',
      icon: Copy,
      onClick: (guest) => copyInvitationLink(guest),
      show: (guest) => !!guest.invitation_code
    },
    {
      label: 'Delete',
      icon: Trash2,
      variant: 'danger',
      onClick: deleteGuest
    }
  ]

  // Bulk actions
  const bulkActions: Action<Guest[]>[] = [
    {
      label: 'Send Invitations',
      icon: Send,
      onClick: bulkSendInvitations
    },
    {
      label: 'Export Selected',
      icon: Download,
      onClick: (selected) => {
        toast.success(`Exporting ${selected.length} guests`)
      }
    },
    {
      label: 'Delete Selected',
      icon: Trash2,
      variant: 'danger',
      onClick: async (selected) => {
        if (!confirm(`Delete ${selected.length} guests?`)) return
        
        try {
          const { error } = await supabase
            .from('guests')
            .delete()
            .in('id', selected.map(g => g.id))

          if (error) throw error

          toast.success(`${selected.length} guests deleted`)
          fetchGuests()
        } catch (error) {
          toast.error('Failed to delete guests')
        }
      }
    }
  ]

  // Stats
  const stats = {
    total: guests.length,
    invited: guests.filter(g => g.invitation_sent_at).length,
    confirmed: guests.filter(g => g.confirmed_at).length,
    checkedIn: guests.filter(g => g.checked_in_at).length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-playfair">Guests</h1>
          <p className="text-gray-500 mt-1">
            Manage your guest list and invitations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => toast('Import feature coming soon')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Import CSV
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-luxury-gold text-black rounded-lg hover:bg-luxury-gold/80 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Add Guest
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Guests', value: stats.total, icon: Users, color: 'text-blue-500' },
          { label: 'Invited', value: stats.invited, icon: Mail, color: 'text-yellow-500' },
          { label: 'Confirmed', value: stats.confirmed, icon: CheckCircle, color: 'text-green-500' },
          { label: 'Checked In', value: stats.checkedIn, icon: Calendar, color: 'text-purple-500' }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-950 border border-gray-900 rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <stat.icon className={cn("w-5 h-5", stat.color)} />
              <span className="text-2xl font-light">{stat.value}</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">{stat.label}</p>
            <div className="mt-3 h-1 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-luxury-gold to-yellow-500"
                style={{ width: `${(stat.value / stats.total) * 100}%` }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Guests Table */}
      <DataTable
        data={guests}
        columns={columns}
        actions={actions}
        bulkActions={bulkActions}
        selectable
        searchPlaceholder="Search guests..."
        filters={[
          { label: 'Pending', value: 'pending' },
          { label: 'Invited', value: 'invited' },
          { label: 'Confirmed', value: 'confirmed' },
          { label: 'Checked In', value: 'checked_in' }
        ]}
        exportFilename="guests"
        refreshable
        onRefresh={fetchGuests}
        loading={loading}
        emptyMessage="No guests found"
        emptyIcon={Users}
      />

      {/* Add Guest Modal */}
      {showAddModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setShowAddModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gray-950 border border-gray-800 rounded-lg max-w-md w-full p-6"
          >
            <h2 className="text-xl font-playfair mb-4">Add New Guest</h2>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={newGuest.name}
                onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })}
                className="w-full px-4 py-2 bg-black border border-gray-800 rounded-lg text-white placeholder:text-gray-600 focus:border-luxury-gold focus:outline-none"
              />
              
              <input
                type="email"
                placeholder="Email"
                value={newGuest.email}
                onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })}
                className="w-full px-4 py-2 bg-black border border-gray-800 rounded-lg text-white placeholder:text-gray-600 focus:border-luxury-gold focus:outline-none"
              />
              
              <input
                type="tel"
                placeholder="Phone Number (with country code)"
                value={newGuest.phone_number}
                onChange={(e) => setNewGuest({ ...newGuest, phone_number: e.target.value })}
                className="w-full px-4 py-2 bg-black border border-gray-800 rounded-lg text-white placeholder:text-gray-600 focus:border-luxury-gold focus:outline-none"
              />
              
              <select
                value={newGuest.vip_level}
                onChange={(e) => setNewGuest({ ...newGuest, vip_level: e.target.value })}
                className="w-full px-4 py-2 bg-black border border-gray-800 rounded-lg text-white focus:border-luxury-gold focus:outline-none"
              >
                <option value="standard">Standard</option>
                <option value="gold">Gold VIP</option>
                <option value="platinum">Platinum VIP</option>
              </select>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={async () => {
                    try {
                      const code = Math.random().toString(36).substring(2, 8).toUpperCase()
                      const { error } = await supabase
                        .from('guests')
                        .insert([{
                          ...newGuest,
                          invitation_code: code,
                          created_at: new Date().toISOString()
                        }])

                      if (error) throw error

                      toast.success('Guest added successfully!')
                      setShowAddModal(false)
                      setNewGuest({ name: '', email: '', phone_number: '', vip_level: 'standard' })
                      fetchGuests()
                    } catch (error) {
                      toast.error('Failed to add guest')
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-luxury-gold text-black rounded-lg hover:bg-luxury-gold/80 transition-colors"
                >
                  Add Guest
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}