'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { 
  ArrowLeft, 
  Home,
  LogOut,
  Settings,
  Package,
  Sparkles,
  BarChart3,
  Download,
  Users,
  Eye,
  Activity,
  Heart,
  ChevronRight
} from 'lucide-react'
import { auth } from '@/lib/auth'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface AdminLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  showBackButton?: boolean
  backUrl?: string
}

export function AdminLayout({ 
  children, 
  title, 
  subtitle,
  showBackButton = false,
  backUrl = '/admin'
}: AdminLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false)

  // Check authentication only once on mount, not on every route change
  useEffect(() => {
    // Only check auth if we haven't checked it yet
    if (!hasCheckedAuth) {
      const checkAuth = () => {
        const authenticated = auth.isAuthenticated()
        setIsAuthenticated(authenticated)
        setIsLoading(false)
        setHasCheckedAuth(true)
        
        if (!authenticated) {
          router.replace(`/admin/login?redirect=${encodeURIComponent(pathname)}`)
        }
      }

      checkAuth()
    }
  }, [hasCheckedAuth, pathname, router])

  // Separate effect to handle route changes after initial auth
  useEffect(() => {
    // Only run this if we've already done the initial auth check
    if (hasCheckedAuth && isAuthenticated) {
      // Optional: Do a quick auth revalidation on route changes
      // But don't redirect, just update state
      const revalidateAuth = () => {
        const stillAuth = auth.isAuthenticated()
        if (!stillAuth) {
          // Lost authentication, redirect to login
          setIsAuthenticated(false)
          router.replace(`/admin/login?redirect=${encodeURIComponent(pathname)}`)
        }
      }

      // Only revalidate on significant route changes (not sub-navigation)
      const isSignificantChange = pathname.split('/').length <= 3 // e.g., /admin or /admin/guests
      if (isSignificantChange) {
        revalidateAuth()
      }
    }
  }, [pathname, router, hasCheckedAuth, isAuthenticated])

  // Handle logout
  const handleLogout = useCallback(() => {
    auth.logout()
    router.replace('/admin/login')
  }, [router])

  // Handle back navigation with proper browser history
  const handleBack = useCallback(() => {
    if (backUrl) {
      // Use push instead of replace to maintain proper history
      router.push(backUrl)
    } else {
      // Prefer using the browser's native back functionality
      // This preserves the proper navigation stack
      if (typeof window !== 'undefined' && window.history.length > 1) {
        window.history.back()
      } else {
        // Fallback to admin home only if no history
        router.push('/admin')
      }
    }
  }, [backUrl, router])

  // Generate breadcrumbs
  const getBreadcrumbs = () => {
    const parts = pathname.split('/').filter(Boolean)
    const breadcrumbs = []
    
    // Always start with Admin
    breadcrumbs.push({ label: 'Admin', href: '/admin', icon: Settings })
    
    if (parts.length > 1) {
      const section = parts[1]
      const sectionMap: Record<string, { label: string; icon: any }> = {
        'guests': { label: 'Guests', icon: Users },
        'checkins': { label: 'Check-ins', icon: Eye },
        'active': { label: 'Active', icon: Activity },
        'wishes': { label: 'Wishes', icon: Heart },
        'products': { label: 'Products', icon: Package },
        'looks': { label: 'Looks', icon: Sparkles },
        'analytics': { label: 'Analytics', icon: BarChart3 },
        'export': { label: 'Export', icon: Download },
      }
      
      if (sectionMap[section]) {
        breadcrumbs.push({
          label: sectionMap[section].label,
          href: `/admin/${section}`,
          icon: sectionMap[section].icon
        })
      }
    }
    
    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs()

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-luxury-gold"></div>
      </div>
    )
  }

  // If not authenticated, don't render anything (will redirect)
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-black border-b border-gray-900 sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Left side - Logo and Navigation */}
            <div className="flex items-center gap-4">
              {/* Logo */}
              <Link href="/admin">
                <Image 
                  src="/logo.png" 
                  alt="Second Story" 
                  width={120} 
                  height={36} 
                  className="opacity-90 hover:opacity-100 transition-opacity"
                />
              </Link>
              <div className="w-px h-6 bg-gray-800" />
              {/* Back button or breadcrumbs */}
              {showBackButton ? (
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="hidden sm:inline">Back</span>
                </button>
              ) : (
                <nav className="flex items-center gap-2">
                  {breadcrumbs.map((crumb, index) => (
                    <div key={crumb.href} className="flex items-center gap-2">
                      <Link
                        href={crumb.href}
                        className={cn(
                          "flex items-center gap-2 text-sm transition-colors",
                          index === breadcrumbs.length - 1
                            ? "text-luxury-gold"
                            : "text-gray-400 hover:text-white"
                        )}
                      >
                        <crumb.icon className="w-4 h-4" />
                        <span className="hidden sm:inline">{crumb.label}</span>
                      </Link>
                      {index < breadcrumbs.length - 1 && (
                        <ChevronRight className="w-4 h-4 text-gray-600" />
                      )}
                    </div>
                  ))}
                </nav>
              )}
              
              {/* Title section */}
              {(title || subtitle) && (
                <>
                  <div className="w-px h-6 bg-gray-800" />
                  <div>
                    {title && (
                      <h1 className="font-playfair text-xl sm:text-2xl">{title}</h1>
                    )}
                    {subtitle && (
                      <p className="text-xs tracking-widest uppercase text-gray-500 mt-1">
                        {subtitle}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
            
            {/* Right side - Actions */}
            <div className="flex items-center gap-3">
              {/* Home button */}
              <Link
                href="/admin"
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  pathname === '/admin'
                    ? "bg-luxury-gold/20 text-luxury-gold"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                )}
                title="Admin Home"
              >
                <Home className="w-5 h-5" />
              </Link>
              
              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative">
        {children}
      </main>
    </div>
  )
}