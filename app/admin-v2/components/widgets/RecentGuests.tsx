'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Users, ChevronRight, User, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Guest {
  id: string
  name: string
  email: string
  checked_in_at?: string
  created_at: string
}

export function RecentGuests() {
  const router = useRouter()
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecentGuests()
  }, [])

  async function fetchRecentGuests() {
    try {
      const { data } = await supabase
        .from('guests')
        .select('id, name, email, checked_in_at, created_at')
        .order('created_at', { ascending: false })
        .limit(5)

      setGuests(data || [])
    } catch (error) {
      console.error('Failed to fetch recent guests:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gray-950 border border-gray-900 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-luxury-gold" />
          <h3 className="font-medium">Recent Guests</h3>
        </div>
        <button
          onClick={() => router.push('/admin-v2/guests')}
          className="text-xs text-gray-500 hover:text-white transition-colors flex items-center gap-1"
        >
          View all
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-8 h-8 bg-gray-800 rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-gray-800 rounded w-3/4 mb-1" />
                <div className="h-3 bg-gray-800 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : guests.length > 0 ? (
        <div className="space-y-3">
          {guests.map((guest) => (
            <button
              key={guest.id}
              onClick={() => router.push(`/admin-v2/guests?id=${guest.id}`)}
              className="w-full flex items-center gap-3 p-2 hover:bg-gray-900 rounded-lg transition-colors text-left group"
            >
              <div className="w-8 h-8 bg-luxury-gold/20 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-luxury-gold" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate group-hover:text-luxury-gold transition-colors">
                  {guest.name}
                </p>
                <p className="text-xs text-gray-500 truncate">{guest.email}</p>
              </div>
              {guest.checked_in_at && (
                <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                  Checked in
                </span>
              )}
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Users className="w-8 h-8 mx-auto mb-2 text-gray-700" />
          <p className="text-sm">No guests yet</p>
        </div>
      )}
    </div>
  )
}