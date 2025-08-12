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
  User,
  X
} from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

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
  time: string
  location: string
  address: string
  max_capacity: number
  dress_code?: string
  description?: string
}

export default function PersonalInvitationPage() {
  const params = useParams()
  const router = useRouter()
  const code = params.code as string
  
  const [guest, setGuest] = useState<GuestData | null>(null)
  const [event, setEvent] = useState<EventData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isConfirming, setIsConfirming] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [hasConfirmed, setHasConfirmed] = useState(false)
  const [spotsLeft, setSpotsLeft] = useState(50)
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 })

  useEffect(() => {
    fetchInvitationData()
  }, [code])

  useEffect(() => {
    if (event) {
      const timer = setInterval(() => {
        const eventDate = new Date(event.date)
        const now = new Date()
        const diff = eventDate.getTime() - now.getTime()
        
        if (diff > 0) {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24))
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
          setTimeLeft({ days, hours, minutes })
        }
      }, 1000)
      
      return () => clearInterval(timer)
    }
  }, [event])

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
      
      if (guestError) {
        console.error('Guest fetch error:', guestError)
        if (guestError.code === 'PGRST116') {
          // No matching record found
          toast.error('Invalid invitation code')
          setTimeout(() => router.push('/'), 3000)
        } else {
          // Other database error
          toast.error('Error loading invitation. Please try again.')
        }
        setIsLoading(false)
        return
      }
      
      if (!guestData) {
        toast.error('Invalid invitation code')
        setTimeout(() => router.push('/'), 3000)
        setIsLoading(false)
        return
      }
      
      setGuest(guestData)
      setHasConfirmed(!!guestData.confirmed_at)
      
      // Get upcoming event - don't fail if no event
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'upcoming')
        .single()
      
      if (!eventError && eventData) {
        setEvent(eventData)
        
        // Get current capacity
        const { count } = await supabase
          .from('guests')
          .select('*', { count: 'exact', head: true })
          .not('confirmed_at', 'is', null)
        
        if (count !== null) {
          setSpotsLeft(eventData.max_capacity - count)
        }
      } else if (eventError && eventError.code !== 'PGRST116') {
        console.error('Event fetch error:', eventError)
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      toast.error('Something went wrong. Please refresh and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  async function confirmAttendance() {
    if (!guest || hasConfirmed) return
    
    setIsConfirming(true)
    
    try {
      const { error } = await supabase
        .from('guests')
        .update({ 
          confirmed_at: new Date().toISOString(),
          registered_at: new Date().toISOString()
        })
        .eq('id', guest.id)
      
      if (error) throw error
      
      setHasConfirmed(true)
      setShowConfetti(true)
      toast.success('See you there!')
      
      // Hide confetti after 5 seconds
      setTimeout(() => setShowConfetti(false), 5000)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to confirm attendance')
    } finally {
      setIsConfirming(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-8 h-8 text-black" />
        </motion.div>
      </div>
    )
  }

  if (!guest) {
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

  if (!event) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center px-6">
          <Sparkles className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h1 className="text-2xl font-light mb-2">Dear {guest.name}</h1>
          <p className="text-gray-500 mb-4">Thank you for your interest!</p>
          <p className="text-gray-600">Event details will be announced soon.</p>
          <p className="text-sm text-gray-400 mt-6">Your invitation code: {code.toUpperCase()}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Toaster position="top-center" />
      
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
          gravity={0.1}
        />
      )}

      {/* Header with Logo */}
      <div className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-40 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Image
            src="/logo.png"
            alt="Second Story"
            width={150}
            height={40}
            className="h-8 w-auto"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-24 pb-12 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          {/* Personal Greeting */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex items-center justify-center w-20 h-20 bg-black text-white rounded-full mb-6"
            >
              <User className="w-10 h-10" />
            </motion.div>
            
            <h1 className="text-4xl font-light mb-4">
              Dear {guest.name}
            </h1>
            <p className="text-gray-600 text-lg">
              You're exclusively invited to
            </p>
          </div>

          {/* Event Card */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="border border-gray-200 p-8 mb-8"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-light mb-2">{event.name}</h2>
              {event.description && (
                <p className="text-gray-600 italic">{event.description}</p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
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

            {/* Event Countdown */}
            {timeLeft.days > 0 && (
              <div className="border-t border-gray-200 pt-6">
                <div className="flex justify-center gap-8">
                  <div className="text-center">
                    <p className="text-3xl font-light">{timeLeft.days}</p>
                    <p className="text-sm text-gray-500">Days</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-light">{timeLeft.hours}</p>
                    <p className="text-sm text-gray-500">Hours</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-light">{timeLeft.minutes}</p>
                    <p className="text-sm text-gray-500">Minutes</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* RSVP Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            {hasConfirmed ? (
              <div className="space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full mb-4">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-light">You're All Set!</h3>
                <p className="text-gray-600">
                  Your attendance has been confirmed. We can't wait to see you there.
                </p>
                {guest.vip_level === 'vip' && (
                  <div className="mt-6 inline-flex items-center gap-2 bg-black text-white px-6 py-3">
                    <Sparkles className="w-5 h-5" />
                    <span>VIP Access Granted</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-gray-600">
                  Limited to {event.max_capacity} guests • {spotsLeft} spots remaining
                </p>
                <button
                  onClick={confirmAttendance}
                  disabled={isConfirming || spotsLeft <= 0}
                  className={`
                    inline-flex items-center gap-3 px-12 py-4 text-lg
                    transition-all duration-300 transform hover:scale-105
                    ${spotsLeft <= 0 
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                      : 'bg-black text-white hover:bg-gray-900'
                    }
                  `}
                >
                  {isConfirming ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Confirming...</span>
                    </>
                  ) : spotsLeft <= 0 ? (
                    <span>Event Full</span>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Yes, I'll Be There</span>
                    </>
                  )}
                </button>
                
                <div className="mt-4">
                  <button
                    onClick={() => router.push('/')}
                    className="text-gray-500 underline hover:no-underline text-sm"
                  >
                    Cannot attend
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 py-8 px-6">
        <div className="max-w-2xl mx-auto text-center text-sm text-gray-500">
          <p>Questions? Contact us at hello@secondstory.com</p>
          <p className="mt-2">Your invitation code: {code.toUpperCase()}</p>
        </div>
      </div>
    </div>
  )
}