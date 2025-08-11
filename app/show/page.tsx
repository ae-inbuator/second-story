'use client'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Users, ChevronLeft, ChevronRight, Sparkles, ShoppingBag, Clock } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import Image from 'next/image'
import { useWebSocket } from '@/hooks/useWebSocket'
import { useOptimisticWishlist } from '@/hooks/useOptimisticWishlist'
import { LookSkeleton } from '@/components/ui/skeleton'
import { LuxuryImage } from '@/components/ui/luxury-image'
import config from '@/lib/config'

export default function ShowPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [guestName, setGuestName] = useState('')
  const [guestId, setGuestId] = useState('')
  const [currentLook, setCurrentLook] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [wishCounts, setWishCounts] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [showWishlist, setShowWishlist] = useState(false)
  
  // Use enhanced hooks
  const { socket, isConnected, isReconnecting, emit, on, off } = useWebSocket()
  const { 
    wishlist, 
    addToWishlist, 
    removeFromWishlist, 
    isInWishlist, 
    getPosition,
    isSyncing 
  } = useOptimisticWishlist(guestId)

  // Initialize page
  useEffect(() => {
    const init = async () => {
      setIsPageLoading(true)
      // Check if already logged in from localStorage
      const storedGuest = localStorage.getItem(config.storage.guestId)
      if (storedGuest) {
        const guest = JSON.parse(storedGuest)
        setGuestName(guest.name)
        setGuestId(guest.id)
        setIsLoggedIn(true)
        await fetchCurrentLook()
      }
      setIsPageLoading(false)
    }
    init()
  }, [])

  // Socket event listeners
  useEffect(() => {
    if (!socket) return

    const handleLookChanged = () => {
      fetchCurrentLook()
      toast('New look on runway!', { icon: '✨', duration: 3000 })
    }

    const handleWishlistUpdated = ({ productId, count }: any) => {
      setWishCounts(prev => ({ ...prev, [productId]: count }))
    }

    const handleAnnouncement = ({ message }: any) => {
      toast(message, { 
        duration: 10000,
        style: {
          background: 'var(--color-luxury-gold)',
          color: 'black',
        }
      })
    }

    on('look:changed', handleLookChanged)
    on('wishlist:updated', handleWishlistUpdated)
    on('announcement', handleAnnouncement)

    return () => {
      off('look:changed', handleLookChanged)
      off('wishlist:updated', handleWishlistUpdated)
      off('announcement', handleAnnouncement)
    }
  }, [socket, on, off])

  // Handle login
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const { data } = await supabase
        .from('guests')
        .select('*')
        .ilike('name', guestName.trim())
        .single()
      
      if (data) {
        setGuestId(data.id)
        setIsLoggedIn(true)
        
        // Save to localStorage
        localStorage.setItem(config.storage.guestId, JSON.stringify({
          id: data.id,
          name: data.name,
          email: data.email
        }))
        
        // Update check-in
        await supabase
          .from('guests')
          .update({ checked_in_at: new Date().toISOString() })
          .eq('id', data.id)
        
        // Join socket room
        emit('guest:join', { guestId: data.id })
        
        await fetchCurrentLook()
        
        toast.success(`Welcome back, ${data.name.split(' ')[0]}!`, {
          icon: '👋',
          duration: 3000
        })
      } else {
        toast.error('Name not found. Please check your registration.')
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch current look
  async function fetchCurrentLook() {
    try {
      const { data: look } = await supabase
        .from('looks')
        .select(`
          *,
          look_products!inner(
            product_id,
            display_order,
            products(*)
          )
        `)
        .eq('active', true)
        .single()
      
      if (look) {
        setCurrentLook(look)
        const prods = look.look_products
          .sort((a: any, b: any) => a.display_order - b.display_order)
          .map((lp: any) => lp.products)
        setProducts(prods)
        
        // Fetch wish counts
        const counts: Record<string, number> = {}
        for (const prod of prods) {
          const { count } = await supabase
            .from('wishlists')
            .select('*', { count: 'exact', head: true })
            .eq('product_id', prod.id)
          counts[prod.id] = count || 0
        }
        setWishCounts(counts)
      }
    } catch (error) {
      console.error('Failed to fetch look:', error)
    }
  }

  // Add item to wishlist
  const handleAddToWishlist = useCallback(async (productId: string, type: 'individual' | 'full_look' = 'individual') => {
    if (!guestId) {
      toast.error('Please login first')
      return
    }
    
    await addToWishlist(productId, currentLook?.id || '', type)
    
    // Emit to socket for real-time updates
    emit('wishlist:add', { productId })
    
    // Haptic feedback on mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(100)
    }
  }, [guestId, currentLook, addToWishlist, emit])

  // Add full look
  const handleAddFullLook = useCallback(async () => {
    if (!products.length) return
    
    toast.promise(
      Promise.all(products.map(p => handleAddToWishlist(p.id, 'full_look'))),
      {
        loading: 'Adding full look...',
        success: 'Full look added to wishlist!',
        error: 'Failed to add some items'
      }
    )
  }, [products, handleAddToWishlist])

  // Loading state
  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="pt-20">
          <LookSkeleton />
        </div>
      </div>
    )
  }

  // Login screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 sm:px-6">
        <Toaster position="top-center" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-sm sm:max-w-md"
        >
          <div className="text-center mb-12 sm:mb-16">
            <Image 
              src="/logo.png" 
              alt="Second Story" 
              width={280} 
              height={84} 
              className="mx-auto mb-4"
              priority
            />
            <p className="text-xs tracking-widest uppercase text-gray-400">
              Chapter I • Live Experience
            </p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <input
              type="text"
              placeholder="ENTER YOUR NAME"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              required
              disabled={isLoading}
              className="input-luxury bg-transparent border-gray-800 text-white placeholder:text-gray-600 focus:border-white"
              autoComplete="name"
              autoFocus
            />
            
            <button
              type="submit"
              disabled={isLoading}
              className="btn-luxury w-full bg-white text-black hover:bg-luxury-gold"
            >
              {isLoading ? 'ENTERING...' : 'ENTER SHOW'}
            </button>
          </form>
          
          {/* Connection status */}
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              {isReconnecting ? (
                <>
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                  <span>Reconnecting...</span>
                </>
              ) : isConnected ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>Connected</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span>Offline</span>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  // Main show interface
  return (
    <div className="min-h-screen bg-black text-white">
      <Toaster position="top-center" />
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-xl border-b border-gray-900 safe-top">
        <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
          <Image 
            src="/logo.png" 
            alt="Second Story" 
            width={140} 
            height={42} 
          />
          <div className="flex items-center gap-4">
            {/* Wishlist count */}
            <button
              onClick={() => setShowWishlist(!showWishlist)}
              className="relative p-2"
              aria-label="View wishlist"
            >
              <ShoppingBag className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-luxury-gold text-black text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                  {wishlist.length}
                </span>
              )}
            </button>
            
            {/* Live indicator */}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-luxury-gold rounded-full animate-pulse" />
              <span className="text-xs tracking-widest uppercase">Live</span>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-20">
        <AnimatePresence mode="wait">
          {currentLook ? (
            <motion.div
              key={currentLook.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Hero Section */}
              <div className="relative h-[50vh] sm:h-[60vh] md:h-[70vh] bg-gray-900">
                {currentLook.hero_image ? (
                  <LuxuryImage
                    src={currentLook.hero_image}
                    alt={currentLook.name}
                    fill
                    priority
                    objectFit="cover"
                    className="w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-b from-gray-900 to-black" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <p className="text-xs tracking-widest uppercase text-luxury-gold mb-2">
                      Look {currentLook.look_number}
                    </p>
                    <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl mb-4">{currentLook.name}</h2>
                    
                    {/* Social proof */}
                    {config.features.socialProof && Object.values(wishCounts).reduce((a, b) => a + b, 0) > 0 && (
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Users className="w-4 h-4" />
                        <span>{Object.values(wishCounts).reduce((a, b) => a + b, 0)} guests interested</span>
                      </div>
                    )}
                  </motion.div>
                </div>
              </div>

              {/* Actions */}
              <div className="px-4 sm:px-6 lg:px-8 py-6">
                <motion.button
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  onClick={handleAddFullLook}
                  disabled={isSyncing}
                  className="btn-luxury w-full bg-luxury-gold text-black hover:bg-white flex items-center justify-center gap-3"
                >
                  <Heart className="w-5 h-5" />
                  Request Full Look
                  {isSyncing && <Clock className="w-4 h-4 animate-spin" />}
                </motion.button>
              </div>

              {/* Products Grid */}
              <div className="px-4 sm:px-6 lg:px-8 pb-12">
                <div className="border-t border-gray-900 pt-8">
                  <h3 className="text-xs tracking-widest uppercase text-gray-400 mb-6 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Individual Pieces
                  </h3>
                  
                  <div className="grid gap-px bg-gray-900">
                    {products.map((product, index) => {
                      const inWishlist = isInWishlist(product.id)
                      const position = getPosition(product.id)
                      
                      return (
                        <motion.div
                          key={product.id}
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.4 + index * 0.1 }}
                          className="group bg-black p-4 sm:p-6 hover:bg-gray-950 transition-all duration-300"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex-1">
                              <h4 className="font-playfair text-lg sm:text-xl mb-1">{product.brand}</h4>
                              <p className="text-sm text-gray-400 mb-2">{product.name}</p>
                              <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs tracking-widest uppercase">
                                <span className="text-white">${product.price?.toLocaleString()}</span>
                                <span className="text-gray-600">Size {product.size}</span>
                                {wishCounts[product.id] > 0 && (
                                  <span className="text-luxury-gold">
                                    {wishCounts[product.id]} interested
                                  </span>
                                )}
                                {position && (
                                  <span className="text-green-500">
                                    #{position} in queue
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <button
                              onClick={() => inWishlist ? removeFromWishlist(product.id) : handleAddToWishlist(product.id)}
                              disabled={isSyncing}
                              className={`
                                flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 border transition-all duration-300
                                ${inWishlist 
                                  ? 'border-luxury-gold bg-luxury-gold/10 text-luxury-gold' 
                                  : 'border-gray-800 hover:border-luxury-gold hover:text-luxury-gold'
                                }
                                disabled:opacity-50 disabled:cursor-not-allowed
                              `}
                              aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                            >
                              <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${inWishlist ? 'fill-current' : ''}`} />
                              <span className="text-xs sm:text-sm font-light tracking-wider uppercase">
                                {inWishlist ? (
                                  position ? (
                                    <>
                                      <span className="sm:hidden">#{position}</span>
                                      <span className="hidden sm:inline">Position #{position}</span>
                                    </>
                                  ) : (
                                    <>
                                      <span className="sm:hidden">Added</span>
                                      <span className="hidden sm:inline">In Wishlist</span>
                                    </>
                                  )
                                ) : (
                                  <>
                                    <span className="sm:hidden">Wish</span>
                                    <span className="hidden sm:inline">Add to Wishlist</span>
                                  </>
                                )}
                              </span>
                            </button>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="min-h-[80vh] flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 border-2 border-luxury-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <h2 className="font-playfair text-2xl sm:text-3xl mb-4">Preparing Next Look</h2>
                <p className="text-xs tracking-widest uppercase text-gray-400">
                  Please wait
                </p>
              </div>
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* Wishlist Drawer */}
      <AnimatePresence>
        {showWishlist && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40"
              onClick={() => setShowWishlist(false)}
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30 }}
              className="fixed right-0 top-0 h-full w-full sm:w-96 bg-black border-l border-gray-900 z-50 overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="font-playfair text-2xl">Your Wishlist</h3>
                  <button
                    onClick={() => setShowWishlist(false)}
                    className="p-2 hover:bg-gray-900 rounded"
                    aria-label="Close wishlist"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
                
                {wishlist.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                    <p className="text-gray-400">Your wishlist is empty</p>
                    <p className="text-sm text-gray-600 mt-2">Add items from the runway</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {wishlist.map((item) => (
                      <div key={item.id} className="border border-gray-900 p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{item.product?.brand}</h4>
                            <p className="text-sm text-gray-400">{item.product?.name}</p>
                            <p className="text-xs text-luxury-gold mt-1">
                              Position #{item.position}
                            </p>
                          </div>
                          <button
                            onClick={() => removeFromWishlist(item.productId)}
                            className="text-gray-500 hover:text-white"
                            aria-label="Remove from wishlist"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}