# D1 Database Setup - API Key Persistence

## ✅ Setup Complete!

Your Tippen D1 database is now live and working!

### Database Details

- **Database Name:** `tippen-db`
- **Database ID:** `4bce4fdf-e8a2-43f4-8456-366a24cfb0a7`
- **Region:** OC (Oceania)
- **Worker URL:** `https://tippen-backend.benjiemalinao879557.workers.dev`

### Tables Created

#### 1. `api_keys` - Main API Key Storage
```sql
CREATE TABLE api_keys (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  api_key TEXT UNIQUE NOT NULL,
  key_type TEXT NOT NULL,           -- 'client', 'demo', 'test'
  client_name TEXT,
  website TEXT,
  backend_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP,
  status TEXT DEFAULT 'active',     -- 'active', 'inactive', 'revoked'
  usage_count INTEGER DEFAULT 0,
  notes TEXT
);
```

#### 2. `visitor_sessions` - Visitor Tracking History
```sql
CREATE TABLE visitor_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  api_key TEXT NOT NULL,
  visitor_id TEXT NOT NULL,
  company TEXT,
  location TEXT,
  last_role TEXT,
  website TEXT,
  page_views INTEGER DEFAULT 0,
  first_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total_time_seconds INTEGER DEFAULT 0,
  FOREIGN KEY (api_key) REFERENCES api_keys(api_key)
);
```

---

## API Endpoints

### 1. Create API Key
```bash
POST /api/keys

Body:
{
  "apiKey": "client_acmecorp_1729800000000_abc123",
  "keyType": "client",           # or "demo", "test"
  "clientName": "Acme Corp",     # optional
  "website": "acme.com",         # optional
  "backendUrl": "https://...",   # optional
  "notes": "Created from dashboard"  # optional
}

Response:
{
  "success": true,
  "id": 1,
  "apiKey": "client_acmecorp_1729800000000_abc123"
}
```

### 2. Get All API Keys
```bash
GET /api/keys?status=active&limit=50&offset=0

Query params:
  - status: "active", "inactive", "revoked", "all" (default: "active")
  - limit: number (default: 50)
  - offset: number (default: 0)

Response:
{
  "success": true,
  "keys": [
    {
      "id": 1,
      "api_key": "client_acmecorp_...",
      "key_type": "client",
      "client_name": "Acme Corp",
      "website": "acme.com",
      "backend_url": "https://...",
      "created_at": "2025-10-22 11:20:53",
      "updated_at": "2025-10-22 11:20:53",
      "last_used_at": null,
      "status": "active",
      "usage_count": 0,
      "notes": "..."
    }
  ],
  "count": 1
}
```

### 3. Get Single API Key
```bash
GET /api/keys/{apiKey}

Response:
{
  "success": true,
  "key": { ... }
}
```

### 4. Update API Key
```bash
PUT /api/keys/{apiKey}

Body:
{
  "clientName": "Updated Name",
  "website": "newdomain.com",
  "backendUrl": "https://...",
  "status": "active",
  "notes": "Updated notes"
}

Response:
{
  "success": true
}
```

### 5. Delete API Key (Soft Delete)
```bash
DELETE /api/keys/{apiKey}

Response:
{
  "success": true
}
```

---

## Testing

### Test API Key Creation
```bash
curl -X POST https://tippen-backend.benjiemalinao879557.workers.dev/api/keys \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "test_1729800000000_abc123",
    "keyType": "test",
    "notes": "Test key"
  }'
```

### Test API Key Retrieval
```bash
curl https://tippen-backend.benjiemalinao879557.workers.dev/api/keys
```

### Test Specific Key
```bash
curl https://tippen-backend.benjiemalinao879557.workers.dev/api/keys/test_1729800000000_abc123
```

---

## How It Works

### Frontend (Settings Page)

1. User clicks "Generate Key" button
2. Key is generated locally using timestamp + random string
3. Key is saved to **localStorage** (immediate)
4. Key is saved to **D1 database** via API (persistent)
5. Script updates with new key
6. User copies script to install on website

### Persistence Flow

```
┌─────────────────┐
│ User Generates  │
│   API Key       │
└────────┬────────┘
         │
         ├──────────────────────────────┐
         │                              │
         v                              v
┌─────────────────┐          ┌─────────────────┐
│   localStorage  │          │  POST /api/keys │
│   (instant)     │          │  (persistent)   │
└─────────────────┘          └────────┬────────┘
                                      │
                                      v
                             ┌─────────────────┐
                             │  D1 Database    │
                             │  - api_keys     │
                             │  - indexed      │
                             └─────────────────┘
```

### On Page Refresh

1. Check localStorage first (fast)
2. If found, populate UI immediately
3. Optionally sync with D1 database

### Benefits

✅ **Instant Load:** localStorage provides immediate access  
✅ **Persistent:** D1 database survives browser clear/new devices  
✅ **Scalable:** Can query, filter, and analyze keys  
✅ **Auditable:** Tracks creation time, usage, status  
✅ **Manageable:** Can list, update, revoke keys  

---

## Database Commands

### View D1 Database
```bash
cd cloudflare-backend
npx wrangler d1 list
```

### Execute SQL Query
```bash
npx wrangler d1 execute tippen-db --remote --command="SELECT * FROM api_keys"
```

### View Database Info
```bash
npx wrangler d1 info tippen-db
```

### Backup Database
```bash
npx wrangler d1 export tippen-db --remote --output=backup.sql
```

---

## Deployment

### Deploy Worker with D1
```bash
cd cloudflare-backend
npx wrangler deploy
```

### Update Schema (if changed)
```bash
npx wrangler d1 execute tippen-db --remote --file=./schema.sql
```

### Local Development
```bash
# For local dev, create local D1
npx wrangler d1 execute tippen-db --local --file=./schema.sql

# Run dev server
npx wrangler dev
```

---

## Monitoring

### Check Recent Keys
```bash
npx wrangler d1 execute tippen-db --remote --command="
  SELECT api_key, key_type, client_name, created_at, status 
  FROM api_keys 
  ORDER BY created_at DESC 
  LIMIT 10
"
```

### Count Active Keys
```bash
npx wrangler d1 execute tippen-db --remote --command="
  SELECT key_type, COUNT(*) as count 
  FROM api_keys 
  WHERE status='active' 
  GROUP BY key_type
"
```

### View Usage Stats
```bash
npx wrangler d1 execute tippen-db --remote --command="
  SELECT api_key, usage_count, last_used_at 
  FROM api_keys 
  WHERE status='active' 
  ORDER BY usage_count DESC 
  LIMIT 10
"
```

---

## Security

### Best Practices

1. **API Key Format:**
   - Client: `client_companyname_timestamp_random`
   - Demo: `demo_tippen_2025_random`
   - Test: `test_timestamp_random`

2. **Status Management:**
   - Use `active` for production keys
   - Use `inactive` for temporarily disabled
   - Use `revoked` for permanently disabled

3. **Soft Deletes:**
   - DELETE endpoint sets status to 'revoked'
   - Data is preserved for audit trail
   - Can be reactivated if needed

4. **Access Control:**
   - Add authentication to API endpoints in production
   - Consider rate limiting for key creation
   - Monitor for unusual activity

---

## Troubleshooting

### Issue: "Database not found"
**Solution:**
```bash
npx wrangler d1 list
# Verify database exists and ID matches wrangler.toml
```

### Issue: "Table doesn't exist"
**Solution:**
```bash
npx wrangler d1 execute tippen-db --remote --file=./schema.sql
```

### Issue: "API key already exists"
**Solution:**
- Key must be unique
- Check if key exists: `GET /api/keys/{key}`
- Delete or revoke existing key first

### Issue: "CORS error from frontend"
**Solution:**
- Ensure CORS headers are set in worker
- Check `Access-Control-Allow-Origin` includes your domain

---

## Next Steps

### Optional Enhancements

1. **Add Authentication:**
   - Require admin auth for key management
   - Add API tokens for key CRUD operations

2. **Track Usage:**
   - Update `usage_count` when key is used
   - Update `last_used_at` timestamp
   - Add visitor tracking integration

3. **Add Limits:**
   - Set max keys per account
   - Add rate limiting per key
   - Track API quota usage

4. **Build Admin UI:**
   - List all keys in dashboard
   - View usage analytics
   - Bulk operations (revoke, export)

5. **Add Notifications:**
   - Alert when key is used for first time
   - Notify when key reaches usage limit
   - Warning for revoked key attempts

---

## Files Modified

### Backend
- `cloudflare-backend/wrangler.toml` - Added D1 binding
- `cloudflare-backend/schema.sql` - Database schema
- `cloudflare-backend/src/index.ts` - Added D1 routes
- `cloudflare-backend/src/apiKeyHandlers.ts` - API key CRUD handlers

### Frontend
- `src/features/settings/components/Settings.tsx` - Added D1 API calls

---

## Summary

✅ **D1 Database Created:** `tippen-db`  
✅ **Tables Created:** `api_keys`, `visitor_sessions`  
✅ **API Endpoints:** Full CRUD operations  
✅ **Worker Deployed:** https://tippen-backend.benjiemalinao879557.workers.dev  
✅ **Frontend Integrated:** localStorage + D1 dual persistence  
✅ **Tested:** API key creation and retrieval working  

**Status:** 🟢 Production Ready!

---

**Last Updated:** October 22, 2025  
**Database Region:** OC (Oceania)  
**Version:** 1.0.0

