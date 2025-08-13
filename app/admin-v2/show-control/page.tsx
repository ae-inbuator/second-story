'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Radio,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Send,
  Bell,
  Clock,
  Sparkles,
  Eye,
  Users,
  Activity,
  Coffee,
  ChevronRight,
  Maximize2,
  Monitor,
  Smartphone,
  Settings,
  Volume2,
  Mic
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useWebSocket } from '@/hooks/useWebSocket'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

interface Look {
  id: string
  look_number: number
  name: string
  hero_image?: string
  active: boolean
  products_count?: number
}

export default function ShowControlPage() {
  const [looks, setLooks] = useState<Look[]>([])
  const [currentLookIndex, setCurrentLookIndex] = useState(0)
  const [showStatus, setShowStatus] = useState<'preparing' | 'doors_open' | 'live' | 'paused' | 'ended'>('preparing')
  const [announcement, setAnnouncement] = useState('')
  const [announcementDuration, setAnnouncementDuration] = useState(10)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [viewMode, setViewMode] = useState<'director' | 'preview' | 'split'>('director')
  const [isLoading, setIsLoading] = useState(true)
  const [recentReactions, setRecentReactions] = useState<Array<{emoji: string, count: number}>>([])
  const [totalReactions, setTotalReactions] = useState(0)
  
  // WebSocket
  const socketUrl = process.env.NODE_ENV === 'production' 
    ? 'https://second-story.onrender.com'
    : 'http://localhost:3001'
  const { socket, isConnected, emit, on, off } = useWebSocket(socketUrl)

  useEffect(() => {
    fetchLooks()
  }, [])

  // Listen for reactions
  useEffect(() => {
    if (!socket) return

    const handleReaction = ({ emoji }: any) => {
      setTotalReactions(prev => prev + 1)
      setRecentReactions(prev => {
        const existing = prev.find(r => r.emoji === emoji)
        if (existing) {
          return prev.map(r => r.emoji === emoji ? {...r, count: r.count + 1} : r)
        }
        return [...prev.slice(-4), {emoji, count: 1}]
      })
    }

    on('reaction', handleReaction)
    return () => {
      off('reaction', handleReaction)
    }
  }, [socket, on, off])

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
        }
      }
    } catch (error) {
      console.error('Failed to fetch looks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const activateLook = useCallback(async (lookId: string) => {
    const targetLook = looks.find(l => l.id === lookId)
    if (!targetLook || targetLook.active) return

    const loadingToast = toast.loading(`Activating ${targetLook.name}...`)

    try {
      // Deactivate all looks
      await supabase.from('looks').update({ active: false }).neq('id', '')
      // Activate target look
      await supabase.from('looks').update({ active: true }).eq('id', lookId)

      await fetchLooks()
      
      emit('look:change', { 
        lookId,
        lookNumber: targetLook.look_number,
        lookName: targetLook.name
      })

      toast.dismiss(loadingToast)
      toast.success(`${targetLook.name} is now live!`, { icon: '✨' })
    } catch (error) {
      toast.dismiss(loadingToast)
      toast.error('Failed to activate look')
    }
  }, [looks, emit])

  const changeShowStatus = async (newStatus: typeof showStatus) => {
    try {
      await supabase
        .from('events')
        .update({ show_status: newStatus })
        .eq('status', 'upcoming')
      
      setShowStatus(newStatus)
      emit('show:status', { status: newStatus })
      
      const messages = {
        'preparing': 'Show in preparation',
        'doors_open': 'Doors are open!',
        'live': 'Show is LIVE!',
        'paused': 'Taking a break',
        'ended': 'Show has ended'
      }
      
      toast.success(messages[newStatus], { 
        icon: newStatus === 'live' ? '🎬' : 
              newStatus === 'paused' ? '☕' : 
              newStatus === 'doors_open' ? '🥂' : '🎯'
      })
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const sendAnnouncement = () => {
    if (!announcement.trim()) {
      toast.error('Please enter an announcement')
      return
    }
    
    emit('announcement', { 
      message: announcement,
      duration: announcementDuration * 1000
    })
    
    toast.success('Announcement sent!', { icon: '📢' })
    setAnnouncement('')
  }

  const statusConfig = {
    preparing: { color: 'text-gray-400', bg: 'bg-gray-500/20', icon: Settings },
    doors_open: { color: 'text-blue-400', bg: 'bg-blue-500/20', icon: Users },
    live: { color: 'text-green-400', bg: 'bg-green-500/20', icon: Radio },
    paused: { color: 'text-yellow-400', bg: 'bg-yellow-500/20', icon: Coffee },
    ended: { color: 'text-red-400', bg: 'bg-red-500/20', icon: Clock }
  }

  const config = statusConfig[showStatus]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-luxury-gold"></div>
      </div>
    )
  }

  return (
    <div className={cn(
      "min-h-screen",
      isFullscreen && "fixed inset-0 z-50 bg-black"
    )}>
      {/* Header */}
      <div className="bg-gray-950 border-b border-gray-900 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-playfair">Show Control</h1>
            <div className={cn("px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2", config.bg, config.color)}>
              <config.icon className="w-4 h-4" />
              {showStatus.replace('_', ' ').toUpperCase()}
            </div>
            {isConnected ? (
              <div className="flex items-center gap-2 text-xs text-green-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Connected
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-red-500">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                Offline
              </div>
            )}
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-2">
            <div className="flex bg-gray-900 rounded-lg p-1">
              <button
                onClick={() => setViewMode('director')}
                className={cn(
                  "px-3 py-1.5 rounded text-sm transition-colors",
                  viewMode === 'director' ? "bg-luxury-gold text-black" : "text-gray-400 hover:text-white"
                )}
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('preview')}
                className={cn(
                  "px-3 py-1.5 rounded text-sm transition-colors",
                  viewMode === 'preview' ? "bg-luxury-gold text-black" : "text-gray-400 hover:text-white"
                )}
              >
                <Smartphone className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('split')}
                className={cn(
                  "px-3 py-1.5 rounded text-sm transition-colors",
                  viewMode === 'split' ? "bg-luxury-gold text-black" : "text-gray-400 hover:text-white"
                )}
              >
                Split
              </button>
            </div>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 hover:bg-gray-900 rounded-lg transition-colors"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className={cn(
        "grid gap-6 p-6",
        viewMode === 'split' ? "lg:grid-cols-2" : "grid-cols-1"
      )}>
        {/* Director Controls */}
        {(viewMode === 'director' || viewMode === 'split') && (
          <div className="space-y-6">
            {/* Main Status Control */}
            <div className="bg-gray-950 border border-gray-900 rounded-lg p-6">
              <h2 className="text-lg font-medium mb-4">Show Status</h2>
              <div className="grid grid-cols-5 gap-2">
                {Object.entries(statusConfig).map(([status, cfg]) => (
                  <button
                    key={status}
                    onClick={() => changeShowStatus(status as any)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-lg transition-all",
                      showStatus === status
                        ? `${cfg.bg} ${cfg.color} ring-2 ring-offset-2 ring-offset-black ring-current`
                        : "bg-gray-900 hover:bg-gray-800 text-gray-400"
                    )}
                  >
                    <cfg.icon className="w-5 h-5" />
                    <span className="text-xs capitalize">{status.replace('_', ' ')}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Look Controls */}
            <div className="bg-gray-950 border border-gray-900 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium">Look Control</h2>
                <span className="text-sm text-gray-500">
                  {looks.find(l => l.active)?.look_number || 0} / {looks.length}
                </span>
              </div>

              {/* Current Look Display */}
              <div className="bg-black/50 rounded-lg p-4 mb-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Now Showing</p>
                <h3 className="text-3xl font-playfair">
                  {looks.find(l => l.active)?.name || 'No Active Look'}
                </h3>
              </div>

              {/* Navigation Controls */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <button
                  onClick={() => {
                    const prevIndex = Math.max(0, currentLookIndex - 1)
                    if (looks[prevIndex]) activateLook(looks[prevIndex].id)
                  }}
                  disabled={currentLookIndex === 0}
                  className="flex flex-col items-center gap-2 p-4 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  <SkipBack className="w-6 h-6" />
                  <span className="text-sm">Previous</span>
                </button>
                
                <button
                  onClick={() => changeShowStatus(showStatus === 'live' ? 'paused' : 'live')}
                  className="flex flex-col items-center gap-2 p-4 bg-luxury-gold text-black hover:bg-luxury-gold/80 rounded-lg transition-colors"
                >
                  {showStatus === 'live' ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                  <span className="text-sm font-medium">
                    {showStatus === 'live' ? 'Pause' : 'Start'}
                  </span>
                </button>
                
                <button
                  onClick={() => {
                    const nextIndex = Math.min(looks.length - 1, currentLookIndex + 1)
                    if (looks[nextIndex]) activateLook(looks[nextIndex].id)
                  }}
                  disabled={currentLookIndex >= looks.length - 1}
                  className="flex flex-col items-center gap-2 p-4 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  <SkipForward className="w-6 h-6" />
                  <span className="text-sm">Next</span>
                </button>
              </div>

              {/* Look Timeline */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {looks.map((look, index) => (
                  <button
                    key={look.id}
                    onClick={() => activateLook(look.id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-lg transition-all",
                      look.active
                        ? "bg-luxury-gold/20 border border-luxury-gold text-luxury-gold"
                        : "bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center font-bold",
                      look.active ? "bg-luxury-gold text-black" : "bg-gray-800"
                    )}>
                      {look.look_number}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium">{look.name}</p>
                      <p className="text-xs opacity-60">Look {look.look_number}</p>
                    </div>
                    {look.active && (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-current rounded-full animate-pulse" />
                        <span className="text-xs">LIVE</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Reactions */}
            <div className="bg-gray-950 border border-gray-900 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-luxury-gold" />
                  <h2 className="text-lg font-medium">Live Reactions</h2>
                </div>
                <span className="text-sm text-gray-500">{totalReactions} total</span>
              </div>
              
              {recentReactions.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {recentReactions.map((reaction) => (
                    <div 
                      key={reaction.emoji}
                      className="flex items-center gap-2 bg-gray-900 px-3 py-2 rounded-lg"
                    >
                      <span className="text-2xl">{reaction.emoji}</span>
                      <span className="text-sm text-gray-400">×{reaction.count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No reactions yet</p>
              )}
            </div>

            {/* Announcement Panel */}
            <div className="bg-gray-950 border border-gray-900 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="w-5 h-5 text-luxury-gold" />
                <h2 className="text-lg font-medium">Send Announcement</h2>
              </div>
              
              <textarea
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
                placeholder="Type your announcement..."
                className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg text-white placeholder:text-gray-600 focus:border-luxury-gold focus:outline-none resize-none mb-3"
                rows={3}
              />
              
              <div className="flex items-center gap-3">
                <select
                  value={announcementDuration}
                  onChange={(e) => setAnnouncementDuration(Number(e.target.value))}
                  className="px-3 py-2 bg-black border border-gray-800 rounded-lg text-white focus:border-luxury-gold focus:outline-none"
                >
                  <option value={5}>5 seconds</option>
                  <option value={10}>10 seconds</option>
                  <option value={15}>15 seconds</option>
                  <option value={30}>30 seconds</option>
                </select>
                
                <button
                  onClick={sendAnnouncement}
                  disabled={!announcement.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-luxury-gold text-black rounded-lg hover:bg-luxury-gold/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                  Send to All Guests
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Preview Panel */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className="bg-gray-950 border border-gray-900 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">Guest View Preview</h2>
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-500">Mobile Preview</span>
              </div>
            </div>
            
            {/* Phone Frame */}
            <div className="mx-auto max-w-sm">
              <div className="bg-gray-900 rounded-[2rem] p-2">
                <div className="bg-black rounded-[1.5rem] p-4 h-[600px] overflow-y-auto">
                  {/* Preview Content */}
                  <div className="text-center py-8">
                    <h3 className="text-2xl font-playfair mb-2">
                      {looks.find(l => l.active)?.name || 'Welcome'}
                    </h3>
                    <p className="text-gray-500">
                      Look {looks.find(l => l.active)?.look_number || '-'} of {looks.length}
                    </p>
                    
                    {looks.find(l => l.active)?.hero_image && (
                      <div className="mt-6 aspect-video bg-gray-800 rounded-lg overflow-hidden">
                        <img
                          src={looks.find(l => l.active)?.hero_image}
                          alt="Current Look"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <div className="mt-8 space-y-4">
                      <div className="p-4 bg-gray-900 rounded-lg">
                        <p className="text-sm text-gray-400">Show Status</p>
                        <p className="text-lg font-medium capitalize">
                          {showStatus.replace('_', ' ')}
                        </p>
                      </div>
                      
                      {announcement && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 bg-luxury-gold/20 border border-luxury-gold rounded-lg"
                        >
                          <Bell className="w-5 h-5 text-luxury-gold mx-auto mb-2" />
                          <p className="text-sm">{announcement}</p>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}