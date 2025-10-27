/**
 * Analytics Service
 * Handles all database operations for metrics, video calls, and performance tracking
 */

import type { D1Database } from '@cloudflare/workers-types';

// ============================================================================
// VIDEO CALL TRACKING
// ============================================================================

export interface VideoCall {
  id?: number;
  api_key: string;
  visitor_id: string;
  session_id: string;
  company?: string;
  visitor_role?: string;
  status: 'invited' | 'connecting' | 'connected' | 'completed' | 'failed' | 'declined';
  invited_at?: string;
  connected_at?: string;
  ended_at?: string;
  duration_seconds?: number;
  connection_time_seconds?: number;
  is_qualified_lead?: boolean;
  lead_quality_score?: number;
  host_url?: string;
  guest_url?: string;
  notes?: string;
}

/**
 * Create a new video call record when admin initiates a call
 */
export async function createVideoCall(
  db: D1Database,
  data: Omit<VideoCall, 'id' | 'invited_at'>
): Promise<number> {
  const result = await db
    .prepare(
      `INSERT INTO video_calls (
        api_key, visitor_id, session_id, company, visitor_role,
        status, host_url, guest_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      data.api_key,
      data.visitor_id,
      data.session_id,
      data.company || null,
      data.visitor_role || null,
      data.status,
      data.host_url || null,
      data.guest_url || null
    )
    .run();

  return result.meta.last_row_id || 0;
}

/**
 * Update video call status (connecting -> connected -> completed)
 */
export async function updateVideoCallStatus(
  db: D1Database,
  session_id: string,
  status: VideoCall['status'],
  additionalData?: Partial<VideoCall>
): Promise<void> {
  const updates: string[] = ['status = ?'];
  const bindings: any[] = [status];

  if (status === 'connected' && !additionalData?.connected_at) {
    updates.push('connected_at = CURRENT_TIMESTAMP');
  }
  if (status === 'completed' && !additionalData?.ended_at) {
    updates.push('ended_at = CURRENT_TIMESTAMP');

    // Calculate duration if not provided
    if (additionalData?.duration_seconds === undefined) {
      // Get the connected_at timestamp to calculate duration
      const existingCall = await db
        .prepare('SELECT connected_at FROM video_calls WHERE session_id = ?')
        .bind(session_id)
        .first();

      if (existingCall && existingCall.connected_at) {
        const connectedAt = new Date(existingCall.connected_at as string);
        const endedAt = new Date();
        const durationSeconds = Math.floor((endedAt.getTime() - connectedAt.getTime()) / 1000);

        updates.push('duration_seconds = ?');
        bindings.push(durationSeconds);

        console.log(`[Analytics] Calculated duration for ${session_id}: ${durationSeconds}s`);
      }
    }
  }

  if (additionalData?.connected_at) {
    updates.push('connected_at = ?');
    bindings.push(additionalData.connected_at);
  }
  if (additionalData?.ended_at) {
    updates.push('ended_at = ?');
    bindings.push(additionalData.ended_at);
  }
  if (additionalData?.duration_seconds !== undefined) {
    updates.push('duration_seconds = ?');
    bindings.push(additionalData.duration_seconds);
  }
  if (additionalData?.connection_time_seconds !== undefined) {
    updates.push('connection_time_seconds = ?');
    bindings.push(additionalData.connection_time_seconds);
  }
  if (additionalData?.is_qualified_lead !== undefined) {
    updates.push('is_qualified_lead = ?');
    bindings.push(additionalData.is_qualified_lead ? 1 : 0);
  }
  if (additionalData?.lead_quality_score !== undefined) {
    updates.push('lead_quality_score = ?');
    bindings.push(additionalData.lead_quality_score);
  }

  bindings.push(session_id);

  await db
    .prepare(`UPDATE video_calls SET ${updates.join(', ')} WHERE session_id = ?`)
    .bind(...bindings)
    .run();
}

// ============================================================================
// VISITOR EVENTS TRACKING
// ============================================================================

export interface VisitorEvent {
  api_key: string;
  visitor_id: string;
  event_type:
    | 'page_view'
    | 'video_invite_sent'
    | 'video_accepted'
    | 'video_declined'
    | 'video_connected'
    | 'video_ended'
    | 'visitor_left';
  event_data?: Record<string, any>;
  page_url?: string;
  user_agent?: string;
  ip_address?: string;
}

/**
 * Track a visitor event
 */
export async function trackVisitorEvent(
  db: D1Database,
  event: VisitorEvent
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO visitor_events (
        api_key, visitor_id, event_type, event_data,
        page_url, user_agent, ip_address
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      event.api_key,
      event.visitor_id,
      event.event_type,
      event.event_data ? JSON.stringify(event.event_data) : null,
      event.page_url || null,
      event.user_agent || null,
      event.ip_address || null
    )
    .run();
}

// ============================================================================
// SLACK NOTIFICATIONS TRACKING
// ============================================================================

export interface SlackNotification {
  api_key: string;
  notification_type: 'new_visitor' | 'video_call_request';
  visitor_id?: string;
  video_session_id?: string;
  status: 'sent' | 'failed';
  payload?: Record<string, any>;
}

/**
 * Track a Slack notification
 */
export async function trackSlackNotification(
  db: D1Database,
  notification: SlackNotification
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO slack_notifications (
        api_key, notification_type, visitor_id, video_session_id,
        status, payload
      ) VALUES (?, ?, ?, ?, ?, ?)`
    )
    .bind(
      notification.api_key,
      notification.notification_type,
      notification.visitor_id || null,
      notification.video_session_id || null,
      notification.status,
      notification.payload ? JSON.stringify(notification.payload) : null
    )
    .run();
}

// ============================================================================
// COMPANY INSIGHTS
// ============================================================================

/**
 * Update company insights when a visitor from that company visits
 */
export async function updateCompanyInsights(
  db: D1Database,
  api_key: string,
  company: string,
  updates: {
    new_visit?: boolean;
    new_visitor?: boolean;
    page_views?: number;
    video_call?: boolean;
    successful_connection?: boolean;
    qualified_lead?: boolean;
    session_duration?: number;
  }
): Promise<void> {
  // Get existing record or create new one
  const existing = await db
    .prepare('SELECT * FROM company_insights WHERE api_key = ? AND company = ?')
    .bind(api_key, company)
    .first();

  if (existing) {
    // Update existing
    const updateFields: string[] = [];
    const bindings: any[] = [];

    if (updates.new_visit) {
      updateFields.push('total_visits = total_visits + 1');
      updateFields.push('last_visit_at = CURRENT_TIMESTAMP');
    }
    if (updates.new_visitor) {
      updateFields.push('total_visitors = total_visitors + 1');
    }
    if (updates.page_views) {
      updateFields.push('total_page_views = total_page_views + ?');
      bindings.push(updates.page_views);
    }
    if (updates.video_call) {
      updateFields.push('total_video_calls = total_video_calls + 1');
    }
    if (updates.successful_connection) {
      updateFields.push('successful_connections = successful_connections + 1');
    }
    if (updates.qualified_lead) {
      updateFields.push('qualified_leads = qualified_leads + 1');
    }
    if (updates.session_duration) {
      // Calculate new average
      updateFields.push(
        `avg_session_duration_seconds = (
          (COALESCE(avg_session_duration_seconds, 0) * total_visits + ?) / (total_visits + 1)
        )`
      );
      bindings.push(updates.session_duration);
    }

    bindings.push(api_key, company);

    if (updateFields.length > 0) {
      await db
        .prepare(
          `UPDATE company_insights SET ${updateFields.join(', ')}
           WHERE api_key = ? AND company = ?`
        )
        .bind(...bindings)
        .run();
    }
  } else {
    // Create new record
    await db
      .prepare(
        `INSERT INTO company_insights (
          api_key, company, total_visits, total_visitors, total_page_views,
          total_video_calls, successful_connections, qualified_leads,
          avg_session_duration_seconds, first_visit_at, last_visit_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
      )
      .bind(
        api_key,
        company,
        updates.new_visit ? 1 : 0,
        updates.new_visitor ? 1 : 0,
        updates.page_views || 0,
        updates.video_call ? 1 : 0,
        updates.successful_connection ? 1 : 0,
        updates.qualified_lead ? 1 : 0,
        updates.session_duration || 0
      )
      .run();
  }
}

// ============================================================================
// DASHBOARD METRICS QUERIES
// ============================================================================

export interface DashboardMetrics {
  totalOutboundCalls: number;
  connectionRate: number;
  qualifiedLeads: number;
  avgCallDuration: number;
  totalVisitors: number;
  activeVisitors: number;
}

/**
 * Get dashboard metrics for the current day
 */
export async function getDashboardMetrics(
  db: D1Database,
  api_key: string
): Promise<DashboardMetrics> {
  // Get video call stats
  const callStats = await db
    .prepare(
      `SELECT
        COUNT(*) as total_calls,
        SUM(CASE WHEN status = 'connected' OR status = 'completed' THEN 1 ELSE 0 END) as connected_calls,
        SUM(CASE WHEN is_qualified_lead = 1 THEN 1 ELSE 0 END) as qualified_leads,
        AVG(CASE WHEN duration_seconds > 0 THEN duration_seconds ELSE NULL END) as avg_duration
      FROM video_calls
      WHERE api_key = ? AND DATE(invited_at) = DATE('now')`
    )
    .bind(api_key)
    .first();

  // Get visitor stats
  const visitorStats = await db
    .prepare(
      `SELECT
        COUNT(*) as total_visitors,
        SUM(CASE WHEN last_seen_at >= datetime('now', '-5 minutes') THEN 1 ELSE 0 END) as active_visitors
      FROM visitors
      WHERE api_key = ? AND DATE(first_seen_at) = DATE('now')`
    )
    .bind(api_key)
    .first();

  const totalCalls = (callStats?.total_calls as number) || 0;
  const connectedCalls = (callStats?.connected_calls as number) || 0;

  return {
    totalOutboundCalls: totalCalls,
    connectionRate: totalCalls > 0 ? (connectedCalls / totalCalls) * 100 : 0,
    qualifiedLeads: (callStats?.qualified_leads as number) || 0,
    avgCallDuration: (callStats?.avg_duration as number) || 0,
    totalVisitors: (visitorStats?.total_visitors as number) || 0,
    activeVisitors: (visitorStats?.active_visitors as number) || 0,
  };
}

/**
 * Get top companies by engagement
 */
export async function getTopCompanies(
  db: D1Database,
  api_key: string,
  limit: number = 10
): Promise<any[]> {
  const results = await db
    .prepare(
      `SELECT
        company,
        total_visits,
        total_video_calls,
        successful_connections,
        qualified_leads,
        avg_session_duration_seconds
      FROM company_insights
      WHERE api_key = ?
      ORDER BY total_video_calls DESC, total_visits DESC
      LIMIT ?`
    )
    .bind(api_key, limit)
    .all();

  return results.results || [];
}

/**
 * Get call volume over time (for charts)
 */
export async function getCallVolumeOverTime(
  db: D1Database,
  api_key: string,
  days: number = 7
): Promise<any[]> {
  const results = await db
    .prepare(
      `SELECT
        DATE(invited_at) as date,
        COUNT(*) as total_calls,
        SUM(CASE WHEN status = 'connected' OR status = 'completed' THEN 1 ELSE 0 END) as successful_calls
      FROM video_calls
      WHERE api_key = ? AND invited_at >= datetime('now', '-' || ? || ' days')
      GROUP BY DATE(invited_at)
      ORDER BY date ASC`
    )
    .bind(api_key, days)
    .all();

  return results.results || [];
}

// ============================================================================
// VISITOR ANALYTICS
// ============================================================================

export interface VisitorAnalytics {
  totalVisitors: number;
  activeVisitors: number;
  totalPageViews: number;
  avgPageViewsPerVisitor: number;
  engagementRate: number;
  avgTimeOnSite: number;
  topVisitors: any[];
  visitorActivityByHour: any[];
  locationBreakdown: any[];
}

/**
 * Get visitor analytics for a given date range
 */
export async function getVisitorAnalytics(
  db: D1Database,
  api_key: string,
  dateRange: 'active' | 'today' | 'yesterday' | 'last7days' | 'last30days' | 'custom',
  startDate?: string,
  endDate?: string
): Promise<VisitorAnalytics> {
  // Build date filter based on range
  let dateFilter = '';
  let bindings: any[] = [api_key];

  if (dateRange === 'active') {
    // Active visitors (seen in last 5 minutes)
    dateFilter = "AND last_seen_at >= datetime('now', '-5 minutes')";
  } else if (dateRange === 'today') {
    dateFilter = "AND DATE(first_seen_at) = DATE('now')";
  } else if (dateRange === 'yesterday') {
    dateFilter = "AND DATE(first_seen_at) = DATE('now', '-1 day')";
  } else if (dateRange === 'last7days') {
    dateFilter = "AND first_seen_at >= datetime('now', '-7 days')";
  } else if (dateRange === 'last30days') {
    dateFilter = "AND first_seen_at >= datetime('now', '-30 days')";
  } else if (dateRange === 'custom' && startDate && endDate) {
    dateFilter = "AND DATE(first_seen_at) BETWEEN DATE(?) AND DATE(?)";
    bindings.push(startDate, endDate);
  }

  // Get visitor stats
  const visitorStats = await db
    .prepare(
      `SELECT
        COUNT(DISTINCT visitor_id) as total_visitors,
        SUM(page_views) as total_page_views,
        AVG(page_views) as avg_page_views,
        AVG(total_time_seconds) as avg_time_seconds,
        SUM(CASE WHEN page_views >= 3 THEN 1 ELSE 0 END) as engaged_visitors
      FROM visitors
      WHERE api_key = ? ${dateFilter}`
    )
    .bind(...bindings)
    .first();

  // Get active visitors count
  const activeVisitors = await db
    .prepare(
      `SELECT COUNT(DISTINCT visitor_id) as count
      FROM visitors
      WHERE api_key = ? AND last_seen_at >= datetime('now', '-5 minutes')`
    )
    .bind(api_key)
    .first();

  // Get top visitors (most engaged)
  const topVisitorsResult = await db
    .prepare(
      `SELECT
        visitor_id,
        company,
        location,
        last_role,
        page_views,
        total_time_seconds,
        last_seen_at
      FROM visitors
      WHERE api_key = ? ${dateFilter}
      ORDER BY page_views DESC, total_time_seconds DESC
      LIMIT 10`
    )
    .bind(...bindings)
    .all();

  // Get visitor activity by hour (last 7 hours for today, or aggregate for larger ranges)
  const activityByHourResult = await db
    .prepare(
      `SELECT
        strftime('%H', first_seen_at) as hour,
        COUNT(*) as visitor_count
      FROM visitors
      WHERE api_key = ? ${dateFilter}
      GROUP BY strftime('%H', first_seen_at)
      ORDER BY hour ASC`
    )
    .bind(...bindings)
    .all();

  // Get location breakdown
  const locationBreakdownResult = await db
    .prepare(
      `SELECT
        location,
        COUNT(*) as visitor_count
      FROM visitors
      WHERE api_key = ? ${dateFilter} AND location IS NOT NULL AND location != ''
      GROUP BY location
      ORDER BY visitor_count DESC
      LIMIT 10`
    )
    .bind(...bindings)
    .all();

  const totalVisitors = (visitorStats?.total_visitors as number) || 0;
  const engagedVisitors = (visitorStats?.engaged_visitors as number) || 0;

  return {
    totalVisitors,
    activeVisitors: (activeVisitors?.count as number) || 0,
    totalPageViews: (visitorStats?.total_page_views as number) || 0,
    avgPageViewsPerVisitor: (visitorStats?.avg_page_views as number) || 0,
    engagementRate: totalVisitors > 0 ? (engagedVisitors / totalVisitors) * 100 : 0,
    avgTimeOnSite: (visitorStats?.avg_time_seconds as number) || 0,
    topVisitors: topVisitorsResult.results || [],
    visitorActivityByHour: activityByHourResult.results || [],
    locationBreakdown: locationBreakdownResult.results || [],
  };
}
