'use client'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { 
  ChevronLeft, 
  ChevronRight, 
  Users, 
  Heart, 
  Eye, 
  Activity,
  ArrowUpRight,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Send,
  Download,
  BarChart3,
  Radio,
  Sparkles,
  Settings,
  Bell,
  Package,
  Grid3X3,
  Plus,
  Mail,
  Calendar
} from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import { useWebSocket } from '@/hooks/useWebSocket'
import { ExportPanel } from '@/components/admin/export-panel'
import { StatsSkeleton } from '@/components/ui/skeleton'
import { ProductUpload } from '@/components/admin/product-upload'
import { ProductManager } from '@/components/admin/product-manager'
import { LookManager } from '@/components/admin/look-manager'
import config from '@/lib/config'
import { cn } from '@/lib/utils'

interface Look {
  id: string
  look_number: number
  name: string
  hero_image?: string
  active: boolean
  event_id: string
}

interface Stats {
  registered: number
  checkedIn: number
  activeNow: number
  totalWishes: number
  conversionRate: number
  avgWishesPerGuest: number
}

export default function AdminPage() {
  const router = useRouter()
  const [looks, setLooks] = useState<Look[]>([])
  const [currentLookIndex, setCurrentLookIndex] = useState(0)
  const [stats, setStats] = useState<Stats>({
    registered: 0,
    checkedIn: 0,
    activeNow: 0,
    totalWishes: 0,
    conversionRate: 0,
    avgWishesPerGuest: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [showStatus, setShowStatus] = useState<'preparing' | 'live' | 'paused' | 'ended'>('preparing')
  const [announcement, setAnnouncement] = useState('')
  const [announcementDuration, setAnnouncementDuration] = useState(10)
  const [activeTab, setActiveTab] = useState<'control' | 'products' | 'looks' | 'analytics' | 'export'>('control')
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  
  // WebSocket connection
  const { socket, isConnected, emit, on, off } = useWebSocket()

  // Initialize
  useEffect(() => {
    const init = async () => {
      setIsLoading(true)
      await Promise.all([
        fetchLooks(),
        fetchStats()
      ])
      setIsLoading(false)
    }
    init()
    
    // Refresh stats periodically
    const interval = setInterval(fetchStats, 5000)
    
    // Set up real-time subscriptions for looks
    const looksSubscription = supabase
      .channel('looks_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'looks' 
        }, 
        (payload) => {
          console.log('🔄 Real-time update received:', payload)
          // Refresh looks data when changes occur
          fetchLooks()
          
          // Show toast for activation changes
          if (payload.eventType === 'UPDATE' && payload.new?.active) {
            const lookName = payload.new.name
            toast.success(`🎬 ${lookName} is now live!`, {
              duration: 2000,
              icon: '📺'
            })
          }
        }
      )
      .subscribe()

    return () => {
      clearInterval(interval)
      supabase.removeChannel(looksSubscription)
    }
  }, [])

  // Socket listeners
  useEffect(() => {
    if (!socket) return

    const handleStatsUpdate = (data: any) => {
      setStats(prev => ({
        ...prev,
        activeNow: data.activeGuests || prev.activeNow
      }))
    }

    on('stats:updated', handleStatsUpdate)
    
    // Request initial stats
    emit('stats:request')

    return () => {
      off('stats:updated', handleStatsUpdate)
    }
  }, [socket, on, off, emit])

  // Fetch looks
  async function fetchLooks() {
    try {
      const { data } = await supabase
        .from('looks')
        .select('*')
        .order('look_number')
      
      if (data) {
        setLooks(data)
        const activeIndex = data.findIndex(l => l.active)
        if (activeIndex >= 0) {
          setCurrentLookIndex(activeIndex)
          setShowStatus('live')
        }
      }
    } catch (error) {
      console.error('Failed to fetch looks:', error)
      toast.error('Failed to load looks')
    }
  }

  // Fetch stats
  async function fetchStats() {
    try {
      const [guests, wishes] = await Promise.all([
        supabase.from('guests').select('*', { count: 'exact' }),
        supabase.from('wishlists').select('*', { count: 'exact' })
      ])
      
      const registered = guests.count || 0
      const checkedIn = guests.data?.filter(g => g.checked_in_at).length || 0
      const totalWishes = wishes.count || 0
      
      setStats({
        registered,
        checkedIn,
        activeNow: checkedIn, // This gets updated via WebSocket
        totalWishes,
        conversionRate: registered > 0 ? (checkedIn / registered) * 100 : 0,
        avgWishesPerGuest: checkedIn > 0 ? totalWishes / checkedIn : 0
      })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  // Activate look (only one can be active at a time) - IMPROVED VERSION
  const activateLook = useCallback(async (lookId: string) => {
    try {
      // Find the target look
      const targetLook = looks.find(l => l.id === lookId)
      if (!targetLook) {
        toast.error('Look not found')
        return false
      }

      // Check if it's already active
      if (targetLook.active) {
        toast('This look is already active')
        return true
      }

      // Show loading state
      const loadingToast = toast.loading(`Activating ${targetLook.name}...`)

      // IMPROVED: Use a more robust atomic approach
      // First, get all currently active looks to ensure we know what we're dealing with
      const { data: activeLooks, error: activeError } = await supabase
        .from('looks')
        .select('id, name')
        .eq('active', true)

      if (activeError) throw activeError

      // Deactivate all active looks one by one for better reliability
      for (const activeLook of activeLooks) {
        const { error: deactivateError } = await supabase
          .from('looks')
          .update({ active: false })
          .eq('id', activeLook.id)
        
        if (deactivateError) throw deactivateError
      }

      // Now activate the target look
      const { error: activateError } = await supabase
        .from('looks')
        .update({ active: true })
        .eq('id', lookId)

      if (activateError) throw activateError

      // Verify the operation succeeded
      const { data: verifyLook, error: verifyError } = await supabase
        .from('looks')
        .select('active')
        .eq('id', lookId)
        .single()

      if (verifyError || !verifyLook?.active) {
        throw new Error('Look activation verification failed')
      }

      // Refresh looks data to sync UI
      await fetchLooks()

      // Emit to WebSocket for live updates
      emit('look:change', { 
        lookId: lookId,
        lookNumber: targetLook.look_number,
        lookName: targetLook.name,
        timestamp: new Date().toISOString()
      })

      // Success feedback
      toast.dismiss(loadingToast)
      toast.success(`✨ ${targetLook.name} is now live!`, {
        duration: 3000
      })

      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100])
      }

      return true

    } catch (error) {
      console.error('Error activating look:', error)
      toast.error(`Failed to activate look: ${error instanceof Error ? error.message : 'Unknown error'}`)
      
      // Refresh looks to ensure UI is in sync with database
      await fetchLooks()
      return false
    }
  }, [looks, emit, fetchLooks])

  // Legacy function for backwards compatibility
  const advanceLook = useCallback(async (direction: 'next' | 'prev' | 'direct', lookId?: string) => {
    if (direction === 'direct' && lookId) {
      await activateLook(lookId)
      return
    }

    const currentActiveIndex = looks.findIndex(l => l.active)
    let targetIndex = currentActiveIndex

    if (direction === 'next') {
      targetIndex = Math.min(currentActiveIndex + 1, looks.length - 1)
    } else if (direction === 'prev') {
      targetIndex = Math.max(currentActiveIndex - 1, 0)
    }

    if (targetIndex !== currentActiveIndex && looks[targetIndex]) {
      await activateLook(looks[targetIndex].id)
    }
  }, [looks, activateLook])

  // Send announcement
  const sendAnnouncement = useCallback(() => {
    if (!announcement.trim()) {
      toast.error('Please enter an announcement')
      return
    }
    
    console.log('📢 Sending announcement:', announcement) // Debug log
    
    const success = emit('announcement', { 
      message: announcement,
      duration: announcementDuration * 1000
    })
    
    if (success) {
      toast.success('Announcement sent!', { icon: '📢' })
      setAnnouncement('')
    } else {
      toast.error('Failed to send - WebSocket not connected')
    }
  }, [announcement, announcementDuration, emit])

  // Control show status
  const toggleShowStatus = useCallback(() => {
    const newStatus = showStatus === 'live' ? 'paused' : 'live'
    setShowStatus(newStatus)
    
    emit('show:status', { status: newStatus })
    
    toast.success(
      newStatus === 'live' ? 'Show is live!' : 'Show paused',
      { icon: newStatus === 'live' ? '🎬' : '⏸️' }
    )
  }, [showStatus, emit])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-8">
          <StatsSkeleton />
        </div>
      </div>
    )
  }

  return (
    <AdminLayout 
      title="SECOND STORY"
      subtitle="Administration Panel"
    >
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: '#1a1a1a',
            color: '#fff',
            border: '1px solid #333',
          },
        }}
      />
      
      {/* Status Bar */}
      <div className="bg-black border-b border-gray-900 px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Connection Status */}
          <div className="flex items-center gap-4">
            <div className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs",
              showStatus === 'live' 
                ? 'bg-green-500/20 text-green-400' 
                : showStatus === 'paused'
                ? 'bg-yellow-500/20 text-yellow-400'
                : 'bg-gray-500/20 text-gray-400'
            )}>
              <Radio className="w-3 h-3" />
              <span className="uppercase tracking-wider">{showStatus}</span>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-gray-500">
              {isConnected ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>Connected</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span>Offline</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="mt-4">
          <div className="flex gap-8 border-b border-gray-900">
            {[
              { id: 'control', label: 'Show Control', icon: Settings },
              { id: 'products', label: 'Products', icon: Package },
              { id: 'looks', label: 'Look Manager', icon: Sparkles },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'export', label: 'Export', icon: Download },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 px-1 py-3 text-sm font-medium transition-all duration-200",
                  "border-b-2 -mb-[2px]",
                  activeTab === tab.id
                    ? "text-luxury-gold border-luxury-gold"
                    : "text-gray-500 border-transparent hover:text-white hover:border-gray-700"
                )}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <AnimatePresence mode="wait">
          {/* Show Control Tab */}
          {activeTab === 'control' && (
            <motion.div
              key="control"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Look Management */}
              {looks.length > 0 ? (
                <div className="space-y-6">
                  {/* Show Controls */}
                  <div className="bg-gray-950 border border-gray-900 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-medium tracking-wide">Show Control</h2>
                      <button
                        onClick={toggleShowStatus}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200",
                          showStatus === 'live'
                            ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                            : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                        )}
                      >
                        {showStatus === 'live' ? (
                          <>
                            <Pause className="w-4 h-4" />
                            <span>Pause Show</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4" />
                            <span>Start Show</span>
                          </>
                        )}
                      </button>
                    </div>
                    
                    <div className="text-center py-6">
                      <p className="text-xs tracking-widest uppercase text-gray-500 mb-2">Currently Active</p>
                      <h3 className="font-playfair text-2xl">
                        {looks.find(l => l.active)?.name || 'No look active'}
                      </h3>
                      <p className="text-sm text-luxury-gold">
                        Look {looks.find(l => l.active)?.look_number || 'N/A'} of {looks.length}
                      </p>
                    </div>
                  </div>

                  {/* Look Selection Grid */}
                  <div className="bg-gray-950 border border-gray-900 rounded-lg p-6">
                    <h3 className="text-lg font-medium tracking-wide mb-4">All Looks</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {looks.map((look, index) => (
                        <motion.div
                          key={look.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={cn(
                            "relative border rounded-lg p-4 cursor-pointer transition-all duration-200",
                            look.active 
                              ? "border-luxury-gold bg-luxury-gold/5" 
                              : "border-gray-800 hover:border-gray-600 bg-gray-900/50"
                          )}
                          onClick={() => {
                            if (!look.active) {
                              activateLook(look.id)
                            }
                          }}
                        >
                          {/* Look Hero Image */}
                          {look.hero_image && (
                            <div className="aspect-video relative rounded mb-3 overflow-hidden">
                              <img
                                src={look.hero_image}
                                alt={look.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none'
                                }}
                              />
                            </div>
                          )}
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="font-playfair text-lg">{look.name}</h4>
                              {look.active && (
                                <div className="w-2 h-2 bg-luxury-gold rounded-full animate-pulse" />
                              )}
                            </div>
                            <p className="text-xs tracking-widest uppercase text-gray-500">
                              Look {look.look_number}
                            </p>
                            
                            {!look.active && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  activateLook(look.id)
                                }}
                                className="w-full mt-3 px-3 py-2 bg-luxury-gold text-black text-sm font-medium rounded hover:bg-luxury-gold/80 transition-colors"
                              >
                                Make Active
                              </button>
                            )}
                            
                            {look.active && (
                              <div className="w-full mt-3 px-3 py-2 bg-green-500/20 text-green-400 text-sm font-medium rounded text-center">
                                Currently Live
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-950 border border-gray-900 rounded-lg p-12 text-center">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 text-gray-700" />
                  <p className="text-gray-500">No looks available</p>
                  <p className="text-sm text-gray-600 mt-2">Upload looks to get started</p>
                </div>
              )}

              {/* Announcement Panel */}
              <div className="bg-gray-950 border border-gray-900 rounded-lg p-6">
                <h3 className="text-lg font-medium tracking-wide mb-4 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-luxury-gold" />
                  Send Announcement
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <textarea
                      value={announcement}
                      onChange={(e) => setAnnouncement(e.target.value)}
                      placeholder="Type your announcement..."
                      className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg text-white placeholder:text-gray-600 focus:border-luxury-gold focus:outline-none resize-none"
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex items-center gap-3">
                      <label className="text-sm text-gray-400">Duration:</label>
                      <select
                        value={announcementDuration}
                        onChange={(e) => setAnnouncementDuration(Number(e.target.value))}
                        className="px-3 py-1.5 bg-black border border-gray-800 rounded text-sm focus:border-luxury-gold focus:outline-none"
                      >
                        <option value={5}>5 seconds</option>
                        <option value={10}>10 seconds</option>
                        <option value={15}>15 seconds</option>
                        <option value={30}>30 seconds</option>
                      </select>
                    </div>
                    
                    <button
                      onClick={sendAnnouncement}
                      disabled={!announcement.trim()}
                      className="btn-luxury px-6 py-2 flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Send to All Guests
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { 
                    label: 'Registered', 
                    value: stats.registered, 
                    max: config.event.capacity,
                    icon: Users,
                    color: 'text-blue-400',
                    bgColor: 'bg-blue-500/10',
                    href: '/admin/guests'
                  },
                  { 
                    label: 'Checked In', 
                    value: stats.checkedIn,
                    percentage: stats.conversionRate,
                    icon: Eye,
                    color: 'text-green-400',
                    bgColor: 'bg-green-500/10',
                    href: '/admin/checkins'
                  },
                  { 
                    label: 'Active Now', 
                    value: stats.activeNow,
                    live: true,
                    icon: Activity,
                    color: 'text-yellow-400',
                    bgColor: 'bg-yellow-500/10',
                    href: '/admin/active'
                  },
                  { 
                    label: 'Total Wishes', 
                    value: stats.totalWishes,
                    average: stats.avgWishesPerGuest,
                    icon: Heart,
                    color: 'text-luxury-gold',
                    bgColor: 'bg-luxury-gold/10',
                    href: '/admin/wishes'
                  },
                ].map((stat, idx) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => router.push(stat.href)}
                    className="bg-gray-950 border border-gray-900 rounded-lg p-6 cursor-pointer hover:bg-gray-900/50 transition-all duration-200 hover:border-gray-700 group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={cn("p-2 rounded-lg", stat.bgColor)}>
                        <stat.icon className={cn("w-5 h-5", stat.color)} />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn("text-3xl font-light", stat.color)}>
                          {stat.value}
                        </span>
                        <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-all duration-200" />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-xs tracking-widest uppercase text-gray-600">
                        {stat.label}
                      </p>
                      <p className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        View details
                      </p>
                    </div>
                    
                    {stat.max && (
                      <div className="mt-3">
                        <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500"
                            style={{ width: `${(stat.value / stat.max) * 100}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {stat.value} of {stat.max}
                        </p>
                      </div>
                    )}
                    
                    {stat.percentage !== undefined && (
                      <p className="text-xs text-gray-500 mt-2">
                        {stat.percentage.toFixed(1)}% conversion
                      </p>
                    )}
                    
                    {stat.average !== undefined && (
                      <p className="text-xs text-gray-500 mt-2">
                        {stat.average.toFixed(1)} per guest
                      </p>
                    )}
                    
                    {stat.live && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-xs text-gray-500">Live</span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="bg-gray-950 border border-gray-900 rounded-lg p-6">
                <h3 className="text-lg font-medium tracking-wide mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => router.push('/admin/events')}
                    className="flex flex-col items-center justify-center p-4 bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors group"
                  >
                    <Calendar className="w-6 h-6 text-luxury-gold mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-sm">Events</span>
                  </button>
                  <button
                    onClick={() => router.push('/admin/invitations')}
                    className="flex flex-col items-center justify-center p-4 bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors group"
                  >
                    <Mail className="w-6 h-6 text-luxury-gold mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-sm">Invitations</span>
                  </button>
                  <button
                    onClick={() => router.push('/admin/guests')}
                    className="flex flex-col items-center justify-center p-4 bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors group"
                  >
                    <Users className="w-6 h-6 text-luxury-gold mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-sm">Guests</span>
                  </button>
                  <button
                    onClick={() => router.push('/admin/wishes')}
                    className="flex flex-col items-center justify-center p-4 bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors group"
                  >
                    <Heart className="w-6 h-6 text-luxury-gold mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-sm">Wishlists</span>
                  </button>
                  <button
                    onClick={() => router.push('/admin/checkins')}
                    className="flex flex-col items-center justify-center p-4 bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors group"
                  >
                    <Activity className="w-6 h-6 text-luxury-gold mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-sm">Check-ins</span>
                  </button>
                  <button
                    onClick={() => router.push('/admin/active')}
                    className="flex flex-col items-center justify-center p-4 bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors group"
                  >
                    <Eye className="w-6 h-6 text-luxury-gold mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-sm">Active Now</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('export')}
                    className="flex flex-col items-center justify-center p-4 bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors group"
                  >
                    <Download className="w-6 h-6 text-luxury-gold mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-sm">Export</span>
                  </button>
                </div>
              </div>

              {/* Real-time Activity Feed */}
              <div className="bg-gray-950 border border-gray-900 rounded-lg p-6">
                <h3 className="text-lg font-medium tracking-wide mb-4">Real-time Activity</h3>
                <div className="space-y-3">
                  <p className="text-sm text-gray-500 text-center py-8">
                    Activity feed will appear here during the show
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <motion.div
              key="products"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div>
                  <ProductUpload 
                    eventId="1" 
                    onProductCreated={() => setRefreshTrigger(prev => prev + 1)}
                  />
                </div>
                <div>
                  <ProductManager refreshTrigger={refreshTrigger} />
                </div>
              </div>
            </motion.div>
          )}

          {/* Looks Tab */}
          {activeTab === 'looks' && (
            <motion.div
              key="looks"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <LookManager />
            </motion.div>
          )}

          {/* Export Tab */}
          {activeTab === 'export' && (
            <motion.div
              key="export"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ExportPanel eventId="1" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  )
}