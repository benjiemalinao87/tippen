# Tippen Tracking Script - Installation Guide

## Where to Place the Script

### ✅ RECOMMENDED: In the `<head>` tag (Early Loading)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Website</title>

  <!-- ═══════════════════════════════════════════════════ -->
  <!-- TIPPEN TRACKING SCRIPT - PLACE HERE (RECOMMENDED) -->
  <!-- ═══════════════════════════════════════════════════ -->
  <script
    src="https://your-cdn.com/tippen-tracker.js"
    data-tippen-api-key="your_api_key_here"
    data-tippen-backend="https://tippen-backend.workers.dev"
  ></script>
  <!-- ═══════════════════════════════════════════════════ -->

  <!-- Your other head elements -->
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <!-- Your website content -->
</body>
</html>
```

**Why in `<head>`?**
- ✅ Loads immediately when page starts
- ✅ Captures visitor as soon as possible
- ✅ Tracks bounce rates accurately
- ✅ Doesn't depend on page content loading
- ✅ Works even if user leaves quickly

---

### ⚠️ ALTERNATIVE: Before closing `</body>` tag (Late Loading)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Your Website</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>

  <!-- Your website content -->
  <header>...</header>
  <main>...</main>
  <footer>...</footer>

  <!-- ═══════════════════════════════════════════════════ -->
  <!-- TIPPEN TRACKING SCRIPT - ALTERNATIVE PLACEMENT     -->
  <!-- ═══════════════════════════════════════════════════ -->
  <script
    src="https://your-cdn.com/tippen-tracker.js"
    data-tippen-api-key="your_api_key_here"
    data-tippen-backend="https://tippen-backend.workers.dev"
  ></script>
  <!-- ═══════════════════════════════════════════════════ -->

</body>
</html>
```

**Why before `</body>`?**
- ⚠️ Doesn't block page rendering
- ⚠️ Better Core Web Vitals scores
- ❌ May miss quick visitors who bounce
- ❌ Delayed tracking by a few seconds

---

## Script Attributes Explained

```html
<script
  src="https://your-cdn.com/tippen-tracker.js"
  data-tippen-api-key="your_api_key_here"
  data-tippen-backend="https://tippen-backend.workers.dev"
  async
></script>
```

| Attribute | Required | Description | Example |
|-----------|----------|-------------|---------|
| `src` | ✅ Yes | URL to tracking script | `https://cdn.tippen.com/tracker.js` |
| `data-tippen-api-key` | ✅ Yes | Your unique API key | `client_abc123` |
| `data-tippen-backend` | ✅ Yes | Backend worker URL | `https://tippen.workers.dev` |
| `async` | ⚠️ Optional | Non-blocking load | Add for better performance |
| `defer` | ⚠️ Optional | Execute after HTML parsed | Alternative to async |

---

## Installation Options

### Option 1: Local Development (Testing)

```html
<script
  src="/tippen-tracker.js"
  data-tippen-api-key="demo_api_key"
  data-tippen-backend="http://localhost:8787"
></script>
```

### Option 2: Production (CDN)

```html
<script
  src="https://cdn.tippen.com/tracker.js"
  data-tippen-api-key="prod_xyz789"
  data-tippen-backend="https://tippen-backend.your-domain.workers.dev"
  async
></script>
```

### Option 3: Self-Hosted

```html
<script
  src="https://your-website.com/scripts/tippen-tracker.js"
  data-tippen-api-key="client_key_456"
  data-tippen-backend="https://tippen-backend.your-domain.workers.dev"
  async
></script>
```

---

## Platform-Specific Installation

### WordPress

**Method 1: Theme Header (Recommended)**

1. Go to **Appearance → Theme Editor**
2. Select **header.php**
3. Find `<head>` tag
4. Add Tippen script right after `<head>`
5. Click **Update File**

```php
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
  <meta charset="<?php bloginfo('charset'); ?>">

  <!-- TIPPEN TRACKING -->
  <script
    src="https://cdn.tippen.com/tracker.js"
    data-tippen-api-key="<?php echo get_option('tippen_api_key'); ?>"
    data-tippen-backend="https://tippen-backend.workers.dev"
    async
  ></script>

  <?php wp_head(); ?>
</head>
```

**Method 2: Plugin (Header/Footer Scripts)**

1. Install plugin: "Insert Headers and Footers"
2. Go to **Settings → Insert Headers and Footers**
3. Paste Tippen script in "Scripts in Header"
4. Save

**Method 3: functions.php**

```php
function add_tippen_tracking() {
  ?>
  <script
    src="https://cdn.tippen.com/tracker.js"
    data-tippen-api-key="your_api_key"
    data-tippen-backend="https://tippen-backend.workers.dev"
    async
  ></script>
  <?php
}
add_action('wp_head', 'add_tippen_tracking');
```

---

### Shopify

1. Go to **Online Store → Themes**
2. Click **Actions → Edit code**
3. Select **theme.liquid**
4. Find `<head>` tag
5. Add Tippen script
6. Click **Save**

```liquid
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>{{ page_title }}</title>

  <!-- TIPPEN TRACKING -->
  <script
    src="https://cdn.tippen.com/tracker.js"
    data-tippen-api-key="{{ settings.tippen_api_key }}"
    data-tippen-backend="https://tippen-backend.workers.dev"
    async
  ></script>

  {{ content_for_header }}
</head>
```

---

### React / Next.js

**Next.js (pages/_document.js):**

```jsx
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html>
      <Head>
        {/* TIPPEN TRACKING */}
        <script
          src="https://cdn.tippen.com/tracker.js"
          data-tippen-api-key={process.env.NEXT_PUBLIC_TIPPEN_API_KEY}
          data-tippen-backend={process.env.NEXT_PUBLIC_TIPPEN_BACKEND}
          async
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
```

**React (public/index.html):**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />

    <!-- TIPPEN TRACKING -->
    <script
      src="%PUBLIC_URL%/tippen-tracker.js"
      data-tippen-api-key="%REACT_APP_TIPPEN_API_KEY%"
      data-tippen-backend="%REACT_APP_TIPPEN_BACKEND%"
      async
    ></script>

    <title>React App</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

---

### Webflow

1. Go to **Project Settings**
2. Click **Custom Code** tab
3. Scroll to **Head Code**
4. Paste Tippen script
5. Click **Save Changes**
6. Publish site

---

### Wix

1. Go to **Settings → Custom Code**
2. Click **+ Add Custom Code**
3. Name: "Tippen Tracking"
4. Paste script code
5. Choose "Head" for placement
6. Apply to: "All pages"
7. Click **Apply**

---

## Testing Your Installation

### Step 1: Open the Webpage

Open your website with the tracking script installed.

### Step 2: Check Browser Console

Open Developer Tools (F12) and check console:

```
✅ You should see:
🎯 Acme Corporation website loaded
📡 Tippen tracking script should be sending visitor data
✅ Tippen Tracker initialized successfully
Visitor ID: visitor_1729080000000_abc123
```

### Step 3: Check Network Tab

1. Open DevTools → Network tab
2. Filter: **Fetch/XHR**
3. Reload page
4. Look for request to `/track/visitor`

```
Request URL: http://localhost:8787/track/visitor
Request Method: POST
Status Code: 200 OK
```

### Step 4: Check Tippen Dashboard

1. Open your Tippen admin dashboard
2. Go to **Visitors** page
3. You should see your visit appear in real-time!

```
🟢 Active Visitor:
Company: Your Company Name
Location: Your Location
Activity: Just now
```

---

## Verification Checklist

```
☐ Script tag added to <head> (or before </body>)
☐ Correct src URL (script loads without 404 error)
☐ data-tippen-api-key attribute set
☐ data-tippen-backend attribute set
☐ Browser console shows "Tippen Tracker initialized"
☐ Network tab shows POST to /track/visitor
☐ Dashboard shows visitor in real-time
☐ Visitor ID stored in localStorage
☐ Page doesn't freeze or slow down
☐ No JavaScript errors in console
```

---

## Common Issues & Solutions

### Issue 1: Script Not Loading (404 Error)

**Symptoms:**
```
GET https://your-cdn.com/tippen-tracker.js 404 (Not Found)
```

**Solution:**
- Verify the `src` URL is correct
- Check if file exists at that URL
- Use browser to navigate directly to script URL
- For local testing, use `/tippen-tracker.js` not full URL

---

### Issue 2: CORS Error

**Symptoms:**
```
Access to fetch at 'http://localhost:8787/track/visitor' from origin
'http://localhost:5173' has been blocked by CORS policy
```

**Solution:**
- Check backend CORS headers allow your domain
- For local dev, backend should allow `localhost:*`
- Edit `cloudflare-backend/src/index.ts` CORS settings

---

### Issue 3: No Visitor Appearing in Dashboard

**Symptoms:**
- Script loads successfully
- No JavaScript errors
- But dashboard shows 0 visitors

**Solution:**
1. Check API key matches in script and dashboard
2. Verify backend is running (`wrangler tail`)
3. Check WebSocket connection status (should be green)
4. Test tracking endpoint manually with curl:

```bash
curl -X POST http://localhost:8787/track/visitor \
  -H "Content-Type: application/json" \
  -H "X-Tippen-API-Key: demo_api_key" \
  -d '{
    "event": "pageview",
    "visitor": {
      "visitorId": "test_001",
      "url": "https://example.com",
      "timestamp": "2025-10-16T12:00:00Z"
    },
    "website": "example.com"
  }'
```

---

### Issue 4: localStorage Not Persisting

**Symptoms:**
- New visitor ID generated on every page load
- Can't track returning visitors

**Solution:**
- Check browser privacy settings
- Disable "Block third-party cookies"
- Test in normal mode (not incognito/private)
- Verify localStorage is enabled in browser

---

## Performance Impact

### Script Size
```
tippen-tracker.js: ~8KB (minified)
Load time: <100ms on 3G connection
```

### Network Activity
```
Initial ping: 1 request (~500 bytes)
Heartbeat: 1 request every 30 seconds (keeps visitor active)
Inactivity timeout: 60 seconds without heartbeat = visitor removed
Total bandwidth: ~15KB per 10-minute session
```

**Important:** The 30-second heartbeat is critical for real-time accuracy:
- Sends ping every 30 seconds to confirm visitor is still on site
- If no ping received for 60 seconds, visitor is automatically removed
- Prevents admins from calling visitors who have already left
- Dashboard updates automatically when visitors leave

### Page Performance
```
First Contentful Paint (FCP): No impact (async load)
Largest Contentful Paint (LCP): No impact
Time to Interactive (TTI): +50ms maximum
```

---

## Privacy & Compliance

### What the Script Collects

✅ **Anonymous Data:**
- Visitor ID (random string)
- Page URLs visited
- Timestamp of visits
- Referrer URL
- User agent string
- IP address (for company lookup)

❌ **Does NOT Collect:**
- Personal names
- Email addresses
- Passwords
- Payment information
- Form inputs
- Private messages

### GDPR Compliance

Add cookie consent banner:

```html
<!-- Before Tippen script -->
<script>
  // Only load Tippen if user consents
  if (localStorage.getItem('cookie-consent') === 'true') {
    const script = document.createElement('script');
    script.src = 'https://cdn.tippen.com/tracker.js';
    script.setAttribute('data-tippen-api-key', 'your_key');
    script.setAttribute('data-tippen-backend', 'https://backend.url');
    document.head.appendChild(script);
  }
</script>
```

### Opt-Out Mechanism

```javascript
// Allow users to opt-out
function optOutTippenTracking() {
  localStorage.setItem('tippen-opt-out', 'true');
  console.log('Tippen tracking disabled');
}

// Check in tracking script
if (localStorage.getItem('tippen-opt-out') === 'true') {
  console.log('User opted out of tracking');
  return; // Don't initialize
}
```

---

## Demo Website

A complete demo website is available at:

```
/public/demo-website.html
```

**To test locally:**

1. Open terminal in project root
2. Start simple HTTP server:
   ```bash
   cd public
   python3 -m http.server 8080
   ```
3. Open browser: `http://localhost:8080/demo-website.html`
4. Check console for tracking confirmation
5. Check Tippen dashboard for visitor

**Expected Result:**
```
Browser Console:
  🎯 Acme Corporation website loaded
  📡 Tippen tracking script should be sending visitor data
  ✅ Tippen Tracker initialized successfully
  Visitor ID: visitor_1729080000000_abc123

Tippen Dashboard:
  🟢 New Visitor
  Company: Your Company Name
  Location: Your Location
  Page: /demo-website.html
  Activity: Just now
```

---

## Advanced Configuration

### Custom Events

Track specific user actions:

```javascript
// After Tippen tracker loads
if (window.TippenTracker) {
  // Track button click
  document.getElementById('cta-button').addEventListener('click', () => {
    TippenTracker.trackEvent('button_click', { button: 'cta' });
  });

  // Track form submission
  document.getElementById('contact-form').addEventListener('submit', () => {
    TippenTracker.trackEvent('form_submit', { form: 'contact' });
  });

  // Track product view
  TippenTracker.trackEvent('product_view', {
    productId: '12345',
    category: 'enterprise'
  });
}
```

### Single Page Applications (SPA)

For React/Vue/Angular apps, track route changes:

```javascript
// React Router
import { useLocation } from 'react-router-dom';

function App() {
  const location = useLocation();

  useEffect(() => {
    if (window.TippenTracker) {
      TippenTracker.trackPageView(location.pathname);
    }
  }, [location]);

  return <div>...</div>;
}
```

---

## Support

- **Documentation:** [ADMIN_SOP.md](ADMIN_SOP.md)
- **Technical Guide:** [CLAUDE.md](CLAUDE.md)
- **Backend Setup:** [cloudflare-backend/README.md](cloudflare-backend/README.md)

---

**Last Updated:** October 16, 2025
