# Slack Integration Guide

## Overview

Tippen's Slack integration sends real-time notifications to your Slack workspace when:
1. **New visitors** arrive on your website
2. **Admins request video calls** with visitors

## Features

### 📬 New Visitor Notifications
When a new visitor lands on your website, you'll receive a rich Slack message containing:
- **Company Name**
- **Revenue**
- **Staff Count**
- **Last Role** (e.g., CEO, Product Manager)
- **Activity Timestamp**
- **Quick Action Button** to view in dashboard

### 📞 Video Call Request Notifications
When an admin starts a video call, your team receives:
- **Company Name** being called
- **Call Status** indicator
- **Interactive Buttons**:
  - "Join as Host" - Direct link to host URL
  - "Guest Link" - Guest URL to share with visitor
- **Helpful Context** about sharing the guest link

## Setup Instructions

### Step 1: Create a Slack Webhook

1. Go to your [Slack workspace settings](https://api.slack.com/apps)
2. Click **"Create New App"**
3. Choose **"From scratch"**
4. Give your app a name (e.g., "Tippen Notifications")
5. Select your workspace

### Step 2: Enable Incoming Webhooks

1. In your app settings, navigate to **"Incoming Webhooks"**
2. Toggle **"Activate Incoming Webhooks"** to ON
3. Click **"Add New Webhook to Workspace"**
4. Select the channel where you want notifications (e.g., `#visitor-alerts`)
5. Click **"Allow"**
6. Copy the **Webhook URL** (it will look like: `https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX`)

### Step 3: Configure in Tippen

1. Open your Tippen dashboard
2. Navigate to **Settings** → **Integrations**
3. Find **Slack** in the Communication Integrations section
4. Click **"Connect"**
5. In the configuration modal:
   - Paste your **Webhook URL**
   - Enter your **Channel Name** (e.g., `#visitor-alerts`)
   - Click **"Test Connection"** to verify it works
   - Click **"Save Configuration"**

### Step 4: Test the Integration

1. The test connection sends a sample message to verify setup
2. Check your Slack channel for the test message
3. If successful, the integration is ready!

## Usage

### Automatic Notifications

Once configured, notifications are sent automatically:

**New Visitors:**
- Triggered when a new visitor is detected via WebSocket connection
- Includes all visitor details
- No manual action required

**Video Calls:**
- Triggered when admin clicks the video call toggle
- Sends immediately after session is created
- Includes both host and guest URLs

### Managing the Integration

**To Disable:**
1. Go to Settings → Integrations
2. Find Slack
3. Click the toggle to disconnect
4. Notifications will stop immediately

**To Update Webhook:**
1. Disconnect the integration
2. Reconnect with new webhook URL
3. Test the new configuration

## Message Examples

### New Visitor Message
```
🆕 New Visitor on Your Website

Company: Acme Corporation
Revenue: $2.5M
Staff Count: 150 employees
Last Role: Operations Manager

⏰ Oct 22, 2025, 3:45 PM

[👁️ View in Dashboard]
```

### Video Call Request Message
```
📞 Video Call Request Initiated

Tippen Agent has requested a video call with Acme Corporation

Company: Acme Corporation
Status: 🟢 Call Ready

🔗 Quick Actions:
[🎥 Join as Host] [👤 Guest Link]

💡 Share the guest link with Acme Corporation to start the call
```

## Technical Details

### Webhook Approach

We use Slack's **Incoming Webhooks** for simplicity and security:
- ✅ No OAuth tokens needed
- ✅ Works without Slack app installation permissions
- ✅ Simple HTTP POST requests
- ✅ Secure webhook URLs
- ✅ Easy to set up and manage

### Message Format

Messages use **Slack Block Kit** for rich formatting:
- Header blocks for titles
- Section blocks with fields for data
- Action blocks for buttons
- Context blocks for metadata

### Data Storage

- Webhook URL stored in browser's **localStorage**
- No server-side storage required
- Configuration is per-browser/device
- User controls their own webhook

### Security Considerations

1. **Webhook URL Security:**
   - Keep your webhook URL private
   - Don't commit it to version control
   - Regenerate if compromised

2. **Data Privacy:**
   - Only sends data you already have
   - No additional tracking
   - Respects your existing data policies

3. **Rate Limiting:**
   - Slack allows ~1 message per second
   - Our implementation naturally respects this
   - Visitor detection prevents duplicate notifications

## Troubleshooting

### "Connection Failed" Error

**Possible Causes:**
1. Invalid webhook URL
2. Webhook was deleted in Slack
3. Network connectivity issues
4. CORS restrictions

**Solutions:**
1. Verify webhook URL is correct
2. Create a new webhook in Slack
3. Check your internet connection
4. Try in a different browser

### No Notifications Received

**Check:**
1. Integration is enabled (green checkmark)
2. Webhook URL is correct
3. Selected Slack channel exists
4. You're monitoring the right channel

**Test:**
1. Click "Test Connection" in settings
2. Check if test message appears
3. If test works but real notifications don't, check browser console for errors

### Duplicate Notifications

**Cause:** Multiple tabs/windows open

**Solution:**
- Use single dashboard window
- Or configure different webhooks per user

### Messages Look Plain

**Cause:** Slack client not supporting Block Kit

**Solution:**
- Update Slack app to latest version
- Use Slack web app
- Messages include fallback plain text

## Best Practices

### Channel Setup

1. **Dedicated Channel:**
   - Create a specific channel for visitor notifications
   - Example: `#visitor-alerts` or `#tippen-notifications`

2. **Team Access:**
   - Add relevant team members to the channel
   - Consider who needs real-time notifications

3. **Mobile Notifications:**
   - Configure Slack mobile app for push notifications
   - Set notification preferences per channel

### Workflow Integration

1. **Response Protocol:**
   - Define who responds to new visitor alerts
   - Create a rotation schedule if needed

2. **Video Call Handling:**
   - Establish process for sharing guest links
   - Define response time expectations

3. **Channel Monitoring:**
   - Assign channel monitors during business hours
   - Set up keyword alerts for high-priority visitors

## API Reference

### SlackService Methods

```typescript
// Check if Slack is enabled
slackService.isEnabled(): boolean

// Send new visitor notification
slackService.sendNewVisitorNotification({
  id: string,
  company: string,
  revenue: string,
  staff: number,
  lastSignedRole: string,
  lastActivity: string
}): Promise<boolean>

// Send video call request notification
slackService.sendVideoCallRequestNotification({
  visitorCompany: string,
  adminName: string,
  hostUrl: string,
  guestUrl: string
}): Promise<boolean>

// Test connection
slackService.sendTestNotification(): Promise<boolean>

// Configure Slack
slackService.setConfig(
  webhookUrl: string,
  channelName: string,
  enabled: boolean
): void

// Get current configuration
slackService.getConfig(): SlackConfig | null
```

## Support

### Additional Resources

- [Slack Incoming Webhooks Documentation](https://api.slack.com/messaging/webhooks)
- [Slack Block Kit Builder](https://api.slack.com/block-kit/building)
- [Slack API Documentation](https://api.slack.com/)

### Need Help?

If you encounter issues:
1. Check browser console for error messages
2. Verify webhook URL is correct
3. Test connection in Settings
4. Review this guide's troubleshooting section

## Future Enhancements

Planned features:
- [ ] Custom notification templates
- [ ] Notification filtering by visitor criteria
- [ ] Multiple webhook support (different channels)
- [ ] Webhook signature verification
- [ ] Analytics on notification engagement
- [ ] Integration with Slack threads for visitor history

---

**Last Updated:** October 22, 2025  
**Version:** 1.0.0
