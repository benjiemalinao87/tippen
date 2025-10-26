/**
 * Slack Notification Utilities for Tippen Backend
 * Sends Slack notifications for new visitors and video calls
 */

export interface SlackConfig {
  webhookUrl: string;
  channelName: string;
  enabled: boolean;
}

export interface VisitorNotificationData {
  company: string;
  location?: string;
  revenue?: string;
  staff?: number;
  lastRole?: string;
  timestamp?: string;
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
    const message = {
      text: `🆕 New Visitor Detected: ${data.company}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🆕 New Visitor on Your Website',
            emoji: true
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Company:*\n${data.company}`
            },
            {
              type: 'mrkdwn',
              text: `*Location:*\n${data.location || 'Unknown'}`
            },
            data.revenue ? {
              type: 'mrkdwn',
              text: `*Revenue:*\n${data.revenue}`
            } : null,
            data.staff ? {
              type: 'mrkdwn',
              text: `*Staff Count:*\n${data.staff.toLocaleString()} employees`
            } : null,
            data.lastRole ? {
              type: 'mrkdwn',
              text: `*Last Role:*\n${data.lastRole}`
            } : null
          ].filter(Boolean)
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `⏰ ${data.timestamp || new Date().toLocaleString()}`
            }
          ]
        },
        {
          type: 'divider'
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: '👁️ View in Dashboard',
                emoji: true
              },
              style: 'primary',
              url: 'https://tippen.pages.dev/visitors',
              action_id: 'view_dashboard'
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
