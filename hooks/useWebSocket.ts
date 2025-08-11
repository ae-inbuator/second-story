/**
 * Enhanced WebSocket Hook
 * Handles connection, reconnection, and offline states
 */

import { useEffect, useState, useCallback, useRef } from 'react'
import io, { Socket } from 'socket.io-client'
import toast from 'react-hot-toast'

interface UseWebSocketOptions {
  autoConnect?: boolean
  reconnectAttempts?: number
  reconnectDelay?: number
  showToasts?: boolean
}

export function useWebSocket(url?: string, options: UseWebSocketOptions = {}) {
  const {
    autoConnect = true,
    reconnectAttempts = 10,
    reconnectDelay = 1000,
    showToasts = true
  } = options

  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isReconnecting, setIsReconnecting] = useState(false)
  const [lastMessage, setLastMessage] = useState<any>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (!autoConnect) return

    const socketUrl = url || process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'
    const socketIo = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: reconnectDelay,
      reconnectionAttempts: reconnectAttempts,
      timeout: 10000,
    })

    socketIo.on('connect', () => {
      console.log('Connected to WebSocket')
      setIsConnected(true)
      setIsReconnecting(false)
      if (showToasts) {
        toast.success('Connected', { duration: 2000, icon: '🟢' })
      }
    })

    socketIo.on('disconnect', (reason) => {
      console.log('Disconnected from WebSocket:', reason)
      setIsConnected(false)
      if (showToasts && reason !== 'io client disconnect') {
        toast.error('Connection lost', { duration: 3000, icon: '🔴' })
      }
    })

    socketIo.on('reconnect_attempt', (attemptNumber) => {
      setIsReconnecting(true)
      console.log(`Reconnection attempt ${attemptNumber}`)
    })

    socketIo.on('reconnect_failed', () => {
      setIsReconnecting(false)
      if (showToasts) {
        toast.error('Failed to reconnect', { duration: 5000 })
      }
    })

    socketIo.on('message', (data) => {
      setLastMessage(data)
    })

    setSocket(socketIo)

    // Handle online/offline events
    const handleOnline = () => {
      if (!socketIo.connected) {
        socketIo.connect()
      }
    }
    
    const handleOffline = () => {
      if (showToasts) {
        toast.error('You are offline', { duration: Infinity, icon: '📵' })
      }
    }
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      socketIo.disconnect()
    }
  }, [url, autoConnect, reconnectDelay, reconnectAttempts, showToasts])

  const emit = useCallback((event: string, data?: any) => {
    if (socket && isConnected) {
      socket.emit(event, data)
      return true
    }
    console.warn('Socket not connected, queueing event:', event)
    return false
  }, [socket, isConnected])

  const on = useCallback((event: string, handler: (data: any) => void) => {
    if (socket) {
      socket.on(event, handler)
      return () => {
        socket.off(event, handler)
      }
    }
    return () => {}
  }, [socket])

  const off = useCallback((event: string, handler?: (data: any) => void) => {
    if (socket) {
      if (handler) {
        socket.off(event, handler)
      } else {
        socket.off(event)
      }
    }
  }, [socket])

  const connect = useCallback(() => {
    if (socket && !socket.connected) {
      socket.connect()
    }
  }, [socket])

  const disconnect = useCallback(() => {
    if (socket && socket.connected) {
      socket.disconnect()
    }
  }, [socket])

  return {
    socket,
    isConnected,
    isReconnecting,
    lastMessage,
    emit,
    on,
    off,
    connect,
    disconnect
  }
}