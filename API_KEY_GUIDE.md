# 🔑 Tippen API Key Management Guide

## Overview

API keys are used to authenticate and track visitors for each client. Each client should have their own unique API key.

---

## 🎯 API Key Format

### **Client Keys** (Production)
```
client_<company>_<timestamp>_<random>
```
Example: `client_acmecorp_1760621395392_lfd58yt3`

### **Demo Keys** (Public Testing)
```
demo_tippen_2025_<random>
```
Example: `demo_tippen_2025_live_k8m9n2p4q7r1`

### **Test Keys** (Internal)
```
test_<timestamp>_<random>
```
Example: `test_1760621395392_x7y9z3a5b8c2`

---

## 🛠️ How to Generate API Keys

### **Method 1: Web Interface (Easiest)**

1. Open the API Key Generator:
   ```
   https://tippen.pages.dev/api-key-generator.html
   ```
   Or locally: `http://localhost:5173/api-key-generator.html`

2. Select key type (Client, Demo, or Test)
3. Enter client name (optional, for client keys)
4. Click "Generate API Key"
5. Copy the generated key and integration code

### **Method 2: Command Line**

```bash
# Generate a client key
node scripts/generate-api-key.js --client "Acme Corporation"

# Generate a demo key
node scripts/generate-api-key.js --type demo

# Generate a test key
node scripts/generate-api-key.js --type test

# Generate a generic client key (no company name)
node scripts/generate-api-key.js
```

### **Method 3: Browser Console (Quick)**

```javascript
// Copy-paste this into browser console
function generateApiKey(clientName = '') {
  const random = () => Math.random().toString(36).substring(2, 15);
  const timestamp = Date.now();
  const clean = clientName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20);
  
  if (clean) {
    return `client_${clean}_${timestamp}_${random().substring(0, 8)}`;
  }
  return `client_${timestamp}_${random().substring(0, 16)}`;
}

// Generate key
const apiKey = generateApiKey('Acme Corporation');
console.log('API Key:', apiKey);
```

---

## 📋 Client Integration

Once you have an API key, provide this code to your client:

```html
<script
  src="https://tippen.pages.dev/tippen-tracker.js"
  data-tippen-api-key="YOUR_API_KEY_HERE"
  data-tippen-backend="https://tippen-backend.benjiemalinao879557.workers.dev"
></script>
```

### **Where to Place:**

**Option 1: In `<head>` (Recommended)**
```html
<!DOCTYPE html>
<html>
<head>
  <title>Client Website</title>
  
  <!-- Tippen Tracking -->
  <script
    src="https://tippen.pages.dev/tippen-tracker.js"
    data-tippen-api-key="client_acmecorp_123"
    data-tippen-backend="https://tippen-backend.benjiemalinao879557.workers.dev"
  ></script>
</head>
<body>
  <!-- Website content -->
</body>
</html>
```

**Option 2: Before closing `</body>`**
```html
<!DOCTYPE html>
<html>
<head>
  <title>Client Website</title>
</head>
<body>
  <!-- Website content -->
  
  <!-- Tippen Tracking -->
  <script
    src="https://tippen.pages.dev/tippen-tracker.js"
    data-tippen-api-key="client_acmecorp_123"
    data-tippen-backend="https://tippen-backend.benjiemalinao879557.workers.dev"
  ></script>
</body>
</html>
```

---

## 🔐 Security Best Practices

### **1. Unique Keys per Client**
- ✅ Generate a new API key for each client
- ❌ Don't reuse the same key across multiple clients

### **2. Store Keys Securely**
- Save API keys in a password manager (1Password, LastPass, etc.)
- Document which key belongs to which client
- Keep a backup in a secure location

### **3. Key Rotation**
If a key is compromised:
1. Generate a new API key
2. Update the client's tracking script
3. Monitor for unauthorized usage of old key
4. (Future: Implement key revocation in backend)

### **4. Demo vs Production Keys**
- Use `demo_*` keys only for public demos
- Use `test_*` keys only for internal testing
- Use `client_*` keys for production clients

---

## 📊 Tracking API Keys

### **Current Method: Manual Tracking**

Create a spreadsheet or document:

| Client Name | API Key | Website | Date Created | Status |
|-------------|---------|---------|--------------|--------|
| Acme Corp | `client_acmecorp_123...` | acme.com | 2025-01-16 | Active |
| TechStart | `client_techstart_456...` | techstart.io | 2025-01-16 | Active |
| Demo | `demo_tippen_2025_live...` | demo site | 2025-01-16 | Active |

### **Future Enhancement: Database Storage**

Consider storing API keys in:
- Cloudflare KV (Key-Value store)
- Cloudflare D1 (SQLite database)
- External database (PostgreSQL, MySQL)

Example schema:
```sql
CREATE TABLE api_keys (
  id INTEGER PRIMARY KEY,
  api_key TEXT UNIQUE NOT NULL,
  client_name TEXT NOT NULL,
  website TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'active',
  last_used_at TIMESTAMP
);
```

---

## 🧪 Testing API Keys

### **Test in Browser Console**

1. Open client website with tracking script
2. Open browser DevTools (F12)
3. Check console for:
   ```
   [Tippen] Tracker initialized with API key: client_acmecorp_123...
   [Tippen] ✅ WebSocket connected for video invites
   [Tippen] Visitor tracked: {success: true, sessionId: '...'}
   ```

### **Test with cURL**

```bash
curl -X POST https://tippen-backend.benjiemalinao879557.workers.dev/track/visitor \
  -H "Content-Type: application/json" \
  -H "X-Tippen-API-Key: client_acmecorp_123" \
  -d '{
    "event": "pageview",
    "visitor": {
      "visitorId": "test_visitor_001",
      "url": "https://acme.com",
      "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
    },
    "website": "acme.com"
  }'
```

Expected response:
```json
{
  "success": true,
  "sessionId": "test_visitor_001"
}
```

---

## 🚨 Troubleshooting

### **Issue: Visitors Not Appearing in Dashboard**

**Possible Causes:**
1. Wrong API key in tracking script
2. API key mismatch between dashboard and tracking script
3. Backend URL incorrect

**Fix:**
1. Verify API key in tracking script matches dashboard
2. Check browser console for errors
3. Verify backend URL: `https://tippen-backend.benjiemalinao879557.workers.dev`

### **Issue: "API key not provided" Error**

**Cause:** Missing `data-tippen-api-key` attribute

**Fix:**
```html
<!-- ❌ Wrong -->
<script src="https://tippen.pages.dev/tippen-tracker.js"></script>

<!-- ✅ Correct -->
<script
  src="https://tippen.pages.dev/tippen-tracker.js"
  data-tippen-api-key="client_acmecorp_123"
></script>
```

---

## 📝 Client Onboarding Checklist

When onboarding a new client:

- [ ] Generate unique API key
- [ ] Save API key securely
- [ ] Document client name and website
- [ ] Provide integration code to client
- [ ] Verify tracking script is installed
- [ ] Test visitor appears in dashboard
- [ ] Test video call functionality
- [ ] Provide client with support documentation

---

## 🔗 Quick Links

- **API Key Generator (Web)**: `https://tippen.pages.dev/api-key-generator.html`
- **API Key Generator (CLI)**: `node scripts/generate-api-key.js`
- **Dashboard**: `https://tippen.pages.dev`
- **Backend API**: `https://tippen-backend.benjiemalinao879557.workers.dev`
- **Tracking Script**: `https://tippen.pages.dev/tippen-tracker.js`

---

## 📞 Support

For issues or questions:
- Review [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- Check [ADMIN_SOP.md](ADMIN_SOP.md)
- View backend logs: `cd cloudflare-backend && npx wrangler tail`

