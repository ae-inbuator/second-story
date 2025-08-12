'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Heart, TrendingUp, Package, ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface TrendingProduct {
  id: string
  name: string
  brand: string
  wishCount: number
  price: number
}

export function WishlistTrends() {
  const router = useRouter()
  const [trending, setTrending] = useState<TrendingProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTrendingProducts()
  }, [])

  async function fetchTrendingProducts() {
    try {
      // In a real app, this would be a more complex query
      // For now, we'll simulate trending products
      const { data: wishes } = await supabase
        .from('wishlists')
        .select('product_id')
      
      const { data: products } = await supabase
        .from('products')
        .select('id, name, brand, price')
        .limit(5)

      if (products) {
        // Simulate wish counts
        const trendingProducts = products.map(p => ({
          ...p,
          wishCount: Math.floor(Math.random() * 20) + 5
        })).sort((a, b) => b.wishCount - a.wishCount)

        setTrending(trendingProducts)
      }
    } catch (error) {
      console.error('Failed to fetch trending:', error)
    } finally {
      setLoading(false)
    }
  }

  const maxWishes = Math.max(...trending.map(t => t.wishCount), 1)

  return (
    <div className="bg-gray-950 border border-gray-900 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-luxury-gold" />
          <h3 className="font-medium">Trending Wishes</h3>
        </div>
        <button
          onClick={() => router.push('/admin-v2/wishes')}
          className="text-xs text-gray-500 hover:text-white transition-colors flex items-center gap-1"
        >
          View all
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-800 rounded w-3/4 mb-2" />
              <div className="h-2 bg-gray-800 rounded w-full" />
            </div>
          ))}
        </div>
      ) : trending.length > 0 ? (
        <div className="space-y-3">
          {trending.slice(0, 5).map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <button
                onClick={() => router.push(`/admin-v2/products?id=${product.id}`)}
                className="w-full text-left"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-500">
                      #{index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-white group-hover:text-luxury-gold transition-colors truncate">
                        {product.brand}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{product.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-luxury-gold">
                      {product.wishCount}
                    </p>
                    <p className="text-xs text-gray-500">wishes</p>
                  </div>
                </div>
                <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    className={cn(
                      "h-full rounded-full",
                      index === 0 ? "bg-gradient-to-r from-luxury-gold to-yellow-500" :
                      index === 1 ? "bg-gradient-to-r from-gray-400 to-gray-300" :
                      index === 2 ? "bg-gradient-to-r from-orange-700 to-orange-600" :
                      "bg-gray-600"
                    )}
                    initial={{ width: 0 }}
                    animate={{ width: `${(product.wishCount / maxWishes) * 100}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  />
                </div>
              </button>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Package className="w-8 h-8 mx-auto mb-2 text-gray-700" />
          <p className="text-sm">No wishes yet</p>
        </div>
      )}

      {/* Summary Stats */}
      {trending.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-xs text-gray-500">
              Total: {trending.reduce((sum, t) => sum + t.wishCount, 0)} wishes
            </span>
          </div>
          <span className="text-xs text-gray-500">
            Avg: ${Math.round(trending.reduce((sum, t) => sum + t.price, 0) / trending.length)}
          </span>
        </div>
      )}
    </div>
  )
}