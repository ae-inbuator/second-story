'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus,
  X,
  Search,
  ArrowUp,
  ArrowDown,
  Save,
  Eye,
  Upload,
  Sparkles,
  Grid,
  List,
  Image as ImageIcon,
  GripVertical
} from 'lucide-react'
import toast from 'react-hot-toast'
import { LuxuryImage } from '@/components/ui/luxury-image'
import { UploadDropzone } from '@/lib/uploadthing'
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

interface SelectedProduct extends Product {
  display_order: number
}

interface Look {
  id?: string
  event_id: string
  look_number: number
  name: string
  hero_image?: string | null
  active: boolean
}

interface LookCreatorProps {
  editingLook?: Look & {
    look_products: Array<{
      display_order: number
      products: Product
    }>
  }
  onLookCreated?: () => void
}

export function LookCreator({ editingLook, onLookCreated }: LookCreatorProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  
  // Look form data
  const [lookData, setLookData] = useState({
    name: '',
    hero_image: '',
    event_id: '1' // Default event ID
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    if (editingLook) {
      // Initialize form with existing look data
      setLookData({
        name: editingLook.name,
        hero_image: editingLook.hero_image || '',
        event_id: editingLook.event_id
      })

      // Initialize selected products
      const existingProducts = editingLook.look_products.map(lp => ({
        ...lp.products,
        display_order: lp.display_order
      }))
      setSelectedProducts(existingProducts)
    }
  }, [editingLook])

  useEffect(() => {
    filterProducts()
  }, [products, searchQuery])

  async function fetchProducts() {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, brand, price, size, condition, images')
        .order('created_at', { ascending: false })

      if (error) throw error
      
      setProducts(data || [])
    } catch (error) {
      console.error('Failed to fetch products:', error)
      toast.error('Failed to load products')
    } finally {
      setIsLoading(false)
    }
  }


  function filterProducts() {
    let filtered = products

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query)
      )
    }

    // Exclude already selected products
    const selectedIds = selectedProducts.map(p => p.id)
    filtered = filtered.filter(p => !selectedIds.includes(p.id))

    setFilteredProducts(filtered)
  }

  function addProductToLook(product: Product) {
    // Check if product is already selected
    if (selectedProducts.find(p => p.id === product.id)) {
      toast.error('Product already added to this look')
      return
    }
    
    const newProduct: SelectedProduct = {
      ...product,
      display_order: selectedProducts.length + 1
    }
    setSelectedProducts([...selectedProducts, newProduct])
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(50)
    }
  }

  function removeProductFromLook(productId: string) {
    const updated = selectedProducts
      .filter(p => p.id !== productId)
      .map((p, index) => ({ ...p, display_order: index + 1 }))
    setSelectedProducts(updated)
    
    toast.success('Product removed from look')
  }

  function moveProduct(productId: string, direction: 'up' | 'down') {
    const currentIndex = selectedProducts.findIndex(p => p.id === productId)
    if (currentIndex === -1) return

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= selectedProducts.length) return

    const updated = [...selectedProducts]
    const [movedProduct] = updated.splice(currentIndex, 1)
    updated.splice(newIndex, 0, movedProduct)

    // Update display orders
    const reordered = updated.map((p, index) => ({ ...p, display_order: index + 1 }))
    setSelectedProducts(reordered)
  }

  async function saveLook() {
    if (!lookData.name.trim()) {
      toast.error('Please enter a look name')
      return
    }

    if (selectedProducts.length === 0) {
      toast.error('Please select at least one product')
      return
    }

    setIsSaving(true)
    try {
      if (editingLook) {
        // Update existing look
        const { error: lookError } = await supabase
          .from('looks')
          .update({
            name: lookData.name,
            hero_image: lookData.hero_image || null,
            event_id: lookData.event_id
          })
          .eq('id', editingLook.id)

        if (lookError) throw lookError

        // Delete existing look-product relationships
        const { error: deleteError } = await supabase
          .from('look_products')
          .delete()
          .eq('look_id', editingLook.id)

        if (deleteError) throw deleteError

        // Create new look-product relationships
        const lookProductsData = selectedProducts.map(product => ({
          look_id: editingLook.id,
          product_id: product.id,
          display_order: product.display_order
        }))

        const { error: relationError } = await supabase
          .from('look_products')
          .insert(lookProductsData)

        if (relationError) throw relationError

        toast.success(`Look "${lookData.name}" updated successfully!`, {
          icon: '✨',
          duration: 3000
        })

      } else {
        // Get next look number
        const { data: existingLooks, error: lookNumberError } = await supabase
          .from('looks')
          .select('look_number')
          .order('look_number', { ascending: false })
          .limit(1)

        if (lookNumberError) throw lookNumberError
        
        const nextLookNumber = existingLooks && existingLooks.length > 0 ? existingLooks[0].look_number + 1 : 1

        // Create new look
        const { data: lookResult, error: lookError } = await supabase
          .from('looks')
          .insert([{
            event_id: lookData.event_id,
            look_number: nextLookNumber,
            name: lookData.name,
            hero_image: lookData.hero_image || null,
            active: false
          }])
          .select()
          .single()

        if (lookError) throw lookError

        // Create look-product relationships
        const lookProductsData = selectedProducts.map(product => ({
          look_id: lookResult.id,
          product_id: product.id,
          display_order: product.display_order
        }))

        const { error: relationError } = await supabase
          .from('look_products')
          .insert(lookProductsData)

        if (relationError) throw relationError

        toast.success(`Look "${lookData.name}" created successfully!`, {
          icon: '✨',
          duration: 3000
        })

        // Reset form only for new looks
        setSelectedProducts([])
        setLookData({
          name: '',
          hero_image: '',
          event_id: '1'
        })
      }

      // Call callback if provided
      if (onLookCreated) {
        onLookCreated()
      }

    } catch (error) {
      console.error(`Failed to ${editingLook ? 'update' : 'create'} look:`, error)
      toast.error(`Failed to ${editingLook ? 'update' : 'create'} look`)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-800 rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-900 h-96 rounded-lg" />
          <div className="bg-gray-900 h-96 rounded-lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Sparkles className="w-6 h-6 text-luxury-gold" />
        <h2 className="text-2xl font-playfair">
          {editingLook ? 'Edit Look' : 'Look Creator'}
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Selection Panel */}
        <div className="bg-gray-950 border border-gray-900 rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <Grid className="w-5 h-5 text-luxury-gold" />
            Select Products
          </h3>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder:text-gray-500 focus:border-luxury-gold focus:outline-none"
            />
          </div>

          {/* Available Products */}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-8">
                <Grid className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                <p className="text-gray-500 text-sm">
                  {searchQuery ? 'No products match your search' : 'All products selected'}
                </p>
              </div>
            ) : (
              filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-3 p-3 bg-gray-900 border border-gray-800 rounded-lg hover:border-gray-700 transition-colors"
                >
                  <div className="w-12 h-12 relative rounded overflow-hidden flex-shrink-0">
                    {product.images && product.images.length > 0 ? (
                      <LuxuryImage
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        objectFit="cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                        <ImageIcon className="w-4 h-4 text-gray-600" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{product.brand}</p>
                    <p className="text-gray-400 text-xs truncate">{product.name}</p>
                    <p className="text-luxury-gold text-xs">${product.price.toLocaleString()}</p>
                  </div>
                  
                  <button
                    onClick={() => addProductToLook(product)}
                    className="p-2 bg-luxury-gold text-black rounded-lg hover:bg-luxury-gold/80 flex-shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Look Builder Panel */}
        <div className="bg-gray-950 border border-gray-900 rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <List className="w-5 h-5 text-luxury-gold" />
            Look Builder
          </h3>

          {/* Look Details Form */}
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Look Name
                </label>
                <input
                  type="text"
                  placeholder="Enter look name..."
                  value={lookData.name}
                  onChange={(e) => setLookData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded text-white placeholder:text-gray-600 focus:border-luxury-gold focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Products
                </label>
                <div className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-gray-400">
                  {selectedProducts.length} selected
                </div>
              </div>
            </div>

            {/* Hero Image Upload */}
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">
                Hero Image
              </label>
              {lookData.hero_image ? (
                <div className="relative">
                  <div className="aspect-video relative rounded-lg overflow-hidden">
                    <LuxuryImage
                      src={lookData.hero_image}
                      alt="Hero image"
                      fill
                      objectFit="cover"
                    />
                  </div>
                  <button
                    onClick={() => setLookData(prev => ({ ...prev, hero_image: '' }))}
                    className="absolute top-2 right-2 p-1 bg-black/60 text-white rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <UploadDropzone
                  endpoint="lookHeroImage"
                  onClientUploadComplete={(res) => {
                    if (res && res[0]) {
                      setLookData(prev => ({ ...prev, hero_image: res[0].url }))
                      toast.success('Hero image uploaded!')
                    }
                  }}
                  onUploadError={(error) => {
                    toast.error(`Upload failed: ${error.message}`)
                  }}
                  appearance={{
                    container: "border-2 border-dashed border-gray-800 p-4 rounded-lg bg-gray-900",
                    uploadIcon: "text-gray-600",
                    label: "text-xs text-gray-500 uppercase tracking-wider",
                    allowedContent: "text-xs text-gray-600"
                  }}
                />
              )}
            </div>
          </div>

          {/* Selected Products */}
          <div className="border-t border-gray-800 pt-4">
            <h4 className="text-sm font-medium text-gray-400 mb-3">Selected Products ({selectedProducts.length})</h4>
            
            {selectedProducts.length === 0 ? (
              <div className="text-center py-8">
                <Plus className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                <p className="text-gray-500 text-sm">No products selected</p>
                <p className="text-gray-600 text-xs">Add products from the left panel</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                <AnimatePresence>
                  {selectedProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex items-center gap-2 p-2 bg-gray-900 border border-gray-800 rounded group"
                    >
                      <span className="text-xs text-gray-500 w-6 text-center">
                        {product.display_order}
                      </span>
                      
                      <div className="w-8 h-8 relative rounded overflow-hidden">
                        {product.images && product.images.length > 0 ? (
                          <LuxuryImage
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            objectFit="cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-700" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white truncate">{product.brand}</p>
                        <p className="text-xs text-gray-500 truncate">{product.name}</p>
                      </div>
                      
                      <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => moveProduct(product.id, 'up')}
                          disabled={index === 0}
                          className="p-1 text-gray-500 hover:text-white disabled:opacity-30"
                          title="Move up"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => moveProduct(product.id, 'down')}
                          disabled={index === selectedProducts.length - 1}
                          className="p-1 text-gray-500 hover:text-white disabled:opacity-30"
                          title="Move down"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => removeProductFromLook(product.id)}
                          className="p-1 text-red-400 hover:text-red-300 bg-red-900/20 rounded hover:bg-red-900/40 transition-colors"
                          title="Remove product"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="border-t border-gray-800 pt-4 mt-4">
            <button
              onClick={saveLook}
              disabled={isSaving || !lookData.name.trim() || selectedProducts.length === 0}
              className="w-full btn-luxury flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {isSaving 
                ? (editingLook ? 'Updating Look...' : 'Creating Look...') 
                : (editingLook ? 'Update Look' : 'Create Look')
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}