'use client'

// Simple authentication utilities for admin panel
const ADMIN_PASSWORD = 'secondstory123$$'
const AUTH_COOKIE_NAME = 'admin-auth'

// Cache auth status to avoid repeated checks
let _authCache: { isAuth: boolean; timestamp: number } | null = null
const CACHE_DURATION = 1000 // Cache for 1 second to avoid rapid re-checks

export const auth = {
  // Check if user is authenticated
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false
    
    // Use cached result if still valid
    const now = Date.now()
    if (_authCache && (now - _authCache.timestamp) < CACHE_DURATION) {
      return _authCache.isAuth
    }
    
    try {
      // Prioritize localStorage (faster and more reliable)
      const localAuth = localStorage.getItem(AUTH_COOKIE_NAME)
      
      // If localStorage has auth, we're good
      if (localAuth === ADMIN_PASSWORD) {
        _authCache = { isAuth: true, timestamp: now }
        return true
      }
      
      // Fallback to cookie check
      const cookieAuth = document.cookie
        .split('; ')
        .find(row => row.startsWith(AUTH_COOKIE_NAME + '='))
        ?.split('=')[1]
      
      const isAuth = cookieAuth === ADMIN_PASSWORD
      _authCache = { isAuth, timestamp: now }
      
      return isAuth
    } catch {
      _authCache = { isAuth: false, timestamp: now }
      return false
    }
  },
  
  // Clear auth cache (useful after login/logout)
  _clearCache(): void {
    _authCache = null
  },

  // Login with password
  login(password: string): boolean {
    if (password === ADMIN_PASSWORD) {
      try {
        // Set both localStorage and cookie for redundancy
        localStorage.setItem(AUTH_COOKIE_NAME, password)
        document.cookie = `${AUTH_COOKIE_NAME}=${password}; path=/; max-age=${7 * 24 * 60 * 60}` // 7 days
        // Clear cache to force fresh check
        this._clearCache()
        return true
      } catch {
        return false
      }
    }
    return false
  },

  // Logout
  logout(): void {
    try {
      localStorage.removeItem(AUTH_COOKIE_NAME)
      document.cookie = `${AUTH_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
      // Clear cache
      this._clearCache()
    } catch {
      // Ignore errors in logout
    }
  },

  // Get redirect URL after login
  getRedirectUrl(): string {
    if (typeof window === 'undefined') return '/admin'
    
    const params = new URLSearchParams(window.location.search)
    return params.get('redirect') || '/admin'
  }
}