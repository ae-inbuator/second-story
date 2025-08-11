import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  const { name } = await request.json()
  
  const { data, error } = await supabase
    .from('guests')
    .select('*')
    .eq('name', name)
    .single()
  
  if (error || !data) {
    return NextResponse.json({ error: 'Guest not found' }, { status: 404 })
  }
  
  await supabase
    .from('guests')
    .update({ checked_in_at: new Date().toISOString() })
    .eq('id', data.id)
  
  return NextResponse.json({
    success: true,
    guestId: data.id,
    sessionToken: Buffer.from(data.id).toString('base64')
  })
}