'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Heart,
  User,
  Package,
  Download,
  ChevronLeft,
  ChevronRight,
  Calendar,
  DollarSign,
  Eye,
  Sparkles,
  Tag
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { AdminLayout } from '@/components/admin/AdminLayout'

interface WishlistItem {
  id: string
  guest_id: string
  product_id: string
  created_at: string
  guest: {
    name: string
    email: string
  }
  product: {
    name: string
    price: number
    brand: string
    hero_image?: string
    look_id?: string
  }
  look?: {
    look_number: number
    name: string
  }
}

export default function WishesPage() {
  const [wishes, setWishes] = useState<WishlistItem[]>([])
  const [filteredWishes, setFilteredWishes] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [lookFilter, setLookFilter] = useState<string>('all')
  const [priceFilter, setPriceFilter] = useState<'all' | 'under_100' | '100_500' | 'over_500'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState<'created_at' | 'price' | 'guest_name'>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [availableLooks, setAvailableLooks] = useState<{id: string, name: string, look_number: number}[]>([])

  const ITEMS_PER_PAGE = 20

  useEffect(() => {
    Promise.all([
      fetchWishes(),
      fetchLooks()
    ])
  }, [])

  useEffect(() => {
    filterWishes()
  }, [wishes, search, lookFilter, priceFilter, sortBy, sortOrder])

  async function fetchWishes() {
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
            email
          ),
          products:product_id (
            name,
            price,
            brand,
            hero_image,
            look_id,
            looks:look_id (
              look_number,
              name
            )
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      const formattedWishes = (data || []).map(item => ({
        id: item.id,
        guest_id: item.guest_id,
        product_id: item.product_id,
        created_at: item.created_at,
        guest: {
          name: (item.guests as any)?.name || 'Unknown',
          email: (item.guests as any)?.email || 'Unknown'
        },
        product: {
          name: (item.products as any)?.name || 'Unknown Product',
          price: (item.products as any)?.price || 0,
          brand: (item.products as any)?.brand || 'Unknown Brand',
          hero_image: (item.products as any)?.hero_image,
          look_id: (item.products as any)?.look_id
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

  async function fetchLooks() {
    try {
      const { data, error } = await supabase
        .from('looks')
        .select('id, name, look_number')
        .order('look_number')

      if (error) throw error
      setAvailableLooks(data || [])
    } catch (error) {
      console.error('Failed to fetch looks:', error)
    }
  }

  function filterWishes() {
    let filtered = [...wishes]

    // Search filter
    if (search) {
      filtered = filtered.filter(wish =>
        wish.guest.name.toLowerCase().includes(search.toLowerCase()) ||
        wish.guest.email.toLowerCase().includes(search.toLowerCase()) ||
        wish.product.name.toLowerCase().includes(search.toLowerCase()) ||
        wish.product.brand.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Look filter
    if (lookFilter !== 'all') {
      filtered = filtered.filter(wish => wish.product.look_id === lookFilter)
    }

    // Price filter
    if (priceFilter !== 'all') {
      filtered = filtered.filter(wish => {
        const price = wish.product.price
        switch (priceFilter) {
          case 'under_100':
            return price < 100
          case '100_500':
            return price >= 100 && price <= 500
          case 'over_500':
            return price > 500
          default:
            return true
        }
      })
    }

    // Sort
    filtered.sort((a, b) => {
      let result = 0
      
      switch (sortBy) {
        case 'created_at':
          result = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          break
        case 'price':
          result = a.product.price - b.product.price
          break
        case 'guest_name':
          result = a.guest.name.localeCompare(b.guest.name)
          break
      }
      
      return sortOrder === 'asc' ? result : -result
    })

    setFilteredWishes(filtered)
    setCurrentPage(1)
  }

  async function exportWishes() {
    const csvContent = [
      ['Guest Name', 'Guest Email', 'Product Name', 'Brand', 'Price', 'Look', 'Added Date'].join(','),
      ...filteredWishes.map(wish => [
        `"${wish.guest.name}"`,

        `"${wish.guest.email}"`,
        `"${wish.product.name}"`,
        `"${wish.product.brand}"`,
        `"$${wish.product.price}"`,
        `"${wish.look ? `Look ${wish.look.look_number}: ${wish.look.name}` : 'No Look'}"`,
        `"${new Date(wish.created_at).toLocaleString()}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `wishes-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const totalPages = Math.ceil(filteredWishes.length / ITEMS_PER_PAGE)
  const paginatedWishes = filteredWishes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // Stats
  const totalValue = wishes.reduce((sum, wish) => sum + wish.product.price, 0)
  const avgWishValue = wishes.length > 0 ? totalValue / wishes.length : 0
  const uniqueGuests = new Set(wishes.map(w => w.guest_id)).size
  const topBrands = Object.entries(
    wishes.reduce((acc, wish) => {
      acc[wish.product.brand] = (acc[wish.product.brand] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  ).sort(([,a], [,b]) => b - a).slice(0, 3)

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-luxury-gold"></div>
      </div>
    )
  }

  return (
    <AdminLayout 
      title="Wishlist Items"
      subtitle={`${filteredWishes.length} wishes • $${totalValue.toLocaleString()} total value • ${uniqueGuests} unique guests`}
      showBackButton={true}
      backUrl="/admin"
    >
      {/* Export Button */}
      <div className="bg-black border-b border-gray-900 px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-end">
          <button
            onClick={exportWishes}
            className="btn-luxury flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Filters */}
        <div className="bg-gray-950 border border-gray-900 rounded-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by guest, product, or brand..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-black border border-gray-800 rounded-lg text-white placeholder:text-gray-600 focus:border-luxury-gold focus:outline-none"
              />
            </div>

            {/* Look Filter */}
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-gray-500" />
              <select
                value={lookFilter}
                onChange={(e) => setLookFilter(e.target.value)}
                className="px-3 py-2 bg-black border border-gray-800 rounded-lg text-white focus:border-luxury-gold focus:outline-none min-w-[120px]"
              >
                <option value="all">All Looks</option>
                {availableLooks.map(look => (
                  <option key={look.id} value={look.id}>
                    Look {look.look_number}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Filter */}
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gray-500" />
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value as any)}
                className="px-3 py-2 bg-black border border-gray-800 rounded-lg text-white focus:border-luxury-gold focus:outline-none"
              >
                <option value="all">All Prices</option>
                <option value="under_100">Under $100</option>
                <option value="100_500">$100 - $500</option>
                <option value="over_500">Over $500</option>
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-')
                  setSortBy(field as any)
                  setSortOrder(order as any)
                }}
                className="px-3 py-2 bg-black border border-gray-800 rounded-lg text-white focus:border-luxury-gold focus:outline-none"
              >
                <option value="created_at-desc">Newest First</option>
                <option value="created_at-asc">Oldest First</option>
                <option value="price-desc">Highest Price</option>
                <option value="price-asc">Lowest Price</option>
                <option value="guest_name-asc">Guest A-Z</option>
                <option value="guest_name-desc">Guest Z-A</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Wishes', value: wishes.length, icon: Heart, color: 'text-luxury-gold' },
            { label: 'Total Value', value: `$${totalValue.toLocaleString()}`, icon: DollarSign, color: 'text-green-400' },
            { label: 'Avg Value', value: `$${Math.round(avgWishValue)}`, icon: Tag, color: 'text-blue-400' },
            { label: 'Unique Guests', value: uniqueGuests, icon: User, color: 'text-purple-400' }
          ].map((stat) => (
            <div key={stat.label} className="bg-gray-950 border border-gray-900 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <stat.icon className={cn("w-5 h-5", stat.color)} />
                <span className="text-2xl font-light">{stat.value}</span>
              </div>
              <p className="text-xs tracking-widest uppercase text-gray-600 mt-2">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Top Brands */}
        {topBrands.length > 0 && (
          <div className="bg-gray-950 border border-gray-900 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-medium tracking-wide mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-luxury-gold" />
              Top Brands by Wishes
            </h3>
            <div className="flex flex-wrap gap-3">
              {topBrands.map(([brand, count]) => (
                <div key={brand} className="flex items-center gap-2 px-3 py-1.5 bg-gray-900/50 rounded-full">
                  <span className="text-white">{brand}</span>
                  <span className="text-luxury-gold bg-luxury-gold/20 px-2 py-0.5 rounded-full text-xs">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Wishes Table */}
        <div className="bg-gray-950 border border-gray-900 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Guest
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Look
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Added
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {paginatedWishes.map((wish, idx) => (
                  <motion.tr
                    key={wish.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-gray-900/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                          {wish.product.hero_image ? (
                            <Image
                              src={wish.product.hero_image}
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
                          <p className="font-medium text-white truncate">{wish.product.name}</p>
                          <p className="text-sm text-gray-400">{wish.product.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-white">{wish.guest.name}</p>
                        <p className="text-sm text-gray-400">{wish.guest.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-lg font-medium text-luxury-gold">
                        ${wish.product.price.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {wish.look ? (
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
                        <span className="text-sm text-gray-500">No look assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      <div>
                        <p>{new Date(wish.created_at).toLocaleDateString()}</p>
                        <p className="text-xs">{new Date(wish.created_at).toLocaleTimeString()}</p>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-900/30 border-t border-gray-800">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredWishes.length)} of {filteredWishes.length} wishes
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  <span className="px-3 py-1 text-sm bg-gray-800 rounded">
                    {currentPage} of {totalPages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Empty State */}
        {filteredWishes.length === 0 && !loading && (
          <div className="bg-gray-950 border border-gray-900 rounded-lg p-12 text-center">
            <Heart className="w-12 h-12 mx-auto mb-4 text-gray-700" />
            <p className="text-gray-500">No wishes found</p>
            {search || lookFilter !== 'all' || priceFilter !== 'all' ? (
              <p className="text-sm text-gray-600 mt-2">Try adjusting your filters</p>
            ) : (
              <p className="text-sm text-gray-600 mt-2">No items have been added to wishlists yet</p>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}