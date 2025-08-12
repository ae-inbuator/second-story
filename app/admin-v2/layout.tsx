'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { 
  LayoutDashboard,
  Radio,
  Package,
  Sparkles,
  BarChart3,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Command,
  ChevronRight,
  Activity,
  Heart,
  Eye,
  Calendar,
  Mail,
  Download,
  Bell,
  Search,
  Beta
} from 'lucide-react'
import { auth } from '@/lib/auth'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { Toaster } from 'react-hot-toast'
import { CommandPalette } from './components/shared/CommandPalette'

const navigation = [
  { name: 'Dashboard', href: '/admin-v2', icon: LayoutDashboard },
  { name: 'Show Control', href: '/admin-v2/show-control', icon: Radio },
  { name: 'Products', href: '/admin-v2/products', icon: Package },
  { name: 'Looks', href: '/admin-v2/looks', icon: Sparkles },
  { name: 'Analytics', href: '/admin-v2/analytics', icon: BarChart3 },
  { name: 'Guests', href: '/admin-v2/guests', icon: Users },
  { name: 'Check-ins', href: '/admin-v2/checkins', icon: Eye },
  { name: 'Wishes', href: '/admin-v2/wishes', icon: Heart },
  { name: 'Events', href: '/admin-v2/events', icon: Calendar },
  { name: 'Invitations', href: '/admin-v2/invitations', icon: Mail },
]

const quickActions = [
  { key: 'g', label: 'Go to...', icon: ChevronRight },
  { key: 's', label: 'Search', icon: Search },
  { key: 'n', label: 'Notifications', icon: Bell },
  { key: 'e', label: 'Export', icon: Download },
]

export default function AdminV2Layout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = auth.isAuthenticated()
      setIsAuthenticated(authenticated)
      setIsLoading(false)
      
      if (!authenticated) {
        router.replace(`/admin/login?redirect=${encodeURIComponent(pathname)}`)
      }
    }
    checkAuth()
  }, [pathname, router])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandPaletteOpen(true)
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault()
        setSidebarOpen(!sidebarOpen)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [sidebarOpen])

  const handleLogout = () => {
    auth.logout()
    router.replace('/admin/login')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-luxury-gold"></div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-black text-white">
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1a1a',
            color: '#fff',
            border: '1px solid #333',
          },
        }}
      />

      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 bg-gray-900 rounded-lg border border-gray-800"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {(sidebarOpen || mobileMenuOpen) && (
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={cn(
              "fixed inset-y-0 left-0 z-40 w-72 bg-gray-950 border-r border-gray-900",
              "lg:translate-x-0",
              mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            )}
          >
            <div className="flex flex-col h-full">
              {/* Logo */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-900">
                <Link href="/admin-v2" className="flex items-center gap-3">
                  <Image 
                    src="/logo.png" 
                    alt="Second Story" 
                    width={120} 
                    height={36} 
                    className="opacity-90 hover:opacity-100 transition-opacity"
                  />
                  <span className="px-2 py-0.5 bg-luxury-gold/20 text-luxury-gold text-xs rounded-full font-medium">
                    v2.0
                  </span>
                </Link>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="hidden lg:block p-1 hover:bg-gray-800 rounded"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {/* Quick Actions */}
              <div className="px-4 py-3 border-b border-gray-900">
                <button
                  onClick={() => setCommandPaletteOpen(true)}
                  className="w-full flex items-center gap-3 px-3 py-2 bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors group"
                >
                  <Search className="w-4 h-4 text-gray-500 group-hover:text-white" />
                  <span className="text-sm text-gray-500 group-hover:text-white">Quick search...</span>
                  <kbd className="ml-auto px-2 py-0.5 bg-gray-800 text-xs rounded">⌘K</kbd>
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                {navigation.map((item) => {
                  const isActive = pathname === item.href || 
                    (item.href !== '/admin-v2' && pathname.startsWith(item.href))
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
                        isActive
                          ? "bg-luxury-gold/20 text-luxury-gold"
                          : "text-gray-400 hover:text-white hover:bg-gray-900"
                      )}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      <span className="font-medium">{item.name}</span>
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="ml-auto w-1 h-4 bg-luxury-gold rounded-full"
                        />
                      )}
                    </Link>
                  )
                })}
              </nav>

              {/* Beta Feedback */}
              <div className="px-4 py-3 border-t border-gray-900">
                <Link
                  href="/admin"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-white transition-colors"
                >
                  <Beta className="w-4 h-4" />
                  <span>Back to Classic Admin</span>
                </Link>
              </div>

              {/* User Menu */}
              <div className="px-4 py-4 border-t border-gray-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-luxury-gold/20 rounded-full flex items-center justify-center">
                      <span className="text-luxury-gold text-sm font-bold">A</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Admin</p>
                      <p className="text-xs text-gray-500">admin@secondstory.com</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className={cn(
        "transition-all duration-300",
        sidebarOpen ? "lg:pl-72" : "lg:pl-0"
      )}>
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-black/80 backdrop-blur-sm border-b border-gray-900">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              {!sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="hidden lg:block p-2 hover:bg-gray-900 rounded-lg transition-colors"
                >
                  <Menu className="w-5 h-5" />
                </button>
              )}
              {/* Breadcrumbs will go here */}
            </div>
            
            {/* Right side actions */}
            <div className="flex items-center gap-3">
              <button className="relative p-2 text-gray-400 hover:text-white hover:bg-gray-900 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-luxury-gold rounded-full" />
              </button>
              <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-900 rounded-lg transition-colors">
                <Activity className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-900 rounded-lg transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>

      {/* Command Palette */}
      <CommandPalette 
        open={commandPaletteOpen} 
        onClose={() => setCommandPaletteOpen(false)} 
      />
    </div>
  )
}