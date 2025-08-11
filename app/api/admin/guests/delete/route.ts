import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const guestId = searchParams.get('id')

    if (!guestId) {
      return NextResponse.json(
        { error: 'Guest ID is required' },
        { status: 400 }
      )
    }

    // Delete the guest
    const { error } = await supabase
      .from('guests')
      .delete()
      .eq('id', guestId)

    if (error) {
      console.error('Failed to delete guest:', error)
      return NextResponse.json(
        { error: 'Failed to delete guest' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Guest deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting guest:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}