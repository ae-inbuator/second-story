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
  ChevronDown,
  TrendingUp
} from 'lucide-react'
import config from '@/lib/config'
import { LuxuryImage } from '@/components/ui/luxury-image'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

interface RecentRegistration {
  name: string
  registered_at: string
}

export default function HomePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [registrationCount, setRegistrationCount] = useState(0)
  const [targetCount, setTargetCount] = useState(0)
  const [timeUntilEvent, setTimeUntilEvent] = useState({ days: 0, hours: 0, minutes: 0 })
  const [selectedFeature, setSelectedFeature] = useState<number | null>(null)
  const [scrollY, setScrollY] = useState(0)
  const [recentRegistrations, setRecentRegistrations] = useState<RecentRegistration[]>([])
  const [eventDate, setEventDate] = useState<Date | null>(null)

  // Fetch real registration data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch registration count
        const { count, data: guests } = await supabase
          .from('guests')
          .select('*', { count: 'exact' })
          .order('registered_at', { ascending: false })
          .limit(5)
        
        if (count !== null) {
          setTargetCount(count)
          
          // Get recent registrations for social proof
          if (guests && guests.length > 0) {
            setRecentRegistrations(guests.slice(0, 3).map(g => ({
              name: g.name.split(' ')[0], // First name only for privacy
              registered_at: g.registered_at
            })))
          }
        }
        
        // Fetch active event date
        const { data: event } = await supabase
          .from('events')
          .select('*')
          .eq('status', 'upcoming')
          .single()
        
        if (event && event.date) {
          setEventDate(new Date(event.date))
        } else {
          // Default to a future date if no event found
          const futureDate = new Date()
          futureDate.setMonth(futureDate.getMonth() + 1)
          futureDate.setDate(15)
          futureDate.setHours(19, 0, 0, 0)
          setEventDate(futureDate)
        }
        
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching data:', error)
        setIsLoading(false)
      }
    }
    
    fetchData()
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('public:guests')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'guests' },
        (payload) => {
          console.log('New registration:', payload)
          setTargetCount(prev => prev + 1)
          
          // Add to recent registrations
          if (payload.new) {
            const newReg = {
              name: payload.new.name.split(' ')[0],
              registered_at: payload.new.registered_at
            }
            setRecentRegistrations(prev => [newReg, ...prev.slice(0, 2)])
          }
        }
      )
      .subscribe()
    
    // Animate counter to target
    const counterInterval = setInterval(() => {
      setRegistrationCount(prev => {
        if (prev < targetCount) return Math.min(prev + 1, targetCount)
        if (prev > targetCount) return Math.max(prev - 1, targetCount)
        return prev
      })
    }, 50)
    
    // Calculate time until event
    const timer = setInterval(() => {
      if (eventDate) {
        const now = new Date()
        const diff = eventDate.getTime() - now.getTime()
        
        if (diff > 0) {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24))
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
          setTimeUntilEvent({ days, hours, minutes })
        } else {
          setTimeUntilEvent({ days: 0, hours: 0, minutes: 0 })
        }
      }
    }, 1000)
    
    // Parallax scroll effect
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    window.addEventListener('scroll', handleScroll)
    
    return () => {
      subscription.unsubscribe()
      clearInterval(counterInterval)
      clearInterval(timer)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [targetCount, eventDate])

  const features = [
    {
      icon: Heart,
      title: 'Curated Selection',
      description: 'Hand-picked luxury pieces from the world\'s most coveted brands',
      color: 'text-black'
    },
    {
      icon: ShoppingBag,
      title: 'Real-time Wishlist',
      description: 'Tap to add items during the live runway show',
      color: 'text-black'
    },
    {
      icon: Users,
      title: 'Exclusive Access',
      description: 'Limited to 50 guests for an intimate experience',
      color: 'text-black'
    },
    {
      icon: Shield,
      title: 'Authenticated',
      description: 'Every piece verified for authenticity and provenance',
      color: 'text-black'
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

  return (
    <div className="min-h-screen bg-white text-black overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50">
        {/* Clean Background - No Parallax */}
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
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <motion.button
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ y: 0, scale: 0.98 }}
                onClick={() => router.push('/invite')}
                className="btn-luxury px-8 py-4 flex items-center justify-center gap-3"
              >
                <span>Reserve Your Place</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              
              <motion.button
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ y: 0, scale: 0.98 }}
                onClick={() => router.push('/show')}
                className="btn-luxury-ghost px-8 py-4 flex items-center justify-center gap-3"
              >
                <span>Enter Show</span>
                <Sparkles className="w-5 h-5" />
              </motion.button>
            </div>
            
            {/* Live Stats with Progress Bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="space-y-4"
            >
              {/* Progress Bar */}
              <div className="max-w-md mx-auto">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-black" />
                    <span className="text-sm">
                      <span className="text-black font-medium">{registrationCount}</span>
                      <span className="text-gray-600"> of {config.event.capacity} spots taken</span>
                    </span>
                  </div>
                  {registrationCount >= config.event.capacity - 10 && (
                    <span className="text-xs bg-black text-white px-2 py-1 rounded-full animate-pulse">
                      Final Spots
                    </span>
                  )}
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-black to-gray-700"
                    initial={{ width: 0 }}
                    animate={{ width: `${(registrationCount / config.event.capacity) * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1 text-center">
                  {config.event.capacity - registrationCount} spots remaining
                </p>
              </div>
              
              <div className="flex flex-wrap items-center justify-center gap-8 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-black" />
                  <span className="text-gray-600">
                    {timeUntilEvent.days > 0 ? (
                      <>{timeUntilEvent.days}d {timeUntilEvent.hours}h {timeUntilEvent.minutes}m</>
                    ) : timeUntilEvent.hours > 0 || timeUntilEvent.minutes > 0 ? (
                      <>{timeUntilEvent.hours}h {timeUntilEvent.minutes}m</>
                    ) : (
                      <span className="text-black font-medium animate-pulse">Live Now</span>
                    )}
                  </span>
                </div>
                
                {recentRegistrations.length > 0 && (
                  <motion.div 
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-black opacity-60" />
                    <span className="text-gray-700 text-xs tracking-wide">
                      {recentRegistrations[0].name} secured their place
                    </span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Event Info Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
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
                <p className="text-gray-600 text-sm tracking-[0.2em] uppercase mb-4">
                  The Experience
                </p>
                <h2 className="font-playfair text-4xl sm:text-5xl mb-6">
                  An Evening of Curated Luxury
                </h2>
                <p className="text-gray-700 text-lg leading-relaxed">
                  Join us for an exclusive runway show featuring hand-selected pieces from the world's most prestigious fashion houses. Each item tells a story of craftsmanship, provenance, and timeless elegance.
                </p>
              </div>
              
              {/* Event Details */}
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <Calendar className="w-5 h-5 text-black mt-1" />
                  <div>
                    <p className="font-medium">December 12, 2024</p>
                    <p className="text-sm text-gray-600">Thursday Evening</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <Clock className="w-5 h-5 text-black mt-1" />
                  <div>
                    <p className="font-medium">7:00 PM - 10:00 PM</p>
                    <p className="text-sm text-gray-600">Doors open at 6:30 PM</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <MapPin className="w-5 h-5 text-black mt-1" />
                  <div>
                    <p className="font-medium">Private Location</p>
                    <p className="text-sm text-gray-600">Details provided upon registration</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Image */}
            <div className="relative h-[400px] md:h-[500px]">
              <LuxuryImage
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=1200&fit=crop"
                alt="Fashion show"
                fill
                className="object-cover rounded-lg shadow-lg"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-gray-600 text-sm tracking-[0.2em] uppercase mb-4">
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
                  "bg-white border border-gray-200 p-6 rounded-lg transition-all duration-300 cursor-pointer shadow-sm",
                  selectedFeature === index && "border-black shadow-lg transform -translate-y-2"
                )}
              >
                <feature.icon className={cn("w-8 h-8 mb-4", feature.color)} />
                <h3 className="font-medium text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-gray-600 text-sm tracking-[0.2em] uppercase mb-4">
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
                className="bg-white border border-gray-200 p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-black text-black" />
                  ))}
                </div>
                <p className="text-gray-700 italic mb-6">"{testimonial.content}"</p>
                <div>
                  <p className="font-medium">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <Award className="w-12 h-12 text-black mx-auto mb-6" />
          <h2 className="font-playfair text-4xl sm:text-5xl mb-6">
            Join the Next Chapter
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Limited to {config.event.capacity} exclusive guests. Reserve your place today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/invite')}
              className="btn-luxury px-8 py-4"
            >
              Reserve Your Place
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/admin')}
              className="btn-luxury-ghost px-8 py-4"
            >
              Admin Access
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-200 bg-white">
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
              <p className="text-sm text-gray-600">© 2024 All rights reserved</p>
            </div>
            
            <div className="flex gap-8 text-sm text-gray-600">
              <button className="hover:text-black transition-colors">Privacy</button>
              <button className="hover:text-black transition-colors">Terms</button>
              <button className="hover:text-black transition-colors">Contact</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}