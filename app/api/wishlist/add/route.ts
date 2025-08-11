import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  const { guestId, productId, lookId, type, eventId } = await request.json()
  
  // Handle full look wishlist
  if (type === 'full_look' && lookId) {
    // Get all products in the look
    const { data: lookProducts } = await supabase
      .from('look_products')
      .select('product_id')
      .eq('look_id', lookId)
    
    if (!lookProducts || lookProducts.length === 0) {
      return NextResponse.json({ error: 'No products in this look' }, { status: 400 })
    }
    
    // Check if any product from this look is already in wishlist
    const { data: existingLookWish } = await supabase
      .from('wishlists')
      .select('*')
      .eq('guest_id', guestId)
      .eq('look_id', lookId)
      .eq('wish_type', 'full_look')
      .single()
    
    if (existingLookWish) {
      return NextResponse.json({ error: 'Look already in wishlist' }, { status: 400 })
    }
    
    // Get position for the full look
    const { count: lookCount } = await supabase
      .from('wishlists')
      .select('*', { count: 'exact', head: true })
      .eq('look_id', lookId)
      .eq('wish_type', 'full_look')
    
    const lookPosition = (lookCount || 0) + 1
    
    // Add full look to wishlist
    const { data, error } = await supabase
      .from('wishlists')
      .insert([{
        guest_id: guestId,
        look_id: lookId,
        wish_type: 'full_look',
        position: lookPosition,
        event_id: eventId || null
      }])
      .select()
      .single()
    
    if (error) {
      return NextResponse.json({ error: 'Failed to add look' }, { status: 400 })
    }
    
    // Also add individual products from the look with special flag
    const productInserts = lookProducts.map(async (lp) => {
      const { count } = await supabase
        .from('wishlists')
        .select('*', { count: 'exact', head: true })
        .eq('product_id', lp.product_id)
      
      return {
        guest_id: guestId,
        product_id: lp.product_id,
        look_id: lookId,
        wish_type: 'part_of_look',
        position: (count || 0) + 1,
        event_id: eventId || null
      }
    })
    
    await supabase
      .from('wishlists')
      .insert(await Promise.all(productInserts))
    
    return NextResponse.json({
      success: true,
      position: lookPosition,
      totalWanting: lookPosition,
      type: 'full_look'
    })
  }
  
  // Handle individual product wishlist
  if (productId) {
    // Check if already in wishlist
    const { data: existing } = await supabase
      .from('wishlists')
      .select('*')
      .eq('guest_id', guestId)
      .eq('product_id', productId)
      .eq('wish_type', 'individual')
      .single()
    
    if (existing) {
      return NextResponse.json({ error: 'Already in wishlist' }, { status: 400 })
    }
    
    // Get position in queue
    const { count } = await supabase
      .from('wishlists')
      .select('*', { count: 'exact', head: true })
      .eq('product_id', productId)
    
    const position = (count || 0) + 1
    
    // Add to wishlist
    const { data, error } = await supabase
      .from('wishlists')
      .insert([{
        guest_id: guestId,
        product_id: productId,
        look_id: lookId || null,
        wish_type: type || 'individual',
        position: position,
        event_id: eventId || null
      }])
      .select()
      .single()
    
    if (error) {
      return NextResponse.json({ error: 'Failed to add' }, { status: 400 })
    }
    
    // Track analytics
    await supabase
      .from('analytics')
      .insert([{
        event_id: eventId || null,
        guest_id: guestId,
        action: 'wish_add',
        product_id: productId,
        look_id: lookId || null
      }])
    
    return NextResponse.json({
      success: true,
      position: position,
      totalWanting: position,
      type: 'individual'
    })
  }
  
  return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
}