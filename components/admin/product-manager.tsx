'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Eye, 
  Package,
  Image as ImageIcon,
  DollarSign,
  Tag,
  Grid3X3
} from 'lucide-react'
import toast from 'react-hot-toast'
import { LuxuryImage } from '@/components/ui/luxury-image'
import { cn } from '@/lib/utils'

interface Product {
  id: string
  name: string
  brand: string
  price: number
  size: string
  condition: string
  description: string
  measurements: any
  images: string[]
  created_at: string
}

export function ProductManager({ refreshTrigger }: { refreshTrigger?: number }) {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCondition, setSelectedCondition] = useState<string>('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  useEffect(() => {
    fetchProducts()
  }, [refreshTrigger])

  useEffect(() => {
    filterProducts()
  }, [products, searchQuery, selectedCondition])

  async function fetchProducts() {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
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
        p.brand.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      )
    }

    if (selectedCondition) {
      filtered = filtered.filter(p => p.condition === selectedCondition)
    }

    setFilteredProducts(filtered)
  }

  async function deleteProduct(id: string) {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const response = await fetch(`/api/admin/products/delete?id=${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete product')
      }

      toast.success('Product deleted successfully')
      fetchProducts()
    } catch (error) {
      console.error('Failed to delete product:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete product')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-800 rounded mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-900 h-64 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex items-center gap-3">
          <Package className="w-6 h-6 text-luxury-gold" />
          <h2 className="text-2xl font-playfair">Product Manager</h2>
          <span className="px-2 py-1 bg-luxury-gold/20 text-luxury-gold text-xs rounded-full">
            {products.length} products
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              "p-2 rounded transition-colors",
              viewMode === 'grid' ? "bg-luxury-gold text-black" : "text-gray-400 hover:text-white"
            )}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              "p-2 rounded transition-colors",
              viewMode === 'list' ? "bg-luxury-gold text-black" : "text-gray-400 hover:text-white"
            )}
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder:text-gray-500 focus:border-luxury-gold focus:outline-none"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={selectedCondition}
            onChange={(e) => setSelectedCondition(e.target.value)}
            className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white focus:border-luxury-gold focus:outline-none"
          >
            <option value="">All Conditions</option>
            <option value="Excellent">Excellent</option>
            <option value="Very Good">Very Good</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
          </select>
        </div>
      </div>

      {/* Products Grid/List */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-12 h-12 mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400 mb-2">No products found</p>
          <p className="text-sm text-gray-600">
            {searchQuery || selectedCondition ? 'Try adjusting your filters' : 'Add your first product to get started'}
          </p>
        </div>
      ) : (
        <div className={cn(
          viewMode === 'grid' 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" 
            : "space-y-4"
        )}>
          <AnimatePresence>
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "bg-gray-950 border border-gray-900 rounded-lg overflow-hidden group hover:border-gray-700 transition-all duration-300",
                  viewMode === 'list' && "flex"
                )}
              >
                {/* Product Image */}
                <div className={cn(
                  "relative overflow-hidden",
                  viewMode === 'grid' ? "aspect-square" : "w-32 h-32 flex-shrink-0"
                )}>
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        console.log('Image failed to load:', product.images[0])
                        e.currentTarget.style.display = 'none'
                        e.currentTarget.nextElementSibling.style.display = 'flex'
                      }}
                    />
                  ) : null}
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center" style={{ display: product.images && product.images.length > 0 ? 'none' : 'flex' }}>
                    <ImageIcon className="w-8 h-8 text-gray-600" />
                    <span className="text-xs text-gray-500 ml-2">No image</span>
                  </div>
                  
                  {/* Overlay actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                    <button
                      onClick={() => setSelectedProduct(product)}
                      className="p-2 bg-luxury-gold text-black rounded-lg hover:bg-luxury-gold/80"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                      title="Delete product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4 flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-playfair text-lg text-white">{product.brand}</h3>
                      <p className="text-sm text-gray-400">{product.name}</p>
                    </div>
                    <span className="px-2 py-1 bg-luxury-gold/20 text-luxury-gold text-xs rounded-full">
                      {product.condition}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      <span>{product.price.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      <span>Size {product.size}</span>
                    </div>
                  </div>
                  
                  {viewMode === 'list' && product.description && (
                    <p className="text-sm text-gray-400 mt-2 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                  
                  {/* Action Buttons - Always Visible */}
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-800">
                    <button
                      onClick={() => setSelectedProduct(product)}
                      className="flex-1 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="flex-1 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
                      title="Delete product"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedProduct(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gray-950 border border-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="font-playfair text-2xl text-white mb-1">
                        {selectedProduct.brand}
                      </h2>
                      <p className="text-gray-400">{selectedProduct.name}</p>
                    </div>
                    <button
                      onClick={() => setSelectedProduct(null)}
                      className="text-gray-500 hover:text-white"
                    >
                      ×
                    </button>
                  </div>
                  
                  {/* Images */}
                  {selectedProduct.images && selectedProduct.images.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      {selectedProduct.images.map((image, idx) => (
                        <div key={idx} className="aspect-square relative rounded-lg overflow-hidden">
                          <img
                            src={image}
                            alt={`${selectedProduct.name} ${idx + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.log('Modal image failed to load:', image)
                              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMzc0MTUxIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTA1IiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzY5NzI4MyIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Tm8gSW1hZ2U8L3RleHQ+Cjwvc3ZnPgo='
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Details */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-500 uppercase tracking-wider">Price</label>
                        <p className="text-white">${selectedProduct.price.toLocaleString()}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 uppercase tracking-wider">Size</label>
                        <p className="text-white">{selectedProduct.size}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 uppercase tracking-wider">Condition</label>
                        <p className="text-white">{selectedProduct.condition}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 uppercase tracking-wider">Added</label>
                        <p className="text-white">
                          {new Date(selectedProduct.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    {selectedProduct.description && (
                      <div>
                        <label className="text-xs text-gray-500 uppercase tracking-wider">Description</label>
                        <p className="text-white mt-1">{selectedProduct.description}</p>
                      </div>
                    )}
                    
                    {selectedProduct.measurements && Object.keys(selectedProduct.measurements).length > 0 && (
                      <div>
                        <label className="text-xs text-gray-500 uppercase tracking-wider">Measurements</label>
                        <div className="grid grid-cols-2 gap-2 mt-1">
                          {Object.entries(selectedProduct.measurements).map(([key, value]) => (
                            value && (
                              <div key={key} className="text-sm">
                                <span className="text-gray-400 capitalize">{key}:</span>
                                <span className="text-white ml-2">{value} cm</span>
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}