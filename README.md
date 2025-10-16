# 🎯 Tippen - Real-Time Visitor Engagement Platform

Convert anonymous website visitors into qualified leads through instant video connections.

## 🚀 Quick Links

| Document | Description |
|----------|-------------|
| **[ADMIN_SOP.md](ADMIN_SOP.md)** | 📋 Complete admin guide with API docs, Postman examples, and troubleshooting |
| **[TRACKING_SCRIPT_GUIDE.md](TRACKING_SCRIPT_GUIDE.md)** | 🔧 How to install tracking script on any website |
| **[SCRIPT_PLACEMENT_VISUAL.md](SCRIPT_PLACEMENT_VISUAL.md)** | 📍 Visual guide showing exactly where to place the script |
| **[CLAUDE.md](CLAUDE.md)** | 🎨 Design system and component patterns |
| **[ARCHITECTURE.md](ARCHITECTURE.md)** | 🏗️ Code structure and folder organization |
| **[cloudflare-backend/README.md](cloudflare-backend/README.md)** | ☁️ Backend deployment guide |

## 📚 What is Tippen?

Tippen enables B2B companies to:
- **Track visitors** in real-time on their website
- **See company details** (name, revenue, staff, role)
- **Initiate video calls** with one toggle switch
- **Convert traffic** into qualified sales conversations

## 🎬 How It Works

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Visitor   │────▶│  Cloudflare │────▶│    Admin    │
│ on Website  │     │   Backend   │     │  Dashboard  │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           │ Real-Time
                           │ WebSocket
                           ▼
                    ┌─────────────┐
                    │   Durable   │
                    │   Object    │
                    └─────────────┘
```

1. **Client embeds tracking script** on their website (abc.com)
2. **Visitor lands on abc.com** → Script sends ping to backend
3. **Backend enriches data** → Company info, location, revenue
4. **Admin sees visitor** in dashboard via WebSocket
5. **Admin toggles video ON** → Creates video session
6. **Visitor gets popup** → Both join video call
7. **Qualify lead** → Close the sale!

## 🛠️ Technology Stack

### Frontend
- React 18 + TypeScript
- Tailwind CSS
- WebSocket (real-time)
- Vite

### Backend
- Cloudflare Workers
- Durable Objects
- WebSocket Hibernation API
- Customer Connect API (video)

## 🚦 Getting Started

### Prerequisites

```bash
# Required
✓ Node.js 18+
✓ npm 9+
✓ Cloudflare account
```

### 1. Install Dependencies

```bash
# Frontend
npm install

# Backend
cd cloudflare-backend
npm install
```

### 2. Configure Environment

```bash
# Copy example
cp .env.example .env

# Edit with your values
VITE_VISITOR_WS_URL=ws://localhost:8787/ws/dashboard
VITE_TIPPEN_API_KEY=demo_api_key
```

### 3. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd cloudflare-backend
npm run dev
# Running on http://localhost:8787
```

**Terminal 2 - Frontend:**
```bash
npm run dev
# Running on http://localhost:5173
```

**Terminal 3 - Demo Website:**
```bash
cd public
python3 -m http.server 8080
# Running on http://localhost:8080/demo-website.html
```

### 4. Test the System

1. Open **Tippen Dashboard**: http://localhost:5173
2. Navigate to **Visitors** page
3. Open **Demo Website**: http://localhost:8080/demo-website.html
4. Watch visitor appear in dashboard in real-time! 🎉

## 📖 Documentation Guide

### For Administrators

Start here: **[ADMIN_SOP.md](ADMIN_SOP.md)**
- Complete system overview
- ASCII diagrams of data flow
- Customer journey (7 phases)
- API endpoints with Postman examples
- Setup & deployment instructions
- Troubleshooting guide

### For Website Integration

Start here: **[TRACKING_SCRIPT_GUIDE.md](TRACKING_SCRIPT_GUIDE.md)**
- Where to place the script
- Platform-specific guides (WordPress, Shopify, React, etc.)
- Testing checklist
- Common issues & solutions
- Performance impact
- Privacy & GDPR compliance

### For Visual Learners

Start here: **[SCRIPT_PLACEMENT_VISUAL.md](SCRIPT_PLACEMENT_VISUAL.md)**
- Visual diagrams showing script placement
- Head vs Body comparison
- Timeline of what happens after load
- Live examples

### For Developers

Start here: **[CLAUDE.md](CLAUDE.md)**
- Component patterns
- Design system
- WebSocket integration
- Backend architecture
- Best practices

## 🎯 Quick Test

Test the tracking endpoint:

```bash
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

# Expected: {"success":true,"sessionId":"test_001"}
```

## 📡 API Endpoints

### 1. Visitor Tracking
```
POST /track/visitor
Header: X-Tippen-API-Key: your_key
```

### 2. WebSocket (Dashboard)
```
GET /ws/dashboard?apiKey=your_key
```

### 3. Video Invite
```
POST /api/send-video-invite
Body: { apiKey, visitorId, guestUrl }
```

See **[ADMIN_SOP.md](ADMIN_SOP.md)** for complete API documentation with Postman examples.

## 🎨 Key Features

### Real-Time Tracking
- ✅ Instant visitor detection
- ✅ WebSocket updates (<100ms latency)
- ✅ Company enrichment (IP → Company data)
- ✅ 30-second heartbeat pings (keeps visitor active)
- ✅ 60-second auto-removal (prevents false alarms)
- ✅ Activity tracking (page views, time on site)

### Video Engagement
- ✅ One-click video call initiation
- ✅ No software download required
- ✅ Works in all modern browsers
- ✅ Mobile-friendly

### Admin Dashboard
- ✅ Live visitor feed
- ✅ Company information (revenue, staff, role)
- ✅ Connection status indicator
- ✅ Video session management
- ✅ Dark mode support

## 📂 Project Structure

```
Tippen/
├── src/
│   ├── features/
│   │   ├── dashboard/          # Performance metrics
│   │   └── visitors/           # Visitor tracking & video
│   ├── shared/
│   │   ├── components/         # Reusable UI components
│   │   ├── hooks/              # useVisitorWebSocket()
│   │   └── types/              # TypeScript types
│   └── lib/                    # Configuration
├── cloudflare-backend/
│   └── src/
│       ├── index.ts            # Worker entry point
│       └── VisitorCoordinator.ts # Durable Object
├── public/
│   ├── tippen-tracker.js       # Client tracking script
│   └── demo-website.html       # Demo implementation
├── ADMIN_SOP.md               # 📋 Admin documentation
├── TRACKING_SCRIPT_GUIDE.md   # 🔧 Installation guide
└── SCRIPT_PLACEMENT_VISUAL.md # 📍 Visual guide
```

## 🚀 Deployment

### Deploy Backend

```bash
cd cloudflare-backend
npm run deploy
# Output: https://tippen-backend.your-subdomain.workers.dev
```

### Deploy Frontend

```bash
npm run build
# Upload dist/ to Vercel, Netlify, or Cloudflare Pages
```

### Update Environment

```bash
# Production .env
VITE_VISITOR_WS_URL=wss://tippen-backend.your-subdomain.workers.dev/ws/dashboard
VITE_TIPPEN_API_KEY=production_key_here
```

## 🔒 Security

- ✅ API key authentication
- ✅ CORS protection
- ✅ WebSocket encryption (wss://)
- ✅ No personal data collected
- ✅ GDPR compliant (with consent)
- ✅ Rate limiting (via Cloudflare)

## 📊 Performance

- **Script Size**: 8KB (minified)
- **Load Time**: <100ms
- **WebSocket Latency**: <100ms
- **Heartbeat**: Every 30 seconds
- **Bandwidth**: ~15KB per 10-min session

## 🐛 Troubleshooting

### Dashboard Not Showing Visitors?

1. Check WebSocket connection status (should be green)
2. Verify API key matches in `.env` and tracking script
3. Test tracking endpoint with curl (see above)
4. Check backend logs: `cd cloudflare-backend && wrangler tail`

### Video Popup Not Appearing?

1. Check browser console for errors
2. Verify tracking script is loaded (check Network tab)
3. Test manually: `window.postMessage({type: 'TIPPEN_VIDEO_INVITE', guestUrl: '...'}, '*')`
4. Disable popup blocker

### WebSocket Disconnecting?

1. Check firewall allows WebSocket connections
2. Verify ping interval is running (every 30s)
3. Check backend is running: `curl http://localhost:8787`
4. Review Cloudflare rate limiting rules

**Full troubleshooting guide:** [ADMIN_SOP.md](ADMIN_SOP.md#troubleshooting)

## 📞 Support

- **Issues**: Open an issue on GitHub
- **Documentation**: See links above
- **Email**: support@tippen.com

## 📝 License

MIT License - see LICENSE file

---

## 🎓 Learning Path

**New to Tippen?** Follow this learning path:

1. **Read**: [ADMIN_SOP.md](ADMIN_SOP.md) (System Overview section)
2. **Try**: Open demo website and see tracking in action
3. **Understand**: [SCRIPT_PLACEMENT_VISUAL.md](SCRIPT_PLACEMENT_VISUAL.md) (How it works)
4. **Install**: [TRACKING_SCRIPT_GUIDE.md](TRACKING_SCRIPT_GUIDE.md) (Add to your site)
5. **Customize**: [CLAUDE.md](CLAUDE.md) (Modify components)

**Want to integrate?** 

1. **Install tracking script** on your website (5 minutes)
2. **Test it works** - See visitor in dashboard (2 minutes)
3. **Try video call** - Toggle switch and connect (1 minute)
4. **Go live** - Deploy to production

**Total time: < 10 minutes to go live** ⚡

---

**Version**: 1.0.0  
**Last Updated**: October 16, 2025  
**Status**: ✅ Production Ready

🚀 **Ready to convert your website visitors into sales?** Get started now!
