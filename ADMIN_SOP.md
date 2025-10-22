# Tippen - Administrator Standard Operating Procedure (SOP)

**Version:** 1.0.0
**Last Updated:** October 16, 2025
**Document Type:** Technical Operations Manual

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture & Data Flow](#architecture--data-flow)
3. [Customer Journey](#customer-journey)
4. [API Endpoints Reference](#api-endpoints-reference)
5. [Setup & Deployment](#setup--deployment)
6. [Operations & Monitoring](#operations--monitoring)
7. [Troubleshooting](#troubleshooting)
8. [Security & Compliance](#security--compliance)

---

## System Overview

### What is Tippen?

Tippen is a B2B real-time visitor engagement platform that enables businesses to:
- Track visitors on their website in real-time
- See company information and visitor details
- Initiate instant video calls with website visitors
- Convert anonymous traffic into qualified leads

### Core Components

```
┌─────────────────────────────────────────────────────────────────┐
│                        TIPPEN PLATFORM                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Client     │  │  Cloudflare  │  │    Admin     │         │
│  │   Website    │  │   Backend    │  │  Dashboard   │         │
│  │ (abc.com)    │  │  (Workers)   │  │  (React)     │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│         │                 │                  │                  │
│    Tracking           Real-Time          Video Call            │
│     Script           Coordination        Management            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**
- React 18 + TypeScript
- Tailwind CSS
- Vite (build tool)
- WebSocket client for real-time updates

**Backend:**
- Cloudflare Workers (edge computing)
- Durable Objects (stateful coordination)
- WebSocket Hibernation API
- Persistent storage

**Third-Party Services:**
- Customer Connect Live (video sessions)
- Clearbit API (company enrichment - optional)

---

## Architecture & Data Flow

### System Architecture Diagram

```
┌───────────────────────────────────────────────────────────────────────┐
│                         TIPPEN ARCHITECTURE                           │
└───────────────────────────────────────────────────────────────────────┘

CLIENT WEBSITE (abc.com)
┌────────────────────────────┐
│  HTML Page                 │
│  ┌──────────────────────┐  │
│  │ <script>             │  │
│  │ tippen-tracker.js    │  │
│  │ </script>            │  │
│  └──────────────────────┘  │
└─────────────┬──────────────┘
              │ HTTP POST
              │ /track/visitor
              │ (Every 30s heartbeat - keeps visitor active)
              ▼
┌─────────────────────────────────────────────────────────────┐
│         CLOUDFLARE WORKER (Edge Network)                    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Worker Routes                                      │    │
│  │  • POST /track/visitor                             │    │
│  │  • GET  /ws/dashboard                              │    │
│  │  • POST /api/send-video-invite                     │    │
│  └────────────────────────────────────────────────────┘    │
│                          │                                   │
│                          │ Forward to                        │
│                          ▼                                   │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Durable Object: VisitorCoordinator                │    │
│  │  (One instance per API key)                        │    │
│  │                                                     │    │
│  │  • Stores visitor state (Map<string, Visitor>)     │    │
│  │  • Manages WebSocket connections                   │    │
│  │  • Broadcasts updates to dashboards                │    │
│  │  • Auto-cleanup inactive visitors (60 seconds)     │    │
│  └────────────────────────────────────────────────────┘    │
│                          │                                   │
└──────────────────────────┼───────────────────────────────────┘
                           │ WebSocket broadcast
                           │ (Real-time updates)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│         ADMIN DASHBOARD (Tippen React App)                  │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  useVisitorWebSocket() Hook                        │    │
│  │  • ws://backend/ws/dashboard?apiKey=xxx            │    │
│  │  • Receives INITIAL_VISITORS on connect            │    │
│  │  • Receives VISITOR_UPDATE in real-time            │    │
│  │  • Sends PING every 30s (keep-alive)               │    │
│  └────────────────────────────────────────────────────┘    │
│                          │                                   │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Visitors Component                                 │    │
│  │  • Displays live visitor feed                       │    │
│  │  • Video call toggle switches                       │    │
│  │  • Connection status indicator                      │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow Sequence

```
VISITOR TRACKING FLOW
═════════════════════

1. Visitor Detection
   ────────────────
   Client Website          Tracking Script          Cloudflare Worker
   ┌────────┐              ┌─────────┐              ┌──────────┐
   │        │──Page Load──▶│         │              │          │
   │        │              │ Generate│              │          │
   │ HTML   │              │Visitor  │              │          │
   │  +     │              │  ID     │              │          │
   │Script  │              │         │──POST────────▶│ Worker   │
   │        │              │localStorage│/track/    │   +      │
   │        │              │ visitor_  │  visitor   │ Durable  │
   │        │              │ 123       │            │ Object   │
   └────────┘              └─────────┘              └──────────┘
                                                           │
                                                           │ Store &
                                                           │ Broadcast
                                                           ▼
                                                    ┌──────────┐
                                                    │Dashboard │
                                                    │WebSocket │
                                                    │Connected │
                                                    └──────────┘


2. Real-Time Updates
   ─────────────────
   Visitor Activity        Worker/DO                Dashboard
   ┌────────┐              ┌──────────┐             ┌──────────┐
   │        │──Heartbeat──▶│          │──Broadcast─▶│          │
   │ Browse │  (30s ping)  │ Durable  │ VISITOR_    │ Admin    │
   │ Pages  │              │ Object   │ UPDATE      │ Sees     │
   │        │              │          │             │ Visitor  │
   │ Click  │──Activity───▶│ Updates  │────────────▶│ Live!    │
   │ Links  │              │ State    │             │          │
   └────────┘              └──────────┘             └──────────┘


3. Video Call Initiation
   ─────────────────────
   Admin Dashboard         Worker/DO               Client Website
   ┌────────┐              ┌──────────┐             ┌──────────┐
   │        │──Toggle ON──▶│          │             │          │
   │ Admin  │              │ Create   │             │ Tracking │
   │ Clicks │              │ Session  │             │ Script   │
   │ Video  │              │   via    │             │ Listens  │
   │ Switch │◀─Host URL────│Customer  │             │          │
   │        │              │ Connect  │             │          │
   │        │              │   API    │             │          │
   │ Opens  │              │          │──Invite────▶│ Shows    │
   │ Video  │              │ Sends    │ postMessage │ Video    │
   │ Modal  │              │ Invite   │             │ Popup    │
   └────────┘              └──────────┘             └──────────┘
        │                                                │
        │                  Both Connected               │
        └────────────────Video Session──────────────────┘
```

---

## Customer Journey

### Complete End-to-End Flow

```
╔═══════════════════════════════════════════════════════════════════╗
║                    CUSTOMER JOURNEY MAP                           ║
╚═══════════════════════════════════════════════════════════════════╝

PHASE 1: SETUP (One-time)
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ADMIN                                                          │
│  ┌──────┐    1. Sign up for Tippen                            │
│  │      │    2. Get API key (e.g., "client_abc_xyz")          │
│  │ 👤   │    3. Add tracking script to website                │
│  │      │                                                      │
│  └──────┘    <script src="https://cdn.tippen.com/tracker.js"  │
│              data-tippen-api-key="client_abc_xyz"></script>    │
│                                                                 │
│  WEBSITE DEVELOPER                                              │
│  ┌──────┐    4. Embed script in <head> tag                    │
│  │      │    5. Deploy to production                          │
│  │ 💻   │    6. Verify tracking is working                    │
│  │      │                                                      │
│  └──────┘                                                       │
└─────────────────────────────────────────────────────────────────┘

PHASE 2: VISITOR ARRIVES
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  VISITOR                                                        │
│  ┌──────┐    1. Opens website (e.g., abc.com/products)        │
│  │      │    2. Tracking script loads automatically           │
│  │ 🧑   │    3. Visitor ID generated (if new)                 │
│  │      │       • Stored in localStorage                      │
│  └──────┘       • Format: visitor_<timestamp>_<random>        │
│                                                                 │
│  TRACKING SCRIPT                                                │
│  ┌──────┐    4. Sends initial ping to backend                 │
│  │      │       POST /track/visitor                           │
│  │ 📡   │       {                                              │
│  │      │         visitorId: "visitor_123",                   │
│  └──────┘         url: "https://abc.com/products",            │
│                   timestamp: "2025-10-16T12:00:00Z",          │
│                   userAgent: "Mozilla/5.0...",                │
│                   referrer: "https://google.com"              │
│                 }                                              │
│                                                                 │
│  BACKEND                                                        │
│  ┌──────┐    5. Worker enriches visitor data                  │
│  │      │       • IP → Company name (Clearbit)                │
│  │ ☁️   │       • IP → Location                               │
│  │      │       • Revenue estimate                            │
│  └──────┘       • Staff count                                  │
│                                                                 │
│              6. Durable Object stores visitor                  │
│                 {                                              │
│                   visitorId: "visitor_123",                   │
│                   company: "Acme Corporation",                │
│                   location: "San Francisco, CA",              │
│                   lastRole: "Unknown",                        │
│                   pageViews: 1,                               │
│                   status: "active",                           │
│                   website: "abc.com"                          │
│                 }                                              │
│                                                                 │
│              7. Broadcasts to all connected dashboards         │
│                 via WebSocket                                  │
└─────────────────────────────────────────────────────────────────┘

PHASE 3: ADMIN SEES VISITOR
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ADMIN DASHBOARD                                                │
│  ┌──────┐    8. Dashboard connected via WebSocket             │
│  │      │       ws://backend/ws/dashboard?apiKey=xxx          │
│  │ 💼   │                                                      │
│  │      │    9. Receives VISITOR_UPDATE message               │
│  └──────┘       {                                              │
│                   type: "VISITOR_UPDATE",                     │
│                   visitor: { ...visitor data... },            │
│                   event: "new_visitor"                        │
│                 }                                              │
│                                                                 │
│  VISITOR TABLE                                                  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Company          │ Revenue │ Staff │ Role │ Video Call │  │
│  │──────────────────┼─────────┼───────┼──────┼────────────│  │
│  │ 🏢 Acme Corp     │ $2.5M   │ 150   │ CEO  │ ⭕ ──▶ │  │
│  │ 🟢 Active now    │         │       │      │            │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                                 │
│  10. Admin sees visitor appear in real-time!                   │
│      • Green indicator = Active                                │
│      • Company info displayed                                  │
│      • Toggle switch to initiate video call                    │
└─────────────────────────────────────────────────────────────────┘

PHASE 4: VIDEO CALL INITIATION
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ADMIN ACTION                                                   │
│  ┌──────┐    11. Admin clicks video toggle switch             │
│  │      │        (Switch moves from OFF ⭕ to ON 🟢)          │
│  │ 👤   │                                                      │
│  │      │    12. Frontend calls Customer Connect API          │
│  └──────┘        POST https://api.customerconnect.live/       │
│                       /public/demo/create-session             │
│                  {                                             │
│                    hostName: "Tippen Agent",                  │
│                    guestName: "Acme Corporation"              │
│                  }                                             │
│                                                                 │
│  CUSTOMER CONNECT API                                           │
│  ┌──────┐    13. Returns session URLs                         │
│  │      │        {                                             │
│  │ 🎥   │          success: true,                             │
│  │      │          sessionId: "demo_abc123",                  │
│  └──────┘          roomId: "uuid-1234",                        │
│                    urls: {                                     │
│                      host: "https://.../host/...",           │
│                      guest: "https://.../guest/..."          │
│                    }                                           │
│                  }                                             │
│                                                                 │
│  ADMIN DASHBOARD                                                │
│  ┌──────┐    14. Opens video modal with host URL              │
│  │      │        • Full-screen iframe                         │
│  │ 🖥️   │        • Video controls                             │
│  │      │        • Camera/microphone access                   │
│  └──────┘                                                       │
│                                                                 │
│              15. Sends video invite to visitor                 │
│                  POST /api/send-video-invite                  │
│                  {                                             │
│                    apiKey: "client_abc_xyz",                  │
│                    visitorId: "visitor_123",                  │
│                    guestUrl: "https://.../guest/..."         │
│                  }                                             │
└─────────────────────────────────────────────────────────────────┘

PHASE 5: VISITOR RECEIVES INVITATION
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  DURABLE OBJECT                                                 │
│  ┌──────┐    16. Broadcasts VIDEO_INVITE_SENT                 │
│  │      │        {                                             │
│  │ 💾   │          type: "VIDEO_INVITE_SENT",                 │
│  │      │          visitorId: "visitor_123",                  │
│  └──────┘          guestUrl: "https://.../guest/..."         │
│                  }                                             │
│                                                                 │
│  VISITOR BROWSER (abc.com)                                      │
│  ┌──────┐    17. Tracking script receives postMessage         │
│  │      │        window.postMessage({                         │
│  │ 🌐   │          type: "TIPPEN_VIDEO_INVITE",               │
│  │      │          guestUrl: "..."                            │
│  └──────┘        })                                             │
│                                                                 │
│              18. Shows full-screen video popup                 │
│                  ┌──────────────────────────────────┐         │
│                  │ 🎥 Video Call Request            │         │
│                  │                                   │         │
│                  │ Tippen Agent would like to       │         │
│                  │ connect with you                 │         │
│                  │                                   │         │
│                  │  [Join Call]    [Decline]       │         │
│                  └──────────────────────────────────┘         │
│                                                                 │
│  VISITOR                                                        │
│  ┌──────┐    19. Visitor clicks "Join Call"                   │
│  │      │                                                      │
│  │ 🧑   │    20. Video iframe loads with guest URL            │
│  │      │        • Camera/microphone permissions requested    │
│  └──────┘        • Video stream starts                         │
└─────────────────────────────────────────────────────────────────┘

PHASE 6: CONNECTED IN VIDEO CALL
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ADMIN (Host)                     VISITOR (Guest)              │
│  ┌─────────────────┐              ┌─────────────────┐         │
│  │                 │              │                 │         │
│  │   🎥 👤         │◀────────────▶│   🎥 🧑         │         │
│  │                 │  Real-Time   │                 │         │
│  │ Video Stream    │  Video/Audio │ Video Stream    │         │
│  │ Audio Stream    │  Connection  │ Audio Stream    │         │
│  │                 │              │                 │         │
│  │ [🎤] [📹] [🔇]  │              │ [🎤] [📹] [🔇]  │         │
│  │                 │              │                 │         │
│  └─────────────────┘              └─────────────────┘         │
│                                                                 │
│  21. Both parties can now:                                     │
│      • See and hear each other                                 │
│      • Share screens                                           │
│      • Chat (if enabled)                                       │
│      • Record session (if enabled)                             │
│                                                                 │
│  22. Admin qualifies the lead                                  │
│      • Discusses products/services                             │
│      • Answers questions                                       │
│      • Schedules follow-up                                     │
│      • Closes deal                                             │
└─────────────────────────────────────────────────────────────────┘

PHASE 7: CALL ENDS
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  23. Either party ends the call                                │
│      • Admin clicks [X] close button                          │
│      • Or visitor closes popup                                 │
│                                                                 │
│  24. Dashboard records interaction                             │
│      • Call duration                                           │
│      • Outcome (connected/missed)                              │
│      • Lead qualified (yes/no)                                 │
│                                                                 │
│  25. Visitor continues browsing abc.com                        │
│      • Can be called again if needed                          │
│      • Tracking continues with 30s heartbeats                  │
│      • Visitor removed after 60 seconds of inactivity         │
└─────────────────────────────────────────────────────────────────┘
```

---

## API Endpoints Reference

### Base URL

**Local Development:**
```
http://localhost:8787
```

**Production:**
```
https://tippen-backend.your-subdomain.workers.dev
```

---

### 1. Visitor Tracking Endpoint

**Endpoint:** `POST /track/visitor`

**Purpose:** Receive visitor activity pings from embedded tracking script

**Headers:**
```http
Content-Type: application/json
X-Tippen-API-Key: your_api_key_here
```

**Request Body:**
```json
{
  "event": "pageview",
  "visitor": {
    "visitorId": "visitor_1729080000000_abc123",
    "url": "https://example.com/products",
    "timestamp": "2025-10-16T12:00:00Z",
    "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    "referrer": "https://google.com/search?q=best+products"
  },
  "website": "example.com"
}
```

**Response (Success):**
```json
{
  "success": true,
  "sessionId": "visitor_1729080000000_abc123"
}
```

**Response (Error):**
```json
{
  "error": "API key required"
}
```

**Postman Example:**

```bash
# Postman Request Configuration

Method: POST
URL: http://localhost:8787/track/visitor

Headers:
  Content-Type: application/json
  X-Tippen-API-Key: demo_api_key

Body (raw JSON):
{
  "event": "pageview",
  "visitor": {
    "visitorId": "visitor_test_001",
    "url": "https://example.com/products",
    "timestamp": "2025-10-16T12:00:00Z",
    "userAgent": "PostmanRuntime/7.32.0",
    "referrer": "https://google.com"
  },
  "website": "example.com"
}

# cURL equivalent:
curl -X POST http://localhost:8787/track/visitor \
  -H "Content-Type: application/json" \
  -H "X-Tippen-API-Key: demo_api_key" \
  -d '{
    "event": "pageview",
    "visitor": {
      "visitorId": "visitor_test_001",
      "url": "https://example.com/products",
      "timestamp": "2025-10-16T12:00:00Z",
      "userAgent": "PostmanRuntime/7.32.0",
      "referrer": "https://google.com"
    },
    "website": "example.com"
  }'
```

---

### 2. WebSocket Connection (Dashboard)

**Endpoint:** `GET /ws/dashboard`

**Purpose:** Establish WebSocket connection for real-time visitor updates

**Protocol:** WebSocket Upgrade

**Query Parameters:**
- `apiKey` (required): Your Tippen API key

**Connection URL:**
```
ws://localhost:8787/ws/dashboard?apiKey=demo_api_key
```

**Production URL:**
```
wss://tippen-backend.your-subdomain.workers.dev/ws/dashboard?apiKey=your_api_key
```

**Incoming Messages (Server → Client):**

1. **Initial Visitors List:**
```json
{
  "type": "INITIAL_VISITORS",
  "visitors": [
    {
      "visitorId": "visitor_123",
      "company": "Acme Corporation",
      "location": "San Francisco, CA",
      "lastRole": "CEO",
      "pageViews": 5,
      "timestamp": "2025-10-16T12:00:00Z",
      "lastActivity": "2025-10-16T12:05:00Z",
      "status": "active",
      "website": "example.com"
    }
  ]
}
```

2. **Visitor Update (New or Activity):**
```json
{
  "type": "VISITOR_UPDATE",
  "visitor": {
    "visitorId": "visitor_456",
    "company": "TechStart Inc",
    "location": "New York, NY",
    "lastRole": "Unknown",
    "pageViews": 1,
    "timestamp": "2025-10-16T12:10:00Z",
    "lastActivity": "2025-10-16T12:10:00Z",
    "status": "active",
    "website": "example.com"
  },
  "event": "new_visitor"
}
```

3. **Video Invite Sent Confirmation:**
```json
{
  "type": "VIDEO_INVITE_SENT",
  "visitorId": "visitor_123",
  "guestUrl": "https://app.customerconnect.live/public/demo/guest/abc123"
}
```

4. **Visitor Removed (Inactive):**
```json
{
  "type": "VISITOR_REMOVED",
  "visitorId": "visitor_789",
  "reason": "inactive"
}
```

5. **Pong Response:**
```json
{
  "type": "PONG",
  "timestamp": 1729080000000
}
```

**Outgoing Messages (Client → Server):**

1. **Ping (Keep-Alive):**
```json
{
  "type": "PING"
}
```

2. **Get Visitors List:**
```json
{
  "type": "GET_VISITORS"
}
```

**JavaScript Example (Browser):**

```javascript
// Connect to WebSocket
const ws = new WebSocket('ws://localhost:8787/ws/dashboard?apiKey=demo_api_key');

ws.onopen = () => {
  console.log('✅ Connected to Tippen backend');

  // Send ping every 30 seconds to keep connection alive
  setInterval(() => {
    ws.send(JSON.stringify({ type: 'PING' }));
  }, 30000);
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('📩 Received:', message);

  switch (message.type) {
    case 'INITIAL_VISITORS':
      console.log('Initial visitors:', message.visitors);
      break;
    case 'VISITOR_UPDATE':
      console.log('Visitor update:', message.visitor);
      break;
    case 'VIDEO_INVITE_SENT':
      console.log('Video invite sent to:', message.visitorId);
      break;
    case 'PONG':
      console.log('Ping response received');
      break;
  }
};

ws.onerror = (error) => {
  console.error('❌ WebSocket error:', error);
};

ws.onclose = (event) => {
  console.log('🔌 Disconnected:', event.code, event.reason);
};

// Request current visitors list
ws.send(JSON.stringify({ type: 'GET_VISITORS' }));
```

**Postman WebSocket Test:**

Postman supports WebSocket connections (Postman v8.0+):

1. Create new WebSocket Request
2. Enter URL: `ws://localhost:8787/ws/dashboard?apiKey=demo_api_key`
3. Click "Connect"
4. Send message: `{"type": "PING"}`
5. Observe responses in message log

---

### 3. Send Video Invite

**Endpoint:** `POST /api/send-video-invite`

**Purpose:** Trigger video popup on visitor's browser

**Headers:**
```http
Content-Type: application/json
```

**Request Body:**
```json
{
  "apiKey": "demo_api_key",
  "visitorId": "visitor_123",
  "guestUrl": "https://app.customerconnect.live/public/demo/guest/abc123"
}
```

**Response (Success):**
```json
{
  "success": true
}
```

**Response (Error - Visitor Not Found):**
```json
{
  "error": "Visitor not found"
}
```

**Postman Example:**

```bash
# Postman Request Configuration

Method: POST
URL: http://localhost:8787/api/send-video-invite

Headers:
  Content-Type: application/json

Body (raw JSON):
{
  "apiKey": "demo_api_key",
  "visitorId": "visitor_test_001",
  "guestUrl": "https://app.customerconnect.live/public/demo/guest/test123"
}

# cURL equivalent:
curl -X POST http://localhost:8787/api/send-video-invite \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "demo_api_key",
    "visitorId": "visitor_test_001",
    "guestUrl": "https://app.customerconnect.live/public/demo/guest/test123"
  }'
```

---

### 4. Customer Connect Video API (Third-Party)

**Endpoint:** `POST https://dev-platform-api-dev.benjiemalinao879557.workers.dev/public/video-connect/create-session`

**Purpose:** Create video session for admin and visitor

**Headers:**
```http
Content-Type: application/json
```

**Request Body:**
```json
{
  "hostName": "Tippen Agent",
  "guestName": "Acme Corporation",
  "isAdmin": true
}
```

**Response (Success):**
```json
{
  "success": true,
  "sessionId": "vc_1761130191378_03i6oy",
  "roomId": "bbb349e5-ceb3-4cea-bca7-5a9b0407ef61",
  "urls": {
    "host": "https://app.customerconnect.live/public/video-connect/host/vc_1761130191378_03i6oy?roomId=bbb349e5-ceb3-4cea-bca7-5a9b0407ef61&hostName=Tippen%20Agent&isAdmin=true",
    "guest": "https://app.customerconnect.live/public/video-connect/guest/vc_1761130191378_03i6oy?roomId=bbb349e5-ceb3-4cea-bca7-5a9b0407ef61&guestName=Acme%20Corporation&isAdmin=true"
  }
}
```

**Postman Example:**

```bash
# Postman Request Configuration

Method: POST
URL: https://dev-platform-api-dev.benjiemalinao879557.workers.dev/public/video-connect/create-session

Headers:
  Content-Type: application/json

Body (raw JSON):
{
  "hostName": "Tippen Agent",
  "guestName": "Acme Corporation",
  "isAdmin": true
}

# cURL equivalent:
curl -X POST https://dev-platform-api-dev.benjiemalinao879557.workers.dev/public/video-connect/create-session \
  -H "Content-Type: application/json" \
  -d '{
    "hostName": "Tippen Agent",
    "guestName": "Acme Corporation",
    "isAdmin": true
  }'
```

---

## Setup & Deployment

### Prerequisites

```
Required Software:
✓ Node.js 18+ (https://nodejs.org)
✓ npm 9+ (comes with Node.js)
✓ Git (https://git-scm.com)
✓ Cloudflare account (https://cloudflare.com)
```

### Initial Setup

#### 1. Clone Repository

```bash
git clone <repository-url>
cd Tippen
```

#### 2. Install Frontend Dependencies

```bash
npm install
```

#### 3. Configure Environment Variables

Create `.env` file in project root:

```bash
# Copy example file
cp .env.example .env

# Edit with your values
nano .env
```

**Required Variables:**
```bash
# WebSocket URL for visitor tracking
VITE_VISITOR_WS_URL=ws://localhost:8787/ws/dashboard

# API Key (must match backend)
VITE_TIPPEN_API_KEY=demo_api_key
```

#### 4. Start Frontend Development Server

```bash
npm run dev
```

Frontend will be available at: `http://localhost:5173`

---

### Backend Setup

#### 1. Install Wrangler CLI

```bash
npm install -g wrangler
```

#### 2. Login to Cloudflare

```bash
wrangler login
```

Browser will open for authentication.

#### 3. Install Backend Dependencies

```bash
cd cloudflare-backend
npm install
```

#### 4. Configure Wrangler

Edit `wrangler.toml` if needed:

```toml
name = "tippen-backend"
main = "src/index.ts"
compatibility_date = "2025-01-16"

[[durable_objects.bindings]]
name = "VISITOR_COORDINATOR"
class_name = "VisitorCoordinator"
script_name = "tippen-backend"

[[migrations]]
tag = "v1"
new_classes = ["VisitorCoordinator"]
```

#### 5. Start Backend Development Server

```bash
npm run dev
```

Backend will be available at: `http://localhost:8787`

#### 6. Test Backend

```bash
# Test visitor tracking
curl -X POST http://localhost:8787/track/visitor \
  -H "Content-Type: application/json" \
  -H "X-Tippen-API-Key: demo_api_key" \
  -d '{
    "event": "pageview",
    "visitor": {
      "visitorId": "test_001",
      "url": "https://example.com",
      "timestamp": "2025-10-16T12:00:00Z"
    },
    "website": "example.com"
  }'

# Expected response:
# {"success":true,"sessionId":"test_001"}
```

---

### Production Deployment

#### Deploy Backend to Cloudflare

```bash
cd cloudflare-backend
npm run deploy
```

You'll receive a URL like:
```
https://tippen-backend.your-subdomain.workers.dev
```

#### Update Frontend Environment

Edit `.env` with production URL:

```bash
VITE_VISITOR_WS_URL=wss://tippen-backend.your-subdomain.workers.dev/ws/dashboard
VITE_TIPPEN_API_KEY=production_api_key_here
```

#### Build Frontend for Production

```bash
cd ..
npm run build
```

Deploy `dist/` folder to your hosting provider (Vercel, Netlify, Cloudflare Pages, etc.)

---

### Tracking Script Deployment

#### Option 1: Self-Hosted

1. Copy `public/tippen-tracker.js` to your CDN
2. Embed on client websites:

```html
<script
  src="https://your-cdn.com/tippen-tracker.js"
  data-tippen-api-key="client_api_key_here"
  data-tippen-backend="https://tippen-backend.your-subdomain.workers.dev"
></script>
```

#### Option 2: Cloudflare CDN

Upload to Cloudflare R2 or Pages and serve globally.

---

## Operations & Monitoring

### Monitoring Dashboard Connections

Check active WebSocket connections:

```bash
# Via Wrangler logs
cd cloudflare-backend
wrangler tail

# You'll see:
# [wrangler:inf] GET /ws/dashboard 101 Switching Protocols
# WebSocket message: {"type":"PING"}
```

### Monitoring Visitor Activity

Real-time logs in Cloudflare Dashboard:
1. Go to Workers & Pages
2. Click your worker name
3. Click "Logs" tab
4. Enable "Live" mode

### Checking Durable Object Storage

```bash
# List Durable Object instances
wrangler d1 list

# View storage for specific API key
# (Via Cloudflare Dashboard → Durable Objects)
```

### Performance Metrics

**Key Metrics to Monitor:**

| Metric | Target | How to Check |
|--------|--------|--------------|
| WebSocket Uptime | >99.9% | Cloudflare Analytics |
| Visitor Ping Latency | <200ms | Backend logs |
| Video Session Creation | <2s | Customer Connect API |
| Dashboard Load Time | <3s | Browser DevTools |

### Visitor Timeout & Auto-Cleanup

**How It Works:**

Tippen automatically removes inactive visitors to prevent false positives and ensure admins only see visitors who are currently on the site.

**Timing:**
- **Heartbeat Interval:** Tracking script pings every 30 seconds
- **Inactivity Threshold:** Visitors removed after 60 seconds without heartbeat
- **Cleanup Frequency:** Background alarm runs every 30 seconds

**Example Timeline:**
```
00:00 - Visitor lands on site → Appears in dashboard
00:30 - First heartbeat ping → Still active
01:00 - Second heartbeat ping → Still active
01:30 - Third heartbeat ping → Still active
02:00 - Visitor closes tab (no more pings)
02:30 - Cleanup alarm checks: "Last activity 30s ago" → Still shown
03:00 - Cleanup alarm checks: "Last activity 60s ago" → Removed from dashboard
```

**Why 60 seconds?**
- Prevents admins from trying to call visitors who already left
- Accounts for slow connections (30s ping + 30s grace period)
- Real-time accuracy for engagement decisions

**Backend Logs:**
```bash
[VisitorCoordinator] Running cleanup alarm, checking 5 visitors
[VisitorCoordinator] Removing inactive visitor: Acme Corp inactive for 62 seconds
[VisitorCoordinator] Removed 1 inactive visitors
```

**Dashboard Behavior:**
- Dashboard automatically updates when visitors are removed
- No manual refresh needed
- "X total visitors" count updates in real-time

### Health Check Endpoint

```bash
# Check if worker is running
curl http://localhost:8787/

# Response: "Tippen API"
```

---

## Troubleshooting

### Issue 1: Dashboard Not Receiving Visitors

**Symptoms:**
- Dashboard shows "0 total visitors"
- Connection status shows "connected"
- No visitors appear when tracking script runs

**Diagnosis:**
```bash
# 1. Check WebSocket connection
# Open browser console on dashboard
# Should see: "✅ Connected to Tippen backend"

# 2. Test visitor tracking manually
curl -X POST http://localhost:8787/track/visitor \
  -H "Content-Type: application/json" \
  -H "X-Tippen-API-Key: demo_api_key" \
  -d '{
    "event": "pageview",
    "visitor": {"visitorId": "debug_001", "url": "https://test.com", "timestamp": "2025-10-16T12:00:00Z"},
    "website": "test.com"
  }'

# 3. Check backend logs
cd cloudflare-backend
wrangler tail
```

**Solution:**
- Verify API key matches in both frontend `.env` and tracking script
- Check CORS headers allow your domain
- Ensure Durable Object is properly initialized

---

### Issue 2: Video Popup Not Appearing

**Symptoms:**
- Admin toggles video switch ON
- Video modal appears for admin
- No popup appears on visitor's browser

**Diagnosis:**
```javascript
// On visitor's website (abc.com), open browser console
// Check if tracking script is loaded
window.TippenTracker

// Check for postMessage listener
// Should log: "Tippen tracker listening for video invites"

// Manually test popup
window.postMessage({
  type: 'TIPPEN_VIDEO_INVITE',
  guestUrl: 'https://app.customerconnect.live/public/demo/guest/test'
}, '*');
```

**Solution:**
- Verify tracking script is loaded on the page
- Check browser console for errors
- Ensure postMessage origin validation is correct
- Test with browser popup blocker disabled

---

### Issue 3: WebSocket Disconnecting

**Symptoms:**
- Connection status flickers between "connected" and "connecting"
- Dashboard shows "disconnected" or "error"

**Diagnosis:**
```javascript
// In browser console
// Check WebSocket readyState
// 0 = CONNECTING, 1 = OPEN, 2 = CLOSING, 3 = CLOSED

// Check for network issues
// DevTools → Network → WS filter
```

**Solution:**
- Check firewall/proxy settings allow WebSocket
- Ensure ping interval is sending (every 30s)
- Verify backend is running (`wrangler tail`)
- Check for rate limiting in Cloudflare Dashboard

---

### Issue 4: Clearbit Enrichment Not Working

**Symptoms:**
- Visitors show as "Unknown Company"
- Revenue and staff fields are null

**Diagnosis:**
```bash
# Check if Clearbit API key is set
cd cloudflare-backend
wrangler secret list

# Should show:
# CLEARBIT_API_KEY
```

**Solution:**
```bash
# Add Clearbit API key
wrangler secret put CLEARBIT_API_KEY
# Enter your key when prompted

# Or use alternative enrichment service
# Edit src/index.ts enrichVisitorData() function
```

---

### Issue 5: Durable Object Not Persisting

**Symptoms:**
- Visitors disappear on refresh
- Dashboard shows empty list after reconnecting

**Diagnosis:**
```bash
# Check Durable Object storage
# In src/VisitorCoordinator.ts, add logging:
console.log('Visitors loaded:', this.visitors.size);

# Run wrangler tail to see logs
```

**Solution:**
- Ensure `state.storage.put()` is called after updates
- Check migrations are applied (`wrangler.toml`)
- Verify Durable Object bindings are correct

---

## Security & Compliance

### API Key Management

**Best Practices:**
```bash
# ✅ DO: Store API keys in environment variables
VITE_TIPPEN_API_KEY=secret_key_here

# ❌ DON'T: Hardcode in source code
const apiKey = "secret_key_here"; // BAD!

# ✅ DO: Use different keys per environment
# development: demo_api_key
# production: prod_abc123xyz

# ✅ DO: Rotate keys regularly (every 90 days)
```

### CORS Configuration

Current settings allow all origins (`*`). For production:

```typescript
// src/index.ts
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://your-dashboard.com',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Tippen-API-Key',
};
```

### Data Privacy (GDPR/CCPA)

**What data is collected:**
- ✓ Visitor ID (anonymous)
- ✓ Page URLs visited
- ✓ IP address (for company enrichment)
- ✓ User agent string
- ✓ Referrer URL
- ✓ Timestamps

**What is NOT collected:**
- ✗ Personal names
- ✗ Email addresses
- ✗ Passwords
- ✗ Payment information

**Compliance Checklist:**
```
☐ Add cookie consent banner to tracking script
☐ Provide opt-out mechanism
☐ Honor Do Not Track (DNT) header
☐ Add privacy policy link
☐ Implement data deletion API
☐ Log data access for audit trail
```

### Rate Limiting

Implement rate limiting to prevent abuse:

```typescript
// Recommended: 100 requests per minute per IP
// Configure in Cloudflare Dashboard → Rate Limiting Rules
```

### SSL/TLS

**Production Requirements:**
```
✓ Use wss:// (WebSocket Secure) not ws://
✓ Use https:// for all API endpoints
✓ Enable HSTS headers
✓ Use TLS 1.2 or higher
```

---

## Appendix

### A. Common Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 101 | Switching Protocols | ✅ WebSocket connected |
| 200 | OK | ✅ Request successful |
| 401 | Unauthorized | Check API key |
| 404 | Not Found | Verify endpoint URL |
| 500 | Internal Server Error | Check backend logs |
| 1006 | WebSocket Disconnected | Network issue or timeout |

### B. Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_VISITOR_WS_URL` | Yes | - | WebSocket backend URL |
| `VITE_TIPPEN_API_KEY` | Yes | - | Authentication key |
| `CLEARBIT_API_KEY` | No | - | Company enrichment |

### C. Browser Compatibility

| Browser | Min Version | WebSocket | Video Support |
|---------|-------------|-----------|---------------|
| Chrome | 90+ | ✅ | ✅ |
| Firefox | 88+ | ✅ | ✅ |
| Safari | 14+ | ✅ | ✅ |
| Edge | 90+ | ✅ | ✅ |
| Mobile Safari | 14+ | ✅ | ✅ |
| Chrome Mobile | 90+ | ✅ | ✅ |

### D. Useful Commands Cheatsheet

```bash
# Frontend
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview production build

# Backend
wrangler dev         # Start local backend
wrangler deploy      # Deploy to Cloudflare
wrangler tail        # View live logs
wrangler secret list # List secrets
wrangler secret put KEY # Add secret

# Testing
curl -X POST http://localhost:8787/track/visitor -H "Content-Type: application/json" -H "X-Tippen-API-Key: demo_api_key" -d '{"event":"pageview","visitor":{"visitorId":"test","url":"https://test.com","timestamp":"2025-10-16T12:00:00Z"},"website":"test.com"}'

# Git
git status           # Check status
git add .            # Stage changes
git commit -m "msg"  # Commit
git push            # Push to remote
```

---

## Support & Contact

**Documentation:** [CLAUDE.md](CLAUDE.md), [ARCHITECTURE.md](ARCHITECTURE.md)
**Backend Guide:** [cloudflare-backend/README.md](cloudflare-backend/README.md)
**GitHub Issues:** [Open an issue](https://github.com/your-repo/issues)

---

**Document Version:** 1.0.0
**Last Updated:** October 16, 2025
**Maintained By:** Tippen Engineering Team
