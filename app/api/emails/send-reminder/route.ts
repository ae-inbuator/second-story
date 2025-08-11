import { NextRequest, NextResponse } from 'next/server';
import resend from '@/lib/resend';
import { EventReminderEmail } from '@/emails/event-reminder';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId, hoursUntilEvent = 24 } = body;

    // Get all registered guests for the event
    const { data: guests, error: guestsError } = await supabase
      .from('guests')
      .select('*')
      .not('email', 'is', null);

    if (guestsError || !guests) {
      return NextResponse.json(
        { error: 'Failed to fetch guests' },
        { status: 500 }
      );
    }

    // Get event details
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId || '1')
      .single();

    const eventDate = event?.date || 'December 12, 2024';
    const eventTime = '7:00 PM';
    const chapterNumber = event?.chapter_number || 'I';

    // Send emails to all guests
    const emailPromises = guests.map(guest => 
      resend.emails.send({
        from: 'Second Story <noreply@secondstory.com>',
        to: [guest.email],
        subject: hoursUntilEvent === 24 
          ? `Tomorrow: Second Story Chapter ${chapterNumber}`
          : `Starting soon: Second Story Chapter ${chapterNumber}`,
        react: EventReminderEmail({
          guestName: guest.name.split(' ')[0],
          eventDate,
          eventTime,
          hoursUntilEvent,
          location: hoursUntilEvent <= 2 ? 'The Vault, 123 Luxury Lane, New York' : undefined,
          chapterNumber: chapterNumber.toString(),
        }),
      })
    );

    const results = await Promise.allSettled(emailPromises);
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return NextResponse.json({ 
      success: true, 
      sent: successful,
      failed,
      total: guests.length 
    });
  } catch (error) {
    console.error('Email API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}