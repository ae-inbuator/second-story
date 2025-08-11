'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  Search,
  Eye,
  Sparkles,
  Grid,
  ArrowLeft,
  ShoppingBag
} from 'lucide-react'
import toast from 'react-hot-toast'
import { LookCreator } from './look-creator'
import { cn } from '@/lib/utils'

interface Product {
  id: string
  name: string
  brand: string
  price: number
  size: string
  condition: string
  images: string[]
}

interface Look {
  id: string
  look_number: number
  name: string
  hero_image: string | null
  active: boolean
  event_id: string
  created_at: string
  look_products: Array<{
    display_order: number
    products: Product
  }>
}

type ViewMode = 'list' | 'create' | 'edit'

export function LookManager() {
  const [looks, setLooks] = useState<Look[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [editingLook, setEditingLook] = useState<Look | null>(null)

  useEffect(() => {
    fetchLooks()
  }, [])

  async function fetchLooks() {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('looks')
        .select(`
          id,
          look_number,
          name,
          hero_image,
          active,
          event_id,
          created_at,
          look_products!inner(
            display_order,
            products(id, name, brand, price, size, condition, images)
          )
        `)
        .order('look_number')

      if (error) throw error
      
      setLooks(data || [])
    } catch (error) {
      console.error('Failed to fetch looks:', error)
      toast.error('Failed to load looks')
    } finally {
      setIsLoading(false)
    }
  }

  async function deleteLook(lookId: string) {
    if (!confirm('Are you sure you want to delete this look? This action cannot be undone.')) {
      return
    }

    try {
      // First delete look_products relationships
      const { error: relationError } = await supabase
        .from('look_products')
        .delete()
        .eq('look_id', lookId)

      if (relationError) throw relationError

      // Then delete the look
      const { error: lookError } = await supabase
        .from('looks')
        .delete()
        .eq('id', lookId)

      if (lookError) throw lookError

      toast.success('Look deleted successfully')
      fetchLooks()
    } catch (error) {
      console.error('Failed to delete look:', error)
      toast.error('Failed to delete look')
    }
  }

  const filteredLooks = looks.filter(look => 
    look.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    look.look_number.toString().includes(searchQuery)
  )

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-800 rounded mb-4" />
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-900 h-64 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  // Create New Look View
  if (viewMode === 'create') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setViewMode('list')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Look Manager</span>
          </button>
        </div>
        <LookCreator onLookCreated={() => {
          setViewMode('list')
          fetchLooks()
        }} />
      </div>
    )
  }

  // Edit Look View
  if (viewMode === 'edit' && editingLook) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              setViewMode('list')
              setEditingLook(null)
            }}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Look Manager</span>
          </button>
        </div>
        <LookCreator 
          editingLook={editingLook}
          onLookCreated={() => {
            setViewMode('list')
            setEditingLook(null)
            fetchLooks()
          }} 
        />
      </div>
    )
  }

  // Main List View
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-luxury-gold" />
          <h2 className="text-2xl font-playfair">Look Manager</h2>
          <span className="px-2 py-1 bg-luxury-gold/20 text-luxury-gold text-xs rounded-full">
            {looks.length} looks
          </span>
        </div>
        
        <button
          onClick={() => setViewMode('create')}
          className="btn-luxury flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create New Look
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search looks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder:text-gray-500 focus:border-luxury-gold focus:outline-none"
        />
      </div>

      {/* Looks Grid */}
      {filteredLooks.length === 0 ? (
        <div className="text-center py-12">
          <Grid className="w-12 h-12 mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400 mb-2">No looks found</p>
          <p className="text-sm text-gray-600">
            {searchQuery ? 'Try adjusting your search' : 'Create your first look to get started'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredLooks.map((look, index) => (
              <motion.div
                key={look.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "bg-gray-950 border rounded-lg overflow-hidden group hover:border-gray-700 transition-all duration-300",
                  look.active ? "border-luxury-gold" : "border-gray-900"
                )}
              >
                {/* Hero Image */}
                <div className="aspect-video relative bg-gray-800">
                  {look.hero_image ? (
                    <img
                      src={look.hero_image}
                      alt={look.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Eye className="w-8 h-8 text-gray-600" />
                    </div>
                  )}
                  
                  {look.active && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-luxury-gold text-black text-xs font-medium rounded">
                      LIVE
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-playfair text-lg text-white mb-1">{look.name}</h3>
                      <p className="text-xs tracking-widest uppercase text-gray-500">
                        Look {look.look_number}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <ShoppingBag className="w-3 h-3 text-gray-500" />
                      <span className="text-xs text-gray-500">{look.look_products.length}</span>
                    </div>
                  </div>

                  {/* Products Preview */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {look.look_products
                        .sort((a, b) => a.display_order - b.display_order)
                        .slice(0, 3)
                        .map((lp, idx) => (
                          <div
                            key={idx}
                            className="text-xs bg-gray-900 px-2 py-1 rounded text-gray-400"
                          >
                            {lp.products.brand}
                          </div>
                        ))}
                      {look.look_products.length > 3 && (
                        <div className="text-xs bg-gray-900 px-2 py-1 rounded text-gray-400">
                          +{look.look_products.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingLook(look)
                        setViewMode('edit')
                      }}
                      className="flex-1 px-3 py-2 bg-gray-900 text-gray-300 text-sm rounded hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                    >
                      <Edit3 className="w-3 h-3" />
                      Edit
                    </button>
                    
                    <button
                      onClick={() => deleteLook(look.id)}
                      className="px-3 py-2 bg-red-500/20 text-red-400 text-sm rounded hover:bg-red-500/30 transition-colors"
                      disabled={look.active}
                      title={look.active ? 'Cannot delete active look' : 'Delete look'}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}