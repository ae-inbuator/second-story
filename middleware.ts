import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Only apply middleware to admin routes
  if (pathname.startsWith('/admin')) {
    // Allow access to login page
    if (pathname === '/admin/login') {
      return NextResponse.next()
    }
    
    // Check for auth token in cookies - be more permissive
    const authToken = request.cookies.get('admin-auth')?.value
    
    // Only redirect if we're absolutely sure there's no auth
    // Let AdminLayout handle the detailed auth checking
    if (!authToken) {
      // Check if this might be a navigation from an authenticated session
      const referer = request.headers.get('referer')
      const isFromAdminArea = referer && referer.includes('/admin')
      
      // If coming from admin area, let AdminLayout handle it (might have localStorage auth)
      if (isFromAdminArea) {
        return NextResponse.next()
      }
      
      // Only redirect to login for fresh visits without any auth evidence
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
    
    // Validate the token
    if (authToken !== 'secondstory123$$') {
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all admin routes except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/admin/:path*',
  ],
}