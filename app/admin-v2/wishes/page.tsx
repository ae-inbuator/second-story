'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Heart,
  DollarSign,
  Tag,
  Users,
  Package,
  TrendingUp,
  Eye,
  User,
  Sparkles,
  Star
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { DataTable, Column } from '../components/shared/DataTable'
import { cn } from '@/lib/utils'
import Image from 'next/image'

interface WishlistItem {
  id: string
  guest_id: string
  product_id: string
  created_at: string
  guest: {
    name: string
    email: string
    vip_level?: string
  }
  product: {
    name: string
    brand: string
    price: number
    images: string[]
    hero_image?: string
  }
  look?: {
    look_number: number
    name: string
  }
}

export default function WishesPage() {
  const [wishes, setWishes] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWishes()
  }, [])

  async function fetchWishes() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select(`
          id,
          guest_id,
          product_id,
          created_at,
          guests:guest_id (
            name,
            email,
            vip_level
          ),
          products:product_id (
            name,
            brand,
            price,
            images,
            hero_image,
            looks:look_id (
              look_number,
              name
            )
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Transform the data to match our interface
      const formattedWishes = (data || []).map(item => ({
        id: item.id,
        guest_id: item.guest_id,
        product_id: item.product_id,
        created_at: item.created_at,
        guest: {
          name: (item.guests as any)?.name || 'Unknown',
          email: (item.guests as any)?.email || 'Unknown',
          vip_level: (item.guests as any)?.vip_level
        },
        product: {
          name: (item.products as any)?.name || 'Unknown Product',
          brand: (item.products as any)?.brand || 'Unknown Brand',
          price: (item.products as any)?.price || 0,
          images: (item.products as any)?.images || [],
          hero_image: (item.products as any)?.hero_image
        },
        look: (item.products as any)?.looks ? {
          look_number: (item.products as any).looks.look_number,
          name: (item.products as any).looks.name
        } : undefined
      }))

      setWishes(formattedWishes)
    } catch (error) {
      console.error('Failed to fetch wishes:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate stats
  const totalValue = wishes.reduce((sum, wish) => sum + wish.product.price, 0)
  const avgWishValue = wishes.length > 0 ? totalValue / wishes.length : 0
  const uniqueGuests = new Set(wishes.map(w => w.guest_id)).size
  const vipWishes = wishes.filter(w => w.guest.vip_level && w.guest.vip_level !== 'standard').length

  // Top brands
  const brandCounts = wishes.reduce((acc, wish) => {
    acc[wish.product.brand] = (acc[wish.product.brand] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const topBrands = Object.entries(brandCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)

  // Table columns
  const columns: Column<WishlistItem>[] = [
    {
      key: 'product',
      header: 'Product',
      accessor: (wish) => wish.product.name,
      searchable: true,
      render: (_, wish) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
            {wish.product.hero_image || wish.product.images?.[0] ? (
              <Image
                src={wish.product.hero_image || wish.product.images[0]}
                alt={wish.product.name}
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-5 h-5 text-gray-600" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-white truncate">{wish.product.brand}</p>
            <p className="text-sm text-gray-400 truncate">{wish.product.name}</p>
          </div>
        </div>
      )
    },
    {
      key: 'guest',
      header: 'Guest',
      accessor: (wish) => wish.guest.name,
      searchable: true,
      render: (_, wish) => (
        <div>
          <p className="font-medium text-white">{wish.guest.name}</p>
          <p className="text-sm text-gray-400">{wish.guest.email}</p>
          {wish.guest.vip_level && wish.guest.vip_level !== 'standard' && (
            <span className="text-xs text-luxury-gold">VIP {wish.guest.vip_level}</span>
          )}
        </div>
      )
    },
    {
      key: 'price',
      header: 'Price',
      accessor: (wish) => wish.product.price,
      sortable: true,
      align: 'right',
      render: (price) => (
        <span className="text-lg font-medium text-luxury-gold">
          ${price.toLocaleString()}
        </span>
      )
    },
    {
      key: 'look',
      header: 'Look',
      accessor: (wish) => wish.look?.name || '',
      render: (_, wish) => (
        wish.look ? (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-luxury-gold/20 rounded-full flex items-center justify-center">
              <span className="text-luxury-gold text-xs font-bold">
                {wish.look.look_number}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-white">
                Look {wish.look.look_number}
              </p>
              <p className="text-xs text-gray-400">{wish.look.name}</p>
            </div>
          </div>
        ) : (
          <span className="text-sm text-gray-500">No look</span>
        )
      )
    },
    {
      key: 'added',
      header: 'Added',
      accessor: (wish) => wish.created_at,
      sortable: true,
      render: (date) => (
        <div className="text-sm text-gray-400">
          <p>{new Date(date).toLocaleDateString()}</p>
          <p className="text-xs">{new Date(date).toLocaleTimeString()}</p>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-playfair">Wishlist Items</h1>
          <p className="text-gray-500 mt-1">
            Track what guests are coveting
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Wishes',
            value: wishes.length,
            icon: Heart,
            color: 'text-luxury-gold',
            bg: 'bg-luxury-gold/10'
          },
          {
            label: 'Total Value',
            value: `$${totalValue.toLocaleString()}`,
            icon: DollarSign,
            color: 'text-green-500',
            bg: 'bg-green-500/10'
          },
          {
            label: 'Avg Value',
            value: `$${Math.round(avgWishValue)}`,
            icon: Tag,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10'
          },
          {
            label: 'Unique Guests',
            value: uniqueGuests,
            icon: Users,
            color: 'text-purple-500',
            bg: 'bg-purple-500/10'
          }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-950 border border-gray-900 rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div className={cn("p-2 rounded-lg", stat.bg)}>
                <stat.icon className={cn("w-5 h-5", stat.color)} />
              </div>
              <span className="text-2xl font-light">{stat.value}</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Top Brands */}
      {topBrands.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-950 border border-gray-900 rounded-lg p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-luxury-gold" />
            <h3 className="text-lg font-medium">Top Brands by Wishes</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {topBrands.map(([brand, count], index) => (
              <div 
                key={brand}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-900/50 rounded-full"
              >
                <span className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                  index === 0 ? "bg-luxury-gold text-black" :
                  index === 1 ? "bg-gray-400 text-black" :
                  index === 2 ? "bg-orange-600 text-white" :
                  "bg-gray-600 text-white"
                )}>
                  {index + 1}
                </span>
                <span className="text-white font-medium">{brand}</span>
                <span className="text-luxury-gold bg-luxury-gold/20 px-2 py-0.5 rounded-full text-xs">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Wishes Table */}
      <DataTable
        data={wishes}
        columns={columns}
        searchPlaceholder="Search by guest, product, or brand..."
        filters={[
          { label: 'All Prices', value: 'all' },
          { label: 'Under $100', value: 'under_100' },
          { label: '$100 - $500', value: '100_500' },
          { label: 'Over $500', value: 'over_500' }
        ]}
        exportFilename="wishes"
        refreshable
        onRefresh={fetchWishes}
        loading={loading}
        emptyMessage="No wishes found"
        emptyIcon={Heart}
      />

      {/* VIP Insights */}
      {vipWishes > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-950 border border-gray-900 rounded-lg p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-luxury-gold" />
            <h3 className="text-lg font-medium">VIP Insights</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-light text-luxury-gold">{vipWishes}</p>
              <p className="text-sm text-gray-500">VIP Wishes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-light text-luxury-gold">
                ${Math.round(wishes.filter(w => w.guest.vip_level && w.guest.vip_level !== 'standard')
                  .reduce((sum, w) => sum + w.product.price, 0) / Math.max(vipWishes, 1))}
              </p>
              <p className="text-sm text-gray-500">Avg VIP Wish Value</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-light text-luxury-gold">
                {((vipWishes / wishes.length) * 100).toFixed(1)}%
              </p>
              <p className="text-sm text-gray-500">VIP Share</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}