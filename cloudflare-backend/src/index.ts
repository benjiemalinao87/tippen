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

    // Save visitor to D1 database
    try {
      await saveVisitorToD1(env, apiKey, enrichedVisitor, data.website, data.event);
    } catch (error) {
      console.error('[Tippen] Failed to save visitor to D1:', error);
      // Continue anyway - don't fail the request if D1 save fails
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
    lastRole: `${deviceInfo} - ${browser}`,
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
    const { apiKey, visitorId, guestUrl } = data;

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
