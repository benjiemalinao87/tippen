/**
 * Command Center - Platform-wide analytics for saas-owner users
 */

interface CommandCenterStats {
  totalOrganizations: number;
  totalUsers: number;
  totalVisitors: number;
  totalCreditsUsed: number;
  totalCreditsSaved: number;
  cacheHitRate: number;
  organizations: OrganizationData[];
  creditUsageHistory: CreditUsageData[];
  enrichmentStats: EnrichmentStats;
}

interface OrganizationData {
  id: number;
  name: string;
  apiKey: string;
  totalUsers: number;
  totalVisitors: number;
  totalVideoCalls: number;
  totalInvites: number;
  connectedCalls: number;
  qualifiedLeads: number;
  avgCallDuration: number;
  creditsUsed: number;
  cacheHits: number;
  lastActivity: string;
  status: 'active' | 'inactive';
}

interface CreditUsageData {
  date: string;
  creditsUsed: number;
  creditsSaved: number;
}

interface EnrichmentStats {
  totalLookups: number;
  successfulLookups: number;
  failedLookups: number;
  cacheHits: number;
  cacheMisses: number;
  avgResponseTime: number;
}

export async function getCommandCenterStats(env: any): Promise<CommandCenterStats> {
  try {
    // Get total organizations
    const orgsResult = await env.DB.prepare(`
      SELECT COUNT(*) as total
      FROM organizations
    `).first();
    const totalOrganizations = orgsResult?.total || 0;

    // Get total users
    const usersResult = await env.DB.prepare(`
      SELECT COUNT(*) as total
      FROM users
      WHERE status = 'active'
    `).first();
    const totalUsers = usersResult?.total || 0;

    // Get total visitors tracked
    const visitorsResult = await env.DB.prepare(`
      SELECT COUNT(DISTINCT visitor_id) as total
      FROM visitors
    `).first();
    const totalVisitors = visitorsResult?.total || 0;

    // Get enrichment cache stats
    const cacheStats = await env.DB.prepare(`
      SELECT
        COUNT(*) as total_lookups,
        SUM(lookup_count) as cache_hits,
        SUM(credits_used) as total_credits_used,
        SUM(credits_saved) as total_credits_saved,
        AVG(api_response_time_ms) as avg_response_time,
        SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful_lookups,
        SUM(CASE WHEN status IN ('failed', 'no_data') THEN 1 ELSE 0 END) as failed_lookups
      FROM enrichment_cache
    `).first();

    const totalLookups = (cacheStats?.cache_hits || 0) + (cacheStats?.total_lookups || 0);
    const cacheHits = cacheStats?.cache_hits || 0;
    const cacheMisses = cacheStats?.total_lookups || 0;
    const cacheHitRate = totalLookups > 0 ? (cacheHits / totalLookups) * 100 : 0;

    // Get organization details with comprehensive metrics
    const organizationsData = await env.DB.prepare(`
      SELECT
        o.id,
        o.name,
        o.api_key,
        COUNT(DISTINCT u.id) as total_users,
        COUNT(DISTINCT v.visitor_id) as total_visitors,
        COUNT(DISTINCT vc.id) as total_video_calls,
        COUNT(DISTINCT CASE WHEN vc.status = 'invited' THEN vc.id END) as total_invites,
        COUNT(DISTINCT CASE WHEN vc.status IN ('connected', 'completed') THEN vc.id END) as connected_calls,
        COUNT(DISTINCT CASE WHEN vc.is_qualified_lead = 1 THEN vc.id END) as qualified_leads,
        COALESCE(AVG(CASE WHEN vc.duration_seconds > 0 THEN vc.duration_seconds END), 0) as avg_call_duration,
        0 as credits_used,
        0 as cache_hits,
        MAX(v.last_seen_at) as last_activity,
        'active' as status
      FROM organizations o
      LEFT JOIN users u ON o.id = u.organization_id AND u.status = 'active'
      LEFT JOIN visitors v ON o.api_key = v.api_key
      LEFT JOIN video_calls vc ON o.api_key = vc.api_key
      GROUP BY o.id, o.name, o.api_key
      ORDER BY total_visitors DESC
    `).all();

    const organizations: OrganizationData[] = (organizationsData.results || []).map((org: any) => ({
      id: org.id,
      name: org.name,
      apiKey: org.api_key,
      totalUsers: org.total_users || 0,
      totalVisitors: org.total_visitors || 0,
      totalVideoCalls: org.total_video_calls || 0,
      totalInvites: org.total_invites || 0,
      connectedCalls: org.connected_calls || 0,
      qualifiedLeads: org.qualified_leads || 0,
      avgCallDuration: Math.round(org.avg_call_duration || 0),
      creditsUsed: org.credits_used || 0,
      cacheHits: org.cache_hits || 0,
      lastActivity: org.last_activity || new Date().toISOString(),
      status: org.status === 'active' ? 'active' : 'inactive'
    }));

    // Get credit usage history (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const creditHistoryResult = await env.DB.prepare(`
      SELECT
        DATE(first_looked_up_at) as date,
        SUM(CASE WHEN lookup_count = 1 THEN credits_used ELSE 0 END) as credits_used,
        SUM(CASE WHEN lookup_count > 1 THEN (lookup_count - 1) ELSE 0 END) as credits_saved
      FROM enrichment_cache
      WHERE first_looked_up_at >= ?
      GROUP BY DATE(first_looked_up_at)
      ORDER BY DATE(first_looked_up_at) ASC
    `).bind(sevenDaysAgo.toISOString()).all();

    // Fill in missing days with zeros
    const creditUsageHistory: CreditUsageData[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const existing = (creditHistoryResult.results || []).find((r: any) => r.date === dateStr);
      creditUsageHistory.push({
        date: dateStr,
        creditsUsed: existing?.credits_used || 0,
        creditsSaved: existing?.credits_saved || 0
      });
    }

    const enrichmentStats: EnrichmentStats = {
      totalLookups,
      successfulLookups: cacheStats?.successful_lookups || 0,
      failedLookups: cacheStats?.failed_lookups || 0,
      cacheHits,
      cacheMisses,
      avgResponseTime: Math.round(cacheStats?.avg_response_time || 0)
    };

    return {
      totalOrganizations,
      totalUsers,
      totalVisitors,
      totalCreditsUsed: cacheStats?.total_credits_used || 0,
      totalCreditsSaved: cacheStats?.total_credits_saved || 0,
      cacheHitRate,
      organizations,
      creditUsageHistory,
      enrichmentStats
    };
  } catch (error) {
    console.error('[Command Center] Error fetching stats:', error);
    throw error;
  }
}

/**
 * Parse SAAS_OWNERS env variable into a Set of emails
 */
function getSaasOwnerEmails(env: any): Set<string> {
  const saasOwners = env.SAAS_OWNERS || '';
  const emails = saasOwners
    .split(',')
    .map((email: string) => email.trim().toLowerCase())
    .filter((email: string) => email.length > 0);
  return new Set(emails);
}

/**
 * Verify that the request is from a saas-owner
 * Checks both:
 * 1. If user's email is in the SAAS_OWNERS env variable
 * 2. OR if user has role 'saas-owner' in the database
 */
async function verifySaasOwner(
  request: Request,
  env: any
): Promise<{ authorized: boolean; userId?: number; userEmail?: string; error?: string }> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { authorized: false, error: 'Unauthorized' };
  }

  const token = authHeader.substring(7);

  const session = await env.DB.prepare(`
    SELECT s.user_id, u.role, u.email
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.token = ? AND s.expires_at > datetime('now') AND s.revoked_at IS NULL
  `).bind(token).first();

  if (!session) {
    return { authorized: false, error: 'Unauthorized' };
  }

  // Get list of saas-owner emails from env
  const saasOwnerEmails = getSaasOwnerEmails(env);
  const userEmail = (session.email || '').toLowerCase();

  // Check if user is authorized:
  // 1. Email is in SAAS_OWNERS env variable
  // 2. OR role is 'saas-owner' in database
  const isInEnvList = saasOwnerEmails.has(userEmail);
  const hasDbRole = session.role === 'saas-owner';

  if (!isInEnvList && !hasDbRole) {
    console.log(`[SaaS Owner] Access denied for ${userEmail}. InEnvList: ${isInEnvList}, HasDbRole: ${hasDbRole}`);
    return { authorized: false, error: 'Forbidden: saas-owner access required' };
  }

  console.log(`[SaaS Owner] Access granted for ${userEmail}. InEnvList: ${isInEnvList}, HasDbRole: ${hasDbRole}`);
  return { authorized: true, userId: session.user_id, userEmail };
}

export async function handleCommandCenterRequest(
  request: Request,
  env: any,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const auth = await verifySaasOwner(request, env);
    if (!auth.authorized) {
      return new Response(JSON.stringify({ error: auth.error }), {
        status: auth.error === 'Unauthorized' ? 401 : 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get command center stats
    const stats = await getCommandCenterStats(env);

    return new Response(JSON.stringify(stats), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('[Command Center] Request error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

/**
 * List all organizations for workspace switcher (saas-owner only)
 */
export async function handleListOrganizations(
  request: Request,
  env: any,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const auth = await verifySaasOwner(request, env);
    if (!auth.authorized) {
      return new Response(JSON.stringify({ error: auth.error }), {
        status: auth.error === 'Unauthorized' ? 401 : 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get all organizations with basic info for workspace switcher
    const orgsResult = await env.DB.prepare(`
      SELECT 
        o.id,
        o.name,
        o.api_key,
        o.created_at,
        COUNT(DISTINCT v.visitor_id) as total_visitors,
        MAX(v.last_seen_at) as last_activity,
        CASE 
          WHEN MAX(v.last_seen_at) > datetime('now', '-7 days') THEN 'active'
          ELSE 'inactive'
        END as status
      FROM organizations o
      LEFT JOIN visitors v ON o.api_key = v.api_key
      GROUP BY o.id, o.name, o.api_key, o.created_at
      ORDER BY o.name ASC
    `).all();

    const organizations = (orgsResult.results || []).map((org: any) => ({
      id: org.id,
      name: org.name,
      apiKey: org.api_key,
      totalVisitors: org.total_visitors || 0,
      lastActivity: org.last_activity || org.created_at,
      status: org.status || 'inactive'
    }));

    console.log(`[Workspace Switcher] Listed ${organizations.length} organizations for saas-owner`);

    return new Response(JSON.stringify({ 
      success: true, 
      organizations 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('[Workspace Switcher] Error listing organizations:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Switch to a client workspace / start impersonation (saas-owner only)
 */
export async function handleSwitchWorkspace(
  request: Request,
  env: any,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const auth = await verifySaasOwner(request, env);
    if (!auth.authorized) {
      return new Response(JSON.stringify({ error: auth.error }), {
        status: auth.error === 'Unauthorized' ? 401 : 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const body = await request.json() as { organizationId?: number };
    
    if (!body.organizationId) {
      return new Response(JSON.stringify({ error: 'organizationId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get the target organization
    const org = await env.DB.prepare(`
      SELECT id, name, api_key, slug
      FROM organizations
      WHERE id = ?
    `).bind(body.organizationId).first();

    if (!org) {
      return new Response(JSON.stringify({ error: 'Organization not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Log the impersonation action for audit purposes
    await env.DB.prepare(`
      INSERT INTO audit_logs (user_id, action, ip_address, new_values)
      VALUES (?, 'workspace_impersonation_start', ?, ?)
    `).bind(
      auth.userId,
      request.headers.get('CF-Connecting-IP') || 'unknown',
      JSON.stringify({ 
        targetOrganizationId: org.id, 
        targetOrganizationName: org.name,
        targetApiKey: org.api_key
      })
    ).run();

    console.log(`[Workspace Switcher] SaaS owner (user ${auth.userId}) switched to organization: ${org.name}`);

    return new Response(JSON.stringify({ 
      success: true, 
      organization: {
        id: org.id,
        name: org.name,
        apiKey: org.api_key,
        slug: org.slug
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('[Workspace Switcher] Error switching workspace:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}
