import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  // Get all stats
  const [guests, wishes, topProducts] = await Promise.all([
    supabase.from('guests').select('*'),
    supabase.from('wishlists').select('*'),
    supabase.from('wishlists')
      .select('product_id, products!inner(name, brand, price)')
      .order('added_at', { ascending: false })
      .limit(10)
  ])
  
  const stats = {
    totalGuests: guests.data?.length || 0,
    checkedIn: guests.data?.filter(g => g.checked_in_at).length || 0,
    totalWishes: wishes.data?.length || 0,
    topProducts: topProducts.data || []
  }
  
  return NextResponse.json(stats)
}