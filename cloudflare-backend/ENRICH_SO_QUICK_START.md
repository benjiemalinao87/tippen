# Enrich.so Quick Start Guide

## ✅ Already Configured

Your Enrich.so integration is **ready to use**! Here's what's been set up:

### 1. API Key Configured
- **File**: `cloudflare-backend/.dev.vars`
- **Status**: ✅ Active
- **Rate Limit**: 50 requests/minute
- **Cost**: 1 credit per lookup

### 2. Code Updated
- **File**: `cloudflare-backend/src/index.ts` (lines 335-420)
- **Function**: `enrichVisitorData()`
- **Status**: ✅ Using Enrich.so API

---

## 🚀 Quick Test (3 steps)

### Step 1: Start Backend
```bash
cd cloudflare-backend
npm run dev
```

### Step 2: Send Test Visitor
```bash
curl -X POST http://localhost:8787/track/visitor \
  -H "Content-Type: application/json" \
  -H "X-Tippen-API-Key: demo_api_key" \
  -d '{
    "event": "pageview",
    "visitor": {
      "visitorId": "test_123",
      "url": "https://example.com",
      "timestamp": "2025-01-16T12:00:00Z"
    },
    "website": "example.com"
  }'
```

### Step 3: Check Logs
Look for:
```
[Enrich.so] Looking up company for IP: 127.0.0.1
[Enrich.so] ✅ Company found: {...}
```

---

## 📊 What You Get

### Before (without Enrich.so):
```
Company: Direct Visitor
Revenue: null
Staff: null
```

### After (with Enrich.so):
```
Company: Google LLC
Revenue: $280B
Staff: 150,000
Industry: Technology
Location: Mountain View, CA
```

---

## 🌐 Deploy to Production

```bash
# 1. Deploy worker
npm run deploy

# 2. Set API key as secret
wrangler secret put ENRICH_API_KEY

# When prompted, paste:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MDdlNzFmNWQwNTBiOWMxMjU1ZWM0ZCIsInR5cGUiOiJhcGkiLCJyb3RhdGlvbiI6ImFlNjI4MTNlLWE5NTEtNDE5NS05YzI0LTE3ZWEzODc4MzQ4ZCIsImlhdCI6MTc2MjEyNTU5OX0.HF6k1Ei77Wq8_S1YElr_DEardtXHXbPF4xePQSTMWkU

# 3. Done! 🎉
```

---

## 📖 Full Documentation

For detailed setup, testing, and troubleshooting, see:
- **[ENRICH_SO_SETUP.md](./ENRICH_SO_SETUP.md)** - Complete integration guide

---

## ❓ Questions to Ask Me

Now that Enrich.so is set up, you can ask me:

1. **"How do I test the enrichment with a real company IP?"**
2. **"What response format does Enrich.so return?"**
3. **"How can I monitor my API credit usage?"**
4. **"What happens if the API fails or rate limit is hit?"**
5. **"How do I see enriched data in Slack notifications?"**

Just ask! 🚀
