# Database Schema Update - Visitors Table

## ✅ Migration Complete!

**Date:** October 22, 2025  
**Migration:** `migration_001_rename_visitor_sessions.sql`

---

## What Changed

### Before: `visitor_sessions`
❌ Name implied only video sessions were tracked  
❌ Foreign key constraint could cause failures  
❌ No fields for video session tracking

### After: `visitors`
✅ Clear naming - tracks ALL website visitors  
✅ No foreign key constraint - more resilient  
✅ Added video session fields (optional)  
✅ Works for visitors who never accept video calls

---

## New Table Structure

```sql
CREATE TABLE visitors (
  -- Core visitor info
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
  
  -- Video session fields (nullable - only filled if visitor accepts video)
  video_session_id TEXT,
  video_invited_at TIMESTAMP,
  video_accepted_at TIMESTAMP,
  video_status TEXT  -- 'invited', 'accepted', 'declined', 'completed', NULL
);
```

---

## Key Improvements

### 1. **Better Naming**
The table is now called `visitors` because:
- It tracks ALL website visitors
- Not just those who accept video calls
- Most visitors will never have a video session
- Clearer for anyone reading the code

### 2. **No Foreign Key Constraint**
**Before:**
```sql
FOREIGN KEY (api_key) REFERENCES api_keys(api_key)
```
This caused errors when:
- API key didn't exist in database yet
- Testing with new keys
- Visitor tracking failed if key wasn't registered

**After:**
- No foreign key constraint
- Visitors save successfully regardless of API key status
- API key usage tracking is optional (graceful fallback)

### 3. **Video Session Tracking**
New fields for when visitors DO accept video:
- `video_session_id` - Links to video session
- `video_invited_at` - When invite was sent
- `video_accepted_at` - When visitor joined
- `video_status` - Current status (invited, accepted, declined, completed)

**All fields are nullable** - they remain NULL for visitors who never accept video.

---

## Data Examples

### Regular Website Visitor (No Video)
```json
{
  "id": 2,
  "api_key": "demo_tippen_2025_live_k8m9n2p4q7r1",
  "visitor_id": "visitor_1760622894858_0frlowozn",
  "company": "automate8.swipepages.net Visitor",
  "location": "Australia/Sydney",
  "last_role": "Mac - Edge",
  "website": "automate8.swipepages.net",
  "page_views": 6,
  "first_seen_at": "2025-10-22 12:00:15",
  "last_seen_at": "2025-10-22 12:02:33",
  "total_time_seconds": 0,
  
  // Video fields all NULL - never invited
  "video_session_id": null,
  "video_invited_at": null,
  "video_accepted_at": null,
  "video_status": null
}
```

### Visitor Who Was Invited to Video (Future Example)
```json
{
  "id": 5,
  "visitor_id": "visitor_xyz",
  "company": "Example Corp",
  // ... other fields ...
  
  // Video session info populated
  "video_session_id": "vs_abc123",
  "video_invited_at": "2025-10-22 12:05:30",
  "video_accepted_at": "2025-10-22 12:05:45",
  "video_status": "accepted"
}
```

---

## Current Database Tables

```
1. api_keys         - API key management
2. visitors         - ALL website visitors (with optional video data)
3. sqlite_sequence   - Auto-increment tracking
4. _cf_KV           - Internal Cloudflare metadata
```

---

## Migration Process

### What Happened
1. ✅ Created new `visitors` table with enhanced schema
2. ✅ Copied all data from old `visitor_sessions` table
3. ✅ Dropped old `visitor_sessions` table
4. ✅ Updated code to use new table name
5. ✅ Removed foreign key constraint handling
6. ✅ Added video session update function
7. ✅ Deployed updated worker

### Data Preserved
All existing visitor data was preserved:
- 3 visitors migrated successfully
- Page view counts maintained
- Timestamps preserved
- No data loss

---

## Benefits

### ✅ More Resilient
- Visitors save even if API key doesn't exist
- No foreign key constraint failures
- Graceful degradation if key tracking fails

### ✅ Clearer Purpose
- Name matches actual usage
- Tracks all visitors, not just sessions
- Video data is clearly optional

### ✅ Future-Ready
- Can track video invitations
- Can track video acceptance rate
- Can analyze which visitors accept video calls
- Can see full visitor journey

---

## Analytics Queries

### All Visitors (Including Non-Video)
```sql
SELECT * FROM visitors 
ORDER BY last_seen_at DESC;
```

### Visitors Who Were Invited to Video
```sql
SELECT * FROM visitors 
WHERE video_status IS NOT NULL
ORDER BY video_invited_at DESC;
```

### Video Acceptance Rate
```sql
SELECT 
  COUNT(*) as total_invites,
  SUM(CASE WHEN video_status = 'accepted' THEN 1 ELSE 0 END) as accepted,
  ROUND(100.0 * SUM(CASE WHEN video_status = 'accepted' THEN 1 ELSE 0 END) / COUNT(*), 2) as acceptance_rate
FROM visitors 
WHERE video_status IS NOT NULL;
```

### Visitors Who Never Received Video Invite
```sql
SELECT * FROM visitors 
WHERE video_status IS NULL
ORDER BY page_views DESC;
```

---

## Code Updates

### Backend Files Modified
- `src/visitorStorage.ts` - Updated all queries to use `visitors` table
- Added `updateVisitorVideoStatus()` function for video tracking
- Removed foreign key dependency

### Functions Available
```typescript
// Save visitor (works with or without API key in database)
saveVisitorToD1(env, apiKey, visitor, website, event)

// Get all visitors
getVisitorsByApiKey(env, apiKey, limit, offset)

// Get statistics
getVisitorStats(env, apiKey)

// Get recent visitors
getRecentVisitors(env, apiKey, hours)

// NEW: Update video session status
updateVisitorVideoStatus(env, apiKey, visitorId, videoSessionId, status)
```

---

## Testing

### Verify Table Exists
```bash
npx wrangler d1 execute tippen-db --remote \
  --command="SELECT name FROM sqlite_master WHERE type='table'"
```

### Check Current Visitors
```bash
npx wrangler d1 execute tippen-db --remote \
  --command="SELECT id, company, page_views, video_status FROM visitors LIMIT 5"
```

### Test Video Status Update
```bash
npx wrangler d1 execute tippen-db --remote \
  --command="UPDATE visitors SET video_status='invited', video_invited_at=CURRENT_TIMESTAMP WHERE id=2"
```

---

## Summary

✅ **Table renamed:** `visitor_sessions` → `visitors`  
✅ **Foreign key removed:** More resilient  
✅ **Video fields added:** Track video sessions optionally  
✅ **All data migrated:** No data loss  
✅ **Code updated:** All queries use new table  
✅ **Deployed:** Live and working  

**Status:** 🟢 Migration Complete & Production Ready

The database now properly reflects that we're tracking ALL website visitors, not just those in video sessions!

---

**Last Updated:** October 22, 2025  
**Database:** tippen-db (4bce4fdf-e8a2-43f4-8456-366a24cfb0a7)  
**Version:** 2.0.0

