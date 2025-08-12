'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Sparkles,
  ArrowLeft,
  Save,
  X
} from 'lucide-react'
import Link from 'next/link'
import toast, { Toaster } from 'react-hot-toast'
import { AdminLayout } from '@/components/admin/AdminLayout'

interface Event {
  id: string
  name: string
  chapter_number: number
  date: string
  time: string
  location: string
  address: string
  max_capacity: number
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  description: string
  dress_code: string
  created_at: string
  confirmed_count?: number
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [formData, setFormData] = useState({
    name: 'Second Story: Chapter ',
    chapter_number: 1,
    date: '',
    time: '19:00',
    location: '',
    address: '',
    max_capacity: 50,
    status: 'upcoming',
    description: '',
    dress_code: 'Black Tie Creative'
  })

  useEffect(() => {
    fetchEvents()
  }, [])

  async function fetchEvents() {
    try {
      // Fetch events
      const { data: eventsData, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: false })

      if (error) throw error

      // Fetch confirmation counts for each event
      const eventsWithCounts = await Promise.all(
        (eventsData || []).map(async (event) => {
          const { count } = await supabase
            .from('guests')
            .select('*', { count: 'exact', head: true })
            .not('confirmed_at', 'is', null)

          return { ...event, confirmed_count: count || 0 }
        })
      )

      setEvents(eventsWithCounts)
    } catch (error) {
      console.error('Error fetching events:', error)
      toast.error('Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    try {
      const eventData = {
        ...formData,
        date: `${formData.date} ${formData.time}:00`,
        name: formData.name + formData.chapter_number
      }

      if (editingEvent) {
        const { error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', editingEvent.id)

        if (error) throw error
        toast.success('Event updated successfully')
      } else {
        const { error } = await supabase
          .from('events')
          .insert([eventData])

        if (error) throw error
        toast.success('Event created successfully')
      }

      setShowCreateModal(false)
      setEditingEvent(null)
      resetForm()
      fetchEvents()
    } catch (error) {
      console.error('Error saving event:', error)
      toast.error('Failed to save event')
    }
  }

  async function deleteEvent(id: string) {
    if (!confirm('Are you sure you want to delete this event?')) return

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Event deleted successfully')
      fetchEvents()
    } catch (error) {
      console.error('Error deleting event:', error)
      toast.error('Failed to delete event')
    }
  }

  function resetForm() {
    setFormData({
      name: 'Second Story: Chapter ',
      chapter_number: events.length + 1,
      date: '',
      time: '19:00',
      location: '',
      address: '',
      max_capacity: 50,
      status: 'upcoming',
      description: '',
      dress_code: 'Black Tie Creative'
    })
  }

  function editEvent(event: Event) {
    const dateOnly = event.date.split('T')[0]
    const timeOnly = event.time || '19:00'
    
    setFormData({
      name: event.name.replace(/Chapter \d+/, 'Chapter '),
      chapter_number: event.chapter_number,
      date: dateOnly,
      time: timeOnly,
      location: event.location,
      address: event.address,
      max_capacity: event.max_capacity,
      status: event.status,
      description: event.description,
      dress_code: event.dress_code
    })
    setEditingEvent(event)
    setShowCreateModal(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'text-blue-500'
      case 'ongoing': return 'text-green-500'
      case 'completed': return 'text-gray-500'
      case 'cancelled': return 'text-red-500'
      default: return 'text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming': return <Clock className="w-4 h-4" />
      case 'ongoing': return <Sparkles className="w-4 h-4" />
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'cancelled': return <XCircle className="w-4 h-4" />
      default: return null
    }
  }

  return (
    <AdminLayout>
      <Toaster position="top-right" />
      
      <div className="min-h-screen bg-black text-white p-6">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-gray-400 hover:text-white transition-colors">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-light tracking-wider">Event Management</h1>
                <p className="text-gray-400 mt-1">Create and manage fashion show events</p>
              </div>
            </div>
            <button
              onClick={() => {
                resetForm()
                setEditingEvent(null)
                setShowCreateModal(true)
              }}
              className="flex items-center gap-2 bg-white text-black px-6 py-3 hover:bg-gray-100 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Create Event</span>
            </button>
          </div>
        </div>

        {/* Events Grid */}
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-white"></div>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400">No events created yet</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 text-white underline hover:no-underline"
              >
                Create your first event
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-gray-800 p-6 hover:border-gray-600 transition-colors"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-light">{event.name}</h3>
                    <div className={`flex items-center gap-1 ${getStatusColor(event.status)}`}>
                      {getStatusIcon(event.status)}
                      <span className="text-sm capitalize">{event.status}</span>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{event.confirmed_count || 0} / {event.max_capacity} confirmed</span>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-2">
                    <button
                      onClick={() => editEvent(event)}
                      className="flex-1 flex items-center justify-center gap-2 border border-gray-800 py-2 hover:bg-gray-900 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => deleteEvent(event.id)}
                      className="flex items-center justify-center gap-2 border border-red-900 text-red-500 px-4 py-2 hover:bg-red-950 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Create/Edit Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50"
              onClick={() => setShowCreateModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-900 border border-gray-800 p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-light">
                    {editingEvent ? 'Edit Event' : 'Create New Event'}
                  </h2>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Event Name</label>
                      <input
                        type="text"
                        value={formData.name + formData.chapter_number}
                        onChange={(e) => {
                          const match = e.target.value.match(/(.+?)(\d+)$/)
                          if (match) {
                            setFormData({ ...formData, name: match[1], chapter_number: parseInt(match[2]) })
                          }
                        }}
                        className="w-full bg-black border border-gray-800 px-4 py-2 focus:border-white transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                        className="w-full bg-black border border-gray-800 px-4 py-2 focus:border-white transition-colors"
                      >
                        <option value="upcoming">Upcoming</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Date</label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full bg-black border border-gray-800 px-4 py-2 focus:border-white transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Time</label>
                      <input
                        type="time"
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        className="w-full bg-black border border-gray-800 px-4 py-2 focus:border-white transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Location Name</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g., Polanco District"
                      className="w-full bg-black border border-gray-800 px-4 py-2 focus:border-white transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Full Address</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="e.g., Julio Verne 93, Polanco, CDMX"
                      className="w-full bg-black border border-gray-800 px-4 py-2 focus:border-white transition-colors"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Max Capacity</label>
                      <input
                        type="number"
                        value={formData.max_capacity}
                        onChange={(e) => setFormData({ ...formData, max_capacity: parseInt(e.target.value) })}
                        className="w-full bg-black border border-gray-800 px-4 py-2 focus:border-white transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Dress Code</label>
                      <input
                        type="text"
                        value={formData.dress_code}
                        onChange={(e) => setFormData({ ...formData, dress_code: e.target.value })}
                        placeholder="e.g., Black Tie Creative"
                        className="w-full bg-black border border-gray-800 px-4 py-2 focus:border-white transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Event description..."
                      rows={4}
                      className="w-full bg-black border border-gray-800 px-4 py-2 focus:border-white transition-colors"
                    />
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      className="flex-1 flex items-center justify-center gap-2 bg-white text-black py-3 hover:bg-gray-100 transition-colors"
                    >
                      <Save className="w-5 h-5" />
                      <span>{editingEvent ? 'Update Event' : 'Create Event'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-6 py-3 border border-gray-800 hover:bg-gray-900 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  )
}