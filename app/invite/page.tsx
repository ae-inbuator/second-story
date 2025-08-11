'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'
import Image from 'next/image'
import Confetti from 'react-confetti'
import { Loader2, CheckCircle, Sparkles } from 'lucide-react'

export default function InvitePage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isRegistered, setIsRegistered] = useState(false)
  const [spotsLeft, setSpotsLeft] = useState(50)
  const [isLoading, setIsLoading] = useState(false)
  const [spotNumber, setSpotNumber] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    fetchEventData()
    const interval = setInterval(fetchEventData, 10000)
    
    // Set window size for confetti
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  async function fetchEventData() {
    const { count } = await supabase
      .from('guests')
      .select('*', { count: 'exact', head: true })
    
    if (count !== null) {
      setSpotsLeft(50 - count)
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // Call the API endpoint instead of direct Supabase insert
      const response = await fetch('/api/invite/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        if (data.error === 'Event full') {
          toast.error('Event is now full!', {
            style: {
              background: '#000',
              color: '#fff',
              fontSize: '14px',
              letterSpacing: '0.05em',
            },
            icon: '🚫'
          })
        } else {
          toast.error('This email is already registered', {
            style: {
              background: '#000',
              color: '#fff',
              fontSize: '14px',
              letterSpacing: '0.05em',
            },
          })
        }
        setIsLoading(false)
        return
      }
      
      // Success!
      setSpotNumber(data.spotNumber)
      setIsRegistered(true)
      setShowConfetti(true)
      
      // Stop confetti after 5 seconds
      setTimeout(() => setShowConfetti(false), 5000)
      
      // Haptic feedback if available
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100])
      }
      
      fetchEventData()
    } catch (error) {
      toast.error('Something went wrong. Please try again.', {
        style: {
          background: '#000',
          color: '#fff',
          fontSize: '14px',
          letterSpacing: '0.05em',
        },
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <Toaster position="top-center" />
      
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 1px, transparent 15px)`,
        }} />
      </div>

      <div className="relative min-h-screen flex items-center justify-center px-6 py-20">
        <AnimatePresence mode="wait">
          {!isRegistered ? (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-sm sm:max-w-md"
            >
              {/* Header */}
              <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.6 }}
                className="text-center mb-16"
              >
                <Image 
                  src="/logo.png" 
                  alt="Second Story" 
                  width={320} 
                  height={96} 
                  className="mx-auto mb-4"
                  priority
                />
                <div className="flex items-center justify-center gap-4 text-xs tracking-widest uppercase">
                  <span>Chapter I</span>
                  <span className="text-black">•</span>
                  <span>Winter Luxe</span>
                </div>
              </motion.div>

              {/* Form */}
              <motion.form
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                onSubmit={handleRegister}
                className="space-y-6"
              >
                <div>
                  <input
                    type="text"
                    placeholder="YOUR NAME"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={isLoading}
                    className="input-luxury w-full text-center tracking-widest placeholder:text-gray-400 uppercase"
                  />
                </div>
                
                <div>
                  <input
                    type="email"
                    placeholder="YOUR EMAIL"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="input-luxury w-full text-center tracking-widest placeholder:text-gray-400"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading || spotsLeft === 0}
                  className="btn-luxury w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>PROCESSING...</span>
                    </>
                  ) : spotsLeft === 0 ? (
                    'EVENT FULL'
                  ) : (
                    'RESERVE YOUR PLACE'
                  )}
                </button>
              </motion.form>

              {/* Event Details */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="mt-16 text-center space-y-6"
              >
                <div className="text-xs tracking-widest uppercase text-gray-600">
                  <p>December 12, 2024</p>
                  <p>7:00 PM</p>
                </div>
                
                <div className="relative">
                  <div className="absolute inset-x-0 top-1/2 h-px bg-gray-200" />
                  <div className="relative bg-white px-4 mx-auto w-fit">
                    <p className="text-xs tracking-widest uppercase">
                      {spotsLeft > 0 ? (
                        <>
                          {spotsLeft <= 10 && (
                            <span className="inline-block px-2 py-0.5 bg-black text-white rounded-full text-[10px] mr-2 animate-pulse">
                              FINAL SPOTS
                            </span>
                          )}
                          <span className="text-black font-medium">{spotsLeft}</span>
                          <span className="text-gray-600"> of 50 places remaining</span>
                        </>
                      ) : (
                        <span className="text-black font-medium">FULLY BOOKED</span>
                      )}
                    </p>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="mt-4 max-w-xs mx-auto">
                    <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-black"
                        initial={{ width: 0 }}
                        animate={{ width: `${((50 - spotsLeft) / 50) * 100}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-sm sm:max-w-md text-center px-4"
            >
              {/* Confetti Effect */}
              {showConfetti && (
                <Confetti
                  width={windowSize.width}
                  height={windowSize.height}
                  numberOfPieces={200}
                  recycle={false}
                  colors={['#000000', '#666666', '#999999', '#CCCCCC']}
                />
              )}
              
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-20 h-20 mx-auto mb-8 flex items-center justify-center"
              >
                <div className="w-full h-full bg-black text-white flex items-center justify-center relative">
                  <CheckCircle className="w-10 h-10" />
                  <motion.div
                    className="absolute -top-2 -right-2"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.5, type: "spring" }}
                  >
                    <Sparkles className="w-6 h-6 text-gray-600" />
                  </motion.div>
                </div>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="font-playfair text-4xl mb-4">Welcome, {name.split(' ')[0]}</h2>
                <p className="text-gray-600 tracking-wide mb-4">Your place has been reserved</p>
                
                {/* Spot Number Badge */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                  className="inline-block mb-8"
                >
                  <div className="bg-black text-white px-6 py-3 rounded-full">
                    <p className="text-xs tracking-widest uppercase mb-1">Your Spot</p>
                    <p className="font-playfair text-2xl">#{spotNumber}</p>
                  </div>
                </motion.div>
                
                <div className="space-y-4 py-8 border-y border-gray-200">
                  <p className="text-sm tracking-widest uppercase">Chapter I • Winter Luxe</p>
                  <p className="font-playfair text-2xl">December 12, 2024</p>
                  <p className="text-sm tracking-widest uppercase text-gray-600">7:00 PM</p>
                </div>
                
                <p className="mt-8 text-xs tracking-widest uppercase text-gray-500">
                  Confirmation email sent to {email}
                </p>
                
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  onClick={() => window.location.href = '/'}
                  className="mt-8 btn-luxury-ghost px-6 py-2 text-sm"
                >
                  Return Home
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="fixed bottom-8 left-0 right-0 text-center"
      >
        <p className="text-xs tracking-widest uppercase text-gray-400">
          An Exclusive Luxury Archive Experience
        </p>
      </motion.div>
    </div>
  )
}