# Tippen Tracking Script - Visual Placement Guide

## 📍 Where Does the Script Go?

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Website Title</title>

  ┌─────────────────────────────────────────────────────────────┐
  │                                                             │
  │  ✅ OPTION 1: PLACE HERE (RECOMMENDED)                     │
  │  Place in <head> for early tracking                        │
  │                                                             │
  │  <script                                                    │
  │    src="https://cdn.tippen.com/tippen-tracker.js"         │
  │    data-tippen-api-key="your_api_key"                     │
  │    data-tippen-backend="https://backend.url"              │
  │  ></script>                                                 │
  │                                                             │
  └─────────────────────────────────────────────────────────────┘

  <!-- Your other CSS and meta tags -->
  <link rel="stylesheet" href="styles.css">
  <link rel="icon" href="favicon.ico">
</head>
<body>

  <!-- Website Header -->
  <header>
    <nav>
      <div class="logo">Your Logo</div>
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/about">About</a></li>
        <li><a href="/contact">Contact</a></li>
      </ul>
    </nav>
  </header>

  <!-- Main Content -->
  <main>
    <h1>Welcome to Our Website</h1>
    <p>Your content goes here...</p>
  </main>

  <!-- Website Footer -->
  <footer>
    <p>&copy; 2025 Your Company</p>
  </footer>

  ┌─────────────────────────────────────────────────────────────┐
  │                                                             │
  │  ⚠️ OPTION 2: PLACE HERE (ALTERNATIVE)                     │
  │  Place before </body> for non-blocking load                │
  │                                                             │
  │  <script                                                    │
  │    src="https://cdn.tippen.com/tippen-tracker.js"         │
  │    data-tippen-api-key="your_api_key"                     │
  │    data-tippen-backend="https://backend.url"              │
  │    async                                                    │
  │  ></script>                                                 │
  │                                                             │
  └─────────────────────────────────────────────────────────────┘

</body>
</html>
```

---

## 🎯 Quick Answer

### ✅ YES - Place in `<head>` (Recommended)

```html
<head>
  <!-- Tippen goes HERE -->
  <script src="tracker.js" data-tippen-api-key="key"></script>
</head>
```

**Pros:**
- ✅ Tracks visitors immediately
- ✅ Captures quick bounces
- ✅ More accurate analytics
- ✅ Visitor appears in dashboard faster

**Cons:**
- ⚠️ Blocks page render (unless using `async`)

---

### ⚠️ OK - Place before `</body>` (Alternative)

```html
<body>
  <!-- Content here -->

  <!-- Tippen goes HERE -->
  <script src="tracker.js" data-tippen-api-key="key"></script>
</body>
```

**Pros:**
- ✅ Doesn't block page rendering
- ✅ Better page load metrics

**Cons:**
- ❌ May miss quick visitors
- ❌ Delayed by 1-2 seconds

---

## 🔍 Real Example from Demo Website

Here's the actual placement in our demo site ([public/demo-website.html](public/demo-website.html)):

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Acme Corporation - Products & Services</title>

  <!-- ═══════════════════════════════════════════════════════════ -->
  <!-- TIPPEN TRACKING SCRIPT - PLACED IN HEAD TAG               -->
  <!-- ═══════════════════════════════════════════════════════════ -->
  <script
    src="./tippen-tracker.js"
    data-tippen-api-key="demo_api_key"
    data-tippen-backend="http://localhost:8787"
  ></script>
  <!-- ═══════════════════════════════════════════════════════════ -->

  <!-- Regular website styles below -->
  <style>
    /* CSS goes here */
  </style>
</head>
<body>
  <!-- Website content... -->
</body>
</html>
```

---

## 📊 Comparison: Head vs Body Placement

```
┌────────────────────────────────────────────────────────────────┐
│                    PLACEMENT COMPARISON                        │
└────────────────────────────────────────────────────────────────┘

TIME ──────────────────────────────────────────────────────────▶

User clicks link
│
├─ Browser requests page
│
├─ HTML starts loading
│
├─ <head> parsed
│  │
│  ├─ 🟢 HEAD PLACEMENT: Script loads HERE
│  │   └─ Visitor tracked immediately
│  │
│  ├─ CSS loads
│  ├─ Other head scripts load
│  └─ Head complete
│
├─ <body> starts rendering
│  │
│  ├─ Header renders
│  ├─ Navigation renders
│  ├─ Main content renders
│  ├─ Footer renders
│  │
│  └─ 🟡 BODY PLACEMENT: Script loads HERE
│      └─ Visitor tracked (1-2 seconds late)
│
└─ Page fully loaded


SCENARIO 1: User stays 10+ seconds
┌────────────────────────────────────────────────────────────┐
│ HEAD placement:  ████████████████████████ (Tracked)       │
│ BODY placement:  ██████████████████████ (Tracked)         │
│ Result: Both work ✅                                       │
└────────────────────────────────────────────────────────────┘

SCENARIO 2: User bounces in 2 seconds (quick exit)
┌────────────────────────────────────────────────────────────┐
│ HEAD placement:  ██ (Tracked ✅)                           │
│ BODY placement:  -- (Missed ❌)                            │
│ Result: HEAD placement wins                                │
└────────────────────────────────────────────────────────────┘

SCENARIO 3: Slow connection / Large page
┌────────────────────────────────────────────────────────────┐
│ HEAD placement:  ████░░░░░░░░░░░░░░░░░░ (May delay render)│
│ BODY placement:  ░░░░░░░░░░░░░░░░░░████ (Smooth render)   │
│ Result: BODY placement better for UX                       │
└────────────────────────────────────────────────────────────┘
```

---

## 🎨 Visual Layout Examples

### Standard Website

```
┌──────────────────────────────────────────────────────┐
│ <html>                                               │
│   <head>                                             │
│     <title>My Site</title>                          │
│     ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓   │
│     ┃ 📡 TIPPEN SCRIPT HERE                     ┃   │
│     ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛   │
│     <link rel="stylesheet" href="styles.css">       │
│   </head>                                            │
│   <body>                                             │
│     ┌────────────────────────────────────────┐      │
│     │ HEADER                                 │      │
│     │ [Logo] [Nav] [Menu]                    │      │
│     └────────────────────────────────────────┘      │
│     ┌────────────────────────────────────────┐      │
│     │ HERO SECTION                           │      │
│     │ Welcome to Our Site!                   │      │
│     └────────────────────────────────────────┘      │
│     ┌────────────────────────────────────────┐      │
│     │ MAIN CONTENT                           │      │
│     │ Lorem ipsum dolor sit amet...          │      │
│     └────────────────────────────────────────┘      │
│     ┌────────────────────────────────────────┐      │
│     │ FOOTER                                 │      │
│     │ © 2025 Company                         │      │
│     └────────────────────────────────────────┘      │
│   </body>                                            │
│ </html>                                              │
└──────────────────────────────────────────────────────┘
```

### E-commerce Site

```
┌──────────────────────────────────────────────────────┐
│ <head>                                               │
│   <meta charset="UTF-8">                            │
│   ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓   │
│   ┃ 📡 TIPPEN: Track product page views      ┃   │
│   ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛   │
│ </head>                                              │
│ <body>                                               │
│   ┌────────────────────────────────────────────┐   │
│   │ 🏪 SHOP HEADER                             │   │
│   │ [Logo] [Search] [Cart] [Account]          │   │
│   └────────────────────────────────────────────┘   │
│   ┌────────────────┬───────────────────────────┐   │
│   │ CATEGORIES     │ PRODUCT GRID              │   │
│   │ • Electronics  │ [Product 1] [Product 2]   │   │
│   │ • Clothing     │ [Product 3] [Product 4]   │   │
│   │ • Home         │ [Product 5] [Product 6]   │   │
│   └────────────────┴───────────────────────────┘   │
│                                                      │
│   💡 When visitor views product:                    │
│      → Tippen shows: "Viewing Product Page"         │
│      → Admin can initiate video call                │
│      → Help close the sale!                         │
│ </body>                                              │
└──────────────────────────────────────────────────────┘
```

### SaaS Landing Page

```
┌──────────────────────────────────────────────────────┐
│ <head>                                               │
│   ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓   │
│   ┃ 📡 TIPPEN: Catch high-intent visitors    ┃   │
│   ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛   │
│ </head>                                              │
│ <body>                                               │
│   ┌─────────────────────────────────────────────┐  │
│   │ 🚀 HERO                                     │  │
│   │ "Transform Your Business"                   │  │
│   │ [Get Started] [Watch Demo]                  │  │
│   └─────────────────────────────────────────────┘  │
│   ┌─────────────────────────────────────────────┐  │
│   │ 📊 FEATURES                                 │  │
│   │ [Feature 1] [Feature 2] [Feature 3]         │  │
│   └─────────────────────────────────────────────┘  │
│   ┌─────────────────────────────────────────────┐  │
│   │ 💰 PRICING                                  │  │
│   │ [Starter] [Pro] [Enterprise] ← Viewing      │  │
│   └─────────────────────────────────────────────┘  │
│                                                      │
│   💡 Tippen Dashboard Shows:                        │
│      "Visitor on Pricing Page - High Intent!"       │
│      → Perfect time to offer help!                  │
│ </body>                                              │
└──────────────────────────────────────────────────────┘
```

---

## 🎬 What Happens After Script Loads

### Timeline View

```
0ms: Page loads, Tippen script runs
│
├─ 10ms: Generate or retrieve visitor ID from localStorage
│        visitor_1729080000000_abc123
│
├─ 50ms: Collect page information
│        • URL: https://example.com/products
│        • Referrer: https://google.com/search?q=...
│        • User Agent: Mozilla/5.0...
│        • Timestamp: 2025-10-16T12:00:00Z
│
├─ 100ms: Send first ping to backend
│         POST /track/visitor
│         ┌──────────────────────────────────────┐
│         │ {                                    │
│         │   event: "pageview",                 │
│         │   visitor: {                         │
│         │     visitorId: "visitor_...",        │
│         │     url: "...",                      │
│         │     timestamp: "..."                 │
│         │   },                                 │
│         │   website: "example.com"             │
│         │ }                                    │
│         └──────────────────────────────────────┘
│
├─ 150ms: Backend enriches data
│         • IP → Company name (via Clearbit)
│         • IP → Location
│         • Revenue estimate
│         • Staff count
│
├─ 200ms: Durable Object stores visitor
│         ┌──────────────────────────────────────┐
│         │ Visitor Stored:                      │
│         │ • Company: Acme Corporation          │
│         │ • Location: San Francisco, CA        │
│         │ • Status: Active                     │
│         │ • Page Views: 1                      │
│         └──────────────────────────────────────┘
│
├─ 250ms: WebSocket broadcasts to all dashboards
│         📢 "New visitor on example.com!"
│
├─ 300ms: Admin dashboard updates
│         ┌──────────────────────────────────────┐
│         │ TIPPEN DASHBOARD                     │
│         │ ┌──────────────────────────────────┐ │
│         │ │ 🟢 Acme Corporation              │ │
│         │ │ Revenue: $2.5M | Staff: 150      │ │
│         │ │ Role: CEO                        │ │
│         │ │ Activity: Just now               │ │
│         │ │ Video Call: [Toggle Switch]      │ │
│         │ └──────────────────────────────────┘ │
│         └──────────────────────────────────────┘
│
└─ 30s: Heartbeat ping sent
   │
   └─ 60s: Another heartbeat
      │
      └─ 90s: Another heartbeat
         │
         └─ ... continues every 30 seconds
```

---

## 🧪 Testing Your Installation

### Step-by-Step Test

1. **Add Script to Your Page**
   ```html
   <head>
     <script
       src="./tippen-tracker.js"
       data-tippen-api-key="demo_api_key"
       data-tippen-backend="http://localhost:8787"
     ></script>
   </head>
   ```

2. **Open Page in Browser**
   ```
   http://localhost:8080/demo-website.html
   ```

3. **Open Developer Console (F12)**
   ```
   Expected output:
   ✅ Tippen Tracker initialized successfully
   Visitor ID: visitor_1729080000000_abc123
   ```

4. **Check Network Tab**
   ```
   POST /track/visitor
   Status: 200 OK
   Response: {"success":true,"sessionId":"visitor_..."}
   ```

5. **Check Tippen Dashboard**
   ```
   Navigate to: http://localhost:5173 (Tippen dashboard)
   Go to Visitors page
   Should see: 🟢 Active visitor (your visit)
   ```

---

## 🌐 Live Demo

The demo website is now running at:

```
http://localhost:8080/demo-website.html
```

**What to expect:**
- Beautiful Acme Corporation website
- Tracking script in `<head>` tag
- Green "Tippen Tracking Active" badge
- Console logs showing initialization
- Real-time tracking to dashboard

**Try it:**
1. Open: http://localhost:8080/demo-website.html
2. Open console (F12)
3. See tracking messages
4. Check Tippen dashboard for your visit
5. Admin can toggle video call switch
6. Video popup should appear on demo site

---

## 📚 Summary

### Quick Reference

| Question | Answer |
|----------|--------|
| Where to place? | In `<head>` tag (recommended) |
| Before or after other scripts? | Can go anywhere in `<head>` |
| Does order matter? | No, can be first or last in `<head>` |
| Should I use async? | Optional, helps with performance |
| Works with React/Vue/Angular? | Yes, add to index.html or _document |
| Works with WordPress? | Yes, add to header.php or use plugin |
| Performance impact? | Minimal (~50ms, 8KB script) |
| Required attributes? | src, data-tippen-api-key, data-tippen-backend |

### Best Practice Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Site</title>

  <!-- TIPPEN TRACKING (Place early in head) -->
  <script
    src="https://cdn.tippen.com/tippen-tracker.js"
    data-tippen-api-key="your_api_key_here"
    data-tippen-backend="https://tippen-backend.workers.dev"
    async
  ></script>

  <!-- Your other tags -->
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <!-- Your content -->
</body>
</html>
```

---

**Need Help?**
- See [TRACKING_SCRIPT_GUIDE.md](TRACKING_SCRIPT_GUIDE.md) for detailed instructions
- See [ADMIN_SOP.md](ADMIN_SOP.md) for complete documentation
- Check console for error messages
- Verify API key matches dashboard

**Demo Website:** [public/demo-website.html](public/demo-website.html)
**Running at:** http://localhost:8080/demo-website.html
