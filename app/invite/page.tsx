'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Calendar, Users, Sparkles } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

export default function InvitePage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isRegistered, setIsRegistered] = useState(false)
  const [spotsLeft, setSpotsLeft] = useState(50)
  const [recentGuests, setRecentGuests] = useState<any[]>([])
  const [eventDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))

  useEffect(() => {
    fetchRegistrationStats()
    const interval = setInterval(fetchRegistrationStats, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchRegistrationStats = async () => {
    const { count } = await supabase
      .from('guests')
      .select('*', { count: 'exact', head: true })
    
    if (count !== null) {
      setSpotsLeft(50 - count)
    }

    const { data: recent } = await supabase
      .from('guests')
      .select('name, created_at')
      .order('created_at', { ascending: false })
      .limit(3)
    
    if (recent) {
      setRecentGuests(recent)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const { error } = await supabase
      .from('guests')
      .insert({ name, email })
    
    if (error) {
      if (error.code === '23505') {
        toast.error('You're already registered!')
      } else {
        toast.error('Something went wrong. Please try again.')
      }
      return
    }
    
    setIsRegistered(true)
    toast.success('Perfect! Your spot is confirmed.')
    fetchRegistrationStats()
  }

  const formatTimeAgo = (date: string) => {
    const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000)
    if (mins < 1) return 'just now'
    if (mins === 1) return '1 min ago'
    if (mins < 60) return " mins ago"
    return 'recently'
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <Toaster position="top-center" />
      
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-light tracking-wider">SECOND STORY</h1>
          <p className="text-gray-400 tracking-widest text-sm">CHAPTER I</p>
        </div>

        {!isRegistered ? (
          <>
            {/* Event Info */}
            <div className="text-center space-y-4 py-8">
              <div className="flex items-center justify-center gap-2 text-gray-300">
                <Calendar className="w-4 h-4" />
                <p>{eventDate.toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })} · 7PM</p>
              </div>
              
              <div className="flex items-center justify-center gap-2">
                <Users className="w-4 h-4 text-yellow-500" />
                <p className="text-sm">
                  <span className="text-yellow-500 font-semibold">{spotsLeft}</span> of 50 spots remaining
                </p>
              </div>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-white/30 transition"
              />
              
              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-white/30 transition"
              />
              
              <button
                type="submit"
                className="w-full py-3 bg-white text-black font-medium rounded-lg hover:bg-gray-100 transition"
              >
                Reserve My Spot
              </button>
            </form>

            {/* Recent Registrations */}
            {recentGuests.length > 0 && (
              <div className="pt-8 border-t border-white/10">
                <p className="text-xs text-gray-400 mb-3">Recently joined</p>
                <div className="space-y-2">
                  {recentGuests.map((guest, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                      <Sparkles className="w-3 h-3 text-yellow-500" />
                      <span>{guest.name.split(' ')[0]} {guest.name.split(' ')[1]?.[0]}.</span>
                      <span className="text-gray-500">· {formatTimeAgo(guest.created_at)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          /* Confirmation State */
          <div className="text-center space-y-6 py-12">
            <div className="text-6xl">✓</div>
            <div>
              <h2 className="text-2xl mb-2">Perfect, {name.split(' ')[0]}!</h2>
              <p className="text-gray-400">Your spot is confirmed</p>
            </div>
            
            <div className="py-6 space-y-2">
              <p className="text-lg">
                {eventDate.toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })} · 7PM
              </p>
              <p className="text-sm text-gray-400">Location will be revealed via WhatsApp</p>
            </div>
            
            <button className="px-6 py-2 border border-white/20 rounded-lg hover:bg-white/5 transition">
              Add to Calendar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
