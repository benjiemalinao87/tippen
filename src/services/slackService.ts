interface SlackConfig {
  webhookUrl: string;
  channelName: string;
  enabled: boolean;
}

interface VisitorData {
  id: string;
  company: string;
  revenue: string;
  staff: number;
  lastSignedRole: string;
  lastActivity: string;
}

interface VideoCallData {
  visitorCompany: string;
  adminName: string;
  guestUrl: string;
  hostUrl: string;
}

class SlackService {
  private config: SlackConfig | null = null;

  constructor() {
    this.loadConfig();
  }

  private loadConfig() {
    const savedConfig = localStorage.getItem('slack_config');
    if (savedConfig) {
      this.config = JSON.parse(savedConfig);
    }
  }

  public setConfig(webhookUrl: string, channelName: string, enabled: boolean = true) {
    this.config = { webhookUrl, channelName, enabled };
    localStorage.setItem('slack_config', JSON.stringify(this.config));
  }

  public getConfig(): SlackConfig | null {
    return this.config;
  }

  public isEnabled(): boolean {
    return this.config?.enabled ?? false;
  }

  public async sendNewVisitorNotification(visitor: VisitorData): Promise<boolean> {
    if (!this.isEnabled() || !this.config) {
      console.log('Slack integration not enabled');
      return false;
    }

    try {
      const message = {
        text: `🆕 New Visitor Detected: ${visitor.company}`,
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
                text: `*Company:*\n${visitor.company}`
              },
              {
                type: 'mrkdwn',
                text: `*Revenue:*\n${visitor.revenue}`
              },
              {
                type: 'mrkdwn',
                text: `*Staff Count:*\n${visitor.staff.toLocaleString()} employees`
              },
              {
                type: 'mrkdwn',
                text: `*Last Role:*\n${visitor.lastSignedRole}`
              }
            ]
          },
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: `⏰ ${visitor.lastActivity}`
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
                url: window.location.origin,
                action_id: 'view_dashboard'
              }
            ]
          }
        ]
      };

      const response = await fetch(this.config.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message)
      });

      if (response.ok) {
        console.log('Slack notification sent successfully for new visitor');
        return true;
      } else {
        console.error('Failed to send Slack notification:', response.status);
        return false;
      }
    } catch (error) {
      console.error('Error sending Slack notification:', error);
      return false;
    }
  }

  public async sendVideoCallRequestNotification(data: VideoCallData): Promise<boolean> {
    if (!this.isEnabled() || !this.config) {
      console.log('Slack integration not enabled');
      return false;
    }

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

      const response = await fetch(this.config.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message)
      });

      if (response.ok) {
        console.log('Slack notification sent successfully for video call request');
        return true;
      } else {
        console.error('Failed to send Slack notification:', response.status);
        return false;
      }
    } catch (error) {
      console.error('Error sending Slack notification:', error);
      return false;
    }
  }

  public async sendTestNotification(): Promise<boolean> {
    if (!this.config) {
      console.log('Slack configuration not set');
      return false;
    }

    try {
      const message = {
        text: '🎉 Tippen Integration Test',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '✅ *Your Slack integration is working!*\n\nYou\'ll receive notifications here when:\n\n• 🆕 New visitors arrive on your website\n• 📞 Admins request video calls with visitors'
            }
          }
        ]
      };

      const response = await fetch(this.config.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message)
      });

      return response.ok;
    } catch (error) {
      console.error('Error sending test notification:', error);
      return false;
    }
  }
}

export const slackService = new SlackService();

