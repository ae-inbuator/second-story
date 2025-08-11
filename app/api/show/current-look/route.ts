import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Get current active look
    const { data: currentLook, error } = await supabase
      .from('looks')
      .select(`
        *,
        look_products (
          product_id,
          display_order,
          products (*)
        )
      `)
      .eq('active', true)
      .single()
    
    if (error) {
      console.error('Error fetching current look:', error)
      return NextResponse.json({ currentLook: null })
    }
    
    return NextResponse.json({ currentLook })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ currentLook: null })
  }
}

export async function POST(request: Request) {
  try {
    const { lookId } = await request.json()
    
    // Deactivate all looks first
    await supabase
      .from('looks')
      .update({ active: false })
      .neq('id', 'none')
    
    // Activate the selected look
    const { data, error } = await supabase
      .from('looks')
      .update({ active: true })
      .eq('id', lookId)
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json({ success: true, currentLook: data })
  } catch (error) {
    console.error('Error updating current look:', error)
    return NextResponse.json({ error: 'Failed to update look' }, { status: 500 })
  }
}