/**
 * Optimistic Wishlist Hook
 * Provides instant feedback with rollback on failure
 */

import { useState, useCallback, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import config from '@/lib/config'
import toast from 'react-hot-toast'

interface WishlistItem {
  id: string
  productId: string
  lookId: string
  wishType: 'individual' | 'full_look'
  position: number
  addedAt: Date
  product?: any
}

interface UseOptimisticWishlistReturn {
  wishlist: WishlistItem[]
  isLoading: boolean
  isSyncing: boolean
  addToWishlist: (productId: string, lookId: string, type: 'individual' | 'full_look') => Promise<void>
  removeFromWishlist: (productId: string) => Promise<void>
  getPosition: (productId: string) => number | null
  isInWishlist: (productId: string) => boolean
  clearWishlist: () => void
  syncWithServer: () => Promise<void>
}

export function useOptimisticWishlist(guestId: string | null): UseOptimisticWishlistReturn {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [pendingOperations, setPendingOperations] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [currentEventId, setCurrentEventId] = useState<string | null>(null)

  // Save to localStorage - MOVED BEFORE other functions
  const saveToLocalStorage = (items: WishlistItem[]) => {
    try {
      localStorage.setItem(config.storage.wishlist, JSON.stringify(items))
      localStorage.setItem(config.storage.lastSync, new Date().toISOString())
    } catch (error) {
      console.error('Failed to save to localStorage:', error)
    }
  }

  // Load from localStorage - MOVED BEFORE useEffect
  const loadLocalWishlist = () => {
    try {
      const stored = localStorage.getItem(config.storage.wishlist)
      if (stored) {
        const items = JSON.parse(stored)
        setWishlist(items)
      }
    } catch (error) {
      console.error('Failed to load local wishlist:', error)
    }
    setIsLoading(false)
  }

  // Get current event ID - MOVED BEFORE useEffect to avoid circular dependency
  const getCurrentEventId = useCallback(async (): Promise<string | null> => {
    try {
      // Try to get from cache first
      if (currentEventId) return currentEventId

      const { data, error } = await supabase
        .from('events')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error) {
        console.warn('Could not fetch current event:', error)
        return null
      }

      setCurrentEventId(data.id)
      return data.id
    } catch (error) {
      console.error('Error getting current event ID:', error)
      return null
    }
  }, [currentEventId])

  // Load wishlist from server - MOVED BEFORE useEffect  
  const loadWishlist = async () => {
    if (!guestId) return
    
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select(`
          *,
          products(*)
        `)
        .eq('guest_id', guestId)
        .order('added_at', { ascending: false })

      if (error) throw error

      const items: WishlistItem[] = (data || []).map(item => ({
        id: item.id,
        productId: item.product_id,
        lookId: item.look_id || '',
        wishType: item.wish_type || 'individual',
        position: item.position || 1,
        addedAt: new Date(item.added_at || Date.now()),
        product: item.products || null,
      }))

      setWishlist(items)
      // Save to localStorage for offline access
      saveToLocalStorage(items)
    } catch (error) {
      console.error('Failed to load wishlist from server:', error)
      console.error('Error details:', {
        guestId,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      })
      // Fall back to local storage
      loadLocalWishlist()
      toast.error('Loading from offline cache')
    } finally {
      setIsLoading(false)
    }
  }

  // Load wishlist from server on mount
  useEffect(() => {
    const init = async () => {
      // Initialize event ID first
      await getCurrentEventId()
      
      if (guestId) {
        await loadWishlist()
      } else {
        // Load from localStorage if no guestId
        loadLocalWishlist()
      }
    }
    
    init()
  }, [guestId, getCurrentEventId])

  // Avoid automatic reload that causes rollback issues
  const shouldReloadFromServer = useCallback(() => {
    // Only reload if we have pending operations that might have failed
    return pendingOperations.size === 0
  }, [pendingOperations])

  // Add to wishlist with optimistic update
  const addToWishlist = useCallback(async (
    productId: string,
    lookId: string,
    type: 'individual' | 'full_look'
  ) => {
    // Check if already in wishlist
    if (wishlist.some(item => item.productId === productId)) {
      toast.error('Already in your wishlist')
      return
    }

    // Generate temporary ID
    const tempId = `temp_${Date.now()}_${productId}`
    const operationId = `add_${productId}`

    // Optimistic update
    const newItem: WishlistItem = {
      id: tempId,
      productId,
      lookId,
      wishType: type,
      position: wishlist.filter(item => item.productId === productId).length + 1,
      addedAt: new Date(),
    }

    setWishlist(prev => [newItem, ...prev])
    setPendingOperations(prev => new Set(prev).add(operationId))
    
    // Save to localStorage
    const updatedWishlist = [newItem, ...wishlist]
    saveToLocalStorage(updatedWishlist)

    // Show optimistic feedback
    toast.success('Added to wishlist', {
      icon: '✨',
      duration: 2000,
    })

    try {
      if (guestId) {
        // Get current position from server
        const { count } = await supabase
          .from('wishlists')
          .select('*', { count: 'exact', head: true })
          .eq('product_id', productId)

        // Get current event ID
        const eventId = await getCurrentEventId()
        
        if (!eventId) {
          throw new Error('No active event found. Please contact support.')
        }
        
        // Add to server with proper data structure
        const { data, error } = await supabase
          .from('wishlists')
          .insert([{
            guest_id: guestId,
            product_id: productId,
            look_id: lookId,
            wish_type: type,
            position: (count || 0) + 1,
            event_id: eventId,
          }])
          .select(`
            *,
            products(*)
          `)
          .single()

        if (error) throw error

        // Update with real data - ensure we don't lose the optimistic item
        setWishlist(prev => {
          const tempItem = prev.find(item => item.id === tempId)
          if (!tempItem) {
            // Optimistic item was removed, re-add it with server data
            const serverItem: WishlistItem = {
              id: data.id,
              productId,
              lookId,
              wishType: type,
              position: data.position,
              addedAt: new Date(data.added_at),
            }
            return [serverItem, ...prev]
          }
          
          // Update existing optimistic item with server data
          return prev.map(item => 
            item.id === tempId 
              ? { 
                  ...item, 
                  id: data.id, 
                  position: data.position,
                  addedAt: new Date(data.added_at),
                  product: data.products || item.product
                }
              : item
          )
        })

        // Show position feedback
        if (data.position > 1) {
          toast.success(`You're #${data.position} in queue`, {
            duration: 3000,
          })
        }
      }
    } catch (error: any) {
      console.error('Failed to add to wishlist:', error)
      console.error('Add error details:', {
        productId,
        lookId,
        guestId,
        tempId,
        errorCode: error?.code,
        errorMessage: error?.message,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Check if it's a database validation error or server error
      const isValidationError = error?.code === '22P02' || // Invalid UUID format
                               error?.code?.startsWith('23') || // Constraint violations
                               error?.code === '42P01' || // Undefined table
                               error?.message?.includes('invalid input syntax')
      
      // Check if it's a network/connection error
      const isNetworkError = error?.message?.includes('network') ||
                             error?.message?.includes('connection') ||
                             error?.message?.includes('timeout') ||
                             error?.message?.includes('fetch')
      
      if (isValidationError) {
        // Database/validation errors → rollback with specific message
        setWishlist(prev => prev.filter(item => item.id !== tempId))
        toast.error('Failed to add to wishlist. Please try again.')
      } else if (isNetworkError) {
        // Network errors → keep optimistic item
        toast.error('Added to local wishlist. Will sync when online.', {
          duration: 5000
        })
      } else {
        // Unknown errors → rollback to be safe
        setWishlist(prev => prev.filter(item => item.id !== tempId))
        toast.error('Something went wrong. Please try again.')
      }
    } finally {
      setPendingOperations(prev => {
        const next = new Set(prev)
        next.delete(operationId)
        return next
      })
    }
  }, [wishlist, guestId])

  // Remove from wishlist with optimistic update
  const removeFromWishlist = useCallback(async (productId: string) => {
    const operationId = `remove_${productId}`
    const itemToRemove = wishlist.find(item => item.productId === productId)
    
    if (!itemToRemove) return

    // Optimistic update
    setWishlist(prev => prev.filter(item => item.productId !== productId))
    setPendingOperations(prev => new Set(prev).add(operationId))
    
    // Save to localStorage
    const updatedList = wishlist.filter(item => item.productId !== productId)
    saveToLocalStorage(updatedList)

    toast.success('Removed from wishlist', {
      duration: 2000,
    })

    try {
      if (guestId && itemToRemove.id && !itemToRemove.id.startsWith('temp_')) {
        const { error } = await supabase
          .from('wishlists')
          .delete()
          .eq('id', itemToRemove.id)

        if (error) throw error
      }
    } catch (error) {
      // Rollback on failure
      console.error('Failed to remove from wishlist:', error)
      console.error('Remove error details:', {
        productId,
        itemId: itemToRemove.id,
        guestId,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      setWishlist(prev => [...prev, itemToRemove])
      toast.error('Failed to remove from wishlist. Please try again.')
    } finally {
      setPendingOperations(prev => {
        const next = new Set(prev)
        next.delete(operationId)
        return next
      })
    }
  }, [wishlist, guestId])

  // Get position in queue
  const getPosition = useCallback((productId: string): number | null => {
    const item = wishlist.find(item => item.productId === productId)
    return item?.position || null
  }, [wishlist])

  // Check if item is in wishlist
  const isInWishlist = useCallback((productId: string): boolean => {
    return wishlist.some(item => item.productId === productId)
  }, [wishlist])

  // Clear wishlist
  const clearWishlist = useCallback(() => {
    setWishlist([])
    localStorage.removeItem(config.storage.wishlist)
  }, [])

  // Sync with server
  const syncWithServer = useCallback(async () => {
    if (!guestId) return
    
    setIsSyncing(true)
    try {
      await loadWishlist()
      toast.success('Wishlist synced')
    } catch (error) {
      console.error('Failed to sync wishlist:', error)
      toast.error('Failed to sync wishlist')
    } finally {
      setIsSyncing(false)
    }
  }, [guestId])

  return {
    wishlist,
    isLoading,
    isSyncing: pendingOperations.size > 0 || isSyncing,
    addToWishlist,
    removeFromWishlist,
    getPosition,
    isInWishlist,
    clearWishlist,
    syncWithServer,
  }
}

export default useOptimisticWishlist