import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data: wishlists } = await supabase
    .from('wishlists')
    .select(`
      *,
      guests!inner(name, email),
      products!inner(name, brand, price)
    `)
    .order('position')
  
  if (!wishlists) {
    return NextResponse.json({ error: 'No data' }, { status: 404 })
  }
  
  // Create CSV
  const csv = [
    'Guest Name,Email,Product,Brand,Price,Position,Added At',
    ...wishlists.map(w => 
      `"${w.guests.name}","${w.guests.email}","${w.products.name}","${w.products.brand}",${w.products.price},${w.position},"${w.added_at}"`
    )
  ].join('\n')
  
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="wishlists.csv"'
    }
  })
}