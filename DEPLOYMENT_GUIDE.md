# 🚀 Tippen Deployment Guide

## Overview

Tippen consists of **two separate deployments**:

1. **Frontend (React App)** → Cloudflare Pages
2. **Backend (Worker + Durable Object)** → Cloudflare Workers

---

## ✅ Step 1: Deploy Backend (Already Done!)

Your backend is **LIVE** at:
```
https://tippen-backend.benjiemalinao879557.workers.dev
```

### What's Deployed:
- ✅ Cloudflare Worker API
- ✅ Durable Object (VisitorCoordinator)
- ✅ WebSocket endpoints (`/ws/dashboard`, `/ws/visitor`)
- ✅ Tracking endpoint (`/track/visitor`)
- ✅ Video invite endpoint (`/api/send-video-invite`)

### To Redeploy Backend (if needed):
```bash
cd cloudflare-backend
npx wrangler deploy
```

---

## 📦 Step 2: Deploy Frontend to Cloudflare Pages

### A. Configure Build Settings in Cloudflare Pages Dashboard

You should see this screen now. Fill in:

| Setting | Value |
|---------|-------|
| **Framework preset** | Vite |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |

### B. Add Environment Variables

In Cloudflare Pages dashboard, go to:
**Settings → Environment variables → Production**

Add these variables:

| Variable Name | Value |
|---------------|-------|
| `VITE_VISITOR_WS_URL` | `wss://tippen-backend.benjiemalinao879557.workers.dev/ws/dashboard` |
| `VITE_TIPPEN_API_KEY` | `demo_api_key` |

⚠️ **Important**: Use `wss://` (not `ws://`) for production WebSocket connections!

### C. Deploy

Click **"Save and Deploy"**

Your frontend will be deployed to:
```
https://tippen.pages.dev
```

---

## 🔧 Step 3: Update Tracking Script for Production

After frontend deployment, you need to update the tracking script to use the production backend.

### Option A: Host Tracking Script on Cloudflare Pages

The tracking script (`tippen-tracker.js`) will be automatically available at:
```
https://tippen.pages.dev/tippen-tracker.js
```

### Option B: Use Cloudflare R2 (CDN) - Recommended for Production

1. Upload `tippen-tracker.js` to Cloudflare R2
2. Enable public access
3. Use the R2 public URL

### Client Website Integration

Your clients will embed this on their websites:

```html
<script
  src="https://tippen.pages.dev/tippen-tracker.js"
  data-tippen-api-key="client_api_key_here"
  data-tippen-backend="https://tippen-backend.benjiemalinao879557.workers.dev"
></script>
```

---

## 🧪 Step 4: Test Production Deployment

### Test 1: Frontend Dashboard

1. Visit: `https://tippen.pages.dev`
2. Navigate to **Visitors** page
3. Check browser console for WebSocket connection:
   ```
   [WebSocket] Connected to: wss://tippen-backend...
   ```

### Test 2: Tracking Script

Create a test HTML file:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Test Tippen Tracking</title>
</head>
<body>
  <h1>Test Page</h1>
  
  <script
    src="https://tippen.pages.dev/tippen-tracker.js"
    data-tippen-api-key="demo_api_key"
    data-tippen-backend="https://tippen-backend.benjiemalinao879557.workers.dev"
  ></script>
  
  <script>
    console.log('Page loaded, tracking should be active');
  </script>
</body>
</html>
```

Open this file and check:
1. Browser console shows `[Tippen] Tracker initialized`
2. Dashboard shows new visitor in real-time
3. Toggle video call ON → popup appears on test page

### Test 3: Video Call Flow

1. Open test page with tracking script
2. Open dashboard at `https://tippen.pages.dev`
3. Go to **Visitors** page
4. Find the test visitor
5. Toggle video call **ON**
6. Verify popup appears on test page
7. Click "Join Video Call"
8. Both admin and visitor should join the call

---

## 📊 Monitoring

### View Backend Logs

```bash
cd cloudflare-backend
npx wrangler tail
```

### View Durable Object Metrics

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Workers & Pages**
3. Click **tippen-backend**
4. View **Metrics** tab

### Check WebSocket Connections

In your dashboard, the connection status indicator should show:
- 🟢 **Connected** - WebSocket is active
- 🔴 **Disconnected** - Connection lost (will auto-reconnect)

---

## 🔄 Continuous Deployment

### Backend Updates

```bash
cd cloudflare-backend
# Make your changes
npx wrangler deploy
```

### Frontend Updates

Just push to GitHub:
```bash
git add .
git commit -m "Update frontend"
git push origin main
```

Cloudflare Pages will automatically rebuild and deploy!

---

## 🔐 Security Best Practices

### 1. Use Unique API Keys per Client

Don't use `demo_api_key` in production!

Generate unique keys:
```javascript
const apiKey = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
```

### 2. Implement API Key Validation

Update `cloudflare-backend/src/index.ts` to validate API keys against a database or KV store.

### 3. Add Rate Limiting

Prevent abuse by limiting requests per API key:

```typescript
// In VisitorCoordinator.ts
private rateLimitCheck(apiKey: string): boolean {
  // Implement rate limiting logic
  return true;
}
```

### 4. Enable CORS Restrictions

Update CORS headers to only allow your dashboard domain:

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://tippen.pages.dev',
  // ...
};
```

---

## 💰 Cost Estimates

### Cloudflare Workers (Backend)

- **Free Tier**: 100,000 requests/day
- **Paid**: $5/month for 10M requests
- **Durable Objects**: $0.15 per million requests

### Cloudflare Pages (Frontend)

- **Free Tier**: Unlimited bandwidth
- **Builds**: 500 builds/month (free)

### Typical Usage (100 visitors/day)

- **Tracking requests**: ~14,400/day (1 ping every 10 seconds)
- **WebSocket connections**: ~100 concurrent
- **Monthly cost**: **$0** (within free tier)

---

## 🐛 Troubleshooting

### Issue: WebSocket Not Connecting

**Symptoms**: Dashboard shows "Disconnected"

**Fix**:
1. Check environment variables in Cloudflare Pages
2. Verify `VITE_VISITOR_WS_URL` uses `wss://` (not `ws://`)
3. Check browser console for errors

### Issue: Visitors Not Appearing

**Symptoms**: Tracking script runs but no visitors in dashboard

**Fix**:
1. Verify API key matches between tracking script and dashboard
2. Check backend logs: `npx wrangler tail`
3. Test tracking endpoint directly:
   ```bash
   curl -X POST https://tippen-backend.benjiemalinao879557.workers.dev/track/visitor \
     -H "Content-Type: application/json" \
     -H "X-Tippen-API-Key: demo_api_key" \
     -d '{"event":"pageview","visitor":{"visitorId":"test","url":"https://test.com"}}'
   ```

### Issue: Video Popup Not Appearing

**Symptoms**: Toggle video ON but popup doesn't show

**Fix**:
1. Check browser console on visitor page
2. Verify WebSocket connection: `[Tippen] ✅ WebSocket connected`
3. Check backend logs for `VIDEO_INVITE` message
4. Ensure `data-tippen-backend` attribute is correct in tracking script

---

## 🎯 Next Steps

1. ✅ Complete Cloudflare Pages setup (in progress)
2. ⏳ Test production deployment
3. ⏳ Generate production API keys
4. ⏳ Set up custom domain (optional)
5. ⏳ Configure monitoring alerts
6. ⏳ Create client onboarding documentation

---

## 📞 Support

For issues or questions:
- Check [ADMIN_SOP.md](ADMIN_SOP.md) for detailed operations guide
- Review [ARCHITECTURE.md](ARCHITECTURE.md) for system design
- Check backend logs: `npx wrangler tail`

---

**Your Deployment URLs:**

- 🎨 **Frontend**: `https://tippen.pages.dev` (after Pages setup)
- ⚙️ **Backend**: `https://tippen-backend.benjiemalinao879557.workers.dev` ✅
- 📊 **Tracking Script**: `https://tippen.pages.dev/tippen-tracker.js` (after Pages setup)

