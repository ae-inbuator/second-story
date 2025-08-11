# Second Story — Complete Product Requirements Document (v2.0)

**Brand:** Second Story  
**Concept:** Members-only curated luxury resale experience  
**Event Format:** Live runway shows with real-time wishlist system  
**Capacity:** 50-100 exclusive guests per event  
**Language:** All interfaces in English  

---

## 1. EXECUTIVE SUMMARY

Second Story transforms luxury resale into theatrical experiences. Guests attend exclusive runway shows in darkened venues, using their phones/tablets to add items to wishlists in real-time. Post-show, orders are processed manually based on wishlist priority. The system consists of three interconnected web applications: Invitation, Show, and Admin.

**Core Innovation:** No in-app purchases. Instead, a sophisticated wishlist queue system creates urgency and social proof while maintaining elegance. All transactions happen post-event through personal consultation.

---

## 2. PLATFORM ARCHITECTURE

### Three Distinct Applications

```
1. INVITATION APP (/invite)
   - Public-facing registration
   - Countdown timer
   - Social proof of confirmations

2. SHOW APP (/show) 
   - Live runway companion
   - Real-time wishlist system
   - Queue position tracking

3. ADMIN APP (/admin)
   - Show control (advance looks)
   - Live analytics dashboard
   - Guest management
   - Export tools
```

### Technical Stack

```
Frontend:
- Next.js 14 (all apps)
- Tailwind CSS + custom design tokens
- Framer Motion (animations)
- Socket.io client (real-time)
- PWA configuration

Backend:
- Supabase (PostgreSQL + Realtime + Auth)
- Vercel (hosting + serverless functions)
- Socket.io server (WebSockets)
- Resend (email service)

Infrastructure:
- Single domain routing (secondstory.com/*)
- CDN for media (Cloudflare/Vercel)
- Redis for caching (optional)
```

---

## 3. USER JOURNEYS

### Journey A: Guest Registration

```
1. Receives WhatsApp message with link
2. Opens secondstory.com/invite
3. Enters name + email (2 fields only)
4. Sees confirmation + countdown
5. Adds to calendar
6. Receives email confirmation
```

### Journey B: Live Event

```
1. Opens same link (now shows /show)
2. Quick login with name only
3. Views live looks as admin advances
4. Taps items/looks to add to wishlist
5. Sees queue position instantly
6. Reviews final wishlist post-show
```

### Journey C: Admin Control

```
1. Access /admin with credentials
2. Upload looks + products pre-event
3. Control show progression live
4. Monitor wishlist activity real-time
5. Send announcements
6. Export data post-event
```

---

## 4. DETAILED SCREEN SPECIFICATIONS

### 4.1 INVITATION APP (/invite)

#### Landing Screen
```
Components:
- Logo: "SECOND STORY"
- Subtitle: "Chapter I" 
- Date/Time display
- Registration form (name + email)
- Live counter: "32 of 50 spots reserved"
- Recent confirmations (anonymized)

States:
- Pre-registration (form visible)
- Post-registration (countdown visible)
- Sold out (waitlist mode)
- Event live (redirect to /show)

Interactions:
- Form submission → Instant confirmation
- Add to calendar (iOS/Android)
- Live counter updates via WebSocket
```

#### Confirmation State
```
Display:
✓ Perfect, [Name]!
Your spot is confirmed

December 12, 2024 · 7PM
[Location revealed via WhatsApp]

[Add to Calendar]

Recently joined:
• Isabella R. - 2 min ago
• M.D. - 5 min ago
• S.L. - 12 min ago
```

### 4.2 SHOW APP (/show)

#### Pre-Show Login
```
Components:
- "Welcome back" message
- Name input field only
- "Enter Show" button

Validation:
- Check against registered guests
- No password required
- Session persists during event
```

#### Live Show Interface
```
Layout:
┌─────────────────────────┐
│ SECOND STORY    • LIVE  │ <- Header
├─────────────────────────┤
│                         │
│    [Look Image]         │ <- Hero image
│                         │
├─────────────────────────┤
│ LOOK 5 - Evening Luxe   │ <- Look title
├─────────────────────────┤
│ ♡ WANT FULL LOOK       │ <- Primary action
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │ Bottega Bag         │ │
│ │ $2,850 · Size M     │ │ <- Individual items
│ │ [♡] · 3 wanting     │ │
│ └─────────────────────┘ │
│ [Additional items...]    │
├─────────────────────────┤
│ ← Previous  Next →      │ <- Navigation
└─────────────────────────┘

Real-time elements:
- "3 wanting" updates instantly
- Position toast: "You're #2 for this item"
- Announcement banner (from admin)
```

#### Wishlist Modal
```
Your Wishes (Swipe up to view)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

LOOK 3 - Complete ✓
Position: 1st

Bottega Bag 
Position: 2nd of 5

Max Mara Coat
Position: 1st ✓

[Continue Shopping]
```

#### Post-Show Screen
```
THANK YOU

The show has ended.
Your wishlist has been saved.

Our team will contact you
in order of preference.

[View Your Wishlist]
[Export My Selections]

Get ready for Chapter II
Coming Soon
```

### 4.3 ADMIN APP (/admin)

#### Dashboard
```
CHAPTER I - CONTROL CENTER
━━━━━━━━━━━━━━━━━━━━━━━━━━

LIVE STATS               NOW
Registered              42/50
Checked in              38
Active now              35
Items wished            127
Unique wishers          32

SHOW CONTROL
Current: Look 5 of 12
[← PREV] [⏸ PAUSE] [NEXT →]

[Send Announcement]
[View Analytics]
[Export Data]
```

#### Look Management
```
LOOKS BUILDER
━━━━━━━━━━━━━

Look #1 [Edit]
- 3 items attached
- Hero: uploaded ✓

Look #2 [Edit]
- 5 items attached
- Hero: uploaded ✓

[+ Add New Look]
[Reorder Looks]
```

#### Product Upload
```
PRODUCT DETAILS
━━━━━━━━━━━━━━━

Name: [Bottega Veneta Cassette]
Price: [$2,850]
Size: [Medium]
Condition: [Excellent]
Description: [Full text area...]

Images:
[Upload Hero]
[Upload Gallery]

Measurements:
Length: [___]
Width: [___]
[+ Add custom field]

[Save Product]
```

#### Live Analytics
```
REAL-TIME ACTIVITY
━━━━━━━━━━━━━━━━━

LOOK 5 (Current)
- Views: 35
- Wishes: 12
- Most wanted: Bottega Bag (8)

TOP WISHERS
1. Guest_023 - 15 items
2. Guest_007 - 12 items
3. Guest_041 - 11 items

QUEUE POSITIONS
Bottega Bag: 8 in queue
Max Mara Coat: 5 in queue
[View All Queues]
```

#### Announcement System
```
SEND ANNOUNCEMENT
━━━━━━━━━━━━━━━━━

Message:
[Champagne break - 5 minutes]

Display duration:
○ 5 seconds
● 10 seconds
○ Until dismissed

[Send to All]
```

---

## 5. DATABASE SCHEMA

### Core Tables

```sql
-- Guests table
CREATE TABLE guests (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  registered_at TIMESTAMP,
  checked_in_at TIMESTAMP,
  device_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Events table
CREATE TABLE events (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  chapter_number INTEGER,
  date TIMESTAMP,
  status VARCHAR(50), -- 'upcoming', 'live', 'ended'
  max_capacity INTEGER DEFAULT 50,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  brand VARCHAR(255),
  price DECIMAL(10,2),
  size VARCHAR(50),
  condition VARCHAR(50),
  description TEXT,
  measurements JSONB,
  images JSONB, -- Array of URLs
  created_at TIMESTAMP DEFAULT NOW()
);

-- Looks table
CREATE TABLE looks (
  id UUID PRIMARY KEY,
  event_id UUID REFERENCES events(id),
  look_number INTEGER,
  name VARCHAR(255),
  hero_image VARCHAR(500),
  active BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Look_Products junction table
CREATE TABLE look_products (
  look_id UUID REFERENCES looks(id),
  product_id UUID REFERENCES products(id),
  display_order INTEGER,
  PRIMARY KEY (look_id, product_id)
);

-- Wishlists table
CREATE TABLE wishlists (
  id UUID PRIMARY KEY,
  guest_id UUID REFERENCES guests(id),
  product_id UUID REFERENCES products(id),
  look_id UUID REFERENCES looks(id),
  wish_type VARCHAR(50), -- 'individual' or 'full_look'
  position INTEGER, -- Queue position
  added_at TIMESTAMP DEFAULT NOW(),
  event_id UUID REFERENCES events(id)
);

-- Announcements table
CREATE TABLE announcements (
  id UUID PRIMARY KEY,
  event_id UUID REFERENCES events(id),
  message TEXT,
  sent_at TIMESTAMP DEFAULT NOW(),
  sent_by UUID REFERENCES guests(id)
);

-- Analytics table
CREATE TABLE analytics (
  id UUID PRIMARY KEY,
  event_id UUID REFERENCES events(id),
  guest_id UUID REFERENCES guests(id),
  action VARCHAR(50), -- 'view', 'wish_add', 'wish_remove'
  product_id UUID,
  look_id UUID,
  timestamp TIMESTAMP DEFAULT NOW()
);
```

---

## 6. API ENDPOINTS

### Guest APIs

```javascript
// Registration
POST /api/invite/register
Body: { name, email }
Response: { success, guestId, spotNumber, totalSpots }

// Check-in
POST /api/show/checkin
Body: { name }
Response: { success, guestId, sessionToken }

// Get current look
GET /api/show/current-look
Response: { look, products, wishlistCounts }

// Add to wishlist
POST /api/wishlist/add
Body: { productId, lookId, type }
Response: { success, position, totalWanting }

// Get wishlist
GET /api/wishlist/my
Response: { items: [{ product, position, addedAt }] }
```

### Admin APIs

```javascript
// Advance look
POST /api/admin/show/advance
Body: { lookId }
Response: { success, currentLook }

// Send announcement
POST /api/admin/announce
Body: { message, duration }
Response: { success, announcementId }

// Get analytics
GET /api/admin/analytics
Response: { stats, topWishes, guestActivity }

// Export data
GET /api/admin/export
Response: { csv/excel file }
```

### WebSocket Events

```javascript
// Client subscribes
socket.on('look:changed', (data) => {
  // Update UI with new look
});

socket.on('wishlist:updated', (data) => {
  // Update counters
});

socket.on('announcement', (data) => {
  // Show announcement banner
});

// Server emits
io.emit('look:changed', { lookId, lookNumber });
io.emit('wishlist:updated', { productId, count });
io.emit('announcement', { message, duration });
```

---

## 7. UI COMPONENTS LIBRARY

### Design Tokens

```css
/* Colors */
--black: #000000;
--white: #FFFFFF;
--gray-light: #F5F5F5;
--gray-medium: #999999;
--gray-dark: #333333;
--accent-gold: #D4AF37; /* Used sparingly */

/* Typography */
--font-display: 'Playfair Display', serif;
--font-body: 'Inter', sans-serif;
--font-mono: 'JetBrains Mono', monospace;

/* Spacing */
--space-xs: 0.5rem;
--space-sm: 1rem;
--space-md: 1.5rem;
--space-lg: 2rem;
--space-xl: 3rem;
--space-2xl: 4rem;

/* Animation */
--transition-fast: 150ms ease;
--transition-normal: 300ms ease;
--transition-slow: 500ms ease;
```

### Core Components

```jsx
// Button variants
<Button variant="primary">Add to Wishes</Button>
<Button variant="ghost">View Details</Button>
<Button variant="admin">Next Look</Button>

// Wishlist indicator
<WishCounter count={5} isActive={true} />

// Position badge
<QueuePosition position={2} total={8} />

// Live indicator
<LiveBadge pulseAnimation={true} />

// Announcement banner
<Announcement message="Intermission - 5 minutes" />
```

---

## 8. ANIMATIONS & TRANSITIONS

### Look Transitions
```javascript
// Fade transition between looks
const lookTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3, ease: "easeInOut" }
};
```

### Wishlist Feedback
```javascript
// Heart animation on add
const heartPulse = {
  scale: [1, 1.2, 0.9, 1],
  transition: { duration: 0.4 }
};

// Position toast
const toastSlide = {
  initial: { x: -100, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 100, opacity: 0 }
};
```

---

## 9. DEPLOYMENT STRATEGY

### Environment Setup

```bash
# Environment variables
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
RESEND_API_KEY=
NEXT_PUBLIC_SOCKET_URL=
```

### Deployment Steps

```bash
1. Database setup (Supabase)
   - Create project
   - Run migrations
   - Set up realtime

2. Deploy to Vercel
   - Connect GitHub repo
   - Set environment variables
   - Configure domains

3. Domain routing
   /invite → invitation app
   /show → event app
   /admin → admin panel

4. Testing checklist
   - Load test with 100 concurrent users
   - WebSocket stability
   - Mobile responsiveness
   - Export functionality
```

---

## 10. WHATSAPP INTEGRATION FLOW

### Communication Timeline

```
T-7 days: Save the date
T-1 day: Reminder + exclusive preview
T-2 hours: Final reminder + link
T-0: "Starting now!" + link
Post-event: Thank you + wishlist reminder
```

### Message Templates

```
INVITATION:
"You're invited to Second Story Chapter I
December 12 at 7PM
RSVP: secondstory.com/invite"

PRE-EVENT:
"Second Story starts in 1 hour
Your link: secondstory.com/invite
See you soon ✨"

LIVE:
"We're live! Join now:
secondstory.com/show"
```

---

## 11. ANALYTICS & METRICS

### Key Performance Indicators

```javascript
// Registration funnel
- Invite sent → Page visit (CTR)
- Page visit → Registration (Conversion)
- Registration → Check-in (Attendance)

// Engagement metrics
- Avg wishes per guest
- Most wished items
- Look engagement rate
- Time per look view

// Business metrics
- Wishlist → Purchase conversion
- Average order value
- Items per buyer
```

### Export Format

```csv
Guest Name, Email, Check-in Time, Total Wishes, Queue Positions
Isabella R., isabella@email.com, 7:05 PM, 8, "Bag-2nd, Coat-1st"
```

---

## 12. ERROR HANDLING

### Connection Issues
```javascript
// Auto-reconnect logic
const reconnectStrategy = {
  maxAttempts: 10,
  delay: 1000,
  backoff: 1.5,
  onReconnect: () => syncWishlist()
};
```

### Offline Behavior
- Cache current look locally
- Queue wishlist additions
- Show connection status banner
- Sync on reconnection

---

## 13. SECURITY & PRIVACY

### Authentication
- Simple name-based login for event
- No passwords stored
- Session tokens expire post-event
- Admin requires secure authentication

### Data Protection
- Email/names encrypted at rest
- No payment data stored
- Export requires admin auth
- Auto-cleanup old event data

---

## 14. MOBILE OPTIMIZATION

### Responsive Breakpoints
```css
/* Mobile first approach */
- Base: 320px (iPhone SE)
- Small: 375px (iPhone standard)
- Medium: 768px (iPad portrait)
- Large: 1024px (iPad landscape)
```

### Touch Interactions
- 44px minimum touch targets
- Swipe gestures for navigation
- Pull-to-refresh wishlists
- Haptic feedback on actions

---

## 15. POST-EVENT WORKFLOW

### 30 Minutes Post-Show
1. "Trading window" opens
2. Guests can release items
3. Positions update real-time
4. Final positions lock

### Admin Processing
1. Export final wishlists
2. Contact guests in order
3. Process payments manually
4. Update inventory

### Follow-up
1. Thank you email
2. Preview Chapter II
3. Request feedback
4. Build anticipation

---

## 16. FUTURE ROADMAP (Post-MVP)

### Phase 2: Social Features
- Guest profiles with history
- Follow other members
- Share wishlists
- Style inspiration board

### Phase 3: Commerce Integration
- In-app payments
- Apple Pay express checkout
- Automated inventory sync
- Shipping integration

### Phase 4: Members Club
- Year-round access
- Exclusive previews
- Personal styling
- Rewards program

---

## 17. DEVELOPMENT TIMELINE

### Week 1-2: Foundation
- Database setup
- Authentication system
- Basic UI components
- WebSocket infrastructure

### Week 3-4: Core Features
- Invitation flow
- Show interface
- Wishlist system
- Admin controls

### Week 5: Polish & Testing
- Animations
- Error handling
- Load testing
- UI refinements

### Week 6: Launch Prep
- Deployment
- Final testing
- Content upload
- Team training

---

## 18. SUCCESS CRITERIA

### Technical
- Page load < 2 seconds
- WebSocket latency < 300ms
- 99.9% uptime during event
- Zero data loss

### Business
- 80% RSVP → attendance
- 60% guests add to wishlist
- 40% wishlist → purchase
- 90% satisfaction score

---

## 19. TEAM RESPONSIBILITIES

### Required Roles
- Frontend Developer (React/Next.js)
- Backend Developer (Supabase/Node)
- UI/UX Designer
- DevOps Engineer
- QA Tester

### Admin Training
- Look advancement timing
- Reading analytics
- Managing announcements
- Export procedures

---

## 20. APPENDIX

### Sample Test Data
```javascript
// Test guests
const testGuests = [
  { name: "Isabella Rossi", email: "test1@example.com" },
  { name: "Sofia Martinez", email: "test2@example.com" },
  // ... 50 test accounts
];

// Test products
const testProducts = [
  {
    name: "Bottega Veneta Cassette",
    brand: "Bottega Veneta",
    price: 2850,
    size: "Medium",
    condition: "Excellent"
  },
  // ... sample inventory
];
```

### Troubleshooting Guide
- WebSocket disconnections
- Database connection issues
- Export failures
- Cache clearing procedures

---

**END OF DOCUMENT v2.0**

*This document serves as the complete blueprint for Second Story's live event platform. All features, flows, and specifications have been detailed for immediate development.*