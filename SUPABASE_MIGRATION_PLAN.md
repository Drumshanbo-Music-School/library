# Supabase Migration Plan: Drumshanbo Music Library

## Overview
Migrate the Irish Traditional Music catalog to a **hybrid architecture**:
- **Production (GitHub Pages):** Supabase database with admin authentication and dynamic edits
- **Local Development:** Static catalog.json (offline-capable, fast)
- **Enrichment Workflow:** Preserved exactly as-is (CSV → JSON → append script)

**Current State:** 181 CDs in static JSON, 122 images, client-side filtering
**Target State:** Dual-mode system with catalog.json as source of truth, Supabase for production with admin CRUD UI

## Key Design Decision: Hybrid Architecture

To address local development and enrichment workflow concerns:

### 1. Local Development Impact
**Problem:** Supabase requires internet, API keys, and adds latency
**Solution:** Environment-based data source switching

```javascript
// Local dev: VITE_USE_SUPABASE=false → reads /data/catalog.json (offline, fast)
// Production: VITE_USE_SUPABASE=true → reads from Supabase (dynamic, admin edits)
```

**Benefits:**
- ✓ Local dev works offline (no Supabase needed)
- ✓ Faster local development (no network calls)
- ✓ Production gets dynamic database with admin edits
- ✓ Easy toggle between modes

### 2. Enrichment Workflow Impact
**Problem:** Current workflow uses `append-to-catalog.js` which updates catalog.json
**Solution:** Keep existing workflow, add sync script

**Preserved Workflow:**
```
CSV batch → Web enrichment → enriched_batch_cd###-###.json
  → node append-to-catalog.js → catalog.json updated
  → node sync-catalog-to-supabase.js → Supabase updated
```

**New Script:** `sync-catalog-to-supabase.js`
- Reads catalog.json (source of truth)
- Detects new/changed items (by comparing timestamps or IDs)
- Syncs changes to Supabase
- Uploads new images to Supabase Storage
- **catalog.json remains the master source**

**Benefits:**
- ✓ Enrichment workflow completely unchanged
- ✓ Can continue using Claude for batch enrichment exactly as before
- ✓ catalog.json remains source of truth
- ✓ One extra command to sync to Supabase
- ✓ Admin panel edits also sync back to catalog.json (optional)

**Two-Way Sync:** Both catalog.json and Supabase are kept in sync using timestamps. Whichever has the newer `updated_at` timestamp wins.

### 3. Summary: What Changes?

**Local Development:** ✅ **No changes** - still uses catalog.json, works offline, fast

**Enrichment Workflow:** ✅ **One extra command** - add `node sync-catalog-supabase.js` after append (bidirectional)

**Production Deployment:** ✅ **Uses Supabase** - dynamic database with admin edits

**Admin Panel:** ✅ **NEW** - authorized users can edit/create entries via UI (syncs back to catalog.json)

**Two-Way Sync:** ✅ **Timestamp-based** - newest changes win, no data loss, both sources stay in sync

**Cost:** ✅ **Still $0** - Supabase free tier + GitHub Pages

---

## Phase 1: Supabase Setup (Manual)

### 1.1 Create Supabase Project
1. Go to supabase.com → Create new project
2. Name: `drumshanbo-music-library`
3. Database password: Generate and save securely
4. Region: Choose closest to Ireland (EU West recommended)
5. Free tier confirmed (well within limits: 500MB DB, 1GB storage, 2GB bandwidth)

### 1.2 Run Database Schema

**Execute in Supabase SQL Editor:**

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Publishers table
CREATE TABLE publishers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Artists table
CREATE TABLE artists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Main catalog items table
CREATE TABLE catalog_items (
  id TEXT PRIMARY KEY,  -- cd-001, cd-002, etc.
  type TEXT NOT NULL DEFAULT 'CD',
  title TEXT NOT NULL,
  description TEXT,
  publisher_id UUID REFERENCES publishers(id) ON DELETE SET NULL,
  year TEXT,
  image_url TEXT NOT NULL,  -- Supabase Storage URL
  catalog_number TEXT,
  tracks INTEGER,
  track_list JSONB,
  runtime TEXT,
  discs INTEGER,
  format TEXT,
  instruments JSONB DEFAULT '[]'::jsonb,
  genre JSONB DEFAULT '[]'::jsonb,
  links JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Junction table for many-to-many relationship
CREATE TABLE catalog_item_artists (
  catalog_item_id TEXT REFERENCES catalog_items(id) ON DELETE CASCADE,
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  artist_order INTEGER NOT NULL,
  PRIMARY KEY (catalog_item_id, artist_id)
);

-- Indexes for performance
CREATE INDEX idx_catalog_items_publisher ON catalog_items(publisher_id);
CREATE INDEX idx_catalog_items_year ON catalog_items(year);
CREATE INDEX idx_catalog_items_title ON catalog_items(title);
CREATE INDEX idx_catalog_item_artists_item ON catalog_item_artists(catalog_item_id);
CREATE INDEX idx_catalog_item_artists_artist ON catalog_item_artists(artist_id);

-- GIN indexes for JSONB array searching
CREATE INDEX idx_catalog_items_instruments ON catalog_items USING GIN (instruments);
CREATE INDEX idx_catalog_items_genre ON catalog_items USING GIN (genre);
CREATE INDEX idx_catalog_items_track_list ON catalog_items USING GIN (track_list);

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_catalog_items_updated_at
BEFORE UPDATE ON catalog_items
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Denormalized view for easy querying
CREATE OR REPLACE VIEW catalog_items_with_details AS
SELECT
  ci.id,
  ci.type,
  ci.title,
  COALESCE(
    json_agg(
      json_build_object('id', a.id, 'name', a.name)
      ORDER BY cia.artist_order
    ) FILTER (WHERE a.id IS NOT NULL),
    '[]'::json
  ) AS artists,
  ci.description,
  json_build_object('id', p.id, 'name', p.name) AS publisher,
  ci.year,
  ci.image_url,
  ci.catalog_number,
  ci.tracks,
  ci.track_list,
  ci.runtime,
  ci.discs,
  ci.format,
  ci.instruments,
  ci.genre,
  ci.links,
  ci.created_at,
  ci.updated_at
FROM catalog_items ci
LEFT JOIN publishers p ON ci.publisher_id = p.id
LEFT JOIN catalog_item_artists cia ON ci.id = cia.catalog_item_id
LEFT JOIN artists a ON cia.artist_id = a.id
GROUP BY ci.id, p.id, p.name;
```

### 1.3 Enable Row Level Security (RLS)

**Execute in SQL Editor:**

```sql
-- Enable RLS on all tables
ALTER TABLE catalog_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE publishers ENABLE ROW LEVEL SECURITY;
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_item_artists ENABLE ROW LEVEL SECURITY;

-- Public read access (anyone can browse)
CREATE POLICY "Public read" ON catalog_items FOR SELECT USING (true);
CREATE POLICY "Public read" ON publishers FOR SELECT USING (true);
CREATE POLICY "Public read" ON artists FOR SELECT USING (true);
CREATE POLICY "Public read" ON catalog_item_artists FOR SELECT USING (true);

-- Admin-only write access
CREATE POLICY "Admin write" ON catalog_items FOR ALL
USING (auth.jwt() ->> 'email' IN (
  SELECT email FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
));

CREATE POLICY "Admin write" ON publishers FOR ALL
USING (auth.jwt() ->> 'email' IN (
  SELECT email FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
));

CREATE POLICY "Admin write" ON artists FOR ALL
USING (auth.jwt() ->> 'email' IN (
  SELECT email FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
));

CREATE POLICY "Admin write" ON catalog_item_artists FOR ALL
USING (auth.jwt() ->> 'email' IN (
  SELECT email FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
));
```

### 1.4 Create Storage Bucket

1. In Supabase Dashboard: Storage → Create Bucket
2. Name: `album-covers`
3. Public: ✓ Yes (for browsing images)
4. File size limit: 5MB
5. Allowed MIME types: `image/jpeg`, `image/png`

**RLS Policies for Storage (SQL Editor):**

```sql
-- Public read access for images
CREATE POLICY "Public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'album-covers');

-- Admin upload/update/delete
CREATE POLICY "Admin upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'album-covers' AND
    auth.jwt() ->> 'email' IN (
      SELECT email FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admin update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'album-covers' AND
    auth.jwt() ->> 'email' IN (
      SELECT email FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admin delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'album-covers' AND
    auth.jwt() ->> 'email' IN (
      SELECT email FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
    )
  );
```

### 1.5 Setup Authentication

1. Dashboard: Authentication → Providers → Email → Enable
2. Disable email confirmation for now (or configure SMTP if desired)
3. Create admin user:
   - Dashboard: Authentication → Users → Add User
   - Enter your email + password
   - After creation, run in SQL Editor:
     ```sql
     UPDATE auth.users
     SET raw_user_meta_data = jsonb_set(
       COALESCE(raw_user_meta_data, '{}'::jsonb),
       '{role}',
       '"admin"'
     )
     WHERE email = 'your-email@example.com';
     ```

### 1.6 Save Credentials

Copy from Settings → API:
- Project URL: `https://[project-id].supabase.co`
- Anon/Public key: `eyJh...` (safe for frontend)
- Service Role key: `eyJh...` (SECRET - only for migration script)

---

## Phase 2: Data Migration

### 2.1 Create Migration Script

**File:** `migrate-to-supabase.js`

**Install dependency first:**
```bash
cd /Users/akash/Development/Web/drumshanbo-music-school/library
npm install @supabase/supabase-js
```

**Script structure:**
1. Read `web-app/public/data/catalog.json` (181 items)
2. **Add timestamps to catalog.json** if missing (created_at, updated_at)
3. Extract unique publishers → insert into `publishers` table
4. Extract unique artists → insert into `artists` table
5. For each of 122 images in `web-app/public/images/`:
   - Upload to Supabase Storage `album-covers` bucket
   - Get public URL
6. Insert catalog items with foreign keys AND timestamps
7. Create artist associations in junction table
8. Write updated catalog.json (with timestamps) back to file
9. Validate count matches 181

**Key functions:**
- `addTimestampsToJSON()` - add created_at/updated_at to catalog.json items (if missing)
- `seedPublishers()` - batch insert unique publishers
- `seedArtists()` - batch insert unique artists
- `uploadImage(id, filename)` - upload JPG to storage, return URL
- `insertCatalogItem()` - insert item with all relationships + timestamps
- `validateMigration()` - count check and data integrity verification

**Important:** Migration script adds `created_at` and `updated_at` timestamps to catalog.json for future sync operations.

### 2.2 Run Migration

```bash
SUPABASE_URL="https://..." SUPABASE_SERVICE_KEY="ey..." node migrate-to-supabase.js
```

Expected output:
- ✓ 181 items migrated
- ✓ 122 images uploaded
- ✓ X publishers created
- ✓ Y artists created

### 2.3 Create Two-Way Sync Script

**File:** `sync-catalog-supabase.js`

**Purpose:** Bidirectional sync between catalog.json ↔ Supabase with conflict resolution

**Features:**
- Reads both `web-app/public/data/catalog.json` AND Supabase database
- **Adds timestamps** if missing (created_at, updated_at) to catalog.json items
- Compares timestamps (`updated_at` field) for each item
- **Sync Direction 1: catalog.json → Supabase**
  - New items in catalog.json → INSERT to Supabase
  - Items newer in catalog.json (by timestamp) → UPDATE in Supabase
  - Upload new/updated images to Supabase Storage
- **Sync Direction 2: Supabase → catalog.json**
  - New items in Supabase (admin-created) → INSERT to catalog.json
  - Items newer in Supabase (admin-edited) → UPDATE in catalog.json
  - Download new images from Supabase Storage (if needed)
- **Conflict Resolution:** Newest timestamp wins (no data loss)
- **Deletions:** NOT synced (must be done manually in both places for safety)
- Idempotent (safe to run multiple times)
- Creates backup of catalog.json before writing

**Updated catalog.json Schema:**
Each item needs `created_at` and `updated_at` fields:
```json
{
  "id": "cd-001",
  "title": "...",
  "artists": [...],
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-03-17T14:22:00Z",  // NEW: tracks last modification
  ...
}
```

**Usage:**
```bash
# Run after enrichment OR after admin edits (bidirectional)
SUPABASE_URL="..." SUPABASE_SERVICE_KEY="..." node sync-catalog-supabase.js
```

**Output:**
```
✓ Backing up catalog.json → catalog.json.backup
✓ Analyzing differences...
  → catalog.json has 39 new items (cd-182 to cd-220)
  → Supabase has 2 newer items (cd-045, cd-112 edited by admin)
✓ Syncing catalog.json → Supabase: 39 inserts
✓ Syncing Supabase → catalog.json: 2 updates
✓ Uploaded 39 new images to Supabase Storage
✓ Sync complete - both sources now identical
```

**Workflow Integration:**
```bash
# Scenario 1: After enrichment workflow
node append-to-catalog.js assets/enriched_batch_cd182-220.json
node sync-catalog-supabase.js  # Syncs new items to Supabase, pulls admin edits

# Scenario 2: After admin edits in Supabase
node sync-catalog-supabase.js  # Pulls admin changes to catalog.json

# Scenario 3: Periodic sync (cron job, weekly)
node sync-catalog-supabase.js  # Ensures both sources stay in sync
```

---

## Phase 3: Frontend Integration

### 3.1 Install Dependencies

```bash
cd /Users/akash/Development/Web/drumshanbo-music-school/library/web-app
npm install @supabase/supabase-js react-router-dom
npm install react-hot-toast react-hook-form zod @hookform/resolvers  # Optional but recommended
```

### 3.2 Create Supabase Client

**File:** `src/lib/supabase.js` (NEW)

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

**File:** `.env.local` (NEW, git ignored)

```bash
# Set to "true" for Supabase mode (production), "false" for local JSON mode
VITE_USE_SUPABASE=false

# Only needed when VITE_USE_SUPABASE=true
VITE_SUPABASE_URL=https://[project-id].supabase.co
VITE_SUPABASE_ANON_KEY=eyJh...
```

**For local development:** Set `VITE_USE_SUPABASE=false` (or omit entirely)
**For production/testing Supabase:** Set `VITE_USE_SUPABASE=true`

### 3.3 Create Data Hooks

**File:** `src/lib/hooks/useCatalog.js` (NEW)

```javascript
import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

const USE_SUPABASE = import.meta.env.VITE_USE_SUPABASE === 'true'

export function useCatalog() {
  const [catalog, setCatalog] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchCatalog() {
      if (USE_SUPABASE) {
        // Production mode: Fetch from Supabase
        const { data, error } = await supabase
          .from('catalog_items_with_details')
          .select('*')
          .order('id')

        if (error) {
          setError(error)
          console.error('Error fetching catalog:', error)
        } else {
          // Transform data to match catalog.json format
          const transformed = data.map(item => ({
            ...item,
            artists: item.artists.map(a => a.name),
            publisher: item.publisher?.name || 'Independent',
            image: item.image_url
          }))
          setCatalog(transformed)
        }
      } else {
        // Local dev mode: Fetch from static JSON (original behavior)
        try {
          const response = await fetch('/data/catalog.json')
          const data = await response.json()
          setCatalog(data.items)
        } catch (err) {
          setError(err)
          console.error('Error loading catalog.json:', err)
        }
      }
      setLoading(false)
    }

    fetchCatalog()
  }, [])

  return { catalog, loading, error }
}
```

**Key Feature:** Automatically switches between:
- Local JSON (fast, offline) when `VITE_USE_SUPABASE=false`
- Supabase API (dynamic) when `VITE_USE_SUPABASE=true`

---

## Phase 4: Admin UI

Components to create:
- `src/components/admin/AdminPanel.jsx` - Main admin interface
- `src/components/admin/AlbumForm.jsx` - Create/edit form with all 17 fields
- `src/components/admin/ImageUpload.jsx` - Drag-drop image upload to Supabase Storage
- `src/lib/hooks/useAuth.js` - Authentication hook
- `src/lib/hooks/useAdmin.js` - Admin CRUD operations hook

---

## Phase 5: GitHub Pages Deployment

### Update Vite Config

**File:** `vite.config.js`

```javascript
base: '/library/',  // Must match GitHub repo name
```

### Create GitHub Actions Workflow

**File:** `.github/workflows/deploy.yml`

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: web-app/package-lock.json
      - name: Install dependencies
        working-directory: ./web-app
        run: npm ci
      - name: Build
        working-directory: ./web-app
        env:
          VITE_USE_SUPABASE: true  # Production always uses Supabase
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
        run: npm run build
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./web-app/dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

---

## Ongoing Workflow: Adding New CDs

### Scenario: New batch of CDs 182-220

**Step 1: Enrichment (Unchanged)**
```bash
# Existing workflow - no changes
# Claude enriches CSV batch → creates enriched_batch_cd182-220.json
```

**Step 2: Append to catalog.json (Unchanged)**
```bash
node append-to-catalog.js assets/enriched_batch_cd182-220.json
# catalog.json now has 220 items (181 + 39 new)
# New images in web-app/public/images/ (cd-182.jpg through cd-220.jpg)
# Note: New items won't have timestamps yet (added by sync script in next step)
```

**Step 3: Two-Way Sync (NEW)**
```bash
# Set environment variables (or add to .env)
export SUPABASE_URL="https://[project-id].supabase.co"
export SUPABASE_SERVICE_KEY="ey..."

# Run bidirectional sync script
node sync-catalog-supabase.js

# Output:
# ✓ Backing up catalog.json
# ✓ Analyzing differences...
#   → catalog.json has 39 new items (cd-182 to cd-220)
#   → Supabase has 2 updated items (cd-045, cd-112 edited by admin)
# ✓ Syncing catalog.json → Supabase: 39 inserts
# ✓ Syncing Supabase → catalog.json: 2 updates
# ✓ Uploaded 39 images to Supabase Storage
# ✓ Both sources now in sync
```

**Key Feature:** Script pulls admin edits from Supabase back to catalog.json during same sync run.

**Step 4: Commit (Unchanged)**
```bash
git add .
git commit -m "Add CDs 182-220"
git push
# GitHub Actions deploys with Supabase data
```

---

## Admin Panel Edits & Two-Way Sync

**How It Works:**

1. **Admin edits CD-050 via web UI:**
   - Changes go directly to Supabase
   - Supabase `updated_at` timestamp updated automatically (trigger)
   - catalog.json remains unchanged (for now)

2. **Run sync script (manually or on schedule):**
   ```bash
   node sync-catalog-supabase.js
   ```
   - Script compares timestamps for CD-050
   - Finds Supabase has newer timestamp
   - **Updates catalog.json with admin's changes**
   - Both sources now identical

3. **Enrichment adds new CDs (cd-182 to cd-220):**
   ```bash
   node append-to-catalog.js enriched_batch_cd182-220.json  # Updates catalog.json
   node sync-catalog-supabase.js  # Syncs new items to Supabase
   ```
   - Script detects 39 new items in catalog.json
   - **Inserts new items to Supabase**
   - Also pulls any admin edits during sync

**Conflict Resolution:**
- Newest `updated_at` timestamp wins
- No manual intervention needed
- No data loss - both changes preserved based on time

**Best Practices:**
- Run sync script after enrichment workflow (pushes new items)
- Run sync script after admin edits (pulls changes to catalog.json)
- Optional: Set up weekly cron job to auto-sync
- catalog.json backed up before every sync

---

## Cost Analysis

**Supabase Free Tier:**
- Database: 500MB (using <5MB)
- Storage: 1GB (using ~25MB for images)
- Bandwidth: 2GB/month (sufficient for moderate traffic)
- Result: **$0/month** ✓

**GitHub Pages:**
- Free for public repos ✓

**Total Monthly Cost: $0**
