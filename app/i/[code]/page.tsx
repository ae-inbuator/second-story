'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Confetti from 'react-confetti'
import { Loader2, CheckCircle, Sparkles, Clock, MapPin, Calendar } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import { 
  getInvitationLinkState, 
  calculateCountdown, 
  generateICSFile, 
  generateGoogleCalendarLink,
  CalendarEvent,
  LinkState,
  CountdownTime
} from '@/lib/invitation-utils'

interface GuestData {
  id: string
  name: string
  email?: string
  phone_number?: string
  invitation_code: string
  confirmed_at?: string
  vip_level?: string
}

interface EventData {
  id: string
  name: string
  chapter_number: number
  date: string
  max_capacity: number
}

export default function PersonalInvitationPage() {
  const params = useParams()
  const router = useRouter()
  const code = params.code as string
  
  // State
  const [guest, setGuest] = useState<GuestData | null>(null)
  const [event, setEvent] = useState<EventData | null>(null)
  const [linkState, setLinkState] = useState<LinkState>('reservation')
  const [isLoading, setIsLoading] = useState(true)
  const [isConfirming, setIsConfirming] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })
  const [spotsLeft, setSpotsLeft] = useState(50)
  const [recentGuests, setRecentGuests] = useState<string[]>([])
  const [countdown, setCountdown] = useState<CountdownTime>({ 
    days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false 
  })

  // Event location (revealed 24h before)
  const eventLocation = {
    zone: 'Polanco District',
    address: 'Julio Verne 93, Polanco',
    mapsLink: 'https://maps.google.com/?q=Julio+Verne+93+Polanco+CDMX'
  }

  // Initialize and fetch data
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    
    fetchInvitationData()
    
    return () => window.removeEventListener('resize', handleResize)
  }, [code])

  // Update countdown every second
  useEffect(() => {
    if (!event || linkState === 'reservation') return
    
    const timer = setInterval(() => {
      const eventDate = new Date(event.date)
      const newCountdown = calculateCountdown(eventDate)
      setCountdown(newCountdown)
      
      // Update link state if needed
      const newState = getInvitationLinkState(eventDate, guest?.confirmed_at)
      if (newState !== linkState) {
        setLinkState(newState)
      }
    }, 1000)
    
    return () => clearInterval(timer)
  }, [event, guest, linkState])

  // Fetch invitation data
  async function fetchInvitationData() {
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
        router.push('/')
        return
      }
      
      setGuest(guestData)
      
      // Get event data
      const { data: eventData } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'upcoming')
        .single()
      
      if (eventData) {
        setEvent(eventData)
        const eventDate = new Date(eventData.date)
        setLinkState(getInvitationLinkState(eventDate, guestData.confirmed_at))
        setCountdown(calculateCountdown(eventDate))
      }
      
      // Get current capacity
      const { count } = await supabase
        .from('guests')
        .select('*', { count: 'exact', head: true })
        .not('confirmed_at', 'is', null)
      
      if (count !== null && eventData) {
        setSpotsLeft(eventData.max_capacity - count)
      }
      
      // Get recent confirmations
      const { data: recentData } = await supabase
        .from('guests')
        .select('name, confirmed_at')
        .not('confirmed_at', 'is', null)
        .order('confirmed_at', { ascending: false })
        .limit(3)
      
      if (recentData) {
        setRecentGuests(recentData.map(g => {
          const firstName = g.name.split(' ')[0]
          const lastInitial = g.name.split(' ').pop()?.charAt(0) || ''
          return `${firstName} ${lastInitial}.`
        }))
      }
      
    } catch (error) {
      console.error('Error fetching invitation:', error)
      toast.error('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle reservation confirmation
  async function handleConfirmReservation() {
    if (!guest || !event) return
    
    setIsConfirming(true)
    
    try {
      // Update guest confirmation
      const { error } = await supabase
        .from('guests')
        .update({ 
          confirmed_at: new Date().toISOString(),
          registered_at: new Date().toISOString()
        })
        .eq('id', guest.id)
      
      if (error) throw error
      
      // Update local state
      setGuest({ ...guest, confirmed_at: new Date().toISOString() })
      setLinkState('countdown')
      setShowConfetti(true)
      
      // Stop confetti after 5 seconds
      setTimeout(() => setShowConfetti(false), 5000)
      
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100])
      }
      
      // Refresh data
      fetchInvitationData()
      
    } catch (error) {
      console.error('Error confirming reservation:', error)
      toast.error('Failed to confirm reservation')
    } finally {
      setIsConfirming(false)
    }
  }

  // Generate calendar event
  function handleAddToCalendar(type: 'google' | 'apple') {
    if (!event || !guest) return
    
    const eventDate = new Date(event.date)
    const endDate = new Date(eventDate.getTime() + 3 * 60 * 60 * 1000) // 3 hours
    
    const calendarEvent: CalendarEvent = {
      title: `Second Story Chapter ${event.chapter_number}`,
      description: 'Exclusive luxury archive experience. Your personal invitation: secondstory.com/i/' + code,
      startDate: eventDate,
      endDate: endDate,
      location: linkState === 'location_revealed' || linkState === 'event_day' 
        ? eventLocation.address 
        : 'Location TBA (Check WhatsApp 24h before)'
    }
    
    if (type === 'google') {
      const link = generateGoogleCalendarLink(calendarEvent)
      window.open(link, '_blank')
    } else {
      const icsContent = generateICSFile(calendarEvent)
      const blob = new Blob([icsContent], { type: 'text/calendar' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'second-story-event.ics'
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    )
  }

  // Not found
  if (!guest || !event) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="font-playfair text-2xl mb-4">Invalid Invitation</h2>
          <p className="text-gray-400">Please check your invitation link</p>
        </div>
      </div>
    )
  }

  // Render based on link state
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <Toaster position="top-center" />
      
      {/* Animated background */}
      <div className="fixed inset-0 opacity-20">
        <div className="absolute inset-0">
          {/* Floating light particles animation */}
          <div className="particles-container">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                initial={{ 
                  x: Math.random() * window.innerWidth,
                  y: window.innerHeight + 10,
                  opacity: 0
                }}
                animate={{
                  y: -10,
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: Math.random() * 10 + 10,
                  repeat: Infinity,
                  delay: Math.random() * 5,
                  ease: "linear"
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="relative min-h-screen flex items-center justify-center px-6 py-20">
        <AnimatePresence mode="wait">
          {linkState === 'reservation' && (
            <motion.div
              key="reservation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-md text-center"
            >
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Image 
                  src="/logo-white.png" 
                  alt="Second Story" 
                  width={320} 
                  height={96} 
                  className="mx-auto mb-8 brightness-0 invert"
                  priority
                />
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="space-y-6"
              >
                <h1 className="font-playfair text-3xl sm:text-4xl">
                  Welcome, {guest.name}
                </h1>
                
                <div className="text-xs tracking-[0.2em] uppercase text-gray-400">
                  <p>Chapter {event.chapter_number} • Winter Luxe</p>
                  <p className="mt-2">
                    {new Date(event.date).toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })} • 7PM
                  </p>
                </div>

                {spotsLeft > 0 && (
                  <div className="py-6">
                    <div className="flex items-center justify-center gap-3 text-sm">
                      {spotsLeft <= 10 && (
                        <span className="px-3 py-1 bg-white text-black text-xs tracking-wider animate-pulse">
                          FINAL SPOTS
                        </span>
                      )}
                      <span className="text-gray-300">
                        {spotsLeft} of {event.max_capacity} places remaining
                      </span>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="mt-4 max-w-xs mx-auto">
                      <div className="h-[2px] bg-gray-800 overflow-hidden">
                        <motion.div 
                          className="h-full bg-white"
                          initial={{ width: 0 }}
                          animate={{ width: `${((event.max_capacity - spotsLeft) / event.max_capacity) * 100}%` }}
                          transition={{ duration: 1 }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {recentGuests.length > 0 && (
                  <div className="text-xs text-gray-500 space-y-1">
                    <p className="tracking-wider uppercase">Recently joined:</p>
                    {recentGuests.map((name, i) => (
                      <p key={i}>• {name}</p>
                    ))}
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleConfirmReservation}
                  disabled={isConfirming || spotsLeft === 0}
                  className="w-full bg-white text-black py-4 px-8 tracking-[0.2em] uppercase text-sm font-light hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isConfirming ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </span>
                  ) : spotsLeft === 0 ? (
                    'Event Full'
                  ) : (
                    'Reserve Your Place'
                  )}
                </motion.button>
              </motion.div>
            </motion.div>
          )}

          {(linkState === 'countdown' || linkState === 'location_revealed' || linkState === 'event_day') && (
            <motion.div
              key="confirmed"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-md text-center"
            >
              {showConfetti && (
                <Confetti
                  width={windowSize.width}
                  height={windowSize.height}
                  numberOfPieces={200}
                  recycle={false}
                  colors={['#FFFFFF', '#999999', '#666666']}
                  gravity={0.05}
                />
              )}

              {guest.confirmed_at && linkState === 'countdown' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="w-20 h-20 mx-auto mb-8 border border-white flex items-center justify-center"
                >
                  <CheckCircle className="w-10 h-10" />
                </motion.div>
              )}

              <h2 className="font-playfair text-3xl sm:text-4xl mb-2">
                {linkState === 'event_day' ? `Welcome, ${guest.name.split(' ')[0]}` : `Perfect, ${guest.name.split(' ')[0]}`}
              </h2>

              {/* Countdown Timer */}
              {!countdown.isExpired && (
                <div className="my-12">
                  <p className="text-xs tracking-[0.2em] uppercase text-gray-400 mb-4">
                    {linkState === 'event_day' ? 'Starting in' : 'Countdown to Chapter I'}
                  </p>
                  <div className="flex items-center justify-center gap-4">
                    {countdown.days > 0 && (
                      <div>
                        <div className="font-playfair text-4xl">{countdown.days.toString().padStart(2, '0')}</div>
                        <div className="text-xs tracking-wider uppercase text-gray-500">Days</div>
                      </div>
                    )}
                    <div>
                      <div className="font-playfair text-4xl">{countdown.hours.toString().padStart(2, '0')}</div>
                      <div className="text-xs tracking-wider uppercase text-gray-500">Hours</div>
                    </div>
                    <div className="text-3xl text-gray-600">:</div>
                    <div>
                      <div className="font-playfair text-4xl">{countdown.minutes.toString().padStart(2, '0')}</div>
                      <div className="text-xs tracking-wider uppercase text-gray-500">Min</div>
                    </div>
                    <div className="text-3xl text-gray-600">:</div>
                    <div>
                      <div className="font-playfair text-4xl text-white">
                        {countdown.seconds.toString().padStart(2, '0')}
                      </div>
                      <div className="text-xs tracking-wider uppercase text-gray-500">Sec</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Location reveal */}
              {(linkState === 'location_revealed' || linkState === 'event_day') && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="my-8 p-6 border border-gray-800"
                >
                  <MapPin className="w-6 h-6 mx-auto mb-3" />
                  <p className="text-xs tracking-[0.2em] uppercase text-gray-400 mb-2">Location</p>
                  <p className="font-playfair text-xl">{eventLocation.address}</p>
                  <a 
                    href={eventLocation.mapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-3 text-xs tracking-wider uppercase text-gray-400 hover:text-white transition-colors"
                  >
                    View in Maps →
                  </a>
                </motion.div>
              )}

              {linkState === 'countdown' && (
                <p className="text-xs tracking-[0.2em] uppercase text-gray-500 my-8">
                  Location will be revealed 24 hours before
                </p>
              )}

              {/* Calendar buttons */}
              <div className="flex gap-4 justify-center mt-8">
                <button
                  onClick={() => handleAddToCalendar('google')}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-800 hover:border-white transition-colors text-xs tracking-wider uppercase"
                >
                  <Calendar className="w-4 h-4" />
                  Google
                </button>
                <button
                  onClick={() => handleAddToCalendar('apple')}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-800 hover:border-white transition-colors text-xs tracking-wider uppercase"
                >
                  <Calendar className="w-4 h-4" />
                  Apple
                </button>
              </div>

              {/* Event day - ticket QR */}
              {linkState === 'event_day' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="mt-12 p-6 border border-white"
                >
                  <p className="text-xs tracking-[0.2em] uppercase text-gray-400 mb-4">
                    Your Digital Ticket
                  </p>
                  <div className="bg-white text-black p-4">
                    <p className="font-mono text-2xl tracking-wider">{code}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    Show this at entrance
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}

          {linkState === 'expired' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <h2 className="font-playfair text-3xl mb-4">Event has ended</h2>
              <p className="text-gray-400">Thank you for joining us</p>
              <p className="text-xs tracking-[0.2em] uppercase text-gray-500 mt-8">
                Chapter II coming soon
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}