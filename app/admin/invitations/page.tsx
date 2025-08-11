'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Mail,
  Users,
  Download,
  Upload,
  UserPlus,
  Send,
  Copy,
  QrCode,
  CheckCircle,
  Clock,
  Phone,
  Sparkles,
  X,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { 
  generateInvitationCode, 
  generateWhatsAppLink, 
  WhatsAppTemplates,
  formatPhoneDisplay,
  getInvitationStatus
} from '@/lib/invitation-utils'

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

export default function InvitationsPage() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [filteredGuests, setFilteredGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'sent' | 'confirmed' | 'checked_in'>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [selectedGuests, setSelectedGuests] = useState<string[]>([])
  const [newGuest, setNewGuest] = useState({ 
    name: '', 
    phone_number: '', 
    email: '', 
    vip_level: 'standard' 
  })
  const [importData, setImportData] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [event, setEvent] = useState<any>(null)

  useEffect(() => {
    fetchGuests()
    fetchEvent()
  }, [])

  useEffect(() => {
    filterGuests()
  }, [guests, search, filter])

  async function fetchEvent() {
    const { data } = await supabase
      .from('events')
      .select('*')
      .eq('status', 'upcoming')
      .single()
    
    setEvent(data)
  }

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
      toast.error('Failed to load guests')
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
        guest.email?.toLowerCase().includes(search.toLowerCase()) ||
        guest.phone_number?.includes(search) ||
        guest.invitation_code?.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Status filter
    if (filter !== 'all') {
      filtered = filtered.filter(guest => {
        const status = getInvitationStatus(guest)
        return status === filter || (filter === 'sent' && guest.invitation_sent_at)
      })
    }

    setFilteredGuests(filtered)
  }

  async function addSingleGuest() {
    if (!newGuest.name || !newGuest.phone_number) {
      toast.error('Name and phone number are required')
      return
    }

    setIsProcessing(true)
    try {
      const code = generateInvitationCode()
      
      const { error } = await supabase
        .from('guests')
        .insert([{
          ...newGuest,
          invitation_code: code,
          created_at: new Date().toISOString()
        }])

      if (error) throw error

      toast.success(`Guest added successfully! Code: ${code}`)
      setShowAddModal(false)
      setNewGuest({ name: '', phone_number: '', email: '', vip_level: 'standard' })
      fetchGuests()
    } catch (error: any) {
      if (error.message?.includes('duplicate')) {
        toast.error('This email or phone number already exists')
      } else {
        toast.error('Failed to add guest')
      }
    } finally {
      setIsProcessing(false)
    }
  }

  async function importGuests() {
    if (!importData.trim()) {
      toast.error('Please paste CSV data')
      return
    }

    setIsProcessing(true)
    try {
      const lines = importData.trim().split('\n')
      const headers = lines[0].toLowerCase().split(',').map(h => h.trim())
      
      // Find column indices
      const nameIdx = headers.findIndex(h => h.includes('name'))
      const phoneIdx = headers.findIndex(h => h.includes('phone') || h.includes('whatsapp'))
      const emailIdx = headers.findIndex(h => h.includes('email'))
      const vipIdx = headers.findIndex(h => h.includes('vip'))

      if (nameIdx === -1 || phoneIdx === -1) {
        toast.error('CSV must have Name and Phone/WhatsApp columns')
        return
      }

      const newGuestsList = []
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/^["']|["']$/g, ''))
        if (values[nameIdx] && values[phoneIdx]) {
          newGuestsList.push({
            name: values[nameIdx],
            phone_number: values[phoneIdx],
            email: emailIdx !== -1 ? values[emailIdx] : '',
            vip_level: vipIdx !== -1 ? values[vipIdx] : 'standard',
            invitation_code: generateInvitationCode(),
            created_at: new Date().toISOString()
          })
        }
      }

      if (newGuestsList.length === 0) {
        toast.error('No valid guests found in CSV')
        return
      }

      const { error } = await supabase
        .from('guests')
        .insert(newGuestsList)

      if (error) throw error

      toast.success(`Successfully imported ${newGuestsList.length} guests!`)
      setShowImportModal(false)
      setImportData('')
      fetchGuests()
    } catch (error) {
      console.error('Import error:', error)
      toast.error('Failed to import guests. Check for duplicates.')
    } finally {
      setIsProcessing(false)
    }
  }

  async function sendInvitation(guest: Guest) {
    if (!guest.phone_number) {
      toast.error('Guest has no phone number')
      return
    }

    const message = WhatsAppTemplates.invitation(
      guest.name.split(' ')[0],
      guest.invitation_code || '',
      event?.date ? new Date(event.date).toLocaleDateString() : 'December 12, 2024'
    )
    
    const whatsappLink = generateWhatsAppLink(guest.phone_number, message)
    window.open(whatsappLink, '_blank')
    
    // Update invitation sent timestamp
    await supabase
      .from('guests')
      .update({ invitation_sent_at: new Date().toISOString() })
      .eq('id', guest.id)
    
    toast.success('WhatsApp opened with invitation message')
    fetchGuests()
  }

  async function sendBulkInvitations() {
    if (selectedGuests.length === 0) {
      toast.error('Select guests to send invitations')
      return
    }

    for (const guestId of selectedGuests) {
      const guest = guests.find(g => g.id === guestId)
      if (guest && guest.phone_number) {
        await sendInvitation(guest)
      }
    }
    
    setSelectedGuests([])
    setShowBulkActions(false)
  }

  function copyInvitationLink(code: string) {
    const link = `${window.location.origin}/i/${code}`
    navigator.clipboard.writeText(link)
    toast.success('Link copied to clipboard!')
  }

  function downloadTemplate() {
    const template = 'Name,WhatsApp Number,Email (Optional),VIP Level (Optional)\nIsabella Rossi,+525512345678,isabella@email.com,gold\nSofia Martinez,+525587654321,sofia@email.com,standard'
    const blob = new Blob([template], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'invitation-template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  function exportGuests() {
    const csvContent = [
      ['Name', 'Phone', 'Email', 'Invitation Code', 'Status', 'VIP Level'].join(','),
      ...filteredGuests.map(guest => [
        `"${guest.name}"`,
        `"${guest.phone_number || ''}"`,
        `"${guest.email || ''}"`,
        `"${guest.invitation_code || ''}"`,
        `"${getInvitationStatus(guest)}"`,
        `"${guest.vip_level || 'standard'}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `invitations-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getStatusBadge = (guest: Guest) => {
    const status = getInvitationStatus(guest)
    switch (status) {
      case 'checked_in':
        return <span className="px-2 py-1 bg-green-900/50 text-green-400 text-xs rounded-full">Checked In</span>
      case 'confirmed':
        return <span className="px-2 py-1 bg-blue-900/50 text-blue-400 text-xs rounded-full">Confirmed</span>
      case 'sent':
        return <span className="px-2 py-1 bg-yellow-900/50 text-yellow-400 text-xs rounded-full">Sent</span>
      default:
        return <span className="px-2 py-1 bg-gray-900/50 text-gray-400 text-xs rounded-full">Pending</span>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <AdminLayout 
      title="Invitation Management"
      subtitle={`${filteredGuests.length} guests • ${guests.filter(g => g.confirmed_at).length} confirmed`}
      showBackButton={true}
      backUrl="/admin"
    >
      <Toaster position="top-right" />
      
      {/* Action Bar */}
      <div className="bg-black border-b border-gray-900 px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-wrap gap-3 justify-between items-center">
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-luxury flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Add Guest
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="btn-luxury-ghost flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Import CSV
            </button>
            <button
              onClick={downloadTemplate}
              className="btn-luxury-ghost flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Template
            </button>
          </div>
          <button
            onClick={exportGuests}
            className="btn-luxury-ghost flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters */}
        <div className="bg-gray-950 border border-gray-900 rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name, phone, email, or code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-black border border-gray-800 rounded-lg text-white placeholder:text-gray-600 focus:border-white focus:outline-none"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-4 py-2 bg-black border border-gray-800 rounded-lg text-white focus:border-white focus:outline-none"
            >
              <option value="all">All Guests</option>
              <option value="pending">Pending</option>
              <option value="sent">Invited</option>
              <option value="confirmed">Confirmed</option>
              <option value="checked_in">Checked In</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-950 border border-gray-900 rounded-lg p-4">
            <div className="text-2xl font-light">{guests.length}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">Total</div>
          </div>
          <div className="bg-gray-950 border border-gray-900 rounded-lg p-4">
            <div className="text-2xl font-light">{guests.filter(g => g.invitation_sent_at).length}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">Invited</div>
          </div>
          <div className="bg-gray-950 border border-gray-900 rounded-lg p-4">
            <div className="text-2xl font-light">{guests.filter(g => g.confirmed_at).length}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">Confirmed</div>
          </div>
          <div className="bg-gray-950 border border-gray-900 rounded-lg p-4">
            <div className="text-2xl font-light">{guests.filter(g => g.checked_in_at).length}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">Checked In</div>
          </div>
        </div>

        {/* Guest List */}
        <div className="bg-gray-950 border border-gray-900 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guest
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-900">
                {filteredGuests.map((guest) => (
                  <tr key={guest.id} className="hover:bg-gray-900/50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <div className="text-sm font-medium text-white">{guest.name}</div>
                        {guest.vip_level && guest.vip_level !== 'standard' && (
                          <span className="text-xs text-yellow-500 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            {guest.vip_level}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        {guest.phone_number && (
                          <div className="flex items-center gap-1 text-gray-400">
                            <Phone className="w-3 h-3" />
                            {formatPhoneDisplay(guest.phone_number)}
                          </div>
                        )}
                        {guest.email && (
                          <div className="flex items-center gap-1 text-gray-500 text-xs">
                            <Mail className="w-3 h-3" />
                            {guest.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono text-white bg-gray-900 px-2 py-1 rounded">
                          {guest.invitation_code || 'N/A'}
                        </code>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(guest)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {guest.invitation_code && (
                          <>
                            <button
                              onClick={() => copyInvitationLink(guest.invitation_code!)}
                              className="p-1.5 hover:bg-gray-800 rounded transition-colors"
                              title="Copy link"
                            >
                              <Copy className="w-4 h-4 text-gray-400" />
                            </button>
                            {guest.phone_number && (
                              <button
                                onClick={() => sendInvitation(guest)}
                                className="p-1.5 hover:bg-gray-800 rounded transition-colors"
                                title="Send WhatsApp"
                              >
                                <Send className="w-4 h-4 text-green-500" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Guest Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gray-950 border border-gray-800 rounded-lg p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-light">Add Guest</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 hover:bg-gray-800 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={newGuest.name}
                  onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })}
                  className="w-full px-4 py-2 bg-black border border-gray-800 rounded text-white placeholder:text-gray-600 focus:border-white focus:outline-none"
                />
                <input
                  type="tel"
                  placeholder="WhatsApp Number (with country code)"
                  value={newGuest.phone_number}
                  onChange={(e) => setNewGuest({ ...newGuest, phone_number: e.target.value })}
                  className="w-full px-4 py-2 bg-black border border-gray-800 rounded text-white placeholder:text-gray-600 focus:border-white focus:outline-none"
                />
                <input
                  type="email"
                  placeholder="Email (optional)"
                  value={newGuest.email}
                  onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })}
                  className="w-full px-4 py-2 bg-black border border-gray-800 rounded text-white placeholder:text-gray-600 focus:border-white focus:outline-none"
                />
                <select
                  value={newGuest.vip_level}
                  onChange={(e) => setNewGuest({ ...newGuest, vip_level: e.target.value })}
                  className="w-full px-4 py-2 bg-black border border-gray-800 rounded text-white focus:border-white focus:outline-none"
                >
                  <option value="standard">Standard</option>
                  <option value="gold">Gold VIP</option>
                  <option value="platinum">Platinum VIP</option>
                </select>
                
                <button
                  onClick={addSingleGuest}
                  disabled={isProcessing}
                  className="w-full btn-luxury flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Add Guest
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Import Modal */}
      <AnimatePresence>
        {showImportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowImportModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gray-950 border border-gray-800 rounded-lg p-6 max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-light">Import Guests from CSV</h3>
                <button
                  onClick={() => setShowImportModal(false)}
                  className="p-1 hover:bg-gray-800 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="text-sm text-gray-400">
                  <p>Paste CSV data with columns: Name, WhatsApp Number, Email (optional), VIP Level (optional)</p>
                  <p className="mt-1">First row should be headers.</p>
                </div>
                
                <textarea
                  placeholder="Name,WhatsApp Number,Email,VIP Level
Isabella Rossi,+525512345678,isabella@email.com,gold
Sofia Martinez,+525587654321,sofia@email.com,standard"
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  className="w-full h-64 px-4 py-2 bg-black border border-gray-800 rounded text-white placeholder:text-gray-600 focus:border-white focus:outline-none font-mono text-sm"
                />
                
                <div className="flex gap-2">
                  <button
                    onClick={importGuests}
                    disabled={isProcessing}
                    className="flex-1 btn-luxury flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Import Guests
                      </>
                    )}
                  </button>
                  <button
                    onClick={downloadTemplate}
                    className="btn-luxury-ghost flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download Template
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  )
}