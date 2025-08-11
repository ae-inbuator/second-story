'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { 
  ArrowRight, 
  Calendar, 
  MapPin, 
  Users, 
  Sparkles, 
  Heart,
  ShoppingBag,
  Clock,
  Star,
  Award,
  Shield,
  ChevronDown
} from 'lucide-react'
import config from '@/lib/config'
import { LuxuryImage } from '@/components/ui/luxury-image'
import { cn } from '@/lib/utils'

export default function HomePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [registrationCount, setRegistrationCount] = useState(0)
  const [timeUntilEvent, setTimeUntilEvent] = useState({ days: 0, hours: 0, minutes: 0 })
  const [selectedFeature, setSelectedFeature] = useState<number | null>(null)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 1000)
    
    // Animate registration count
    const interval = setInterval(() => {
      setRegistrationCount(prev => {
        if (prev < 38) return prev + 1
        return prev
      })
    }, 50)
    
    // Calculate time until event
    const eventDate = new Date('2024-12-12T19:00:00')
    const timer = setInterval(() => {
      const now = new Date()
      const diff = eventDate.getTime() - now.getTime()
      
      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        setTimeUntilEvent({ days, hours, minutes })
      }
    }, 1000)
    
    // Parallax scroll effect
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    window.addEventListener('scroll', handleScroll)
    
    return () => {
      clearInterval(interval)
      clearInterval(timer)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const features = [
    {
      icon: Heart,
      title: 'Curated Selection',
      description: 'Hand-picked luxury pieces from the world\'s most coveted brands',
      color: 'text-red-500'
    },
    {
      icon: ShoppingBag,
      title: 'Real-time Wishlist',
      description: 'Tap to add items during the live runway show',
      color: 'text-luxury-gold'
    },
    {
      icon: Users,
      title: 'Exclusive Access',
      description: 'Limited to 50 guests for an intimate experience',
      color: 'text-blue-500'
    },
    {
      icon: Shield,
      title: 'Authenticated',
      description: 'Every piece verified for authenticity and provenance',
      color: 'text-green-500'
    }
  ]

  const testimonials = [
    {
      name: 'Isabella R.',
      role: 'Fashion Collector',
      content: 'An extraordinary experience. The curation is impeccable.',
      rating: 5
    },
    {
      name: 'Sofia M.',
      role: 'Style Director',
      content: 'Second Story reimagines luxury resale as theater.',
      rating: 5
    },
    {
      name: 'Ana L.',
      role: 'Art Curator',
      content: 'The stories behind each piece make them truly special.',
      rating: 5
    }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-2 border-luxury-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <Image 
            src="/logo.png" 
            alt="Second Story" 
            width={150} 
            height={45} 
            className="opacity-80"
          />
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Parallax Background */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{ transform: `translateY(${scrollY * 0.5}px)` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black z-10" />
          <LuxuryImage
            src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1920&h=1080&fit=crop"
            alt="Luxury fashion"
            fill
            priority
            className="object-cover"
          />
        </div>
        
        {/* Content */}
        <div className="relative z-20 text-center px-4 sm:px-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-luxury-gold text-sm tracking-[0.3em] uppercase mb-6">
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
            <p className="text-xl sm:text-2xl font-light italic mb-8 text-gray-300">
              Where luxury finds its next chapter
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/invite')}
                className="btn-luxury px-8 py-4 bg-white text-black hover:bg-luxury-gold flex items-center justify-center gap-3"
              >
                <span>Reserve Your Place</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/show')}
                className="btn-luxury-ghost px-8 py-4 text-white border-white hover:bg-white hover:text-black flex items-center justify-center gap-3"
              >
                <span>Enter Show</span>
                <Sparkles className="w-5 h-5" />
              </motion.button>
            </div>
            
            {/* Live Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap items-center justify-center gap-8 text-sm"
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-luxury-gold" />
                <span>
                  <span className="text-luxury-gold font-medium">{registrationCount}</span>
                  <span className="text-gray-400"> of {config.event.capacity} registered</span>
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-luxury-gold" />
                <span className="text-gray-400">
                  {timeUntilEvent.days}d {timeUntilEvent.hours}h {timeUntilEvent.minutes}m
                </span>
              </div>
            </motion.div>
          </motion.div>
          
          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <ChevronDown className="w-6 h-6 text-gray-500 animate-bounce" />
          </motion.div>
        </div>
      </section>

      {/* Event Info Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-12 lg:gap-20"
          >
            {/* Left Content */}
            <div className="space-y-8">
              <div>
                <p className="text-luxury-gold text-sm tracking-[0.2em] uppercase mb-4">
                  The Experience
                </p>
                <h2 className="font-playfair text-4xl sm:text-5xl mb-6">
                  An Evening of Curated Luxury
                </h2>
                <p className="text-gray-300 text-lg leading-relaxed">
                  Join us for an exclusive runway show featuring hand-selected pieces from the world's most prestigious fashion houses. Each item tells a story of craftsmanship, provenance, and timeless elegance.
                </p>
              </div>
              
              {/* Event Details */}
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <Calendar className="w-5 h-5 text-luxury-gold mt-1" />
                  <div>
                    <p className="font-medium">December 12, 2024</p>
                    <p className="text-sm text-gray-400">Thursday Evening</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <Clock className="w-5 h-5 text-luxury-gold mt-1" />
                  <div>
                    <p className="font-medium">7:00 PM - 10:00 PM</p>
                    <p className="text-sm text-gray-400">Doors open at 6:30 PM</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <MapPin className="w-5 h-5 text-luxury-gold mt-1" />
                  <div>
                    <p className="font-medium">Private Location</p>
                    <p className="text-sm text-gray-400">Details provided upon registration</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Image */}
            <div className="relative h-[400px] md:h-[500px]">
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
              <LuxuryImage
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=1200&fit=crop"
                alt="Fashion show"
                fill
                className="object-cover rounded-lg"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-luxury-gold text-sm tracking-[0.2em] uppercase mb-4">
              Why Second Story
            </p>
            <h2 className="font-playfair text-4xl sm:text-5xl">
              Reimagining Luxury Resale
            </h2>
          </motion.div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                onMouseEnter={() => setSelectedFeature(index)}
                onMouseLeave={() => setSelectedFeature(null)}
                className={cn(
                  "bg-black border border-gray-900 p-6 rounded-lg transition-all duration-300 cursor-pointer",
                  selectedFeature === index && "border-luxury-gold transform -translate-y-2"
                )}
              >
                <feature.icon className={cn("w-8 h-8 mb-4", feature.color)} />
                <h3 className="font-medium text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-luxury-gold text-sm tracking-[0.2em] uppercase mb-4">
              Testimonials
            </p>
            <h2 className="font-playfair text-4xl sm:text-5xl">
              What Our Guests Say
            </h2>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-950 border border-gray-900 p-8 rounded-lg"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-luxury-gold text-luxury-gold" />
                  ))}
                </div>
                <p className="text-gray-300 italic mb-6">"{testimonial.content}"</p>
                <div>
                  <p className="font-medium">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-t from-black via-gray-950 to-black">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <Award className="w-12 h-12 text-luxury-gold mx-auto mb-6" />
          <h2 className="font-playfair text-4xl sm:text-5xl mb-6">
            Join the Next Chapter
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Limited to {config.event.capacity} exclusive guests. Reserve your place today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/invite')}
              className="btn-luxury px-8 py-4 bg-luxury-gold text-black hover:bg-white"
            >
              Reserve Your Place
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/admin')}
              className="btn-luxury-ghost px-8 py-4"
            >
              Admin Access
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <Image 
              src="/logo.png" 
              alt="Second Story" 
              width={180} 
              height={54} 
              className="mb-2"
            />
              <p className="text-sm text-gray-500">© 2024 All rights reserved</p>
            </div>
            
            <div className="flex gap-8 text-sm text-gray-400">
              <button className="hover:text-white transition-colors">Privacy</button>
              <button className="hover:text-white transition-colors">Terms</button>
              <button className="hover:text-white transition-colors">Contact</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}