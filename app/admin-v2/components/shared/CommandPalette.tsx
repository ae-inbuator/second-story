'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Command,
  Home,
  Radio,
  Package,
  Sparkles,
  BarChart3,
  Users,
  Eye,
  Heart,
  Calendar,
  Mail,
  Settings,
  LogOut,
  ArrowRight,
  Hash,
  User,
  FileText,
  Bell,
  Send,
  Upload,
  Download,
  Plus,
  Clock,
  Activity
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface CommandItem {
  id: string
  title: string
  description?: string
  icon: any
  type: 'navigation' | 'action' | 'search'
  action?: () => void
  href?: string
  keywords?: string[]
  shortcut?: string
}

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const navigationCommands: CommandItem[] = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      description: 'Go to dashboard',
      icon: Home,
      type: 'navigation',
      href: '/admin-v2',
      keywords: ['home', 'main', 'overview']
    },
    {
      id: 'show-control',
      title: 'Show Control',
      description: 'Manage live show',
      icon: Radio,
      type: 'navigation',
      href: '/admin-v2/show-control',
      keywords: ['live', 'control', 'show'],
      shortcut: '⌘S'
    },
    {
      id: 'products',
      title: 'Products',
      description: 'Manage products',
      icon: Package,
      type: 'navigation',
      href: '/admin-v2/products',
      keywords: ['items', 'catalog']
    },
    {
      id: 'looks',
      title: 'Looks',
      description: 'Manage runway looks',
      icon: Sparkles,
      type: 'navigation',
      href: '/admin-v2/looks',
      keywords: ['runway', 'fashion']
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'View analytics',
      icon: BarChart3,
      type: 'navigation',
      href: '/admin-v2/analytics',
      keywords: ['stats', 'metrics', 'reports'],
      shortcut: '⌘A'
    },
    {
      id: 'guests',
      title: 'Guests',
      description: 'Manage guests',
      icon: Users,
      type: 'navigation',
      href: '/admin-v2/guests',
      keywords: ['people', 'attendees']
    }
  ]

  const actionCommands: CommandItem[] = [
    {
      id: 'send-announcement',
      title: 'Send Announcement',
      description: 'Broadcast to all guests',
      icon: Bell,
      type: 'action',
      action: () => {
        router.push('/admin-v2/show-control#announcement')
        onClose()
      },
      keywords: ['broadcast', 'message', 'notify']
    },
    {
      id: 'add-guest',
      title: 'Add Guest',
      description: 'Quick add new guest',
      icon: Plus,
      type: 'action',
      action: () => {
        router.push('/admin-v2/guests#add')
        onClose()
      },
      keywords: ['new', 'create', 'invite']
    },
    {
      id: 'upload-product',
      title: 'Upload Product',
      description: 'Add new product',
      icon: Upload,
      type: 'action',
      action: () => {
        router.push('/admin-v2/products#upload')
        onClose()
      },
      keywords: ['new', 'add', 'create']
    },
    {
      id: 'export-data',
      title: 'Export Data',
      description: 'Download reports',
      icon: Download,
      type: 'action',
      action: () => {
        toast.success('Export started...')
        onClose()
      },
      keywords: ['download', 'csv', 'report']
    },
    {
      id: 'go-live',
      title: 'Go Live',
      description: 'Start the show',
      icon: Radio,
      type: 'action',
      action: async () => {
        await supabase
          .from('events')
          .update({ show_status: 'live' })
          .eq('status', 'upcoming')
        toast.success('Show is now LIVE!', { icon: '🎬' })
        onClose()
      },
      keywords: ['start', 'begin', 'launch']
    }
  ]

  const allCommands = [...navigationCommands, ...actionCommands]

  // Filter commands based on search
  const filteredCommands = search
    ? allCommands.filter(cmd => {
        const searchLower = search.toLowerCase()
        return (
          cmd.title.toLowerCase().includes(searchLower) ||
          cmd.description?.toLowerCase().includes(searchLower) ||
          cmd.keywords?.some(k => k.toLowerCase().includes(searchLower))
        )
      })
    : allCommands

  // Search in database
  useEffect(() => {
    if (search.startsWith('#')) {
      searchDatabase(search.slice(1))
    }
  }, [search])

  async function searchDatabase(query: string) {
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      // Search guests
      const { data: guests } = await supabase
        .from('guests')
        .select('id, name, email')
        .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(3)

      // Search products
      const { data: products } = await supabase
        .from('products')
        .select('id, name, brand')
        .or(`name.ilike.%${query}%,brand.ilike.%${query}%`)
        .limit(3)

      const results = [
        ...(guests || []).map(g => ({
          id: g.id,
          title: g.name,
          description: g.email,
          icon: User,
          type: 'search' as const,
          action: () => {
            router.push(`/admin-v2/guests?id=${g.id}`)
            onClose()
          }
        })),
        ...(products || []).map(p => ({
          id: p.id,
          title: p.brand,
          description: p.name,
          icon: Package,
          type: 'search' as const,
          action: () => {
            router.push(`/admin-v2/products?id=${p.id}`)
            onClose()
          }
        }))
      ]

      setSearchResults(results)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setIsSearching(false)
    }
  }

  // Handle keyboard navigation
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const items = search.startsWith('#') ? searchResults : filteredCommands
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => Math.min(prev + 1, items.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => Math.max(prev - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          const selected = items[selectedIndex]
          if (selected) {
            if (selected.href) {
              router.push(selected.href)
              onClose()
            } else if (selected.action) {
              selected.action()
            }
          }
          break
        case 'Escape':
          onClose()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, selectedIndex, filteredCommands, searchResults, search, router, onClose])

  // Focus input when opened
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
      setSelectedIndex(0)
      setSearch('')
    }
  }, [open])

  const displayItems = search.startsWith('#') ? searchResults : filteredCommands

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center pt-20 px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -20 }}
            className="bg-gray-950 border border-gray-800 rounded-lg w-full max-w-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800">
              <Search className="w-5 h-5 text-gray-500 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Type a command or search... (use # for database search)"
                className="flex-1 bg-transparent text-white placeholder:text-gray-500 focus:outline-none"
              />
              <kbd className="px-2 py-0.5 bg-gray-800 text-xs rounded">ESC</kbd>
            </div>

            {/* Quick Tips */}
            {!search && (
              <div className="px-4 py-2 border-b border-gray-800 flex items-center gap-4 text-xs text-gray-500">
                <span>Quick tips:</span>
                <span className="flex items-center gap-1">
                  <Hash className="w-3 h-3" />
                  Search database
                </span>
                <span className="flex items-center gap-1">
                  <ArrowRight className="w-3 h-3" />
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <Command className="w-3 h-3" />K
                  Open anytime
                </span>
              </div>
            )}

            {/* Results */}
            <div className="max-h-96 overflow-y-auto p-2">
              {isSearching ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-luxury-gold"></div>
                </div>
              ) : displayItems.length > 0 ? (
                <div className="space-y-1">
                  {/* Group by type */}
                  {['navigation', 'action', 'search'].map(type => {
                    const items = displayItems.filter(item => item.type === type)
                    if (items.length === 0) return null

                    return (
                      <div key={type}>
                        <div className="px-2 py-1 text-xs text-gray-500 uppercase tracking-wider">
                          {type === 'search' ? 'Search Results' : type}
                        </div>
                        {items.map((item, index) => {
                          const globalIndex = displayItems.indexOf(item)
                          const isSelected = selectedIndex === globalIndex

                          return (
                            <button
                              key={item.id}
                              onClick={() => {
                                if (item.href) {
                                  router.push(item.href)
                                  onClose()
                                } else if (item.action) {
                                  item.action()
                                }
                              }}
                              className={cn(
                                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                                isSelected
                                  ? "bg-luxury-gold/20 text-luxury-gold"
                                  : "hover:bg-gray-900 text-gray-300 hover:text-white"
                              )}
                            >
                              <item.icon className="w-5 h-5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{item.title}</p>
                                {item.description && (
                                  <p className="text-xs text-gray-500 truncate">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                              {item.shortcut && (
                                <kbd className="px-2 py-0.5 bg-gray-800 text-xs rounded">
                                  {item.shortcut}
                                </kbd>
                              )}
                              {item.type === 'navigation' && (
                                <ArrowRight className="w-4 h-4 text-gray-500" />
                              )}
                            </button>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Search className="w-8 h-8 mx-auto mb-2 text-gray-700" />
                  <p className="text-sm">No results found</p>
                  <p className="text-xs mt-1">Try a different search term</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-gray-800 flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-gray-800 rounded">↑↓</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-gray-800 rounded">↵</kbd>
                  Select
                </span>
              </div>
              <span>Admin v2.0</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}