# Changelog System Documentation

## Overview

Tippen now includes an automated changelog system that tracks all updates, features, fixes, and improvements. The changelog is automatically populated from git commits and displayed on a beautiful public changelog page.

## Features

✅ **Automatic GitHub Integration** - Changelog entries are created automatically from git commits  
✅ **Public Changelog Page** - Beautiful, categorized changelog at `/changelog`  
✅ **Category Detection** - Auto-detects feature, fix, improvement, breaking, security, update  
✅ **Git History Backfill** - Import existing git history into changelog  
✅ **Conventional Commits Support** - Parses conventional commit format  
✅ **Real-time Updates** - New commits automatically create changelog entries

## Architecture

### Database Schema

**Table: `changelog`**
```sql
- id: INTEGER PRIMARY KEY
- version: TEXT (optional)
- title: TEXT (commit title)
- description: TEXT (commit body)
- commit_hash: TEXT (short hash)
- commit_message: TEXT (full message)
- author: TEXT (author name)
- category: TEXT (feature|fix|improvement|breaking|security|update)
- is_published: INTEGER (1=published, 0=draft)
- created_at: TEXT (ISO timestamp)
- published_at: TEXT (ISO timestamp)
```

### Backend API Endpoints

**1. GET `/api/changelog`** - Get published changelog entries
- Query params: `limit`, `offset`, `category`
- Public endpoint (no auth required)
- Returns paginated changelog entries

**2. POST `/api/changelog`** - Create single changelog entry
- Protected endpoint
- Body: `{ title, description?, commit_hash?, author?, category? }`

**3. POST `/api/changelog/bulk`** - Bulk create entries (for backfilling)
- Body: `{ entries: [...] }`
- Skips existing commit_hash entries

**4. POST `/api/changelog/github-webhook`** - GitHub webhook endpoint
- Receives push events from GitHub Actions
- Auto-creates changelog entries from commits
- Header: `X-GitHub-Event: push`

### Frontend Components

**Location:** `src/features/changelog/components/Changelog.tsx`

**Features:**
- Beautiful gradient design matching Tippen brand
- Category filtering (All, Feature, Fix, Improvement, etc.)
- Grouped by date with sticky headers
- Shows commit hash and author
- Responsive design

**Route:** `/changelog` (public, no auth required)

## Usage

### 1. View Changelog

Navigate to: `https://www.tippen.com.au/changelog`

Or from landing page footer: Click "Changelog" link

### 2. Backfill from Git History

To import existing git commits into the changelog:

```bash
cd /path/to/tippen
node scripts/backfill-changelog.js --limit=50
```

**Options:**
- `--limit=N` - Number of commits to import (default: 50)
- `BACKEND_URL` - Environment variable to override backend URL

**Example:**
```bash
# Import last 100 commits
node scripts/backfill-changelog.js --limit=100

# Use custom backend
BACKEND_URL=https://my-backend.workers.dev node scripts/backfill-changelog.js
```

### 3. GitHub Actions Auto-Update

**Setup:** Already configured in `.github/workflows/changelog.yml`

**How it works:**
1. Developer pushes commits to `main` or `master` branch
2. GitHub Actions triggers on push event
3. Workflow sends commit data to changelog webhook
4. Backend creates changelog entries automatically
5. Entries appear instantly on `/changelog` page

**Manual trigger (if needed):**
```bash
git push origin main  # Automatically triggers changelog update
```

### 4. Commit Message Format

For best results, use conventional commit format:

```
type(scope): description

Optional body with more details
```

**Supported types:**
- `feat` or `feature` → Category: **Feature**
- `fix` → Category: **Fix**
- `refactor`, `improve`, `perf` → Category: **Improvement**
- `breaking` → Category: **Breaking Change**
- `security` → Category: **Security**
- Default → Category: **Update**

**Examples:**

```bash
# Feature
git commit -m "feat: Add workspace switcher for SaaS owners"

# Bug fix
git commit -m "fix: Resolve visitor tracking in Safari"

# Improvement
git commit -m "refactor: Optimize WebSocket connection handling"

# Breaking change
git commit -m "breaking: Remove legacy API endpoints"

# Security
git commit -m "security: Patch XSS vulnerability in video chat"
```

## Category Icons & Colors

| Category | Icon | Color |
|----------|------|-------|
| Feature | ✨ Sparkles | Emerald |
| Fix | 🐛 Bug | Amber |
| Improvement | ⚡ Zap | Blue |
| Breaking | ⚠️ Alert | Red |
| Security | 🛡️ Shield | Purple |
| Update | 🔄 Refresh | Gray |

## Deployment

### Backend Deployment

The changelog system is deployed with the Cloudflare Workers backend:

```bash
cd cloudflare-backend
npm run deploy
```

**Required:**
- D1 database binding (`DB`)
- Migration `migration_007_add_changelog_table.sql` applied

### Frontend Deployment

The changelog page is bundled with the main Tippen app:

```bash
npm run build
# Deploy dist/ to hosting
```

## Testing

### 1. Test Backfill Script

```bash
# Dry run (preview only)
node scripts/backfill-changelog.js --limit=5

# Actual import
node scripts/backfill-changelog.js --limit=50
```

### 2. Test Changelog Page

Visit: `http://localhost:5173/changelog` (dev) or `https://www.tippen.com.au/changelog` (prod)

**Check:**
- ✅ Entries are grouped by date
- ✅ Category filters work
- ✅ Commit hashes display correctly
- ✅ Authors show properly
- ✅ Responsive design works on mobile

### 3. Test GitHub Webhook

**Simulate webhook:**
```bash
curl -X POST https://tippen-backend.benjiemalinao879557.workers.dev/api/changelog/github-webhook \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: push" \
  -d '{
    "ref": "refs/heads/main",
    "commits": [{
      "id": "abc123def456",
      "message": "feat: test changelog webhook",
      "author": {"name": "Test User"},
      "timestamp": "2026-01-13T00:00:00Z"
    }],
    "pusher": {"name": "Test User"},
    "repository": {"name": "tippen", "full_name": "org/tippen"}
  }'
```

## Troubleshooting

### Changelog page shows empty

**Solution:**
1. Check backend is deployed: `curl https://tippen-backend.benjiemalinao879557.workers.dev/api/changelog`
2. Run backfill script: `node scripts/backfill-changelog.js`
3. Check D1 database has data: `wrangler d1 execute tippen-db --command "SELECT COUNT(*) FROM changelog"`

### GitHub webhook not triggering

**Solution:**
1. Check `.github/workflows/changelog.yml` exists
2. Push to `main` or `master` branch (not other branches)
3. Check GitHub Actions logs for errors
4. Verify backend URL in workflow matches deployed URL

### Duplicate entries

**Solution:**
The backend automatically skips duplicate `commit_hash` entries. If you see duplicates, they likely have different commit hashes or were manually created.

### Categories not detecting correctly

**Solution:**
Update commit message format to use conventional commits:
```bash
# Instead of: "added new feature"
# Use: "feat: add new feature"
```

## Migration Guide

### From Manual Changelog to Automated

**Step 1:** Apply D1 migration
```bash
cd cloudflare-backend
wrangler d1 execute tippen-db --remote --file=migration_007_add_changelog_table.sql
```

**Step 2:** Deploy backend
```bash
npm run deploy
```

**Step 3:** Backfill existing commits
```bash
cd ..
node scripts/backfill-changelog.js --limit=100
```

**Step 4:** Verify
Visit `/changelog` and confirm entries are visible.

## Future Enhancements

🔮 **Planned Features:**
- [ ] Version tagging (v1.0.0, v1.1.0, etc.)
- [ ] Release notes generation
- [ ] RSS feed for changelog
- [ ] Email notifications for new updates
- [ ] Admin UI to edit/unpublish entries
- [ ] Markdown support in descriptions
- [ ] Image attachments for visual changes
- [ ] Search functionality
- [ ] Export changelog to Markdown/JSON

## Files Modified/Created

### New Files
- `cloudflare-backend/migration_007_add_changelog_table.sql` - Database schema
- `cloudflare-backend/src/changelog.ts` - Backend handler
- `src/features/changelog/components/Changelog.tsx` - UI component
- `src/features/changelog/index.ts` - Feature export
- `scripts/backfill-changelog.js` - Backfill script
- `.github/workflows/changelog.yml` - GitHub Actions workflow
- `CHANGELOG_SYSTEM.md` - This documentation

### Modified Files
- `cloudflare-backend/src/index.ts` - Added changelog routes
- `src/Router.tsx` - Added changelog route
- `src/features/landing/components/Landing.tsx` - Added changelog link

## Support

For issues or questions:
1. Check this documentation
2. Review GitHub Actions logs
3. Check Cloudflare Workers logs: `wrangler tail`
4. Contact: benjie@tippen.com.au

---

**Last Updated:** 2026-01-13  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
