// Utility functions for invitation system

/**
 * Generate a unique invitation code
 * Format: LUX + 3 random digits (e.g., LUX001, LUX002)
 */
export function generateInvitationCode(): string {
  const prefix = 'LUX'
  const randomNum = Math.floor(Math.random() * 1000)
  const code = `${prefix}${randomNum.toString().padStart(3, '0')}`
  return code
}

/**
 * Generate multiple unique codes
 */
export function generateMultipleCodes(count: number): string[] {
  const codes = new Set<string>()
  while (codes.size < count) {
    codes.add(generateInvitationCode())
  }
  return Array.from(codes)
}

/**
 * Format phone number for display (show only last 4 digits)
 */
export function formatPhoneDisplay(phone: string): string {
  if (!phone || phone.length < 4) return '****'
  const cleaned = phone.replace(/\D/g, '')
  const lastFour = cleaned.slice(-4)
  return `****${lastFour}`
}

/**
 * Validate phone number format
 */
export function validatePhoneNumber(phone: string): boolean {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '')
  // Check if it's a valid length (10-15 digits typical for international)
  return cleaned.length >= 10 && cleaned.length <= 15
}

/**
 * Get the last 4 digits of a phone number for check-in
 */
export function getLastFourDigits(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  return cleaned.slice(-4)
}

/**
 * Check invitation status based on timestamps
 */
export type InvitationStatus = 'pending' | 'sent' | 'confirmed' | 'checked_in'

export function getInvitationStatus(guest: {
  invitation_sent_at?: Date | string | null
  confirmed_at?: Date | string | null
  checked_in_at?: Date | string | null
}): InvitationStatus {
  if (guest.checked_in_at) return 'checked_in'
  if (guest.confirmed_at) return 'confirmed'
  if (guest.invitation_sent_at) return 'sent'
  return 'pending'
}

/**
 * Calculate event countdown
 */
export interface CountdownTime {
  days: number
  hours: number
  minutes: number
  seconds: number
  isExpired: boolean
}

export function calculateCountdown(eventDate: Date): CountdownTime {
  const now = new Date()
  const difference = eventDate.getTime() - now.getTime()
  
  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true }
  }
  
  const days = Math.floor(difference / (1000 * 60 * 60 * 24))
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((difference % (1000 * 60)) / 1000)
  
  return { days, hours, minutes, seconds, isExpired: false }
}

/**
 * Format countdown for display
 */
export function formatCountdown(countdown: CountdownTime): string {
  if (countdown.isExpired) return 'Event has started'
  
  const parts = []
  if (countdown.days > 0) parts.push(`${countdown.days} day${countdown.days !== 1 ? 's' : ''}`)
  if (countdown.hours > 0) parts.push(`${countdown.hours}h`)
  if (countdown.minutes > 0) parts.push(`${countdown.minutes}m`)
  if (countdown.seconds > 0 && countdown.days === 0) parts.push(`${countdown.seconds}s`)
  
  return parts.join(' : ')
}

/**
 * Get invitation link state based on timing
 */
export type LinkState = 'reservation' | 'countdown' | 'location_revealed' | 'event_day' | 'expired'

export function getInvitationLinkState(
  eventDate: Date,
  confirmedAt?: Date | string | null
): LinkState {
  const now = new Date()
  const hoursUntilEvent = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60)
  
  if (hoursUntilEvent < 0) return 'expired'
  if (hoursUntilEvent <= 12) return 'event_day'
  if (hoursUntilEvent <= 24) return 'location_revealed'
  if (confirmedAt) return 'countdown'
  return 'reservation'
}

/**
 * Generate WhatsApp message links
 */
export function generateWhatsAppLink(
  phoneNumber: string,
  message: string
): string {
  // Clean phone number (remove spaces, dashes, etc)
  const cleanPhone = phoneNumber.replace(/\D/g, '')
  // Encode message for URL
  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`
}

/**
 * WhatsApp message templates
 */
export const WhatsAppTemplates = {
  invitation: (name: string, code: string, date: string) => 
    `You're exclusively invited\n\nSECOND STORY\nChapter I • Winter Luxe\n${date} at 7PM\n\nReserve your place:\nsecondstory.com/i/${code}`,
  
  reminder: (name: string, code: string, daysLeft: number) => 
    `${daysLeft} day${daysLeft !== 1 ? 's' : ''} until Second Story\nPolanco District\n\nYour invitation:\nsecondstory.com/i/${code}`,
  
  locationReveal: (name: string, code: string, address: string) => 
    `Tomorrow at 7PM\n📍 ${address}\n\nYour invitation:\nsecondstory.com/i/${code}\n\nValet parking available`,
  
  eventDay: (name: string, code: string, address: string, mapsLink: string) => 
    `Tonight at 7PM\n📍 ${address}\n${mapsLink}\n\nShow this at entrance:\nsecondstory.com/i/${code}\n\nSee you soon ✨`
}

/**
 * Fuzzy name matching for check-in
 */
export function fuzzyNameMatch(input: string, name: string): boolean {
  const normalize = (str: string) => 
    str.toLowerCase()
       .normalize('NFD')
       .replace(/[\u0300-\u036f]/g, '') // Remove accents
       .replace(/[^a-z0-9]/g, '') // Remove special chars
  
  const normalizedInput = normalize(input)
  const normalizedName = normalize(name)
  
  // Check if input is contained in name or vice versa
  return normalizedName.includes(normalizedInput) || 
         normalizedInput.includes(normalizedName)
}

/**
 * Generate calendar event data
 */
export interface CalendarEvent {
  title: string
  description: string
  startDate: Date
  endDate: Date
  location: string
}

export function generateICSFile(event: CalendarEvent): string {
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  }
  
  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Second Story//EN
BEGIN:VEVENT
UID:${Date.now()}@secondstory.com
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(event.startDate)}
DTEND:${formatDate(event.endDate)}
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${event.location}
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR`
  
  return icsContent
}

export function generateGoogleCalendarLink(event: CalendarEvent): string {
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  }
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${formatDate(event.startDate)}/${formatDate(event.endDate)}`,
    details: event.description,
    location: event.location,
    ctz: 'America/Mexico_City'
  })
  
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}