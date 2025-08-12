'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Package,
  Plus,
  Upload,
  DollarSign,
  Tag,
  Eye,
  Edit,
  Trash2,
  Download,
  Filter,
  Grid3X3,
  List,
  Image as ImageIcon
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { DataTable, Column, Action } from '../components/shared/DataTable'
import { cn } from '@/lib/utils'

interface Product {
  id: string
  name: string
  brand: string
  price: number
  size: string
  condition: string
  description: string
  images: string[]
  created_at: string
  in_looks?: number
  times_wished?: number
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // Enrich with additional data (in real app, this would be a join)
      const enrichedProducts = (data || []).map(p => ({
        ...p,
        in_looks: Math.floor(Math.random() * 5),
        times_wished: Math.floor(Math.random() * 20)
      }))
      
      setProducts(enrichedProducts)
    } catch (error) {
      console.error('Failed to fetch products:', error)
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  async function deleteProduct(product: Product) {
    if (!confirm(`Delete ${product.name}?`)) return

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id)

      if (error) throw error

      toast.success('Product deleted')
      fetchProducts()
    } catch (error) {
      toast.error('Failed to delete product')
    }
  }

  async function bulkDelete(selected: Product[]) {
    if (!confirm(`Delete ${selected.length} products?`)) return

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .in('id', selected.map(p => p.id))

      if (error) throw error

      toast.success(`${selected.length} products deleted`)
      fetchProducts()
    } catch (error) {
      toast.error('Failed to delete products')
    }
  }

  // Table columns configuration
  const columns: Column<Product>[] = [
    {
      key: 'image',
      header: '',
      accessor: (product) => product.images?.[0],
      width: '60px',
      render: (image, product) => (
        <div className="w-12 h-12 bg-gray-800 rounded overflow-hidden">
          {image ? (
            <img
              src={image}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-gray-600" />
            </div>
          )}
        </div>
      )
    },
    {
      key: 'brand',
      header: 'Brand',
      accessor: (product) => product.brand,
      sortable: true,
      searchable: true,
      render: (brand, product) => (
        <div>
          <p className="font-medium text-white">{brand}</p>
          <p className="text-xs text-gray-500">{product.name}</p>
        </div>
      )
    },
    {
      key: 'price',
      header: 'Price',
      accessor: (product) => product.price,
      sortable: true,
      align: 'right',
      render: (price) => (
        <span className="font-medium text-luxury-gold">
          ${price.toLocaleString()}
        </span>
      )
    },
    {
      key: 'size',
      header: 'Size',
      accessor: (product) => product.size,
      align: 'center'
    },
    {
      key: 'condition',
      header: 'Condition',
      accessor: (product) => product.condition,
      render: (condition) => {
        const colors = {
          'Excellent': 'text-green-400 bg-green-500/20',
          'Very Good': 'text-blue-400 bg-blue-500/20',
          'Good': 'text-yellow-400 bg-yellow-500/20',
          'Fair': 'text-gray-400 bg-gray-500/20'
        }
        return (
          <span className={cn(
            "px-2 py-1 rounded-full text-xs",
            colors[condition as keyof typeof colors] || colors.Fair
          )}>
            {condition}
          </span>
        )
      }
    },
    {
      key: 'metrics',
      header: 'Metrics',
      accessor: (product) => ({ in_looks: product.in_looks, times_wished: product.times_wished }),
      render: (metrics) => (
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <Eye className="w-3 h-3 text-gray-500" />
            <span>{metrics.in_looks}</span>
          </div>
          <div className="flex items-center gap-1">
            <Tag className="w-3 h-3 text-gray-500" />
            <span>{metrics.times_wished}</span>
          </div>
        </div>
      )
    }
  ]

  // Table actions
  const actions: Action<Product>[] = [
    {
      label: 'View',
      icon: Eye,
      onClick: (product) => setSelectedProduct(product)
    },
    {
      label: 'Edit',
      icon: Edit,
      onClick: (product) => {
        // Navigate to edit page or open modal
        toast('Edit feature coming soon')
      }
    },
    {
      label: 'Delete',
      icon: Trash2,
      variant: 'danger',
      onClick: deleteProduct
    }
  ]

  // Bulk actions
  const bulkActions: Action<Product[]>[] = [
    {
      label: 'Delete Selected',
      icon: Trash2,
      variant: 'danger',
      onClick: bulkDelete
    },
    {
      label: 'Export Selected',
      icon: Download,
      onClick: (selected) => {
        toast.success(`Exporting ${selected.length} products`)
      }
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-playfair">Products</h1>
          <p className="text-gray-500 mt-1">
            Manage your product catalog
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-900 rounded-lg p-1">
            <button
              onClick={() => setViewMode('table')}
              className={cn(
                "px-3 py-1.5 rounded text-sm transition-colors",
                viewMode === 'table' 
                  ? "bg-luxury-gold text-black" 
                  : "text-gray-400 hover:text-white"
              )}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                "px-3 py-1.5 rounded text-sm transition-colors",
                viewMode === 'grid' 
                  ? "bg-luxury-gold text-black" 
                  : "text-gray-400 hover:text-white"
              )}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
          </div>
          
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-luxury-gold text-black rounded-lg hover:bg-luxury-gold/80 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Products', value: products.length, icon: Package, color: 'text-blue-500' },
          { label: 'Total Value', value: `$${products.reduce((sum, p) => sum + p.price, 0).toLocaleString()}`, icon: DollarSign, color: 'text-green-500' },
          { label: 'In Looks', value: products.filter(p => p.in_looks && p.in_looks > 0).length, icon: Eye, color: 'text-purple-500' },
          { label: 'Most Wished', value: Math.max(...products.map(p => p.times_wished || 0)), icon: Tag, color: 'text-luxury-gold' }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-950 border border-gray-900 rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <stat.icon className={cn("w-5 h-5", stat.color)} />
              <span className="text-2xl font-light">{stat.value}</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Products View */}
      {viewMode === 'table' ? (
        <DataTable
          data={products}
          columns={columns}
          actions={actions}
          bulkActions={bulkActions}
          selectable
          searchPlaceholder="Search products..."
          filters={[
            { label: 'Excellent', value: 'excellent' },
            { label: 'Very Good', value: 'very-good' },
            { label: 'Good', value: 'good' },
            { label: 'Fair', value: 'fair' }
          ]}
          exportFilename="products"
          refreshable
          onRefresh={fetchProducts}
          loading={loading}
          emptyMessage="No products found"
          emptyIcon={Package}
        />
      ) : (
        // Grid View
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="bg-gray-950 border border-gray-900 rounded-lg overflow-hidden hover:border-gray-700 transition-all group"
            >
              <div className="aspect-square bg-gray-800 relative overflow-hidden">
                {product.images?.[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-gray-600" />
                  </div>
                )}
                
                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => setSelectedProduct(product)}
                    className="p-2 bg-luxury-gold text-black rounded-lg hover:bg-luxury-gold/80"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteProduct(product)}
                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-medium text-white">{product.brand}</h3>
                <p className="text-sm text-gray-500">{product.name}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-luxury-gold font-medium">
                    ${product.price.toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-500">Size {product.size}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedProduct(null)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gray-950 border border-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-playfair">{selectedProduct.brand}</h2>
                  <p className="text-gray-400">{selectedProduct.name}</p>
                </div>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="text-gray-500 hover:text-white"
                >
                  ×
                </button>
              </div>
              
              {selectedProduct.images?.length > 0 && (
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {selectedProduct.images.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt={`${selectedProduct.name} ${i + 1}`}
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500">Price</label>
                  <p className="text-white">${selectedProduct.price.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Size</label>
                  <p className="text-white">{selectedProduct.size}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Condition</label>
                  <p className="text-white">{selectedProduct.condition}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Added</label>
                  <p className="text-white">
                    {new Date(selectedProduct.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              {selectedProduct.description && (
                <div className="mt-6">
                  <label className="text-xs text-gray-500">Description</label>
                  <p className="text-white mt-1">{selectedProduct.description}</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}