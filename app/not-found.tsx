'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { 
  ArrowLeft, 
  Home, 
  Search, 
  Sparkles,
  ChevronDown
} from 'lucide-react'
import { LuxuryImage } from '@/components/ui/luxury-image'
import { cn } from '@/lib/utils'

export default function NotFound() {
  const router = useRouter()
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    // Parallax scroll effect
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    window.addEventListener('scroll', handleScroll)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Parallax Background */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{ transform: `translateY(${scrollY * 0.5}px)` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black z-10" />
        <LuxuryImage
          src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1920&h=1080&fit=crop"
          alt="Luxury fashion background"
          fill
          priority
          className="object-cover"
        />
      </div>
      
      {/* Content */}
      <div className="relative z-20 min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl mx-auto"
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="mb-8"
          >
            <Image 
              src="/logo.png" 
              alt="Second Story" 
              width={240} 
              height={72} 
              className="mx-auto opacity-80"
              priority
            />
          </motion.div>
          
          {/* 404 Display */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-8"
          >
            <h1 className="font-playfair text-8xl sm:text-9xl lg:text-[12rem] font-light text-luxury-gold leading-none">
              404
            </h1>
          </motion.div>
          
          {/* Error Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mb-12"
          >
            <p className="text-luxury-gold text-sm tracking-[0.3em] uppercase mb-4">
              Page Not Found
            </p>
            <h2 className="font-playfair text-3xl sm:text-4xl lg:text-5xl mb-6">
              This Story Hasn't Been Written Yet
            </h2>
            <p className="text-xl text-gray-300 font-light leading-relaxed max-w-lg mx-auto">
              The page you're looking for doesn't exist. Perhaps it was moved, or you've discovered an uncharted chapter of our collection.
            </p>
          </motion.div>
          
          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.back()}
              className="btn-luxury-ghost px-6 py-3 text-white border-white hover:bg-white hover:text-black flex items-center justify-center gap-3"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Go Back</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/')}
              className="btn-luxury px-6 py-3 bg-luxury-gold text-black hover:bg-white flex items-center justify-center gap-3"
            >
              <Home className="w-5 h-5" />
              <span>Return Home</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/show')}
              className="btn-luxury-ghost px-6 py-3 text-luxury-gold border-luxury-gold hover:bg-luxury-gold hover:text-black flex items-center justify-center gap-3"
            >
              <Sparkles className="w-5 h-5" />
              <span>Enter Show</span>
            </motion.button>
          </motion.div>
          
          {/* Suggested Navigation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="text-center"
          >
            <p className="text-sm text-gray-500 mb-4">Or explore these pages:</p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <button 
                onClick={() => router.push('/invite')}
                className="text-gray-400 hover:text-luxury-gold transition-colors duration-200"
              >
                Reserve Your Place
              </button>
              <span className="text-gray-700">•</span>
              <button 
                onClick={() => router.push('/admin')}
                className="text-gray-400 hover:text-luxury-gold transition-colors duration-200"
              >
                Admin Access
              </button>
            </div>
          </motion.div>
        </motion.div>
        
        {/* Decorative Element */}
        <motion.div
          initial={{ opacity: 0, rotate: -180 }}
          animate={{ opacity: 0.3, rotate: 0 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <ChevronDown className="w-6 h-6 text-gray-600 animate-bounce" />
        </motion.div>
      </div>
      
      {/* Bottom Decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent z-10" />
      
      {/* Floating Elements */}
      <motion.div
        animate={{ 
          y: [0, -20, 0],
          opacity: [0.1, 0.3, 0.1]
        }}
        transition={{ 
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-1/4 left-1/4 w-2 h-2 bg-luxury-gold rounded-full"
      />
      
      <motion.div
        animate={{ 
          y: [0, 20, 0],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{ 
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
        className="absolute top-3/4 right-1/3 w-1 h-1 bg-white rounded-full"
      />
      
      <motion.div
        animate={{ 
          y: [0, -15, 0],
          x: [0, 10, 0],
          opacity: [0.05, 0.2, 0.05]
        }}
        transition={{ 
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4
        }}
        className="absolute top-1/2 right-1/4 w-1.5 h-1.5 bg-luxury-gold/50 rounded-full"
      />
    </div>
  )
}