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
    // Get total organizations (from api_keys table)
    const orgsResult = await env.DB.prepare(`
      SELECT COUNT(DISTINCT api_key) as total
      FROM api_keys
      WHERE status = 'active'
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

    // Get organization details
    const organizationsData = await env.DB.prepare(`
      SELECT
        ak.id,
        COALESCE(o.name, ak.name, 'Organization ' || ak.id) as name,
        ak.api_key,
        COUNT(DISTINCT u.id) as total_users,
        COUNT(DISTINCT v.visitor_id) as total_visitors,
        COALESCE(SUM(ec.credits_used), 0) as credits_used,
        COALESCE(SUM(ec.lookup_count), 0) as cache_hits,
        MAX(v.last_seen_at) as last_activity,
        ak.status
      FROM api_keys ak
      LEFT JOIN organizations o ON ak.organization_id = o.id
      LEFT JOIN users u ON o.id = u.organization_id
      LEFT JOIN visitors v ON ak.api_key = v.api_key
      LEFT JOIN enrichment_cache ec ON v.ip_address = ec.ip_address
      WHERE ak.status = 'active'
      GROUP BY ak.id, o.name, ak.name, ak.api_key, ak.status
      ORDER BY total_visitors DESC
    `).all();

    const organizations: OrganizationData[] = (organizationsData.results || []).map((org: any) => ({
      id: org.id,
      name: org.name,
      apiKey: org.api_key,
      totalUsers: org.total_users || 0,
      totalVisitors: org.total_visitors || 0,
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

export async function handleCommandCenterRequest(
  request: Request,
  env: any,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    // Verify user is saas-owner
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.substring(7);

    // Verify session and get user
    const session = await env.DB.prepare(`
      SELECT s.user_id, u.role
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.session_token = ? AND s.expires_at > datetime('now')
    `).bind(token).first();

    if (!session || session.role !== 'saas-owner') {
      return new Response(JSON.stringify({ error: 'Forbidden: saas-owner role required' }), {
        status: 403,
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
