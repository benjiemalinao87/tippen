/**
 * Tippen - Cloudflare Worker Entry Point
 * Handles visitor tracking and WebSocket connections
 */

import { VisitorCoordinator } from './VisitorCoordinator';
import {
  handleCreateApiKey,
  handleGetApiKeys,
  handleGetApiKey,
  handleUpdateApiKey,
  handleDeleteApiKey
} from './apiKeyHandlers';
import { saveVisitorToD1, updateVisitorVideoStatus } from './visitorStorage';
import {
  getDashboardMetrics,
  getTopCompanies,
  getCallVolumeOverTime,
  getVisitorAnalytics
} from './analytics';
import {
  handleSignup,
  handleLogin,
  verifySession,
  handleLogout
} from './auth';
import { TRACKING_SCRIPT } from './trackingScript';
import { getSlackConfig, saveSlackConfig, sendNewVisitorNotification } from './slack';

export interface Env {
  VISITOR_COORDINATOR: DurableObjectNamespace;
  CLEARBIT_API_KEY: string;
  DB: D1Database;
}

// Export Durable Object
export { VisitorCoordinator };

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Tippen-API-Key',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Route: Visitor tracking webhook
    if (url.pathname === '/track/visitor' && request.method === 'POST') {
      return handleVisitorTracking(request, env, corsHeaders);
    }

    // Route: WebSocket connection for dashboard
    if (url.pathname === '/ws/dashboard') {
      return handleWebSocketConnection(request, env, 'dashboard');
    }

    // Route: WebSocket connection for visitor
    if (url.pathname === '/ws/visitor') {
      return handleWebSocketConnection(request, env, 'visitor');
    }

    // Route: Send video invite to visitor
    if (url.pathname === '/api/send-video-invite' && request.method === 'POST') {
      return handleSendVideoInvite(request, env, corsHeaders);
    }

    // Route: Create/Save API key
    if (url.pathname === '/api/keys' && request.method === 'POST') {
      return handleCreateApiKey(request, env, corsHeaders);
    }

    // Route: Get API keys (list all)
    if (url.pathname === '/api/keys' && request.method === 'GET') {
      return handleGetApiKeys(request, env, corsHeaders);
    }

    // Route: Get single API key
    if (url.pathname.startsWith('/api/keys/') && request.method === 'GET') {
      return handleGetApiKey(request, env, corsHeaders, url);
    }

    // Route: Update API key
    if (url.pathname.startsWith('/api/keys/') && request.method === 'PUT') {
      return handleUpdateApiKey(request, env, corsHeaders, url);
    }

    // Route: Delete API key
    if (url.pathname.startsWith('/api/keys/') && request.method === 'DELETE') {
      return handleDeleteApiKey(request, env, corsHeaders, url);
    }

    // Route: Update visitor video status
    if (url.pathname === '/api/visitors/video-status' && request.method === 'POST') {
      return handleUpdateVideoStatus(request, env, corsHeaders);
    }

    // Route: Get dashboard analytics
    if (url.pathname === '/api/analytics/dashboard' && request.method === 'GET') {
      return handleGetDashboardAnalytics(request, env, corsHeaders, url);
    }

    // Route: Get top companies
    if (url.pathname === '/api/analytics/top-companies' && request.method === 'GET') {
      return handleGetTopCompanies(request, env, corsHeaders, url);
    }

    // Route: Get call volume over time
    if (url.pathname === '/api/analytics/call-volume' && request.method === 'GET') {
      return handleGetCallVolume(request, env, corsHeaders, url);
    }

    // Route: Get visitor analytics
    if (url.pathname === '/api/analytics/visitors' && request.method === 'GET') {
      return handleGetVisitorAnalytics(request, env, corsHeaders, url);
    }

    // Route: Get video sessions history
    if (url.pathname === '/api/analytics/video-sessions' && request.method === 'GET') {
      return handleGetVideoSessions(request, env, corsHeaders, url);
    }

    // Route: Save video call feedback
    if (url.pathname === '/api/video-calls/feedback' && request.method === 'POST') {
      return handleSaveVideoCallFeedback(request, env, corsHeaders);
    }

    // Route: User signup
    if (url.pathname === '/api/auth/signup' && request.method === 'POST') {
      return handleSignupRequest(request, env, corsHeaders);
    }

    // Route: User login
    if (url.pathname === '/api/auth/login' && request.method === 'POST') {
      return handleLoginRequest(request, env, corsHeaders);
    }

    // Route: Verify session
    if (url.pathname === '/api/auth/verify' && request.method === 'POST') {
      return handleVerifySession(request, env, corsHeaders);
    }

    // Route: Logout
    if (url.pathname === '/api/auth/logout' && request.method === 'POST') {
      return handleLogoutRequest(request, env, corsHeaders);
    }

    // Route: Serve tracking script
    if (url.pathname === '/tippen-tracker.js' && request.method === 'GET') {
      return handleGetTrackingScript(corsHeaders);
    }

    // Route: Save Slack configuration
    if (url.pathname === '/api/slack/config' && request.method === 'POST') {
      return handleSaveSlackConfig(request, env, corsHeaders);
    }

    // Route: Get Slack configuration
    if (url.pathname === '/api/slack/config' && request.method === 'GET') {
      return handleGetSlackConfig(request, env, corsHeaders);
    }

    return new Response('Tippen API', { status: 200 });
  },
};

/**
 * Handle visitor tracking from embedded script
 */
async function handleVisitorTracking(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const data = await request.json() as any;
    const apiKey = request.headers.get('X-Tippen-API-Key');

    if (!apiKey) {
      return new Response('API key required', { status: 401, headers: corsHeaders });
    }

    // Enrich visitor data with company information
    const enrichedVisitor = await enrichVisitorData(data.visitor, request, env);

    // Debug log to see enriched data
    console.log('[Tippen] Enriched visitor:', JSON.stringify({
      company: enrichedVisitor.company,
      location: enrichedVisitor.location,
      lastRole: enrichedVisitor.lastRole,
      userAgent: enrichedVisitor.userAgent?.substring(0, 50) + '...'
    }));

    // Get the Durable Object for this API key (admin dashboard)
    const id = env.VISITOR_COORDINATOR.idFromName(apiKey);
    const stub = env.VISITOR_COORDINATOR.get(id);

    // Forward visitor data to Durable Object
    await stub.fetch(request.url, {
      method: 'POST',
      body: JSON.stringify({
        type: 'NEW_VISITOR',
        visitor: enrichedVisitor,
        event: data.event,
        website: data.website,
      }),
    });

    // Check if this is a NEW visitor (first time seeing them)
    let isNewVisitor = false;
    try {
      const existingVisitor = await env.DB
        .prepare('SELECT visitor_id FROM visitors WHERE visitor_id = ? AND api_key = ?')
        .bind(enrichedVisitor.visitorId, apiKey)
        .first();

      isNewVisitor = !existingVisitor;
    } catch (error) {
      console.error('[Tippen] Failed to check if visitor exists:', error);
    }

    // Save visitor to D1 database
    try {
      await saveVisitorToD1(env, apiKey, enrichedVisitor, data.website, data.event);
    } catch (error) {
      console.error('[Tippen] Failed to save visitor to D1:', error);
      // Continue anyway - don't fail the request if D1 save fails
    }

    // Send Slack notification with rate limiting (1 notification per 2 minutes)
    try {
      const slackConfig = await getSlackConfig(env.DB, apiKey);

      if (slackConfig && slackConfig.enabled) {
        // Check when the last Slack notification was sent for this visitor
        let shouldSendNotification = false;
        let lastNotificationTime: number | null = null;

        try {
          const result = await env.DB
            .prepare('SELECT last_slack_notification_at FROM visitors WHERE visitor_id = ? AND api_key = ?')
            .bind(enrichedVisitor.visitorId, apiKey)
            .first();

          if (result && result.last_slack_notification_at) {
            lastNotificationTime = new Date(result.last_slack_notification_at as string).getTime();
            const now = Date.now();
            const timeSinceLastNotification = now - lastNotificationTime;

            // Send notification if it's been at least 2 minutes (120 seconds)
            shouldSendNotification = timeSinceLastNotification >= 120000;

            console.log(`[Tippen] Last Slack notification: ${Math.round(timeSinceLastNotification / 1000)}s ago. Should send: ${shouldSendNotification}`);
          } else {
            // No previous notification, send one
            shouldSendNotification = true;
            console.log('[Tippen] No previous Slack notification found, sending first notification');
          }
        } catch (error) {
          console.error('[Tippen] Failed to check last notification time:', error);
          // If check fails, default to sending notification for new visitors only
          shouldSendNotification = isNewVisitor;
        }

        if (shouldSendNotification) {
          const visitorType = isNewVisitor ? '🆕 New' : '🔄 Returning';
          console.log(`[Tippen] Sending Slack notification for ${visitorType} visitor:`, enrichedVisitor.company);

          const slackPayload = {
            visitorId: enrichedVisitor.visitorId,
            company: `${visitorType} - ${enrichedVisitor.company || 'Unknown Company'}`,
            location: enrichedVisitor.location,
            revenue: enrichedVisitor.revenue,
            staff: enrichedVisitor.staff,
            lastRole: enrichedVisitor.lastRole,
            deviceType: enrichedVisitor.deviceType,
            pageViews: enrichedVisitor.pageViews || 1,
            timeOnSite: enrichedVisitor.timeOnSite,
            referrer: enrichedVisitor.referrer,
            timezone: enrichedVisitor.timezone,
            url: enrichedVisitor.url,
            ip: enrichedVisitor.ip,
            timestamp: new Date().toLocaleString()
          };

          console.log('[Tippen] Slack payload:', JSON.stringify(slackPayload, null, 2));

          await sendNewVisitorNotification(slackConfig.webhookUrl, slackPayload);

          // Update the last notification timestamp
          try {
            await env.DB
              .prepare('UPDATE visitors SET last_slack_notification_at = CURRENT_TIMESTAMP WHERE visitor_id = ? AND api_key = ?')
              .bind(enrichedVisitor.visitorId, apiKey)
              .run();
            console.log('[Tippen] Updated last_slack_notification_at timestamp');
          } catch (error) {
            console.error('[Tippen] Failed to update last notification timestamp:', error);
          }

          console.log('[Tippen] Slack notification sent successfully');
        } else {
          console.log('[Tippen] Skipping Slack notification (rate limit)');
        }
      }
    } catch (error) {
      console.error('[Tippen] Failed to send Slack notification:', error);
      // Don't fail the request if Slack fails
    }

    return new Response(
      JSON.stringify({
        success: true,
        sessionId: enrichedVisitor.visitorId,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * Enrich visitor data with company information using IP lookup
 */
async function enrichVisitorData(
  visitor: any,
  request: Request,
  env: Env
): Promise<any> {
  const ip = request.headers.get('CF-Connecting-IP') || '';

  // Use Clearbit or similar service for company enrichment
  try {
    const response = await fetch(`https://company.clearbit.com/v1/domains/find?ip=${ip}`, {
      headers: {
        Authorization: `Bearer ${env.CLEARBIT_API_KEY}`,
      },
    });

    if (response.ok) {
      const companyData = await response.json() as any;
      return {
        ...visitor,
        ip,
        company: companyData.name || 'Unknown',
        revenue: companyData.metrics?.estimatedAnnualRevenue || null,
        staff: companyData.metrics?.employees || null,
        industry: companyData.category?.industry || null,
        domain: companyData.domain || null,
      };
    }
  } catch (error) {
    console.error('Enrichment failed:', error);
  }

  // Fallback to basic data with useful info
  // Extract domain from referrer or current URL
  let companyName = 'Direct Visitor';

  if (visitor.referrer && visitor.referrer !== 'direct') {
    try {
      const referrerUrl = new URL(visitor.referrer);
      companyName = referrerUrl.hostname.replace('www.', '');
    } catch (e) {
      // Invalid URL
    }
  } else if (visitor.url) {
    try {
      const urlObj = new URL(visitor.url);
      companyName = urlObj.hostname.replace('www.', '') + ' Visitor';
    } catch (e) {
      // Invalid URL
    }
  }

  // Parse user agent for device/browser info
  const ua = visitor.userAgent || '';
  let deviceInfo = 'Unknown Device';
  if (ua.includes('iPhone')) deviceInfo = 'iPhone';
  else if (ua.includes('iPad')) deviceInfo = 'iPad';
  else if (ua.includes('Android')) deviceInfo = 'Android';
  else if (ua.includes('Mac')) deviceInfo = 'Mac';
  else if (ua.includes('Windows')) deviceInfo = 'Windows';
  else if (ua.includes('Linux')) deviceInfo = 'Linux';

  let browser = 'Unknown Browser';
  if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Edg')) browser = 'Edge';

  return {
    ...visitor,
    ip,
    company: companyName,
    location: visitor.timezone || 'Unknown Location',
    deviceType: `${deviceInfo} - ${browser}`,  // Store device info separately
    lastRole: visitor.lastRole || null,  // Keep actual role from visitor data, or null
    revenue: null,
    staff: null,
    userAgent: visitor.userAgent,
    screenResolution: visitor.screenResolution,
    language: visitor.language,
  };
}

/**
 * Handle WebSocket connection from admin dashboard or visitor
 */
async function handleWebSocketConnection(request: Request, env: Env, connectionType: 'dashboard' | 'visitor'): Promise<Response> {
  const url = new URL(request.url);
  const apiKey = url.searchParams.get('apiKey');

  if (!apiKey) {
    return new Response('API key required', { status: 401 });
  }

  // Get Durable Object for this API key
  const id = env.VISITOR_COORDINATOR.idFromName(apiKey);
  const stub = env.VISITOR_COORDINATOR.get(id);

  // Add connection type to URL for Durable Object to handle
  const newUrl = new URL(request.url);
  newUrl.searchParams.set('connectionType', connectionType);
  
  if (connectionType === 'visitor') {
    const visitorId = url.searchParams.get('visitorId');
    if (visitorId) {
      newUrl.searchParams.set('visitorId', visitorId);
    }
  }

  // Forward WebSocket upgrade to Durable Object
  return stub.fetch(newUrl.toString(), {
    method: request.method,
    headers: request.headers,
  });
}

/**
 * Send video invite to specific visitor
 */
async function handleSendVideoInvite(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const data = await request.json() as any;
    const { apiKey, visitorId, guestUrl, sessionId } = data;

    // Get Durable Object
    const id = env.VISITOR_COORDINATOR.idFromName(apiKey);
    const stub = env.VISITOR_COORDINATOR.get(id);

    // Send video invite through Durable Object
    await stub.fetch(request.url, {
      method: 'POST',
      body: JSON.stringify({
        type: 'SEND_VIDEO_INVITE',
        visitorId,
        guestUrl,
        sessionId,  // Pass sessionId to Durable Object
      }),
    });

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * Update visitor video session status
 */
async function handleUpdateVideoStatus(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const data = await request.json() as any;
    const { apiKey, visitorId, videoData, status } = data;

    if (!apiKey || !visitorId || !videoData || !status) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    await updateVisitorVideoStatus(env, apiKey, visitorId, videoData, status);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error updating video status:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Handle dashboard analytics request
 */
async function handleGetDashboardAnalytics(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>,
  url: URL
): Promise<Response> {
  try {
    const apiKey = url.searchParams.get('api_key');

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const metrics = await getDashboardMetrics(env.DB, apiKey);

    return new Response(
      JSON.stringify(metrics),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error fetching dashboard analytics:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Handle top companies request
 */
async function handleGetTopCompanies(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>,
  url: URL
): Promise<Response> {
  try {
    const apiKey = url.searchParams.get('api_key');
    const limit = parseInt(url.searchParams.get('limit') || '10');

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const companies = await getTopCompanies(env.DB, apiKey, limit);

    return new Response(
      JSON.stringify(companies),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error fetching top companies:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Handle call volume over time request
 */
async function handleGetCallVolume(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>,
  url: URL
): Promise<Response> {
  try {
    const apiKey = url.searchParams.get('api_key');
    const days = parseInt(url.searchParams.get('days') || '7');

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const callVolume = await getCallVolumeOverTime(env.DB, apiKey, days);

    return new Response(
      JSON.stringify(callVolume),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error fetching call volume:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Handle visitor analytics request
 */
async function handleGetVisitorAnalytics(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>,
  url: URL
): Promise<Response> {
  try {
    const apiKey = url.searchParams.get('api_key');
    const dateRange = url.searchParams.get('range') as any || 'today';
    const startDate = url.searchParams.get('start_date') || undefined;
    const endDate = url.searchParams.get('end_date') || undefined;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const analytics = await getVisitorAnalytics(env.DB, apiKey, dateRange, startDate, endDate);

    return new Response(
      JSON.stringify(analytics),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error fetching visitor analytics:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Handle get video sessions history request
 */
async function handleGetVideoSessions(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>,
  url: URL
): Promise<Response> {
  try {
    const apiKey = url.searchParams.get('api_key');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const status = url.searchParams.get('status') as string | undefined;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build query
    let query = `
      SELECT
        id,
        visitor_id,
        session_id,
        company,
        visitor_role,
        status,
        invited_at,
        connected_at,
        ended_at,
        duration_seconds,
        connection_time_seconds,
        is_qualified_lead,
        lead_quality_score,
        lead_quality,
        notes
      FROM video_calls
      WHERE api_key = ?
    `;

    const params: any[] = [apiKey];

    if (status) {
      query += ` AND status = ?`;
      params.push(status);
    }

    query += ` ORDER BY invited_at DESC LIMIT ?`;
    params.push(limit);

    const result = await env.DB.prepare(query).bind(...params).all();

    return new Response(
      JSON.stringify({
        success: true,
        sessions: result.results || [],
        total: result.results?.length || 0
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error fetching video sessions:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Handle save video call feedback
 */
async function handleSaveVideoCallFeedback(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const data = await request.json() as any;
    const { apiKey, sessionId, leadQuality, leadQualityScore, notes, isQualifiedLead } = data;

    if (!apiKey || !sessionId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: apiKey and sessionId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update video_calls with feedback
    const updates: string[] = [];
    const params: any[] = [];

    if (leadQuality) {
      updates.push('lead_quality = ?');
      params.push(leadQuality);
    }

    if (leadQualityScore !== undefined && leadQualityScore !== null) {
      updates.push('lead_quality_score = ?');
      params.push(leadQualityScore);
    }

    if (notes !== undefined) {
      updates.push('notes = ?');
      params.push(notes);
    }

    if (isQualifiedLead !== undefined) {
      updates.push('is_qualified_lead = ?');
      params.push(isQualifiedLead ? 1 : 0);
    }

    if (updates.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No feedback data provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Add sessionId and apiKey to params for WHERE clause
    params.push(sessionId, apiKey);

    const query = `
      UPDATE video_calls
      SET ${updates.join(', ')}
      WHERE session_id = ? AND api_key = ?
    `;

    await env.DB.prepare(query).bind(...params).run();

    console.log(`[Feedback] Saved feedback for session ${sessionId}`);

    return new Response(
      JSON.stringify({ success: true, message: 'Feedback saved successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error saving video call feedback:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Handle user signup request
 */
async function handleSignupRequest(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const signupData = await request.json() as any;
    const result = await handleSignup(env.DB, signupData);

    return new Response(
      JSON.stringify(result),
      {
        status: result.success ? 200 : 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error: any) {
    console.error('Signup error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Handle user login request
 */
async function handleLoginRequest(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const loginData = await request.json() as any;
    const result = await handleLogin(env.DB, loginData);

    return new Response(
      JSON.stringify(result),
      {
        status: result.success ? 200 : 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error: any) {
    console.error('Login error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Handle session verification request
 */
async function handleVerifySession(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const { token } = await request.json() as any;

    if (!token) {
      return new Response(
        JSON.stringify({ success: false, error: 'Token required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await verifySession(env.DB, token);

    return new Response(
      JSON.stringify(result),
      {
        status: result.success ? 200 : 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error: any) {
    console.error('Session verification error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Handle logout request
 */
async function handleLogoutRequest(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const { token } = await request.json() as any;

    if (!token) {
      return new Response(
        JSON.stringify({ success: false, error: 'Token required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await handleLogout(env.DB, token);

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Logout error:', error);
    return new Response(
      JSON.stringify({ success: false }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Serve tracking script
 */
function handleGetTrackingScript(corsHeaders: Record<string, string>): Response {
  return new Response(TRACKING_SCRIPT, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/javascript',
      'Cache-Control': 'no-cache, no-store, must-revalidate', // No cache for testing
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
}

/**
 * Handle saving Slack configuration
 */
async function handleSaveSlackConfig(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const { apiKey, webhookUrl, channelName, enabled } = await request.json() as any;

    if (!apiKey || !webhookUrl) {
      return new Response(
        JSON.stringify({ success: false, error: 'API key and webhook URL required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const success = await saveSlackConfig(env.DB, apiKey, {
      webhookUrl,
      channelName: channelName || '',
      enabled: enabled !== false
    });

    return new Response(
      JSON.stringify({ success }),
      { status: success ? 200 : 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error saving Slack config:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Handle getting Slack configuration
 */
async function handleGetSlackConfig(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const url = new URL(request.url);
    const apiKey = url.searchParams.get('api_key');

    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'API key required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const config = await getSlackConfig(env.DB, apiKey);

    return new Response(
      JSON.stringify({ success: true, config }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error getting Slack config:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
