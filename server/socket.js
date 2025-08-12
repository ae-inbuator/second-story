/**
 * Enhanced WebSocket Server for Second Story
 * Handles real-time communication with improved reliability
 */

const { createServer } = require('http')
const { Server } = require('socket.io')

// Load environment variables
const PORT = process.env.PORT || process.env.SOCKET_PORT || 3001
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000'
const NODE_ENV = process.env.NODE_ENV || 'development'

// Allow multiple origins in production
const allowedOrigins = NODE_ENV === 'production' 
  ? [
      'https://second-story-three.vercel.app',
      'https://second-story.vercel.app',
      'https://*.vercel.app',
      CLIENT_URL
    ]
  : ['http://localhost:3000', 'http://localhost:3001']

const httpServer = createServer()
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket', 'polling']
})

// Track connected clients
const connectedGuests = new Map()
const roomStats = {
  totalConnections: 0,
  activeGuests: 0,
  currentLook: null
}

io.on('connection', (socket) => {
  console.log(`[${new Date().toISOString()}] Client connected:`, socket.id)
  roomStats.totalConnections++
  
  // Handle guest join
  socket.on('guest:join', ({ guestId }) => {
    if (guestId) {
      connectedGuests.set(socket.id, { guestId, joinedAt: new Date() })
      roomStats.activeGuests = connectedGuests.size
      socket.join(`guest:${guestId}`)
      console.log(`Guest ${guestId} joined`)
      
      // Notify others
      socket.broadcast.emit('guest:joined', { 
        totalGuests: roomStats.activeGuests 
      })
    }
  })
  
  // Handle guest leave
  socket.on('guest:leave', ({ guestId }) => {
    if (guestId) {
      socket.leave(`guest:${guestId}`)
      connectedGuests.delete(socket.id)
      roomStats.activeGuests = connectedGuests.size
      
      // Notify others
      socket.broadcast.emit('guest:left', { 
        totalGuests: roomStats.activeGuests 
      })
    }
  })
  
  // Handle look changes (admin)
  socket.on('look:change', (data) => {
    console.log('Look changed:', data)
    roomStats.currentLook = data.lookId
    io.emit('look:changed', data)
  })
  
  // Handle wishlist updates
  socket.on('wishlist:add', (data) => {
    // Broadcast to all except sender
    socket.broadcast.emit('wishlist:updated', {
      ...data,
      timestamp: new Date().toISOString()
    })
  })
  
  socket.on('wishlist:remove', (data) => {
    socket.broadcast.emit('wishlist:updated', {
      ...data,
      removed: true,
      timestamp: new Date().toISOString()
    })
  })
  
  // Handle announcements (admin)
  socket.on('announcement', (data) => {
    console.log('Announcement:', data.message)
    io.emit('announcement', {
      ...data,
      timestamp: new Date().toISOString()
    })
  })
  
  // Handle stats request (admin)
  socket.on('stats:request', () => {
    socket.emit('stats:updated', {
      ...roomStats,
      timestamp: new Date().toISOString()
    })
  })
  
  // Handle ping for latency measurement
  socket.on('ping', (timestamp) => {
    socket.emit('pong', timestamp)
  })
  
  // Handle heartbeat
  socket.on('heartbeat', () => {
    socket.emit('heartbeat:ack')
  })
  
  // Handle disconnection
  socket.on('disconnect', (reason) => {
    console.log(`[${new Date().toISOString()}] Client disconnected:`, socket.id, 'Reason:', reason)
    
    const guest = connectedGuests.get(socket.id)
    if (guest) {
      connectedGuests.delete(socket.id)
      roomStats.activeGuests = connectedGuests.size
      
      // Notify others
      socket.broadcast.emit('guest:left', { 
        totalGuests: roomStats.activeGuests 
      })
    }
  })
  
  // Handle errors
  socket.on('error', (error) => {
    console.error('Socket error:', error)
  })
})

// Periodic stats broadcast
setInterval(() => {
  io.emit('stats:updated', {
    ...roomStats,
    timestamp: new Date().toISOString()
  })
}, 30000) // Every 30 seconds

// Error handling
io.on('error', (error) => {
  console.error('Server error:', error)
})

// Start server
httpServer.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════════╗
  ║                                            ║
  ║     SECOND STORY WebSocket Server          ║
  ║                                            ║
  ║     Environment: ${NODE_ENV.padEnd(26)}║
  ║     Port: ${String(PORT).padEnd(33)}║
  ║     Status: Running                        ║
  ║                                            ║
  ╚════════════════════════════════════════════╝
  `)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing connections...')
  io.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('SIGINT received, closing connections...')
  io.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})