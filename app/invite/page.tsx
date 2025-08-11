'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'
import Image from 'next/image'

export default function InvitePage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isRegistered, setIsRegistered] = useState(false)
  const [spotsLeft, setSpotsLeft] = useState(50)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchEventData()
    const interval = setInterval(fetchEventData, 10000)
    return () => clearInterval(interval)
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
    
    const { error } = await supabase
      .from('guests')
      .insert([{ name, email }])
    
    if (error) {
      if (error.code === '23505') {
        toast.error('This email is already registered', {
          style: {
            background: '#000',
            color: '#fff',
            fontSize: '14px',
            letterSpacing: '0.05em',
          },
        })
      } else {
        toast.error('Something went wrong. Please try again.')
      }
      setIsLoading(false)
      return
    }
    
    setIsRegistered(true)
    setIsLoading(false)
    fetchEventData()
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
                  <span className="text-luxury-gold">•</span>
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
                    className="luxury-input w-full text-center tracking-widest placeholder:text-gray-400 uppercase"
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
                    className="luxury-input w-full text-center tracking-widest placeholder:text-gray-400"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading || spotsLeft === 0}
                  className="luxury-button w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'PROCESSING...' : 'RESERVE YOUR PLACE'}
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
                          <span className="text-luxury-gold font-medium">{spotsLeft}</span>
                          <span className="text-gray-600"> of 50 places remaining</span>
                        </>
                      ) : (
                        <span className="text-red-600">FULLY BOOKED</span>
                      )}
                    </p>
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
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-20 h-20 mx-auto mb-8 flex items-center justify-center"
              >
                <div className="w-full h-full border-2 border-luxury-gold flex items-center justify-center">
                  <svg className="w-10 h-10 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="font-playfair text-4xl mb-4">Welcome, {name.split(' ')[0]}</h2>
                <p className="text-gray-600 tracking-wide mb-8">Your place has been reserved</p>
                
                <div className="space-y-4 py-8 border-y border-gray-200">
                  <p className="text-sm tracking-widest uppercase">Chapter I • Winter Luxe</p>
                  <p className="font-playfair text-2xl">December 12, 2024</p>
                  <p className="text-sm tracking-widest uppercase text-gray-600">7:00 PM</p>
                </div>
                
                <p className="mt-8 text-xs tracking-widest uppercase text-gray-500">
                  Location details will be sent via email
                </p>
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