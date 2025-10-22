# Settings Page Features

## Overview

The Settings page now includes comprehensive features for managing your Tippen installation:

1. **Tracking Script** - Easy copy-paste installation
2. **CRM Integrations** - Salesforce, Active Campaign, HubSpot
3. **Communication Integrations** - Slack, Microsoft Teams, Google Chat

---

## 1. Tracking Script Section

### Visual Layout

```
┌─────────────────────────────────────────────────────────────┐
│ 📝 Tracking Script                                          │
│ Install this script on your website to track visitors      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ API Key                    Backend URL                      │
│ ┌─────────────────┐       ┌──────────────────────────┐    │
│ │ your_api_key    │       │ https://tippen-backend..│    │
│ └─────────────────┘       └──────────────────────────┘    │
│                                                             │
│ ┌─────────────────────────────────────────┐  [Copy Script]│
│ │ <script                                 │               │
│ │   src="https://cdn.tippen.com/..."     │               │
│ │   data-tippen-api-key="your_api_key"   │               │
│ │   data-tippen-backend="https://..."    │               │
│ │   async                                  │               │
│ │ ></script>                              │               │
│ └─────────────────────────────────────────┘               │
│                                                             │
│ ℹ️ Installation Instructions                               │
│                                                             │
│ 1. Copy the tracking script above                          │
│ 2. Open your website's HTML file or template               │
│ 3. ✅ Recommended: Paste inside the <head> tag            │
│ 4. ⚠️ Alternative: Paste before closing </body> tag       │
│ 5. Save and publish your website                           │
│ 6. Visit your website to test                              │
│                                                             │
│ What this script does:                                      │
│ • Tracks visitor page views and activity                    │
│ • Identifies company information from IP address            │
│ • Enables real-time video call invitations                  │
│ • Sends heartbeat every 30 seconds                          │
│ • Does NOT collect personal information                     │
│                                                             │
│ Platform-specific guides:                                   │
│ [WordPress] [Shopify] [Webflow] [React/Next.js] [Wix]     │
│                                                             │
│ See TRACKING_SCRIPT_GUIDE.md for detailed instructions     │
└─────────────────────────────────────────────────────────────┘
```

### Features

✅ **Dynamic Script Generation**
- Enter your API key
- Enter your backend URL
- Script updates in real-time

✅ **One-Click Copy**
- Copy button with visual feedback
- "Copied!" confirmation message
- Works across all browsers

✅ **Clear Instructions**
- Step-by-step setup guide
- Recommended vs alternative placement
- What the script does explanation
- Platform badges for quick reference

✅ **Professional Design**
- Purple theme to distinguish from integrations
- Code block with syntax highlighting
- Responsive layout
- Dark mode support

---

## 2. CRM Integrations Section

```
┌─────────────────────────────────────────────────────────────┐
│ 💼 CRM Integrations                                         │
│ Connect your CRM to automatically sync visitor data        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│ │ [Salesforce] │  │ [ActiveCamp] │  │ [HubSpot]    │     │
│ │              │  │              │  │              │     │
│ │ Sync visitor │  │ Automate     │  │ Track        │     │
│ │ data with... │  │ visitor...   │  │ visitor...   │     │
│ │              │  │              │  │              │     │
│ │  [Connect]   │  │  [Connect]   │  │  [Connect]   │     │
│ │  [🔗]        │  │  [🔗]        │  │  [🔗]        │     │
│ └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Features

- Grid layout for integration cards
- Connect/disconnect toggle
- External link for documentation
- Visual status indicators (green checkmark when connected)

---

## 3. Communication Integrations Section

```
┌─────────────────────────────────────────────────────────────┐
│ 💬 Communication Integrations                               │
│ Get real-time notifications about visitor activity         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│ │ [MS Teams] ✓ │  │ [GoogleChat] │  │ [Slack]    ✓ │     │
│ │              │  │              │  │              │     │
│ │ Get notif... │  │ Send visitor │  │ Notify your  │     │
│ │              │  │ updates...   │  │ team in...   │     │
│ │              │  │              │  │              │     │
│ │ [Connected]  │  │  [Connect]   │  │ [Connected]  │     │
│ │  [🔗]        │  │  [🔗]        │  │  [🔗]        │     │
│ └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Slack Integration Features

When you click "Connect" on Slack, you get a full configuration modal:

```
┌──────────────────────────────────────────────────────┐
│ [Slack Logo] Configure Slack Integration         [X] │
├──────────────────────────────────────────────────────┤
│                                                      │
│ ℹ️ Setup Instructions                               │
│                                                      │
│ 1. Go to your Slack workspace settings              │
│ 2. Navigate to Apps → Manage → Custom Integrations │
│ 3. Click Incoming Webhooks and add new webhook     │
│ 4. Select channel for notifications                 │
│ 5. Copy Webhook URL and paste below                │
│                                                      │
│ 🔗 View Slack Webhook Documentation                 │
│                                                      │
│ Webhook URL *                                        │
│ ┌────────────────────────────────────────────────┐ │
│ │ https://hooks.slack.com/services/...           │ │
│ └────────────────────────────────────────────────┘ │
│                                                      │
│ Channel Name *                                       │
│ ┌────────────────────────────────────────────────┐ │
│ │ #visitor-notifications                         │ │
│ └────────────────────────────────────────────────┘ │
│                                                      │
│ [Test Connection]  ✅ Connection successful!        │
│                                                      │
│ 📬 Notifications You'll Receive                     │
│ • New Visitor Alert: When visitors arrive           │
│ • Video Call Request: When admins start calls       │
│                                                      │
├──────────────────────────────────────────────────────┤
│                    [Cancel]  [Save Configuration]   │
└──────────────────────────────────────────────────────┘
```

---

## 4. Integration Status Summary

```
┌─────────────────────────────────────────────────────────────┐
│ ℹ️ Integration Status                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 💼 1 of 3 CRM integrations connected                       │
│ 💬 2 of 3 communication integrations connected             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## How to Use

### Installing Tracking Script

1. **Go to Settings** → Settings tab in navigation
2. **Scroll to "Tracking Script"** section (purple theme)
3. **Enter your details:**
   - API Key: Get from your Tippen account
   - Backend URL: Your Cloudflare Worker URL
4. **Copy the script** - Click "Copy Script" button
5. **Install on your website:**
   - **HTML sites:** Paste in `<head>` tag
   - **WordPress:** Use "Insert Headers and Footers" plugin
   - **Shopify:** Add to theme.liquid
   - **React/Next.js:** Add to _document.js or index.html
6. **Test:** Visit your website and check Visitors page

### Setting up Slack Notifications

1. **Create Slack Webhook:**
   - Go to https://api.slack.com/apps
   - Create new app
   - Enable Incoming Webhooks
   - Add webhook to workspace
   - Copy webhook URL

2. **Configure in Tippen:**
   - Go to Settings
   - Find Slack in Communication Integrations
   - Click "Connect"
   - Paste webhook URL
   - Enter channel name (e.g., #visitor-alerts)
   - Click "Test Connection"
   - Save configuration

3. **Start receiving notifications:**
   - New visitors → Slack message
   - Video call requests → Slack message with links

### Managing Integrations

**To Disconnect:**
- Click the "Connected" button
- Integration turns off immediately

**To Reconnect:**
- Click "Connect" again
- Enter new configuration
- Test and save

---

## Benefits

### For Administrators

✅ **Easy Setup**
- All configuration in one place
- No need to search documentation
- Visual feedback for all actions
- Test functionality built-in

✅ **Customizable**
- Enter your own API keys
- Choose your backend URL
- Select notification channels
- Enable/disable as needed

✅ **Self-Service**
- Copy tracking script instantly
- Configure integrations yourself
- No developer assistance needed
- Test connections before saving

### For Users

✅ **Clear Instructions**
- Step-by-step guides
- Platform-specific help
- What each feature does
- Privacy information included

✅ **Professional UI**
- Modern, clean design
- Dark mode support
- Responsive layout
- Intuitive controls

✅ **Reliable**
- Visual status indicators
- Error handling
- Test before enabling
- Configuration persistence

---

## Technical Details

### Tracking Script

**Components:**
- API Key input (text field)
- Backend URL input (text field)
- Live script generation (template literal)
- Copy to clipboard (Navigator Clipboard API)
- Visual feedback (state management)

**Script Template:**
```javascript
`<script
  src="https://cdn.tippen.com/tippen-tracker.js"
  data-tippen-api-key="${apiKey}"
  data-tippen-backend="${backendUrl}"
  async
></script>`
```

### Slack Integration

**Components:**
- SlackConfigModal (configuration UI)
- slackService (API service layer)
- localStorage (configuration persistence)
- Fetch API (webhook calls)

**Message Format:**
- Slack Block Kit
- Rich formatting with headers, sections, buttons
- Action buttons for quick access
- Context for additional info

### State Management

**Settings Component State:**
```typescript
- integrationsState: Integration[] (all integrations)
- showSlackModal: boolean (modal visibility)
- slackConfig: object | null (Slack configuration)
- copiedScript: boolean (copy feedback)
- apiKey: string (user's API key)
- backendUrl: string (backend URL)
```

---

## Screenshots

### Desktop View
- Full-width layout
- Side-by-side API key/URL inputs
- Large code block with copy button
- Three-column integration grid

### Mobile View
- Stacked layout
- Full-width inputs
- Scrollable code block
- Single-column integration cards

### Dark Mode
- Consistent theme throughout
- High contrast for code blocks
- Readable text on all backgrounds
- Professional appearance

---

## Future Enhancements

### Tracking Script
- [ ] API key generation button
- [ ] Test tracking button
- [ ] Installation verification
- [ ] Usage statistics

### Integrations
- [ ] OAuth flows for CRM integrations
- [ ] Custom webhook templates
- [ ] Integration logs and analytics
- [ ] Webhook signature verification

### General
- [ ] Settings search/filter
- [ ] Export/import configuration
- [ ] Multi-user permissions
- [ ] Audit logs

---

**Last Updated:** October 22, 2025  
**Version:** 1.0.0
