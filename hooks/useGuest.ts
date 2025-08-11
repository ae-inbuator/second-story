import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function useGuest() {
  const [guest, setGuest] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [deviceId, setDeviceId] = useState<string>('')
  
  useEffect(() => {
    // Get or create device ID
    let storedDeviceId = localStorage.getItem('deviceId')
    if (!storedDeviceId) {
      storedDeviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('deviceId', storedDeviceId)
    }
    setDeviceId(storedDeviceId)
    
    // Get guest ID from localStorage
    const storedGuestId = localStorage.getItem('guestId')
    if (storedGuestId) {
      fetchGuest(storedGuestId)
    } else {
      setLoading(false)
    }
  }, [])
  
  async function fetchGuest(id: string) {
    const { data } = await supabase
      .from('guests')
      .select('*')
      .eq('id', id)
      .single()
    
    if (data) {
      setGuest(data)
    }
    setLoading(false)
  }
  
  function setGuestId(id: string) {
    localStorage.setItem('guestId', id)
    fetchGuest(id)
  }
  
  function clearGuest() {
    localStorage.removeItem('guestId')
    setGuest(null)
  }
  
  return { 
    guest, 
    loading, 
    deviceId,
    setGuestId,
    clearGuest
  }
}