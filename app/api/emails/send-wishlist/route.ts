import { NextRequest, NextResponse } from 'next/server';
import resend from '@/lib/resend';
import { WishlistSummaryEmail } from '@/emails/wishlist-summary';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { guestId, eventId } = body;

    // Get guest details
    const { data: guest, error: guestError } = await supabase
      .from('guests')
      .select('*')
      .eq('id', guestId)
      .single();

    if (guestError || !guest) {
      return NextResponse.json(
        { error: 'Guest not found' },
        { status: 404 }
      );
    }

    // Get wishlist items with product details
    const { data: wishlistItems, error: wishlistError } = await supabase
      .from('wishlists')
      .select(`
        *,
        products (
          name,
          brand,
          price,
          images
        )
      `)
      .eq('guest_id', guestId)
      .eq('event_id', eventId || '1');

    if (wishlistError) {
      return NextResponse.json(
        { error: 'Failed to fetch wishlist' },
        { status: 500 }
      );
    }

    // Format items for email
    const items = wishlistItems?.map(item => ({
      name: item.products?.name || 'Unknown Item',
      brand: item.products?.brand || 'Unknown Brand',
      price: item.products?.price || 0,
      position: item.position || 1,
      imageUrl: item.products?.images?.[0] || undefined,
    })) || [];

    // Get event details
    const { data: event } = await supabase
      .from('events')
      .select('chapter_number')
      .eq('id', eventId || '1')
      .single();

    const { data, error } = await resend.emails.send({
      from: 'Second Story <noreply@secondstory.com>',
      to: [guest.email],
      subject: `Your wishlist from Second Story Chapter ${event?.chapter_number || 'I'}`,
      react: WishlistSummaryEmail({
        guestName: guest.name.split(' ')[0],
        items: items.slice(0, 10), // Show top 10 items
        totalItems: items.length,
        chapterNumber: event?.chapter_number?.toString() || 'I',
      }),
    });

    if (error) {
      console.error('Failed to send email:', error);
      return NextResponse.json(
        { error: 'Failed to send wishlist email' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Email API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}