/**
 * Visitor Storage Functions for D1 Database
 */

import { createVideoCall, updateVideoCallStatus, trackVisitorEvent, updateCompanyInsights } from './analytics';

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
      `SELECT id, page_views, total_time_seconds FROM visitors 
       WHERE api_key = ? AND visitor_id = ?`
    )
      .bind(apiKey, visitor.visitorId)
      .first();

    if (existing) {
      // Update existing visitor
      await env.DB.prepare(
        `UPDATE visitors 
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
        `INSERT INTO visitors
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

      // Track new visitor event
      await trackVisitorEvent(env.DB, {
        api_key: apiKey,
        visitor_id: visitor.visitorId,
        event_type: 'page_view',
        page_url: website || null,
        event_data: {
          company: visitor.company,
          location: visitor.location,
          role: visitor.lastRole
        }
      });

      // Update company insights for new visitor
      if (visitor.company) {
        await updateCompanyInsights(env.DB, apiKey, visitor.company, {
          new_visit: true,
          new_visitor: true,
          page_views: 1
        });
      }

      console.log(`[Analytics] Tracked new visitor event for ${visitor.visitorId}`);

      // Try to update API key usage count (but don't fail if API key doesn't exist)
      try {
        await env.DB.prepare(
          `UPDATE api_keys
           SET usage_count = usage_count + 1,
               last_used_at = CURRENT_TIMESTAMP
           WHERE api_key = ?`
        )
          .bind(apiKey)
          .run();

        console.log(`[D1] Updated API key usage count for ${apiKey}`);
      } catch (keyError) {
        console.warn(`[D1] Could not update API key ${apiKey} - key may not exist in database`);
        // Continue anyway - visitor data is more important
      }
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
      `SELECT * FROM visitors 
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
         COUNT(*) as total_visits
       FROM visitors 
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
      `SELECT * FROM visitors 
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

/**
 * Update visitor video session status with full details
 */
export async function updateVisitorVideoStatus(
  env: Env,
  apiKey: string,
  visitorId: string,
  videoData: {
    sessionId: string;
    roomId: string;
    hostUrl: string;
    guestUrl: string;
  },
  status: 'invited' | 'accepted' | 'declined' | 'completed'
): Promise<void> {
  try {
    // Get visitor info for analytics
    const visitor = await env.DB.prepare(
      `SELECT company, last_role FROM visitors WHERE api_key = ? AND visitor_id = ?`
    )
      .bind(apiKey, visitorId)
      .first();

    const updateFields: string[] = ['video_status = ?'];
    const params: any[] = [status];

    if (status === 'invited') {
      updateFields.push('video_invited_at = CURRENT_TIMESTAMP');
      updateFields.push('video_session_id = ?');
      updateFields.push('video_room_id = ?');
      updateFields.push('video_host_url = ?');
      updateFields.push('video_guest_url = ?');
      params.push(videoData.sessionId, videoData.roomId, videoData.hostUrl, videoData.guestUrl);

      // Create video_calls record for analytics
      await createVideoCall(env.DB, {
        api_key: apiKey,
        visitor_id: visitorId,
        session_id: videoData.sessionId,
        company: visitor?.company as string || 'Unknown',
        visitor_role: visitor?.last_role as string || null,
        status: 'invited',
        host_url: videoData.hostUrl,
        guest_url: videoData.guestUrl
      });

      // Track visitor event
      await trackVisitorEvent(env.DB, {
        api_key: apiKey,
        visitor_id: visitorId,
        event_type: 'video_invite_sent',
        event_data: { session_id: videoData.sessionId }
      });

      // Update company insights
      if (visitor?.company) {
        await updateCompanyInsights(env.DB, apiKey, visitor.company as string, {
          video_call: true
        });
      }

      console.log(`[Analytics] Created video_calls record for ${videoData.sessionId}`);
    } else if (status === 'accepted') {
      updateFields.push('video_accepted_at = CURRENT_TIMESTAMP');

      // Update video call status to connected
      await updateVideoCallStatus(env.DB, videoData.sessionId, 'connected');

      // Track visitor event
      await trackVisitorEvent(env.DB, {
        api_key: apiKey,
        visitor_id: visitorId,
        event_type: 'video_connected',
        event_data: { session_id: videoData.sessionId }
      });

      // Update company insights
      if (visitor?.company) {
        await updateCompanyInsights(env.DB, apiKey, visitor.company as string, {
          successful_connection: true
        });
      }

      console.log(`[Analytics] Updated video call to connected: ${videoData.sessionId}`);
    } else if (status === 'completed') {
      // Update video call status to completed
      await updateVideoCallStatus(env.DB, videoData.sessionId, 'completed');

      // Track visitor event
      await trackVisitorEvent(env.DB, {
        api_key: apiKey,
        visitor_id: visitorId,
        event_type: 'video_ended',
        event_data: { session_id: videoData.sessionId }
      });

      console.log(`[Analytics] Updated video call to completed: ${videoData.sessionId}`);
    } else if (status === 'declined') {
      // Update video call status to declined
      await updateVideoCallStatus(env.DB, videoData.sessionId, 'declined');

      // Track visitor event
      await trackVisitorEvent(env.DB, {
        api_key: apiKey,
        visitor_id: visitorId,
        event_type: 'video_declined',
        event_data: { session_id: videoData.sessionId }
      });

      console.log(`[Analytics] Updated video call to declined: ${videoData.sessionId}`);
    }

    params.push(apiKey, visitorId);

    await env.DB.prepare(
      `UPDATE visitors
       SET ${updateFields.join(', ')}
       WHERE api_key = ? AND visitor_id = ?`
    )
      .bind(...params)
      .run();

    console.log(`[D1] Updated video status for ${visitorId}: ${status}`);
  } catch (error) {
    console.error('[D1] Error updating video status:', error);
    throw error;
  }
}

