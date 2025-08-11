import { NextRequest, NextResponse } from 'next/server';
import resend from '@/lib/resend';
import { RegistrationConfirmationEmail } from '@/emails/registration-confirmation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, guestName, eventDate, eventTime, spotNumber, totalSpots, chapterNumber } = body;

    if (!email || !guestName) {
      return NextResponse.json(
        { error: 'Email and guest name are required' },
        { status: 400 }
      );
    }

    const { data, error } = await resend.emails.send({
      from: 'Second Story <noreply@secondstory.com>',
      to: [email],
      subject: `Your spot is confirmed - Second Story Chapter ${chapterNumber || 'I'}`,
      react: RegistrationConfirmationEmail({
        guestName,
        eventDate: eventDate || 'December 12, 2024',
        eventTime: eventTime || '7:00 PM',
        spotNumber: spotNumber || 1,
        totalSpots: totalSpots || 50,
        chapterNumber: chapterNumber || 'I',
      }),
    });

    if (error) {
      console.error('Failed to send email:', error);
      return NextResponse.json(
        { error: 'Failed to send confirmation email' },
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