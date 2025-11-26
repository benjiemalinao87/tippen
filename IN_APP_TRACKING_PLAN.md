# In-App User Activity Tracking - Implementation Plan

## Overview

Build a dedicated tracking script for authenticated users inside the application to track user behavior, identify support needs, and provide analytics for admins.

---

## Use Cases

1. **Support Detection**: Identify when free trial users need help (stuck on page, low activity, errors)
2. **User Journey Analytics**: Track routes, feature usage, and engagement patterns
3. **Admin Notifications**: Alert admins about user activity levels and support opportunities
4. **Proactive Engagement**: Enable video call support for users who need assistance

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENT APPLICATION                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  User interacts with app (clicks, navigates, etc.)       │  │
│  └──────────────────┬───────────────────────────────────────┘  │
│                     │                                            │
│  ┌──────────────────▼───────────────────────────────────────┐  │
│  │  In-App Tracking Script (tippen-app-tracker.js)           │  │
│  │  - Captures: routes, clicks, page time, errors            │  │
│  │  - User context: userId, email, subscription tier         │  │
│  │  - Batches events (every 5s or on page unload)            │  │
│  └──────────────────┬───────────────────────────────────────┘  │
│                     │                                            │
└─────────────────────┼──────────────────────────────────────────┘
                      │
                      │ POST /api/track/user-activity
                      │ { userId, events: [...] }
                      │
┌─────────────────────▼──────────────────────────────────────────┐
│              CLOUDFLARE WORKER (Backend)                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  /api/track/user-activity endpoint                       │  │
│  │  - Validates API key & user context                      │  │
│  │  - Stores events in D1 database                          │  │
│  │  - Analyzes patterns (stuck, low activity, errors)        │  │
│  └──────────────────┬───────────────────────────────────────┘  │
│                     │                                            │
│  ┌──────────────────▼───────────────────────────────────────┐  │
│  │  Pattern Analysis Engine                                 │  │
│  │  - Detects: stuck on page > 5min                         │  │
│  │  - Detects: low activity (free trial)                    │  │
│  │  - Detects: multiple errors                              │  │
│  └──────────────────┬───────────────────────────────────────┘  │
│                     │                                            │
│  ┌──────────────────▼───────────────────────────────────────┐  │
│  │  Notification Service                                    │  │
│  │  - Sends Slack alert if support trigger detected          │  │
│  │  - Rate limits: max 1 notification per user per 10min    │  │
│  └──────────────────┬───────────────────────────────────────┘  │
└─────────────────────┼──────────────────────────────────────────┘
                      │
┌─────────────────────▼──────────────────────────────────────────┐
│                    D1 DATABASE                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  user_activity_events table                              │  │
│  │  - user_id, route, action, timestamp, metadata           │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  user_activity_summary table (aggregated)                 │  │
│  │  - user_id, last_active, total_events, stuck_pages       │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                      │
┌─────────────────────▼──────────────────────────────────────────┐
│              ADMIN DASHBOARD (Frontend)                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  User Activity View                                       │  │
│  │  - List of active users                                   │  │
│  │  - Activity timeline                                      │  │
│  │  - Support alerts (users needing help)                    │  │
│  │  - Journey visualization                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

```
┌──────────────┐
│   User App   │
└──────┬───────┘
       │
       │ 1. User clicks button / navigates route
       │
┌──────▼──────────────────────────────────────────────┐
│  In-App Tracking Script                              │
│  ┌──────────────────────────────────────────────┐   │
│  │ Event Queue (in-memory)                      │   │
│  │ [{ type: 'click', route: '/dashboard', ...}] │   │
│  └──────────────────────────────────────────────┘   │
│                                                       │
│  ┌──────────────────────────────────────────────┐   │
│  │ Batch Timer (5s interval)                     │   │
│  │ OR Page Unload Handler                        │   │
│  └──────────────────────────────────────────────┘   │
└──────┬───────────────────────────────────────────────┘
       │
       │ 2. POST /api/track/user-activity
       │    {
       │      apiKey: "client_...",
       │      userId: "user_123",
       │      userEmail: "john@acme.com",
       │      subscriptionTier: "free_trial",
       │      events: [
       │        { type: 'route', route: '/dashboard', timestamp: ... },
       │        { type: 'click', element: 'button.save', timestamp: ... }
       │      ]
       │    }
       │
┌──────▼───────────────────────────────────────────────┐
│  Cloudflare Worker                                   │
│  ┌──────────────────────────────────────────────┐   │
│  │ Validate API key & user context              │   │
│  └──────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────┐   │
│  │ Store events in D1: user_activity_events      │   │
│  └──────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────┐   │
│  │ Analyze patterns:                             │   │
│  │ - Time on current page > 5min?                │   │
│  │ - Low activity in last 10min?                 │   │
│  │ - Multiple errors?                            │   │
│  └──────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────┐   │
│  │ If trigger detected:                          │   │
│  │ → Send Slack notification                     │   │
│  │ → Update user_activity_summary                 │   │
│  └──────────────────────────────────────────────┘   │
└──────┬───────────────────────────────────────────────┘
       │
       │ 3. Slack Webhook
       │    "🚨 John Doe (free_trial) needs support"
       │
┌──────▼───────────────────────────────────────────────┐
│  Admin Dashboard                                     │
│  ┌──────────────────────────────────────────────┐   │
│  │ Real-time updates via WebSocket                │   │
│  │ Shows: Active users, alerts, activity feed    │   │
│  └──────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘
```

---

## Frontend Architecture

### Frontend Components Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT APPLICATION                        │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  User's Authenticated App                            │   │
│  │  (React/Vue/Angular/Plain HTML)                      │   │
│  └──────────────────┬───────────────────────────────────┘   │
│                     │                                         │
│  ┌──────────────────▼───────────────────────────────────┐   │
│  │  tippen-app-tracker.js (Tracking Script)              │   │
│  │  ┌──────────────────────────────────────────────┐    │   │
│  │  │ Event Listeners                                │    │   │
│  │  │ • Route changes                                │    │   │
│  │  │ • Button clicks                                │    │   │
│  │  │ • Form submissions                             │    │   │
│  │  │ • Errors                                       │    │   │
│  │  └──────────────┬─────────────────────────────────┘    │   │
│  │                 │                                        │   │
│  │  ┌──────────────▼─────────────────────────────────┐    │   │
│  │  │ Event Queue (In-Memory)                         │    │   │
│  │  │ [{type: 'click', ...}, {type: 'route', ...}]   │    │   │
│  │  └──────────────┬─────────────────────────────────┘    │   │
│  │                 │                                        │   │
│  │  ┌──────────────▼─────────────────────────────────┐    │   │
│  │  │ Batch Sender (Every 5s or on unload)           │    │   │
│  │  │ POST /api/track/user-activity                   │    │   │
│  │  └─────────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
                          │
                          │ HTTP POST
                          │
┌─────────────────────────▼─────────────────────────────────────┐
│              ADMIN DASHBOARD (React Frontend)                 │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  /user-activity Route                                 │   │
│  │  ┌──────────────────────────────────────────────┐     │   │
│  │  │ UserActivityDashboard.tsx                    │     │   │
│  │  │ • Active users list                          │     │   │
│  │  │ • Support alerts                             │     │   │
│  │  │ • Real-time updates (WebSocket)              │     │   │
│  │  └──────────────────────────────────────────────┘     │   │
│  │                                                       │   │
│  │  ┌──────────────────────────────────────────────┐     │   │
│  │  │ UserDetailModal.tsx                           │     │   │
│  │  │ • Activity timeline                           │     │   │
│  │  │ • Route journey chart                         │     │   │
│  │  │ • Error log                                   │     │   │
│  │  │ • Start video call button                      │     │   │
│  │  └──────────────────────────────────────────────┘     │   │
│  │                                                       │   │
│  │  ┌──────────────────────────────────────────────┐     │   │
│  │  │ SupportAlerts.tsx                             │     │   │
│  │  │ • Users needing help                          │     │   │
│  │  │ • Trigger reasons                             │     │   │
│  │  │ • Quick actions                               │     │   │
│  │  └──────────────────────────────────────────────┘     │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  WebSocket Connection                                │   │
│  │  • Real-time activity updates                        │   │
│  │  • Support alerts                                    │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────┘
```

### In-App Tracking Script Structure

```
tippen-app-tracker.js
├── Configuration
│   ├── API endpoint URL
│   ├── API key (from data attribute)
│   ├── User context (userId, email, tier)
│   └── Batch interval (5 seconds)
│
├── Event Capture
│   ├── Route changes (SPA navigation)
│   ├── Button clicks (delegated listeners)
│   ├── Form submissions
│   ├── Page visibility (focus/blur)
│   ├── Error events (window.onerror)
│   └── Custom events (developer API)
│
├── Event Queue
│   ├── In-memory array
│   ├── Max 50 events per batch
│   └── Auto-flush on page unload
│
├── Batch Sender
│   ├── Timer-based (every 5s)
│   ├── Unload handler (beforeunload)
│   └── Error handling & retry logic
│
└── Developer API
    ├── tippen.track('custom', { ... })
    ├── tippen.identify(userId, email, tier)
    └── tippen.flush() // Manual send
```

### Script Installation

```html
<!-- In authenticated app pages (after login) -->
<script
  src="https://backend.workers.dev/tippen-app-tracker.js"
  data-tippen-api-key="client_..."
  data-tippen-user-id="user_123"
  data-tippen-user-email="john@acme.com"
  data-tippen-subscription-tier="free_trial"
  async
></script>
```

### Event Types

```javascript
// Route change
{ type: 'route', route: '/dashboard', timestamp: 1234567890 }

// Button click
{ type: 'click', element: 'button.save', route: '/dashboard', timestamp: ... }

// Form submission
{ type: 'form_submit', formId: 'signup', route: '/onboarding', timestamp: ... }

// Page time
{ type: 'page_time', route: '/dashboard', duration: 120000, timestamp: ... }

// Error
{ type: 'error', message: 'Failed to load', route: '/dashboard', timestamp: ... }

// Custom event
{ type: 'custom', name: 'feature_used', data: { feature: 'export' }, timestamp: ... }
```

---

## Backend Architecture

### API Endpoints

```
POST /api/track/user-activity
  Request:
    {
      apiKey: string,
      userId: string,
      userEmail: string,
      subscriptionTier: 'free_trial' | 'paid' | 'enterprise',
      events: Array<{
        type: 'route' | 'click' | 'form_submit' | 'page_time' | 'error' | 'custom',
        route?: string,
        element?: string,
        duration?: number,
        message?: string,
        data?: object,
        timestamp: number
      }>
    }
  
  Response:
    {
      success: boolean,
      stored: number, // events stored
      analyzed: boolean
    }
```

### Database Schema

```sql
-- User activity events (detailed log)
CREATE TABLE user_activity_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  api_key TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_email TEXT,
  subscription_tier TEXT,
  event_type TEXT NOT NULL, -- 'route', 'click', 'form_submit', etc.
  route TEXT,
  element TEXT, -- button ID, form ID, etc.
  duration INTEGER, -- milliseconds
  error_message TEXT,
  metadata TEXT, -- JSON string for custom data
  timestamp INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User activity summary (aggregated, for fast queries)
CREATE TABLE user_activity_summary (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  api_key TEXT NOT NULL,
  user_id TEXT NOT NULL UNIQUE,
  user_email TEXT,
  subscription_tier TEXT,
  last_active_at TIMESTAMP,
  current_route TEXT,
  time_on_current_page INTEGER, -- seconds
  total_events INTEGER DEFAULT 0,
  total_errors INTEGER DEFAULT 0,
  last_error_at TIMESTAMP,
  needs_support BOOLEAN DEFAULT 0,
  support_triggered_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_user_events_user ON user_activity_events(user_id, timestamp DESC);
CREATE INDEX idx_user_events_api ON user_activity_events(api_key, timestamp DESC);
CREATE INDEX idx_user_summary_api ON user_activity_summary(api_key, last_active_at DESC);
CREATE INDEX idx_user_summary_support ON user_activity_summary(needs_support, last_active_at DESC);
```

### Pattern Analysis Logic

```javascript
// Support Detection Triggers:
1. Stuck on Page: time_on_current_page > 5 minutes
2. Low Activity: < 3 events in last 10 minutes (free_trial only)
3. Multiple Errors: > 3 errors in last 5 minutes
4. Long Inactivity: no events in last 15 minutes (free_trial only)

// When trigger detected:
- Set needs_support = true
- Send Slack notification (rate limited: 1 per 10min per user)
- Update support_triggered_at timestamp
```

### Slack Notification Format

```
🚨 User Needs Support

👤 John Doe (john@acme.com)
📊 Free Trial User
📍 Current Page: /dashboard/analytics
⏱️ Time on Page: 6m 23s
⚠️ Trigger: Stuck on page > 5 minutes

📈 Activity Summary:
• Total Events: 45
• Errors: 2
• Last Active: 2 minutes ago

🔗 Quick Actions:
[View User Activity] [Start Video Call]
```

---

## Frontend Dashboard Components

### New Pages/Views

1. **User Activity Dashboard** (`/user-activity`)
   - List of active users (real-time)
   - Filter by: subscription tier, needs support, last active
   - Activity timeline per user
   - Support alerts section

2. **User Detail View** (`/user-activity/:userId`)
   - Full activity timeline
   - Route journey visualization
   - Error log
   - Support actions (start video call)

### Components to Build

```
src/features/user-activity/
├── components/
│   ├── UserActivityDashboard.tsx      # Main list view
│   ├── UserActivityTimeline.tsx        # Event timeline
│   ├── UserActivitySummary.tsx         # Stats cards
│   ├── SupportAlerts.tsx               # Needs help section
│   ├── UserJourneyChart.tsx            # Route flow visualization
│   └── UserDetailModal.tsx             # Full user details
└── index.ts
```

---

## Implementation Steps

### Phase 1: Backend Foundation
1. Create database migration for `user_activity_events` and `user_activity_summary`
2. Create `/api/track/user-activity` endpoint
3. Implement event storage logic
4. Implement pattern analysis engine
5. Integrate Slack notifications for support triggers

### Phase 2: Tracking Script
1. Create `tippen-app-tracker.js` script
2. Implement event capture (routes, clicks, errors)
3. Implement batching and sending logic
4. Add developer API for custom events
5. Test script in sample app

### Phase 3: Frontend Dashboard
1. Create User Activity feature folder structure
2. Build UserActivityDashboard component
3. Build UserDetailModal component
4. Integrate WebSocket for real-time updates
5. Add support alerts section

### Phase 4: Integration & Testing
1. Test end-to-end flow
2. Test support trigger notifications
3. Performance optimization (batching, indexing)
4. Documentation for developers

---

## Technical Considerations

### Performance
- Batch events (max 50 per request, 5s interval)
- Use indexes for fast queries
- Aggregate data in `user_activity_summary` table
- Rate limit Slack notifications

### Privacy
- Only track authenticated users (opt-in)
- No sensitive data (passwords, payment info)
- Clear data retention policy

### Scalability
- D1 database handles high write volume
- Batch processing reduces API calls
- Summary table enables fast dashboard queries

---

## Success Metrics

1. **Support Detection**: Identify users needing help within 5 minutes
2. **Data Quality**: Capture 95%+ of user interactions
3. **Performance**: < 100ms API response time
4. **Admin Engagement**: Admins respond to support alerts within 10 minutes

---

## Next Steps

1. Review and approve this plan
2. Start with Phase 1 (Backend Foundation)
3. Iterate based on feedback
4. Deploy incrementally

