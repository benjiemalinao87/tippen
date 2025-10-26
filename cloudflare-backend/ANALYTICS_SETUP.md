# Tippen Analytics & Metrics Setup

## Overview

This document explains the complete analytics system for tracking visitor metrics, video calls, and dashboard performance in Tippen.

## Database Schema

### Core Tables

1. **`visitors`** - All website visitors
   - Basic visitor info (company, location, role)
   - Video session status
   - First/last seen timestamps

2. **`video_calls`** - Every video call attempt
   - Call status (invited → connecting → connected → completed)
   - Duration, connection time
   - Lead qualification
   - Success/failure tracking

3. **`visitor_events`** - Detailed event timeline
   - Page views
   - Video invites, accepts, declines
   - All visitor interactions

4. **`company_insights`** - Aggregated company data
   - Total visits, visitors, page views per company
   - Video call stats
   - Lead metrics
   - Powers "Top Companies" widget

5. **`performance_metrics`** - Time-based aggregations
   - Hourly/daily rollups
   - Connection rates
   - Average durations
   - Powers dashboard charts

6. **`slack_notifications`** - Notification audit trail
   - Tracks all Slack messages sent
   - Success/failure status

## Setup Instructions

### Step 1: Run Migrations

```bash
cd cloudflare-backend

# Apply the new analytics schema
npx wrangler d1 execute DB --file=migration_002_add_analytics_tables.sql --remote
```

### Step 2: Integrate Analytics Tracking

The analytics system automatically tracks:

✅ **When a new visitor arrives:**
- Creates `visitors` record
- Logs `visitor_events` (page_view)
- Updates `company_insights`
- Sends Slack notification

✅ **When admin initiates video call:**
- Creates `video_calls` record (status: 'invited')
- Logs `visitor_events` (video_invite_sent)
- Updates `company_insights` (total_video_calls++)
- Sends Slack notification

✅ **When visitor accepts/connects:**
- Updates `video_calls` status → 'connected'
- Records `connected_at` timestamp
- Logs `visitor_events` (video_connected)

✅ **When call ends:**
- Updates `video_calls` status → 'completed'
- Calculates `duration_seconds`
- Marks as qualified lead if applicable
- Updates `company_insights` metrics

## API Endpoints

### Get Dashboard Metrics

```typescript
GET /api/analytics/dashboard?api_key={your_key}

Response:
{
  "totalOutboundCalls": 45,
  "connectionRate": 73.3,
  "qualifiedLeads": 12,
  "avgCallDuration": 185,
  "totalVisitors": 128,
  "activeVisitors": 5
}
```

### Get Top Companies

```typescript
GET /api/analytics/top-companies?api_key={your_key}&limit=10

Response:
[
  {
    "company": "Acme Corporation",
    "total_visits": 15,
    "total_video_calls": 5,
    "successful_connections": 4,
    "qualified_leads": 2,
    "avg_session_duration_seconds": 240
  },
  ...
]
```

### Get Call Volume Over Time

```typescript
GET /api/analytics/call-volume?api_key={your_key}&days=7

Response:
[
  {
    "date": "2025-10-20",
    "total_calls": 12,
    "successful_calls": 9
  },
  {
    "date": "2025-10-21",
    "total_calls": 15,
    "successful_calls": 11
  },
  ...
]
```

## Usage Examples

### Track a New Visitor

```typescript
import { updateCompanyInsights, trackVisitorEvent } from './analytics';

// When visitor lands on site
await updateCompanyInsights(env.DB, apiKey, company, {
  new_visit: true,
  new_visitor: true,
  page_views: 1
});

await trackVisitorEvent(env.DB, {
  api_key: apiKey,
  visitor_id: visitorId,
  event_type: 'page_view',
  page_url: 'https://example.com',
  event_data: { referrer: 'google' }
});
```

### Track Video Call Lifecycle

```typescript
import { createVideoCall, updateVideoCallStatus } from './analytics';

// 1. Admin clicks video call toggle
const callId = await createVideoCall(env.DB, {
  api_key: apiKey,
  visitor_id: visitorId,
  session_id: sessionId,
  company: 'Acme Corp',
  visitor_role: 'CEO',
  status: 'invited',
  host_url: hostUrl,
  guest_url: guestUrl
});

await trackVisitorEvent(env.DB, {
  api_key: apiKey,
  visitor_id: visitorId,
  event_type: 'video_invite_sent',
  event_data: { session_id: sessionId }
});

// 2. Visitor accepts and connects
await updateVideoCallStatus(env.DB, sessionId, 'connected', {
  connection_time_seconds: 8
});

await trackVisitorEvent(env.DB, {
  api_key: apiKey,
  visitor_id: visitorId,
  event_type: 'video_connected'
});

await updateCompanyInsights(env.DB, apiKey, company, {
  video_call: true,
  successful_connection: true
});

// 3. Call ends after 5 minutes
await updateVideoCallStatus(env.DB, sessionId, 'completed', {
  duration_seconds: 300,
  is_qualified_lead: true,
  lead_quality_score: 4
});

await trackVisitorEvent(env.DB, {
  api_key: apiKey,
  visitor_id: visitorId,
  event_type: 'video_ended',
  event_data: { duration: 300, qualified: true }
});

await updateCompanyInsights(env.DB, apiKey, company, {
  qualified_lead: true
});
```

### Track Slack Notifications

```typescript
import { trackSlackNotification } from './analytics';

await trackSlackNotification(env.DB, {
  api_key: apiKey,
  notification_type: 'new_visitor',
  visitor_id: visitorId,
  status: 'sent',
  payload: { company, revenue, staff }
});
```

## Dashboard Integration

### Update Frontend to Use Real Data

```typescript
// src/features/dashboard/components/PerformanceDashboard.tsx

import { useEffect, useState } from 'react';

export function PerformanceDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      const apiKey = localStorage.getItem('tippen_api_key');
      const response = await fetch(
        `https://tippen-backend.benjiemalinao879557.workers.dev/api/analytics/dashboard?api_key=${apiKey}`
      );
      const data = await response.json();
      setMetrics(data);
      setLoading(false);
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Loading metrics...</div>;

  return (
    <div>
      <MetricCard
        title="Total Outbound Calls"
        value={metrics.totalOutboundCalls}
      />
      <MetricCard
        title="Connection Rate"
        value={`${metrics.connectionRate.toFixed(1)}%`}
      />
      {/* ... more widgets */}
    </div>
  );
}
```

## Performance Considerations

### Indexing Strategy

All critical queries are indexed:
- `video_calls(api_key, status, invited_at)`
- `visitors(api_key, last_seen_at)`
- `company_insights(api_key, company)`
- `visitor_events(visitor_id, event_type, created_at)`

### Aggregation

For high-traffic scenarios, consider:
1. Pre-compute daily metrics in `performance_metrics` table
2. Run hourly aggregation jobs
3. Cache dashboard results for 1-5 minutes

### Data Retention

Consider archiving old data:
```sql
-- Archive calls older than 90 days
DELETE FROM video_calls WHERE invited_at < datetime('now', '-90 days');

-- Keep company_insights indefinitely (aggregated)
-- Archive visitor_events older than 30 days
DELETE FROM visitor_events WHERE created_at < datetime('now', '-30 days');
```

## Monitoring

### Key Metrics to Watch

1. **Connection Rate**: Should be >50%
   - If low, check video session quality
   - Monitor connection_time_seconds

2. **Qualified Lead Rate**: % of calls marked as qualified
   - Track per company
   - Identify high-value visitors

3. **Average Call Duration**: Longer = better engagement
   - Calls <60s may indicate issues
   - Calls >180s usually high quality

### Health Checks

```sql
-- Check for failed calls
SELECT COUNT(*) FROM video_calls
WHERE status = 'failed' AND DATE(invited_at) = DATE('now');

-- Check connection times (should be <10s)
SELECT AVG(connection_time_seconds) FROM video_calls
WHERE status IN ('connected', 'completed')
AND DATE(invited_at) = DATE('now');
```

## Next Steps

1. ✅ Run migration to create analytics tables
2. ✅ Integrate tracking in existing endpoints
3. ✅ Add API endpoints for dashboard metrics
4. ✅ Update frontend to display real data
5. ✅ Add admin panel for analytics insights
6. ✅ Set up daily aggregation jobs
7. ✅ Implement data retention policies

## Troubleshooting

### No metrics showing up?

1. Check if migrations ran successfully:
   ```bash
   npx wrangler d1 execute DB --command="SELECT name FROM sqlite_master WHERE type='table'"
   ```

2. Verify tracking code is being called:
   ```typescript
   console.log('Tracking video call:', sessionId);
   ```

3. Query database directly:
   ```bash
   npx wrangler d1 execute DB --command="SELECT * FROM video_calls LIMIT 10"
   ```

### Incorrect metrics?

- Check `updated_at` timestamps in `company_insights`
- Verify `performance_metrics` aggregations
- Look for duplicate `visitor_events`

---

**Last Updated**: 2025-10-26
**Version**: 1.0.0
