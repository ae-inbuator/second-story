/**
 * Application Configuration
 * Centralized configuration with environment variables
 */

// Validate required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
] as const

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.warn(`Missing required environment variable: ${envVar}`)
  }
}

// Environment
export const env = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  isClient: typeof window !== 'undefined',
  isServer: typeof window === 'undefined',
} as const

// URLs
export const urls = {
  app: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  socket: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001',
  supabase: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
} as const

// API Keys (only public keys here)
export const keys = {
  supabaseAnon: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
} as const

// Feature Flags
export const features = {
  socialProof: process.env.NEXT_PUBLIC_SHOW_SOCIAL_PROOF === 'true',
  offlineMode: process.env.NEXT_PUBLIC_ENABLE_OFFLINE_MODE === 'true',
  analytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  debugMode: process.env.NEXT_PUBLIC_DEBUG === 'true',
} as const

// Event Configuration
export const event = {
  capacity: parseInt(process.env.NEXT_PUBLIC_EVENT_CAPACITY || '50', 10),
  wishlistHoldDuration: parseInt(process.env.NEXT_PUBLIC_WISHLIST_HOLD_DURATION || '300', 10), // seconds
  checkInWindow: parseInt(process.env.NEXT_PUBLIC_CHECKIN_WINDOW || '30', 10), // minutes before event
} as const

// Performance
export const performance = {
  imageQuality: parseInt(process.env.NEXT_PUBLIC_IMAGE_QUALITY || '85', 10),
  lazyLoadOffset: parseInt(process.env.NEXT_PUBLIC_LAZY_LOAD_OFFSET || '50', 10),
  debounceDelay: parseInt(process.env.NEXT_PUBLIC_DEBOUNCE_DELAY || '300', 10),
  socketReconnectDelay: parseInt(process.env.NEXT_PUBLIC_SOCKET_RECONNECT_DELAY || '1000', 10),
  maxSocketReconnectAttempts: parseInt(process.env.NEXT_PUBLIC_MAX_SOCKET_RECONNECT || '10', 10),
} as const

// Cache Configuration
export const cache = {
  ttl: {
    guest: 60 * 60, // 1 hour
    looks: 5 * 60, // 5 minutes
    products: 10 * 60, // 10 minutes
    analytics: 30, // 30 seconds
  },
  keys: {
    guest: 'second-story:guest',
    looks: 'second-story:looks',
    wishlist: 'second-story:wishlist',
    preferences: 'second-story:preferences',
  },
} as const

// Local Storage Keys
export const storage = {
  authToken: 'second-story-auth',
  guestId: 'second-story-guest-id',
  wishlist: 'second-story-wishlist',
  preferences: 'second-story-preferences',
  lastSync: 'second-story-last-sync',
} as const

// WebSocket Events
export const socketEvents = {
  // Client to Server
  client: {
    join: 'guest:join',
    leave: 'guest:leave',
    wishlistAdd: 'wishlist:add',
    wishlistRemove: 'wishlist:remove',
    heartbeat: 'heartbeat',
  },
  // Server to Client
  server: {
    lookChanged: 'look:changed',
    wishlistUpdated: 'wishlist:updated',
    announcement: 'announcement',
    guestJoined: 'guest:joined',
    guestLeft: 'guest:left',
    statsUpdated: 'stats:updated',
    showStatus: 'show:status',
  },
} as const

// Timeouts and Intervals
export const timing = {
  toastDuration: 4000,
  announcementDuration: 10000,
  statsRefreshInterval: 5000,
  heartbeatInterval: 30000,
  sessionTimeout: 60 * 60 * 1000, // 1 hour
} as const

// Validation
export const validation = {
  name: {
    min: 2,
    max: 50,
    pattern: /^[a-zA-Z\s'-]+$/,
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
} as const

// Export combined config
const config = {
  env,
  urls,
  keys,
  features,
  event,
  performance,
  cache,
  storage,
  socketEvents,
  timing,
  validation,
} as const

export default config