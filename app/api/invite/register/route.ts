import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import resend from '@/lib/resend'
import { RegistrationConfirmationEmail } from '@/emails/registration-confirmation'

export async function POST(request: Request) {
  const { name, email } = await request.json()
  
  try {
    // Check capacity
    const { count } = await supabase
      .from('guests')
      .select('*', { count: 'exact', head: true })
    
    const { data: event } = await supabase
      .from('events')
      .select('*')
      .eq('status', 'upcoming')
      .single()
    
    if (count && event && count >= event.max_capacity) {
      return NextResponse.json({ error: 'Event full' }, { status: 400 })
    }
    
    // Register guest
    const { data, error } = await supabase
      .from('guests')
      .insert([{ name, email, registered_at: new Date().toISOString() }])
      .select()
      .single()
    
    if (error) throw error
    
    const spotNumber = (count || 0) + 1
    const totalSpots = event?.max_capacity || 50
    
    // Send confirmation email
    try {
      // IMPORTANTE: Cambiar esta dirección por una verificada en tu cuenta de Resend
      // Por ejemplo: 'noreply@tudominio.com' o 'info@tudominio.com'
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
      
      console.log('Attempting to send email from:', fromEmail, 'to:', email)
      
      const emailResult = await resend.emails.send({
        from: fromEmail,
        to: [email],
        subject: `Your spot is confirmed - Second Story Chapter ${event?.chapter_number || 'I'}`,
        react: RegistrationConfirmationEmail({
          guestName: name.split(' ')[0],
          eventDate: event?.date ? new Date(event.date).toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
          }) : 'December 12, 2024',
          eventTime: '7:00 PM',
          spotNumber,
          totalSpots,
          chapterNumber: event?.chapter_number?.toString() || 'I',
        }),
      })
      
      console.log('Email sent successfully:', emailResult)
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError)
      console.error('Email error details:', {
        message: emailError instanceof Error ? emailError.message : 'Unknown error',
        stack: emailError instanceof Error ? emailError.stack : undefined
      })
      // Don't fail registration if email fails, but log the error
    }
    
    return NextResponse.json({
      success: true,
      guestId: data.id,
      spotNumber,
      totalSpots
    })
  } catch (error) {
    return NextResponse.json({ error: 'Registration failed' }, { status: 400 })
  }
}