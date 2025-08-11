# 🖤 SECOND STORY - VIP INVITATION SYSTEM
## Complete Documentation v1.0

---

## 🎯 EXECUTIVE SUMMARY

Second Story's VIP Invitation System transforms exclusive event invitations into personalized digital experiences. Each guest receives a unique link that evolves through different states, from initial invitation to event-day ticket.

**Core Features:**
- Personalized invitation links (`/i/LUX001`)
- Real-time countdown with seconds
- Location reveal system (24h before event)
- Dual check-in methods
- WhatsApp integration
- Admin invitation management

---

## 🔗 INVITATION FLOW

### 1. **UNIQUE INVITATION LINKS**

Each guest receives a personalized link:
```
https://secondstory.com/i/LUX834
```

**Code Format:** `LUX` + 3 digits (e.g., LUX001, LUX002)

### 2. **LINK STATES**

The same link changes based on timing and guest actions:

#### **State 1: RESERVATION** (Initial)
```
Welcome, Isabella Rossi

CHAPTER I • WINTER LUXE
December 12, 2024 • 7PM

[32 of 50 places remaining]
[Progress bar]

→ [RESERVE YOUR PLACE] ←

Recently joined:
• Sofia M. - 2 min ago
• Carolina R. - 15 min ago
```

#### **State 2: COUNTDOWN** (After confirmation)
```
✓ Perfect, Isabella

COUNTDOWN TO CHAPTER I
05 DAYS : 14 HOURS : 32 MIN : 18 SEC
[Live countdown with seconds]

Location will be revealed 24 hours before

[Add to Calendar] [Google] [Apple]
```

#### **State 3: LOCATION REVEALED** (24h before)
```
Welcome, Isabella

STARTING IN
00 DAYS : 14 HOURS : 32 MIN : 18 SEC

📍 LOCATION
Julio Verne 93, Polanco
[View in Maps →]

[Add to Calendar]
```

#### **State 4: EVENT DAY** (Day of event)
```
Welcome, Isabella

STARTING IN
00 : 02 : 45 : 32

YOUR DIGITAL TICKET
┌─────────────┐
│   LUX834    │
└─────────────┘
Show this at entrance

📍 Julio Verne 93, Polanco
[Get Directions]
```

---

## 🎨 DESIGN & ANIMATIONS

### **Color Palette**
- Background: Black (#000000)
- Text: White (#FFFFFF)
- Accents: Gray (#999999)
- Confirmation: Subtle green (#1B4332)

### **Typography**
- Headers: Playfair Display (serif)
- Body: Inter (sans-serif)
- Code/Ticket: Mono font
- All text in ENGLISH

### **Animations**
1. **Background:** Floating light particles (like diamond dust)
2. **Confetti:** Monochromatic (white/gray) on confirmation
3. **Transitions:** Smooth fade in/out (0.8s)
4. **Countdown:** Real-time updates every second
5. **Hover effects:** Subtle glow on buttons

---

## 🎫 CHECK-IN SYSTEM

### **Dual Methods**

#### **Method A: Invitation Code**
- Guest enters their code: `LUX834`
- System finds their record instantly

#### **Method B: Phone Last 4 Digits**
- Guest enters: `5678`
- System matches with registered phone
- Fallback for forgotten codes

### **Check-in Screen** (`/show`)
```
WELCOME BACK

[Enter with your invitation]

┌────────────────────────┐
│ LAST 4 DIGITS OF PHONE │
│         ____           │
└────────────────────────┘
        
        — OR —
        
┌────────────────────────┐
│  YOUR INVITATION CODE  │
│       _______          │
└────────────────────────┘

→ [ENTER SHOW]
```

---

## 👨‍💼 ADMIN MANAGEMENT

### **Invitation Dashboard** (`/admin/invitations`)

#### **Features:**
1. **Add Individual Guest**
   - Name (required)
   - WhatsApp Number (required)
   - Email (optional)
   - VIP Level (standard/gold/platinum)
   - Auto-generates unique code

2. **Bulk Import (CSV)**
   ```csv
   Name,WhatsApp Number,Email,VIP Level
   Isabella Rossi,525512345678,isabella@email.com,gold
   Sofia Martinez,525587654321,sofia@email.com,standard
   ```

3. **Quick Actions**
   - Copy invitation link
   - Send via WhatsApp (one-click)
   - View status (pending/sent/confirmed/checked-in)
   - Export guest list

4. **Real-time Stats**
   - Total invitations: 50
   - Sent: 45
   - Confirmed: 38
   - Checked-in: 0

---

## 📱 WHATSAPP INTEGRATION

### **Message Templates**

#### **Initial Invitation**
```
You're exclusively invited

SECOND STORY
Chapter I • Winter Luxe
December 12 at 7PM

Reserve your place:
secondstory.com/i/LUX001
```

#### **Reminder (1 week before)**
```
One week until Second Story
Polanco District

Your invitation:
secondstory.com/i/LUX001
```

#### **Location Reveal (24h before)**
```
Tomorrow at 7PM
📍 Julio Verne 93, Polanco

Your invitation:
secondstory.com/i/LUX001

Valet parking available
```

#### **Event Day**
```
Tonight at 7PM
📍 Julio Verne 93, Polanco
[Google Maps link]

Show this at entrance:
secondstory.com/i/LUX001

See you soon ✨
```

---

## 🗄️ DATABASE SCHEMA

### **Updated Guests Table**
```sql
guests {
  id: UUID
  name: VARCHAR(255)
  email: VARCHAR(255)
  phone_number: VARCHAR(20)        -- New
  invitation_code: VARCHAR(10)     -- New (unique)
  vip_level: VARCHAR(20)          -- New (standard/gold/platinum)
  invitation_sent_at: TIMESTAMP    -- New
  confirmed_at: TIMESTAMP          -- New
  checked_in_at: TIMESTAMP
  created_at: TIMESTAMP
}
```

### **Invitation States Logic**
- `invitation_sent_at` = NULL → Not invited yet
- `confirmed_at` = NULL → Invited but not confirmed
- `confirmed_at` != NULL → Confirmed attendance
- `checked_in_at` != NULL → Arrived at event

---

## 📅 CALENDAR INTEGRATION

### **Add to Calendar Features**
- **Google Calendar:** Direct link with pre-filled details
- **Apple Calendar:** Downloads .ics file
- **Information included:**
  - Event: Second Story Chapter I
  - Date/Time: December 12, 2024 at 7PM
  - Duration: 3 hours
  - Location: TBA initially, updates 24h before

---

## 🚀 DEPLOYMENT

### **Current Setup**
- **Frontend:** Next.js 14
- **Database:** Supabase (PostgreSQL)
- **Hosting:** Vercel
- **Domain:** `second-story.vercel.app`

### **Environment Variables**
```env
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
RESEND_API_KEY=your_api_key
```

### **Live URLs**
- Invitations: `https://second-story.vercel.app/i/[code]`
- Check-in: `https://second-story.vercel.app/show`
- Admin: `https://second-story.vercel.app/admin/invitations`

---

## 📊 ANALYTICS & TRACKING

### **Metrics Tracked**
1. **Invitation Funnel**
   - Sent → Opened (link clicks)
   - Opened → Confirmed (reservation)
   - Confirmed → Checked-in (attendance)

2. **Engagement**
   - Time to confirmation
   - Peak confirmation times
   - Device types (mobile/desktop)

3. **Event Day**
   - Check-in times
   - Method used (code vs phone)
   - Average check-in duration

---

## 🔧 TECHNICAL IMPLEMENTATION

### **Key Files**
```
/app/i/[code]/page.tsx          -- Personalized invitation page
/app/show/page.tsx              -- Dual check-in system
/app/admin/invitations/page.tsx -- Admin management
/lib/invitation-utils.ts        -- Utility functions
/database-migrations.sql        -- DB schema updates
```

### **Core Functions**
```typescript
// Generate unique codes
generateInvitationCode(): string

// Calculate countdown
calculateCountdown(eventDate): CountdownTime

// Get link state
getInvitationLinkState(eventDate, confirmedAt): LinkState

// WhatsApp link generator
generateWhatsAppLink(phone, message): string

// Calendar generators
generateICSFile(event): string
generateGoogleCalendarLink(event): string
```

---

## 🎯 USER JOURNEYS

### **Guest Journey**
1. Receives WhatsApp with personal link
2. Opens link → Sees name + event details
3. Clicks "Reserve Your Place"
4. Sees confetti + confirmation
5. Countdown begins with seconds
6. 24h before → Location revealed
7. Event day → Link becomes ticket
8. Arrives → Check-in with code or phone

### **Admin Journey**
1. Upload guest list (CSV) or add individually
2. System generates unique codes
3. Send invitations via WhatsApp
4. Monitor confirmations in real-time
5. Track check-ins during event
6. Export data post-event

---

## 🐛 TROUBLESHOOTING

### **Common Issues**

**"Invalid invitation code"**
- Check code exists in database
- Ensure event status is 'upcoming'
- Verify guest record has invitation_code

**"Phone number not found"**
- Confirm phone_number field is populated
- Check format (no special characters)
- Try with full number including country code

**Location not showing**
- Verify current time is within 24h of event
- Check event date in database
- Ensure timezone is correct

---

## 📈 FUTURE ENHANCEMENTS

### **Phase 2 (Planned)**
- QR code generation for physical invitations
- Email invitations as alternative
- Guest +1 management
- Waitlist automation

### **Phase 3 (Concept)**
- In-app RSVP for dietary restrictions
- Table assignment system
- Post-event thank you automation
- Guest photo capture at check-in

---

## 🎨 BRAND GUIDELINES

### **Tone & Voice**
- Minimal and elegant
- All caps for emphasis
- No excessive punctuation
- English only
- Professional yet exclusive

### **Visual Hierarchy**
1. Guest name (largest)
2. Event details
3. Call-to-action
4. Supporting information

---

## 📝 ADMIN QUICK REFERENCE

### **Creating Invitations**
```
1. Go to /admin/invitations
2. Click "Add Guest" or "Import CSV"
3. Fill required fields
4. System generates code automatically
5. Click "Send WhatsApp" to invite
```

### **Monitoring Event**
```
1. Dashboard shows real-time stats
2. Green = Confirmed
3. Yellow = Invited
4. Gray = Pending
5. Check-ins update live
```

### **Exporting Data**
```
1. Click "Export" button
2. Choose format (CSV)
3. Includes all guest data
4. Use for post-event follow-up
```

---

## ✅ DEPLOYMENT STATUS

**Current Version:** 1.0.0
**Live URL:** https://second-story.vercel.app
**Last Updated:** December 2024
**Status:** ✅ Production Ready

---

## 📞 SUPPORT

For technical issues or questions about the invitation system:
- Check this documentation first
- Review error logs in Vercel dashboard
- Contact development team

---

*This document is the complete guide for Second Story's VIP Invitation System. All features described are implemented and functional.*

**Created with 🖤 for Second Story**