# Tippen - Real-Time Visitor Engagement Platform

## Project Overview

**Tippen** is a B2B platform that enables businesses to engage with their website visitors in real-time through video connections. When a visitor lands on a client's public-facing website (e.g., abc.com), Tippen tracks and notifies administrators who can initiate instant video sessions with prospects.

### Core Functionality

1. **Visitor Tracking**: JavaScript tracking script embedded on client websites captures visitor activity
2. **Real-Time Notifications**: Admin dashboard displays live visitor feed with company information
3. **Instant Video Connect**: Toggle switch to initiate video call popup on visitor's browser
4. **Video Integration**: Leverages Customer Connect API for video session management

### User Flow

```
1. Client embeds Tippen JS script on their website (abc.com)
2. Visitor lands on abc.com
3. Signal sent to Tippen dashboard
4. Admin sees visitor in Visitors page with company details
5. Admin toggles video call switch ON
6. Video popup appears on visitor's browser (abc.com)
7. Both parties connected via video session
```

## Core Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS (utility-first)
- **Icons**: Lucide React
- **State Management**: React hooks (useState, useEffect)
- **Video API**: Customer Connect Live (https://app.customerconnect.live)
- **Architecture**: Feature-based modular structure

### Backend
- **Platform**: Cloudflare Workers (serverless edge computing)
- **State Management**: Cloudflare Durable Objects
- **Real-Time**: WebSocket Hibernation API
- **Storage**: Durable Object persistent storage
- **Enrichment**: Clearbit API for company data (optional)

## Application Structure

```
Tippen Dashboard
├── Dashboard (Performance Metrics)
│   ├── Total Outbound Calls
│   ├── Connection Rate
│   ├── Qualified Leads
│   └── Analytics Charts
│
└── Visitors (Real-Time Engagement)
    ├── Live visitor feed
    ├── Company information (Revenue, Staff, Role)
    ├── Video call toggle switches
    └── Video session management
```

## Design Philosophy

**Lightweight & Custom-Built**: This project uses custom-built components rather than heavy UI libraries. Every component is crafted for purpose, ensuring optimal performance and full design control.

## Color Palette & Theme

### Light Mode
- **Background**: `bg-white`, `bg-gray-50`
- **Text Primary**: `text-gray-900`
- **Text Secondary**: `text-gray-600`, `text-gray-500`
- **Borders**: `border-gray-200`
- **Accent**: `bg-blue-600`, `text-blue-600`
- **Success**: `text-green-600`
- **Error**: `text-red-600`

### Dark Mode
All components support dark mode using `dark:` prefix:
- **Background**: `dark:bg-gray-800`, `dark:bg-gray-700`
- **Text Primary**: `dark:text-gray-100`
- **Text Secondary**: `dark:text-gray-400`
- **Borders**: `dark:border-gray-700`, `dark:border-gray-600`
- **Accent**: `dark:bg-blue-500`, `dark:text-blue-400`
- **Success**: `dark:text-green-400`
- **Error**: `dark:text-red-400`

## Key Features

### 1. Visitors Dashboard

**Purpose**: Real-time visitor tracking and video engagement

**Features**:
- Live visitor feed showing company information
- Role badges (CEO, CTO, Sales Director, etc.) with color coding
- Video call toggle switches for each visitor
- Last activity timestamps
- Company metrics (Revenue, Staff count)

**Video Call Workflow**:
```tsx
// When toggle is switched ON:
1. Call Customer Connect API to create session
2. Receive host URL and guest URL
3. Send video invite to visitor via WebSocket → Durable Object
4. Durable Object triggers popup on visitor's browser
5. Admin sees host video interface in full-width modal
6. Visitor sees guest video interface in popup
7. Both parties connected in video session
```

**Real-Time Updates**:
- Dashboard connects to Cloudflare Durable Object via WebSocket
- Receives `INITIAL_VISITORS` on connection with all active visitors
- Receives `VISITOR_UPDATE` events when visitors arrive/leave
- Connection status indicator (green=connected, yellow=connecting, red=error)
- Auto-reconnects after 5 seconds if connection drops

### 2. Performance Dashboard

**Purpose**: Track outbound call analytics and metrics

**Features**:
- Total Outbound Calls counter
- Connection Rate percentage
- Qualified Leads tracking
- Average Call Duration
- Outbound Call Volume chart (line graph)
- Language Distribution (donut chart)
- Top Companies (horizontal bar chart)
- Sentiment Analysis

## Component Patterns

### Card Pattern
Standard card structure for all content containers:

```tsx
<div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
  {/* Content */}
</div>
```

**Features**:
- Rounded corners: `rounded-lg`
- Border: Always visible
- Padding: `p-6` standard
- Optional: `hover:shadow-md transition-shadow` for interactive cards

### Toggle Switch Pattern

Used for video call initiation:

```tsx
<button
  onClick={() => handleCallToggle(visitorId, enabled)}
  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
    activeCall === visitorId
      ? 'bg-blue-600 dark:bg-blue-500'
      : 'bg-gray-200 dark:bg-gray-700'
  }`}
>
  <span
    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
      activeCall === visitorId ? 'translate-x-6' : 'translate-x-1'
    }`}
  />
</button>
```

### Role Badge Pattern

Color-coded badges for visitor roles:

```tsx
<span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getRoleBadgeColor(role)}`}>
  {role}
</span>

// Badge colors by role type:
- Executive (CEO, CTO, VP): Purple
- Engineering: Green
- Product/Manager: Blue
- Sales/Marketing: Orange
- Operations: Cyan
- Design: Pink
- Founder: Amber
```

### Video Modal Pattern

Full-screen modal for video sessions:

```tsx
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-7xl h-[700px] flex flex-col">
    {/* Header with session info */}
    {/* Video iframe (full width) */}
  </div>
</div>
```

### Button Patterns

#### Primary Action Button
```tsx
<button className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors">
  <Icon className="w-4 h-4" />
  Button Text
</button>
```

#### Toggle Switch
```tsx
// See Toggle Switch Pattern above
```

**Button Guidelines**:
- Always use `flex items-center gap-2` for icon + text
- Icon size: `w-4 h-4` or `w-5 h-5`
- Include hover states and transitions
- Add `disabled:opacity-50 disabled:cursor-not-allowed` for disabled states

### Form Input Pattern

```tsx
<input
  type="text"
  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
/>
```

## Typography

### Hierarchy
- **Page Title**: `text-2xl font-bold text-gray-900 dark:text-gray-100`
- **Section Header**: `text-lg font-semibold text-gray-900 dark:text-gray-100`
- **Card Title**: `text-sm font-medium text-gray-600 dark:text-gray-400`
- **Body Text**: `text-sm text-gray-900 dark:text-gray-100`
- **Secondary Text**: `text-sm text-gray-500 dark:text-gray-400`
- **Helper Text**: `text-xs text-gray-500 dark:text-gray-400`

### Metric Display
```tsx
<p className="text-3xl font-semibold text-gray-900 dark:text-gray-100">{value}</p>
```

## Spacing

- **Component Spacing**: `space-y-6` between major sections
- **Element Spacing**: `space-y-4` for form fields
- **Small Gaps**: `gap-2` or `gap-3` for inline elements
- **Card Padding**: `p-6` standard, `p-4` for nested content

## Icons

**Icon Guidelines**:
- Use Lucide React for all icons
- Standard size: `w-5 h-5` for section headers
- Button icons: `w-4 h-4`
- Metric cards: `w-6 h-6`
- Icon color: `text-gray-400 dark:text-gray-500` for decorative icons

**Common Icons**:
```tsx
import {
  Users,        // Visitors/People
  Video,        // Video calls
  Phone,        // Phone/calls
  PhoneOutgoing,// Outbound calls
  BarChart3,    // Dashboard/Analytics
  Building2,    // Companies
  MessageSquare,// Chat/Messages
  Copy,         // Copy action
  Check,        // Success/Confirm
  X,            // Close/Cancel
  Moon,         // Dark mode
  Sun,          // Light mode
} from 'lucide-react';
```

## API Integration

### Real-Time WebSocket Connection

**Hook**: `useVisitorWebSocket()` - Located at `src/shared/hooks/useVisitorWebSocket.ts`

**Configuration** (from `.env`):
```typescript
VITE_VISITOR_WS_URL=ws://localhost:8787/ws/dashboard  // Local dev
VITE_VISITOR_WS_URL=wss://your-worker.workers.dev/ws/dashboard  // Production
VITE_TIPPEN_API_KEY=demo_api_key
```

**Usage**:
```typescript
import { useVisitorWebSocket } from '../../../shared/hooks';

const {
  visitors,           // Array of real-time visitors
  connectionStatus,   // 'connecting' | 'connected' | 'disconnected' | 'error'
  sendVideoInvite,    // Function to send video popup to visitor
  refreshVisitors     // Manual refresh function
} = useVisitorWebSocket();

// Send video invite when admin toggles ON
await sendVideoInvite(visitorId, guestUrl);
```

**WebSocket Messages** (received from backend):
```typescript
// Initial visitor list on connection
{
  type: 'INITIAL_VISITORS',
  visitors: [{ visitorId, company, location, lastRole, ... }]
}

// Real-time visitor updates
{
  type: 'VISITOR_UPDATE',
  visitor: { visitorId, company, status: 'active', ... }
}

// Video invite confirmation
{
  type: 'VIDEO_INVITE_SENT',
  visitorId: 'visitor_123',
  guestUrl: 'https://...'
}
```

**Connection Management**:
- Auto-connects on component mount
- Ping every 30 seconds to keep connection alive
- Auto-reconnects after 5 seconds on disconnect
- Cleanup on unmount

### Customer Connect Video API

**Endpoint**: `https://dev-platform-api-dev.benjiemalinao879557.workers.dev/public/video-connect/create-session`

**Request**:
```typescript
{
  hostName: "Tippen Agent",
  guestName: "Company Name",
  isAdmin: true
}
```

**Response**:
```typescript
{
  success: true,
  sessionId: "vc_1761130191378_03i6oy",
  roomId: "bbb349e5-ceb3-4cea-bca7-5a9b0407ef61",
  urls: {
    host: "https://app.customerconnect.live/public/video-connect/host/vc_1761130191378_03i6oy?roomId=bbb349e5-ceb3-4cea-bca7-5a9b0407ef61&hostName=Tippen%20Agent&isAdmin=true",
    guest: "https://app.customerconnect.live/public/video-connect/guest/vc_1761130191378_03i6oy?roomId=bbb349e5-ceb3-4cea-bca7-5a9b0407ef61&guestName=Company%20Name&isAdmin=true"
  }
}
```

**Usage**:
```tsx
const response = await fetch('https://dev-platform-api-dev.benjiemalinao879557.workers.dev/public/video-connect/create-session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    hostName: 'Tippen Agent',
    guestName: visitor.company,
    isAdmin: true
  })
});
```

## Backend Architecture

### Cloudflare Workers + Durable Objects

**Location**: `cloudflare-backend/`

**Key Components**:

1. **Worker (src/index.ts)**: Edge-deployed request handler
   - `POST /track/visitor` - Receives visitor pings from tracking script
   - `GET /ws/dashboard` - WebSocket connection for admin dashboard
   - `POST /api/send-video-invite` - Triggers video popup on visitor browser

2. **Durable Object (src/VisitorCoordinator.ts)**: Stateful visitor coordination
   - One instance per API key (isolated per customer)
   - Manages WebSocket connections to dashboards
   - Stores visitor state in memory + persistent storage
   - Broadcasts updates to all connected dashboards
   - Auto-cleanup via alarm handler (every 5 minutes)

3. **Tracking Script (public/tippen-tracker.js)**: Client-side visitor detection
   - Generates unique visitor ID (localStorage)
   - Sends heartbeat pings every 30 seconds
   - Listens for video invite via postMessage
   - Shows full-screen video popup modal

**WebSocket Hibernation Benefits**:
- Cost-effective (reduces GB-seconds billing)
- Automatic scaling with no connection limits
- Low latency via global edge network
- Built-in state persistence

**Deployment**:
```bash
cd cloudflare-backend
npm install
npm run dev      # Local: localhost:8787
npm run deploy   # Deploy to Cloudflare
```

See [cloudflare-backend/README.md](cloudflare-backend/README.md) for full setup guide.

## State Management Patterns

### Real-Time Visitor State
```tsx
// Use WebSocket hook for live updates
const { visitors, connectionStatus, sendVideoInvite } = useVisitorWebSocket();

// Fallback to mock data if no connection
const displayVisitors = visitors.length > 0 ? visitors : mockVisitors;
```

### Video Call State
```tsx
const [activeCall, setActiveCall] = useState<string | null>(null);
const [videoSession, setVideoSession] = useState<VideoSession | null>(null);
const [callStatus, setCallStatus] = useState<'connecting' | 'connected' | 'waiting'>('connecting');
```

### Loading State
```tsx
const [loading, setLoading] = useState(true);
const [data, setData] = useState<T | null>(null);
```

## Responsive Design

- Mobile-first approach
- Use Tailwind responsive prefixes: `sm:`, `md:`, `lg:`, `xl:`
- Flex containers with proper wrap: `flex flex-wrap`
- Grid layouts: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`

## File Organization

See `ARCHITECTURE.md` for detailed folder structure. Key directories:

```
src/
├── features/              # Feature modules
│   ├── dashboard/         # Performance analytics
│   └── visitors/          # Visitor management
├── shared/                # Shared components
│   ├── components/charts/ # Chart components
│   ├── components/ui/     # UI components
│   └── types/             # TypeScript types
├── services/              # API services
└── lib/                   # Library configs
```

## Best Practices

1. **Consistency First**: Always reference this document before creating new components
2. **Dark Mode**: Every new component must support dark mode
3. **TypeScript**: Always type props and state
4. **Reusability**: Extract repeated patterns into shared components
5. **Performance**: Use React.memo for expensive components
6. **No External UI Libraries**: Build custom components that match this design system
7. **Icons**: Always use Lucide React, never other icon libraries
8. **Video Sessions**: Always handle loading, error, and cleanup states
9. **Real-Time Updates**: Consider WebSocket integration for live visitor feed

## Code Style

- Use functional components with hooks
- Props interface above component
- Destructure props in component signature
- Early returns for loading/error states
- Logical grouping of related code
- Comments for complex logic only

## Security Considerations

- **Visitor Tracking**: Ensure GDPR/privacy compliance
- **Video Sessions**: Validate session tokens
- **API Keys**: Never expose in frontend code
- **Guest URLs**: Generate unique, time-limited links

## Future Enhancements

1. **WebSocket Integration**: Real-time visitor notifications
2. **Visitor Analytics**: Behavior tracking, page views, time on site
3. **Call Recording**: Archive video sessions
4. **CRM Integration**: Sync visitor data to CRM systems
5. **AI Features**: Automated visitor scoring, conversation insights
6. **Multi-Agent Support**: Team collaboration, call routing

## When Adding New Features

1. Check existing components for similar patterns
2. Follow the established color palette
3. Use consistent spacing and typography
4. Ensure dark mode support
5. Add hover/focus states
6. Test responsive behavior
7. Update this document if creating new patterns

---

**Last Updated**: 2025-10-16
**Version**: 2.0.0
**Application**: Tippen - Real-Time Visitor Engagement Platform
