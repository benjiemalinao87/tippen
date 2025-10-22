/**
 * Visitor Storage Functions for D1 Database
 */

export interface Env {
  DB: D1Database;
}

/**
 * Save visitor data to D1 database
 * Creates new visitor or updates existing one
 */
export async function saveVisitorToD1(
  env: Env,
  apiKey: string,
  visitor: any,
  website: string,
  event: string
): Promise<void> {
  try {
    // Check if visitor already exists
    const existing = await env.DB.prepare(
      `SELECT id, page_views, total_time_seconds FROM visitor_sessions 
       WHERE api_key = ? AND visitor_id = ?`
    )
      .bind(apiKey, visitor.visitorId)
      .first();

    if (existing) {
      // Update existing visitor
      await env.DB.prepare(
        `UPDATE visitor_sessions 
         SET last_seen_at = CURRENT_TIMESTAMP,
             page_views = page_views + 1,
             company = ?,
             location = ?,
             last_role = ?,
             website = ?
         WHERE id = ?`
      )
        .bind(
          visitor.company || null,
          visitor.location || null,
          visitor.lastRole || null,
          website || null,
          existing.id
        )
        .run();

      console.log(`[D1] Updated visitor ${visitor.visitorId} - page views: ${(existing.page_views as number) + 1}`);
    } else {
      // Insert new visitor
      await env.DB.prepare(
        `INSERT INTO visitor_sessions 
         (api_key, visitor_id, company, location, last_role, website, page_views, first_seen_at, last_seen_at)
         VALUES (?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
      )
        .bind(
          apiKey,
          visitor.visitorId,
          visitor.company || null,
          visitor.location || null,
          visitor.lastRole || null,
          website || null
        )
        .run();

      console.log(`[D1] Inserted new visitor ${visitor.visitorId} from ${visitor.company || 'Unknown'}`);
      
      // Also update the API key usage count
      await env.DB.prepare(
        `UPDATE api_keys 
         SET usage_count = usage_count + 1,
             last_used_at = CURRENT_TIMESTAMP
         WHERE api_key = ?`
      )
        .bind(apiKey)
        .run();

      console.log(`[D1] Updated API key usage count for ${apiKey}`);
    }
  } catch (error) {
    console.error('[D1] Error saving visitor:', error);
    throw error;
  }
}

/**
 * Get all visitors for an API key
 */
export async function getVisitorsByApiKey(
  env: Env,
  apiKey: string,
  limit: number = 100,
  offset: number = 0
): Promise<any> {
  try {
    const result = await env.DB.prepare(
      `SELECT * FROM visitor_sessions 
       WHERE api_key = ? 
       ORDER BY last_seen_at DESC 
       LIMIT ? OFFSET ?`
    )
      .bind(apiKey, limit, offset)
      .all();

    return {
      visitors: result.results,
      count: result.results.length
    };
  } catch (error) {
    console.error('[D1] Error fetching visitors:', error);
    throw error;
  }
}

/**
 * Get visitor statistics for an API key
 */
export async function getVisitorStats(
  env: Env,
  apiKey: string
): Promise<any> {
  try {
    const stats = await env.DB.prepare(
      `SELECT 
         COUNT(DISTINCT visitor_id) as unique_visitors,
         SUM(page_views) as total_page_views,
         SUM(total_time_seconds) as total_time_seconds,
         COUNT(*) as total_sessions
       FROM visitor_sessions 
       WHERE api_key = ?`
    )
      .bind(apiKey)
      .first();

    return stats;
  } catch (error) {
    console.error('[D1] Error fetching visitor stats:', error);
    throw error;
  }
}

/**
 * Get recent visitors (last 24 hours)
 */
export async function getRecentVisitors(
  env: Env,
  apiKey: string,
  hours: number = 24
): Promise<any> {
  try {
    const result = await env.DB.prepare(
      `SELECT * FROM visitor_sessions 
       WHERE api_key = ? 
         AND last_seen_at >= datetime('now', '-${hours} hours')
       ORDER BY last_seen_at DESC`
    )
      .bind(apiKey)
      .all();

    return {
      visitors: result.results,
      count: result.results.length
    };
  } catch (error) {
    console.error('[D1] Error fetching recent visitors:', error);
    throw error;
  }
}

