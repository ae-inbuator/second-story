'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Confetti from 'react-confetti'
import { 
  Loader2, 
  CheckCircle, 
  Sparkles, 
  Clock, 
  MapPin, 
  Calendar,
  Users,
  X,
  ArrowRight,
  Heart
} from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import config from '@/lib/config'
import { useWebSocket } from '@/hooks/useWebSocket'
import ErrorBoundary from '@/components/ErrorBoundary'

interface GuestData {
  id: string
  name: string
  email?: string
  phone_number?: string
  invitation_code: string
  confirmed_at?: string
  vip_level?: string
  active_session_id?: string
}

interface EventData {
  id: string
  name: string
  chapter_number: number
  date: string
  time: string
  location: string
  address: string
  max_capacity: number
  dress_code?: string
  description?: string
  show_status?: string
  doors_open_at?: string
  show_starts_at?: string
  countdown_target?: string
}

interface RecentConfirmation {
  name: string
  confirmed_at: string
}

function PersonalInvitationPageContent() {
  const params = useParams()
  const router = useRouter()
  const code = params.code as string
  
  const [guest, setGuest] = useState<GuestData | null>(null)
  const [event, setEvent] = useState<EventData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isConfirming, setIsConfirming] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [hasConfirmed, setHasConfirmed] = useState(false)
  const [registrationCount, setRegistrationCount] = useState(0)
  const [targetCount, setTargetCount] = useState(0)
  const [recentConfirmations, setRecentConfirmations] = useState<RecentConfirmation[]>([])
  const [currentConfirmationIndex, setCurrentConfirmationIndex] = useState(0)
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [sessionId] = useState(() => crypto.randomUUID())
  const [showState, setShowState] = useState<'preparing' | 'doors_open' | 'live' | 'paused' | 'ended'>('preparing')
  const [breakEndTime, setBreakEndTime] = useState<Date | null>(null)
  const [breakMinutes, setBreakMinutes] = useState(0)
  const [breakSeconds, setBreakSeconds] = useState(0)
  
  // WebSocket connection with proper URL
  const socketUrl = process.env.NODE_ENV === 'production' 
    ? 'https://second-story.onrender.com'
    : 'http://localhost:3001'
  const { on, off, emit, isConnected, socket } = useWebSocket(socketUrl)

  // Fetch invitation data
  useEffect(() => {
    fetchInvitationData()
    
    // Poll for show status changes every 10 seconds as backup
    const pollInterval = setInterval(() => {
      checkShowStatus()
    }, 10000)
    
    return () => clearInterval(pollInterval)
  }, [code])

  // Listen for WebSocket events
  useEffect(() => {
    if (!socket || !isConnected) {
      console.log('WebSocket not connected yet, waiting...', { socket: !!socket, isConnected })
      return
    }
    
    console.log('Setting up WebSocket listeners')
    
    const handleTimerUpdate = (data: any) => {
      console.log('Timer update received:', data)
      if (event && data.countdown_target) {
        setEvent(prev => prev ? { ...prev, countdown_target: data.countdown_target } : prev)
      }
    }
    
    const handleStatusUpdate = (data: any) => {
      console.log('Status update received:', data)
      if (data.status) {
        setShowState(data.status)
        
        // If intermission, set break timer
        if (data.status === 'paused' && data.breakDuration) {
          const endTime = new Date()
          endTime.setMinutes(endTime.getMinutes() + data.breakDuration)
          setBreakEndTime(endTime)
        }
        
        // Clear break timer when going to other states
        if (data.status !== 'paused') {
          setBreakEndTime(null)
        }
      }
    }
    
    // Set up event listeners
    const unsubTimer = on('timer:updated', handleTimerUpdate)
    const unsubStatus = on('show:status', handleStatusUpdate)
    
    // Emit join event
    if (guest) {
      emit('guest:join', { guestId: guest.id })
    }
    
    return () => {
      off('timer:updated', handleTimerUpdate)
      off('show:status', handleStatusUpdate)
    }
  }, [socket, isConnected, event, guest, on, off, emit])

  // Break timer countdown
  useEffect(() => {
    if (showState === 'paused') {
      if (!breakEndTime) {
        // Default 15 min break if no end time set
        const defaultBreak = new Date()
        defaultBreak.setMinutes(defaultBreak.getMinutes() + 15)
        setBreakEndTime(defaultBreak)
      }
      
      const timer = setInterval(() => {
        if (breakEndTime) {
          const now = new Date()
          const diff = breakEndTime.getTime() - now.getTime()
          
          if (diff > 0) {
            const mins = Math.floor(diff / 60000)
            const secs = Math.floor((diff % 60000) / 1000)
            setBreakMinutes(mins)
            setBreakSeconds(secs)
          } else {
            setBreakMinutes(0)
            setBreakSeconds(0)
          }
        }
      }, 1000)
      
      return () => clearInterval(timer)
    }
  }, [showState, breakEndTime])

  // Animate counter
  useEffect(() => {
    const interval = setInterval(() => {
      setRegistrationCount(prev => {
        if (prev < targetCount) return Math.min(prev + 1, targetCount)
        if (prev > targetCount) return Math.max(prev - 1, targetCount)
        return prev
      })
    }, 50)
    
    return () => clearInterval(interval)
  }, [targetCount])

  // Rotate recent confirmations
  useEffect(() => {
    if (recentConfirmations.length <= 1) return
    
    const interval = setInterval(() => {
      setCurrentConfirmationIndex(prev => 
        (prev + 1) % recentConfirmations.length
      )
    }, 4000)
    
    return () => clearInterval(interval)
  }, [recentConfirmations])

  // Countdown timer with seconds
  useEffect(() => {
    if (!event) return
    
    const timer = setInterval(() => {
      // Use countdown_target if available, otherwise use event date/time
      const targetDate = event.countdown_target 
        ? new Date(event.countdown_target)
        : new Date(event.date + 'T' + event.time)
      
      const now = new Date()
      const diff = targetDate.getTime() - now.getTime()
      
      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)
        setCountdown({ days, hours, minutes, seconds })
      } else {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }, 1000)
    
    return () => clearInterval(timer)
  }, [event])

  async function checkShowStatus() {
    if (!guest || !event) return
    
    try {
      const { data: eventData } = await supabase
        .from('events')
        .select('show_status')
        .eq('id', event.id)
        .single()
      
      if (eventData && eventData.show_status !== showState) {
        setShowState(eventData.show_status as any)
        // NO redirect - handle all states in-place
      }
    } catch (error) {
      console.error('Error checking show status:', error)
    }
  }

  async function fetchInvitationData() {
    if (!code) return
    
    setIsLoading(true)
    
    try {
      // Get guest by invitation code
      const { data: guestData, error: guestError } = await supabase
        .from('guests')
        .select('*')
        .eq('invitation_code', code.toUpperCase())
        .single()
      
      if (guestError || !guestData) {
        toast.error('Invalid invitation code')
        setTimeout(() => router.push('/'), 3000)
        setIsLoading(false)
        return
      }
      
      setGuest(guestData)
      setHasConfirmed(!!guestData.confirmed_at)
      
      // Get event data
      const { data: eventData } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'upcoming')
        .single()
      
      if (eventData) {
        setEvent(eventData)
        setShowState(eventData.show_status || 'preparing')
        
        // NO redirect - handle all states in-place
        
        // Get registration stats
        const { count } = await supabase
          .from('guests')
          .select('*', { count: 'exact', head: true })
          .not('confirmed_at', 'is', null)
        
        if (count !== null) {
          setTargetCount(count)
        }
        
        // Get recent confirmations for social proof
        const { data: recent } = await supabase
          .from('guests')
          .select('name, confirmed_at')
          .not('confirmed_at', 'is', null)
          .order('confirmed_at', { ascending: false })
          .limit(5)
        
        if (recent) {
          setRecentConfirmations(recent.map(r => {
            const nameParts = r.name.trim().split(' ')
            let displayName = ''
            
            if (nameParts.length === 1) {
              // Solo un nombre
              displayName = nameParts[0]
            } else if (nameParts.length === 2) {
              // Nombre y apellido o dos nombres
              // Si el segundo parece un apellido (empieza con mayúscula), usar inicial
              displayName = nameParts[0] + ' ' + nameParts[1].charAt(0) + '.'
            } else {
              // Tres o más partes, tomar primer nombre e inicial del último
              displayName = nameParts[0] + ' ' + nameParts[nameParts.length - 1].charAt(0) + '.'
            }
            
            return {
              name: displayName,
              confirmed_at: r.confirmed_at
            }
          }))
        }
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  async function confirmAttendance() {
    if (!guest || hasConfirmed) return
    
    setIsConfirming(true)
    
    try {
      // Check for active session conflict
      const { data: currentGuest } = await supabase
        .from('guests')
        .select('active_session_id')
        .eq('id', guest.id)
        .single()
      
      if (currentGuest?.active_session_id && currentGuest.active_session_id !== sessionId) {
        toast.error('This invitation is being used elsewhere')
        setIsConfirming(false)
        return
      }
      
      // Update confirmation with session
      const { error } = await supabase
        .from('guests')
        .update({ 
          confirmed_at: new Date().toISOString(),
          registered_at: new Date().toISOString(),
          active_session_id: sessionId,
          last_activity_at: new Date().toISOString()
        })
        .eq('id', guest.id)
      
      if (error) throw error
      
      setHasConfirmed(true)
      setShowConfetti(true)
      setTargetCount(prev => prev + 1)
      
      // Save session for auto-login
      localStorage.setItem('secondStorySession', JSON.stringify({
        guestId: guest.id,
        sessionId: sessionId,
        invitationCode: code,
        confirmedAt: new Date().toISOString()
      }))
      
      // Hide confetti after 5 seconds
      setTimeout(() => setShowConfetti(false), 5000)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to confirm attendance')
    } finally {
      setIsConfirming(false)
    }
  }

  function addToCalendar() {
    if (!event) return
    
    const eventDate = new Date(event.date + 'T' + event.time)
    const endDate = new Date(eventDate.getTime() + 3 * 60 * 60 * 1000) // 3 hours
    
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${eventDate.toISOString().replace(/[-:]/g, '').replace('.000', '')}
DTEND:${endDate.toISOString().replace(/[-:]/g, '').replace('.000', '')}
SUMMARY:Second Story - ${event.name}
DESCRIPTION:An exclusive evening of curated luxury. Your invitation code: ${code.toUpperCase()}
LOCATION:${event.location}, ${event.address}
END:VEVENT
END:VCALENDAR`
    
    const blob = new Blob([icsContent], { type: 'text/calendar' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'second-story-event.ics'
    a.click()
    URL.revokeObjectURL(url)
    
    toast.success('Calendar event downloaded')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <Image 
            src="/logo.png" 
            alt="Second Story" 
            width={150} 
            height={45} 
            className="opacity-90"
          />
        </motion.div>
      </div>
    )
  }

  if (!guest || !event) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <X className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h1 className="text-2xl font-light mb-2">Invalid Invitation</h1>
          <p className="text-gray-500">Please check your invitation link</p>
        </div>
      </div>
    )
  }

  // Show doors open state - Cocktail hour (NO timer)
  if (showState === 'doors_open' && hasConfirmed) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center px-6 max-w-2xl mx-auto">
          <Image 
            src="/logo.png" 
            alt="Second Story" 
            width={300} 
            height={90} 
            className="mx-auto mb-8"
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-6xl mb-4">🥂</div>
            <h1 className="text-4xl sm:text-5xl font-light">Welcome to Second Story</h1>
            <p className="text-xl text-gray-600 mb-2">Dear {guest?.name.split(' ')[0]},</p>
            
            <div className="border-t border-b border-gray-200 py-6 my-8">
              <p className="text-lg text-gray-700 mb-2">The cocktail hour has begun</p>
              <p className="text-gray-600 italic">Mingle, explore, and prepare for an extraordinary show</p>
            </div>
            
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-sm text-gray-500"
            >
              The show will begin shortly
            </motion.div>
          </motion.div>
        </div>
      </div>
    )
  }

  // Show LIVE state - Embedded show experience
  if (showState === 'live' && hasConfirmed) {
    return (
      <div className="min-h-screen bg-black">
        {/* Minimal header */}
        <div className="fixed top-0 left-0 right-0 bg-black/90 backdrop-blur-sm z-50 px-4 py-3 border-b border-gray-800">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <Image 
              src="/logo-white.png" 
              alt="Second Story" 
              width={120} 
              height={36}
              className="brightness-0 invert"
            />
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-white text-xs tracking-widest uppercase">Live</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Embedded show */}
        <iframe 
          src={`/show?guest=${guest?.id}&session=${sessionId}&embedded=true`}
          className="w-full h-screen pt-14"
          style={{ border: 'none' }}
          allow="fullscreen"
          title="Second Story Show"
          onError={(e) => {
            console.error('Iframe error:', e)
            toast.error('Error loading show. Please refresh.')
          }}
        />
      </div>
    )
  }

  // Show INTERMISSION state - Break timer
  if (showState === 'paused' && hasConfirmed) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center px-6 max-w-2xl mx-auto">
          <Image 
            src="/logo.png" 
            alt="Second Story" 
            width={300} 
            height={90} 
            className="mx-auto mb-8"
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-6xl mb-4">☕</div>
            <h1 className="text-4xl sm:text-5xl font-light">Intermission</h1>
            
            <div className="border-t border-b border-gray-200 py-6 my-8">
              <p className="text-lg text-gray-700 mb-4">Perfect time to refresh your champagne</p>
              
              {/* Break Timer */}
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-xs tracking-[0.3em] uppercase text-gray-600 mb-4">
                  Resuming in
                </p>
                <div className="flex justify-center gap-4">
                  <div className="text-center">
                    <div className="text-4xl font-light mb-1">
                      {String(breakMinutes).padStart(2, '0')}
                    </div>
                    <p className="text-xs tracking-widest uppercase text-gray-500">
                      Minutes
                    </p>
                  </div>
                  <div className="text-4xl font-light">:</div>
                  <div className="text-center">
                    <div className="text-4xl font-light mb-1">
                      {String(breakSeconds).padStart(2, '0')}
                    </div>
                    <p className="text-xs tracking-widest uppercase text-gray-500">
                      Seconds
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-gray-500">We'll resume the show shortly</p>
          </motion.div>
        </div>
      </div>
    )
  }

  // Show ended state
  if (showState === 'ended') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center px-6 max-w-2xl mx-auto">
          <Image 
            src="/logo.png" 
            alt="Second Story" 
            width={300} 
            height={90} 
            className="mx-auto mb-8"
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Sparkles className="w-16 h-16 mx-auto text-black" />
            <h1 className="text-4xl font-light">Thank you for experiencing Second Story</h1>
            <div className="border-t border-b border-gray-200 py-6 my-8">
              <p className="text-lg text-gray-700 mb-4">
                Your wishlisted items are reserved in order of selection
              </p>
              <p className="text-sm text-gray-600">
                Guests #1-10 have priority access for the next 24 hours
              </p>
            </div>
            <p className="text-gray-600 mb-2">
              Contact your personal shopper to secure your pieces
            </p>
            <a href="mailto:shop@secondstory.com" className="inline-block text-black underline mb-4">
              shop@secondstory.com
            </a>
            <p className="text-sm text-gray-500 italic">
              Check your email for detailed purchase instructions
            </p>
          </motion.div>
        </div>
      </div>
    )
  }

  // Main invitation interface - replicating home page style
  return (
    <div className="min-h-screen bg-white text-black overflow-hidden">
      <Toaster position="top-center" />
      
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
          gravity={0.1}
          colors={['#000000', '#666666', '#999999', '#CCCCCC']}
        />
      )}

      {/* Hero Section - Identical to home page */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 1px, transparent 15px)`,
          }} />
        </div>
        
        {/* Content */}
        <div className="relative z-20 text-center px-4 sm:px-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {!hasConfirmed ? (
              // Pre-confirmation view
              <>
                <p className="text-gray-600 text-sm tracking-[0.3em] uppercase mb-6">
                  Chapter I
                </p>
                <div className="mb-6">
                  <Image 
                    src="/logo.png" 
                    alt="Second Story" 
                    width={400} 
                    height={120} 
                    className="mx-auto"
                    priority
                  />
                </div>
                <p className="text-xl sm:text-2xl font-light italic mb-8 text-gray-600">
                  Where luxury finds its next chapter
                </p>
                
                {/* Personal greeting */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mb-12"
                >
                  <h1 className="text-3xl sm:text-4xl font-light mb-4">
                    Dear {guest.name.split(' ')[0]},
                  </h1>
                  <p className="text-lg text-gray-600">
                    You're exclusively invited
                  </p>
                </motion.div>
                
                {/* CTA Button */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ y: 0, scale: 0.98 }}
                  onClick={confirmAttendance}
                  disabled={isConfirming}
                  className="btn-luxury animate-pulse-subtle px-12 py-4 flex items-center justify-center gap-3 mx-auto mb-12"
                >
                  {isConfirming ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>Confirm Your Place</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </motion.button>
              </>
            ) : (
              // Post-confirmation thank you view
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="mb-6"
                >
                  <CheckCircle className="w-20 h-20 mx-auto text-black mb-4" />
                </motion.div>
                
                <p className="text-gray-600 text-sm tracking-[0.3em] uppercase mb-4">
                  Chapter I
                </p>
                
                <h1 className="text-4xl sm:text-5xl font-light mb-4">
                  You're confirmed, {guest.name.split(' ')[0]}!
                </h1>
                
                <p className="text-xl text-gray-600 mb-2">
                  You're spot #{registrationCount}
                </p>
                <p className="text-sm text-gray-500">
                  Welcome to an exclusive group of {event.max_capacity}
                </p>
                
                {/* Countdown */}
                <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg p-8 mb-8 mt-8">
                  <p className="text-xs tracking-[0.3em] uppercase text-gray-600 mb-6">
                    Countdown to Show
                  </p>
                  <div className="grid grid-cols-4 gap-4">
                    {[
                      { value: countdown.days, label: 'Days' },
                      { value: countdown.hours, label: 'Hours' },
                      { value: countdown.minutes, label: 'Minutes' },
                      { value: countdown.seconds, label: 'Seconds' }
                    ].map((item, index) => (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="text-center"
                      >
                        <motion.div
                          key={`${item.label}-${item.value}`}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="text-3xl sm:text-4xl font-light mb-1"
                        >
                          {String(item.value).padStart(2, '0')}
                        </motion.div>
                        <p className="text-xs tracking-widest uppercase text-gray-500">
                          {item.label}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
                
                {/* Calendar link */}
                <button
                  onClick={addToCalendar}
                  className="text-sm text-gray-600 hover:text-black transition-colors mb-6"
                >
                  📅 Add to calendar
                </button>
              </>
            )}
            
            {/* Live Stats - Only show before confirmation */}
            {!hasConfirmed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="space-y-4"
              >
                {/* Registration count */}
                <div className="text-center">
                  <motion.p
                    key={registrationCount}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-gray-600"
                  >
                    <span className="text-black font-medium text-lg">{registrationCount}</span>
                    <span className="text-gray-600"> of {event.max_capacity} spots taken</span>
                  </motion.p>
                  <p className="text-xs text-gray-500 mt-1">
                    {event.max_capacity - registrationCount} spots remaining
                  </p>
                </div>
                
                {/* Recent confirmations */}
                {recentConfirmations.length > 0 && (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentConfirmationIndex}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.5 }}
                      className="flex items-center justify-center gap-2 text-sm text-gray-600"
                    >
                      <Sparkles className="w-4 h-4 text-black opacity-60" />
                      <span className="text-gray-700">
                        {recentConfirmations[currentConfirmationIndex]?.name} secured their place
                      </span>
                    </motion.div>
                  </AnimatePresence>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Event Details - Only show if not confirmed */}
      {!hasConfirmed && (
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-t border-gray-100">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium">Date</p>
                    <p className="text-gray-600">
                      {new Date(event.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium">Time</p>
                    <p className="text-gray-600">{event.time}</p>
                    <p className="text-sm text-gray-500">Doors open 30 minutes prior</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-gray-600">{event.location}</p>
                    <p className="text-gray-500 text-sm">{event.address}</p>
                  </div>
                </div>
                
                {event.dress_code && (
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium">Dress Code</p>
                      <p className="text-gray-600">{event.dress_code}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </section>
      )}
    </div>
  )
}

export default function PersonalInvitationPage() {
  return (
    <ErrorBoundary>
      <PersonalInvitationPageContent />
    </ErrorBoundary>
  )
}