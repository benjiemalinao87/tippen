/**
 * Slack Notification Utilities for Tippen Backend
 * Sends Slack notifications for new visitors and video calls
 */

export interface SlackConfig {
  webhookUrl: string;
  channelName: string;
  enabled: boolean;
  notifyNewVisitors?: boolean;
  notifyReturningVisitors?: boolean;
}

export interface VisitorNotificationData {
  visitorId: string;
  company: string;
  location?: string;
  revenue?: string;
  staff?: number;
  lastRole?: string;
  deviceType?: string;
  timestamp?: string;
  pageViews?: number;
  timeOnSite?: string;
  referrer?: string;
  timezone?: string;
  url?: string;
  ip?: string;
  isReturning?: boolean;
  // Enriched company data
  companyDomain?: string;
  industry?: string;
  employees?: number;
  enrichedLocation?: string;
  enrichmentSource?: 'enrich_so' | 'cache' | 'fallback';
  isCached?: boolean;
}

export interface VideoCallNotificationData {
  visitorCompany: string;
  adminName: string;
  hostUrl: string;
  guestUrl: string;
}

/**
 * Get Slack configuration from organization settings
 */
export async function getSlackConfig(
  db: D1Database,
  apiKey: string
): Promise<SlackConfig | null> {
  try {
    const result = await db
      .prepare('SELECT settings FROM organizations WHERE api_key = ?')
      .bind(apiKey)
      .first();

    if (!result || !result.settings) {
      return null;
    }

    const settings = JSON.parse(result.settings as string);
    return settings.slack || null;
  } catch (error) {
    console.error('[Slack] Failed to get config:', error);
    return null;
  }
}

/**
 * Save Slack configuration to organization settings
 */
export async function saveSlackConfig(
  db: D1Database,
  apiKey: string,
  slackConfig: SlackConfig
): Promise<boolean> {
  try {
    // Get existing settings
    const result = await db
      .prepare('SELECT settings FROM organizations WHERE api_key = ?')
      .bind(apiKey)
      .first();

    const existingSettings = result?.settings
      ? JSON.parse(result.settings as string)
      : {};

    // Merge Slack config
    const newSettings = {
      ...existingSettings,
      slack: slackConfig
    };

    // Update organization
    await db
      .prepare('UPDATE organizations SET settings = ?, updated_at = CURRENT_TIMESTAMP WHERE api_key = ?')
      .bind(JSON.stringify(newSettings), apiKey)
      .run();

    console.log('[Slack] Config saved for API key:', apiKey);
    return true;
  } catch (error) {
    console.error('[Slack] Failed to save config:', error);
    return false;
  }
}

/**
 * Send new visitor notification to Slack
 */
export async function sendNewVisitorNotification(
  webhookUrl: string,
  data: VisitorNotificationData
): Promise<boolean> {
  try {
    const isReturning = data.isReturning || false;
    const isEnriched = data.enrichmentSource === 'enrich_so' || data.enrichmentSource === 'cache';
    const headerText = isReturning ? '🔁 Returning Visitor on Your Website' : '🆕 New Visitor on Your Website';
    const messageText = isReturning ? `🔁 Returning Visitor: ${data.company}` : `🆕 New Visitor Detected: ${data.company}`;

    // Build blocks array
    const blocks: any[] = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: headerText,
          emoji: true
        }
      }
    ];

    // Company Intelligence Section (if enriched)
    if (isEnriched && (data.industry || data.revenue || data.employees || data.companyDomain)) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*✨ Company Intelligence* ${data.isCached ? '💾' : '🔍'}`
        }
      });

      blocks.push({
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Company:*\n${data.company}`
          },
          data.companyDomain ? {
            type: 'mrkdwn',
            text: `*Domain:*\n${data.companyDomain}`
          } : null,
          data.industry ? {
            type: 'mrkdwn',
            text: `*Industry:*\n${data.industry}`
          } : null,
          data.revenue ? {
            type: 'mrkdwn',
            text: `*Revenue:*\n${data.revenue}`
          } : null,
          data.employees ? {
            type: 'mrkdwn',
            text: `*Employees:*\n~${data.employees.toLocaleString()}`
          } : null,
          data.enrichedLocation ? {
            type: 'mrkdwn',
            text: `*HQ Location:*\n${data.enrichedLocation}`
          } : null
        ].filter(Boolean)
      });

      blocks.push({
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: data.isCached ? '💾 _From cache (0 credits)_' : '🔍 _Freshly enriched (1 credit)_'
          }
        ]
      });

      blocks.push({ type: 'divider' });
    }

    // Visitor Activity Section
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*📊 Visitor Activity*'
      }
    });

    blocks.push({
      type: 'section',
      fields: [
        !isEnriched ? {
          type: 'mrkdwn',
          text: `*Company:*\n${data.company}`
        } : null,
        {
          type: 'mrkdwn',
          text: `*Location:*\n${data.location || 'Unknown'}`
        },
        data.pageViews ? {
          type: 'mrkdwn',
          text: `*Page Views:*\n${data.pageViews}`
        } : null,
        data.referrer ? {
          type: 'mrkdwn',
          text: `*Referrer:*\n${data.referrer === 'direct' ? 'Direct' : data.referrer}`
        } : null,
        data.timezone ? {
          type: 'mrkdwn',
          text: `*Timezone:*\n${data.timezone}`
        } : null,
        data.url ? {
          type: 'mrkdwn',
          text: `*Current Page:*\n${data.url}`
        } : null,
        data.lastRole ? {
          type: 'mrkdwn',
          text: `*Role:*\n${data.lastRole}`
        } : null,
        data.deviceType ? {
          type: 'mrkdwn',
          text: `*Device:*\n${data.deviceType}`
        } : null
      ].filter(Boolean)
    });

    blocks.push({
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `⏰ ${data.timestamp || new Date().toLocaleString()}`
        }
      ]
    });

    blocks.push({ type: 'divider' });

    // Action Buttons
    blocks.push({
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '📹 Start Video Call',
            emoji: true
          },
          style: 'primary',
          url: `https://app.tippen.com.au/visitors?visitorId=${data.visitorId}`,
          action_id: 'request_video_call'
        },
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '👁️ View Dashboard',
            emoji: true
          },
          url: `https://app.tippen.com.au/visitors?visitorId=${data.visitorId}`,
          action_id: 'view_details'
        }
      ]
    });

    const message = {
      text: messageText,
      blocks
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message)
    });

    if (!response.ok) {
      console.error('[Slack] Failed to send notification:', response.status, await response.text());
      return false;
    }

    console.log('[Slack] New visitor notification sent successfully');
    return true;
  } catch (error) {
    console.error('[Slack] Error sending notification:', error);
    return false;
  }
}

/**
 * Send video call request notification to Slack
 */
export async function sendVideoCallNotification(
  webhookUrl: string,
  data: VideoCallNotificationData
): Promise<boolean> {
  try {
    const message = {
      text: `📞 Video Call Requested with ${data.visitorCompany}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '📞 Video Call Request Initiated',
            emoji: true
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${data.adminName}* has requested a video call with *${data.visitorCompany}*`
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Company:*\n${data.visitorCompany}`
            },
            {
              type: 'mrkdwn',
              text: `*Status:*\n🟢 Call Ready`
            }
          ]
        },
        {
          type: 'divider'
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '🔗 *Quick Actions:*'
          }
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: '🎥 Join as Host',
                emoji: true
              },
              style: 'primary',
              url: data.hostUrl,
              action_id: 'join_host'
            },
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: '👤 Guest Link',
                emoji: true
              },
              url: data.guestUrl,
              action_id: 'guest_link'
            }
          ]
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `💡 Share the guest link with ${data.visitorCompany} to start the call`
            }
          ]
        }
      ]
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message)
    });

    if (!response.ok) {
      console.error('[Slack] Failed to send notification:', response.status, await response.text());
      return false;
    }

    console.log('[Slack] Video call notification sent successfully');
    return true;
  } catch (error) {
    console.error('[Slack] Error sending notification:', error);
    return false;
  }
}
