# ⚡ Cloudflare Pages Setup - Quick Reference

## 🎯 What You're Doing Right Now

You're on the **"Set up builds and deployments"** screen in Cloudflare Pages.

---

## 📝 Fill in These Values:

### **Project name**
```
tippen
```
✅ Already filled in

### **Production branch**
```
main
```
✅ Already filled in

### **Framework preset**
```
Vite
```
⚠️ **Change from "None" to "Vite"**

### **Build command**
```
npm run build
```

### **Build output directory**
```
dist
```

---

## 🔧 After Clicking "Save and Deploy"

### Step 1: Add Environment Variables

Once deployment starts, go to:
**Settings → Environment variables → Production**

Click **"Add variable"** and add these **TWO** variables:

#### Variable 1:
- **Name**: `VITE_VISITOR_WS_URL`
- **Value**: `wss://tippen-backend.benjiemalinao879557.workers.dev/ws/dashboard`

#### Variable 2:
- **Name**: `VITE_TIPPEN_API_KEY`
- **Value**: `demo_tippen_2025_live_k8m9n2p4q7r1`

### Step 2: Trigger Redeploy

After adding environment variables:
1. Go to **Deployments** tab
2. Click **"Retry deployment"** on the latest build

This ensures the environment variables are included in the build.

---

## ✅ What's Already Done

- ✅ **Backend deployed**: `https://tippen-backend.benjiemalinao879557.workers.dev`
- ✅ **Durable Object live**: VisitorCoordinator is running
- ✅ **WebSocket endpoints active**: `/ws/dashboard` and `/ws/visitor`
- ✅ **GitHub repository**: Code pushed to `benjiemalinao87/tippen`

---

## 🎯 What Happens Next

1. **Cloudflare Pages builds your frontend** (~2-3 minutes)
2. **You get a URL**: `https://tippen.pages.dev`
3. **Dashboard connects to backend** via WebSocket
4. **System is fully operational** 🎉

---

## 🧪 How to Test After Deployment

### Test 1: Open Dashboard
```
https://tippen.pages.dev
```
Navigate to **Visitors** page and check console for:
```
[WebSocket] Connected to: wss://tippen-backend...
```

### Test 2: Test Tracking Script

Create `test.html`:
```html
<!DOCTYPE html>
<html>
<body>
  <h1>Test Visitor Tracking</h1>
  
  <script
    src="https://tippen.pages.dev/tippen-tracker.js"
    data-tippen-api-key="demo_api_key"
    data-tippen-backend="https://tippen-backend.benjiemalinao879557.workers.dev"
  ></script>
</body>
</html>
```

Open `test.html` → Check dashboard → Visitor should appear!

---

## 📊 Your Deployment Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Client Website                      │
│  (embeds tippen-tracker.js)                         │
└─────────────────┬───────────────────────────────────┘
                  │
                  │ HTTP POST /track/visitor
                  │ WebSocket /ws/visitor
                  ▼
┌─────────────────────────────────────────────────────┐
│         Cloudflare Worker (Backend) ✅               │
│  https://tippen-backend.benjiemalinao879557...      │
│                                                      │
│  ┌──────────────────────────────────────┐          │
│  │   Durable Object                      │          │
│  │   (VisitorCoordinator)                │          │
│  │   - Stores visitor states             │          │
│  │   - Manages WebSocket connections     │          │
│  │   - Sends video invites               │          │
│  └──────────────────────────────────────┘          │
└─────────────────┬───────────────────────────────────┘
                  │
                  │ WebSocket /ws/dashboard
                  ▼
┌─────────────────────────────────────────────────────┐
│         Cloudflare Pages (Frontend) ⏳               │
│  https://tippen.pages.dev                           │
│                                                      │
│  - Admin Dashboard                                   │
│  - Visitor Visualization                            │
│  - Video Call Controls                              │
└─────────────────────────────────────────────────────┘
```

---

## 🚨 Common Issues

### Issue: Build Fails

**Error**: `Command not found: npm`

**Fix**: Framework preset should be **"Vite"** (not "None")

---

### Issue: Dashboard Shows "Disconnected"

**Cause**: Missing environment variables

**Fix**: 
1. Go to **Settings → Environment variables**
2. Add `VITE_VISITOR_WS_URL` and `VITE_TIPPEN_API_KEY`
3. Redeploy

---

### Issue: Visitors Not Appearing

**Cause**: Wrong backend URL in tracking script

**Fix**: Ensure `data-tippen-backend` attribute is:
```
https://tippen-backend.benjiemalinao879557.workers.dev
```
(NOT `http://localhost:64492`)

---

## 📞 Need Help?

See full documentation:
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Complete deployment instructions
- [ADMIN_SOP.md](ADMIN_SOP.md) - Operations guide
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture

---

## 🎉 Ready to Deploy!

Click **"Save and Deploy"** in the Cloudflare Pages dashboard now!

The build will take 2-3 minutes. You can watch the progress in the **Deployments** tab.

