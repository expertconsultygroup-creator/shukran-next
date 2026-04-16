# شكراً حماة الوطن — Complete System Reference
**Shukran Hamaat Al-Watan · UAE National Recognition Platform**

> Last updated: 2026-04-15

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Infrastructure & Services](#2-infrastructure--services)
3. [Admin Access & Credentials](#3-admin-access--credentials)
4. [Database Schema](#4-database-schema)
5. [API Reference](#5-api-reference)
6. [Pages & Features](#6-pages--features)
7. [Architecture](#7-architecture)
8. [Deployment](#8-deployment)
9. [Environment Variables](#9-environment-variables)
10. [Daily Operations](#10-daily-operations)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. System Overview

**شكراً حماة الوطن** is a UAE national platform for collecting, moderating, and publicly displaying thank-you messages to the UAE Armed Forces.

| Property | Value |
|---|---|
| Platform | Next.js 16 (App Router) + Supabase |
| Language | TypeScript |
| CSS | Tailwind CSS v4 |
| Database | PostgreSQL (via Supabase) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Deployment | Vercel (auto-deploy on push) |
| Repository | github.com/expertconsultygroup-creator/shukran-next |
| Vercel URL | https://shukran-next.vercel.app |

### Key Numbers (April 2026)
- **Total messages**: 847,317+ approved
- **Goal**: 1,000,000 (Guinness World Record)
- **Countries participating**: 12+
- **Admin users**: 1 (admin@shukran.ae)

---

## 2. Infrastructure & Services

### Supabase (Database + Auth + Storage)
| Item | Value |
|---|---|
| Project Name | shukran-next |
| Project Ref | `yflpgnrrwnioiomdipik` |
| Project URL | https://yflpgnrrwnioiomdipik.supabase.co |
| Dashboard | https://supabase.com/dashboard/project/yflpgnrrwnioiomdipik |
| Region | Middle East (closest available) |

### GitHub
| Item | Value |
|---|---|
| Repo | https://github.com/expertconsultygroup-creator/shukran-next |
| Branch | `main` (production) |
| Auto-deploy | Yes — every push to `main` triggers Vercel |

### Vercel
| Item | Value |
|---|---|
| Dashboard | https://vercel.com/dashboard |
| Project | shukran-next |
| Live URL | https://shukran-next.vercel.app |
| Build Command | `npx next build` |
| Framework | Next.js (auto-detected) |

---

## 3. Admin Access & Credentials

### Platform Admin Panel
| Item | Value |
|---|---|
| URL | `/admin` (redirects to login if not authenticated) |
| Admin Login Page | `/admin/login` |
| Admin Email | `admin@shukran.ae` |
| Admin Password | Set via Supabase Auth dashboard |. current password = Shukran@2026#UAE
| Admin User ID | `38c3e49f-e52b-46cf-9ae1-04230016ae91` |
| Role | `admin` (stored in `profiles` table) |

**To reset admin password:**
1. Go to: https://supabase.com/dashboard/project/yflpgnrrwnioiomdipik/auth/users
2. Find `admin@shukran.ae`
3. Click the user → "Send Password Reset Email" or set new password directly

### Admin Panel Features
| Feature | Location | Description |
|---|---|---|
| Dashboard | `/admin` | KPIs, daily chart, category pie chart |
| Message Moderation | `/admin/messages` | Approve / reject / search / bulk actions |
| Export | `/admin` → Export button | Downloads Guinness-formatted CSV |

### Admin Capabilities
- View all messages (pending, approved, rejected)
- Approve individual messages (makes them public)
- Reject messages with reason
- Bulk approve/reject (select multiple)
- Search messages by name, text, or display_id
- Filter by category (مواطن / مقيم / طالب / جهة) or status
- Export full CSV for Guinness World Records submission

---

## 4. Database Schema

### Tables

#### `messages` — Core table
```sql
id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
display_id    TEXT UNIQUE          -- e.g. "UAE-847294"
name          TEXT NOT NULL        -- sender name
text          TEXT NOT NULL        -- message body (10–500 chars)
nationality   TEXT                 -- display string e.g. "🇦🇪 الإمارات"
country_code  CHAR(2)              -- ISO code e.g. "AE"
country_name  TEXT                 -- Arabic name e.g. "الإمارات"
category      TEXT                 -- مواطن | مقيم | طالب | جهة
status        TEXT DEFAULT 'pending' -- pending | approved | rejected
verified      BOOLEAN DEFAULT false
voice_url     TEXT                 -- optional audio recording URL
ip_hash       TEXT                 -- SHA-256 of sender IP (privacy-safe)
badge         TEXT DEFAULT '🥉'   -- 🥇 🥈 🥉 based on activity
moderator_id  UUID                 -- admin user who moderated
moderated_at  TIMESTAMPTZ
rejection_reason TEXT
created_at    TIMESTAMPTZ DEFAULT now()
updated_at    TIMESTAMPTZ DEFAULT now()
```

#### `counter_cache` — Live counter
```sql
id            INT PRIMARY KEY DEFAULT 1
count         BIGINT DEFAULT 0     -- total approved messages
updated_at    TIMESTAMPTZ DEFAULT now()
```
> Updated automatically by a PostgreSQL trigger when a message is approved.

#### `daily_stats` — Analytics
```sql
id               UUID PRIMARY KEY
date             DATE UNIQUE
message_count    INT DEFAULT 0     -- approved messages that day
pending_count    INT DEFAULT 0
rejected_count   INT DEFAULT 0
unique_countries INT DEFAULT 0
created_at       TIMESTAMPTZ DEFAULT now()
```

#### `countries` — Geographic tracking
```sql
code       CHAR(2) PRIMARY KEY     -- ISO 3166-1 alpha-2
name_ar    TEXT NOT NULL           -- Arabic name
name_en    TEXT                    -- English name
flag       TEXT                    -- Emoji flag
count      INT DEFAULT 0           -- approved messages from this country
```

#### `poems` — Poetry section
```sql
id         UUID PRIMARY KEY
title      TEXT NOT NULL
author     TEXT NOT NULL
content    TEXT NOT NULL
audio_url  TEXT
status     TEXT DEFAULT 'approved'
created_at TIMESTAMPTZ
```

#### `videos` — Media section
```sql
id          UUID PRIMARY KEY
title       TEXT NOT NULL
author      TEXT
video_url   TEXT NOT NULL
thumbnail   TEXT
views       INT DEFAULT 0
status      TEXT DEFAULT 'approved'
created_at  TIMESTAMPTZ
```

#### `profiles` — User roles
```sql
id         UUID PRIMARY KEY   -- matches auth.users.id
role       TEXT DEFAULT 'user' -- 'admin' | 'user'
full_name  TEXT
created_at TIMESTAMPTZ
```

### Row Level Security (RLS) Policies

| Table | Public Read | Public Write | Admin Only |
|---|---|---|---|
| messages | `status = approved` | INSERT (new submissions) | UPDATE, DELETE |
| counter_cache | All rows | ❌ | ❌ (trigger-only) |
| daily_stats | All rows | ❌ | ❌ (trigger-only) |
| countries | All rows | ❌ | UPDATE |
| poems | `status = approved` | ❌ | All |
| videos | `status = approved` | ❌ | All |
| profiles | ❌ | ❌ | All |

---

## 5. API Reference

Base URL: `https://shukran-next.vercel.app` (production) or `http://localhost:3001` (local)

### Public Endpoints

#### `GET /api/messages`
Fetch approved messages with filtering.

| Param | Type | Default | Description |
|---|---|---|---|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Results per page (max 100) |
| `category` | string | — | Filter: مواطن / مقيم / طالب / جهة |
| `search` | string | — | Search name, text, display_id |
| `sort` | string | newest | `newest` or `oldest` |
| `status` | string | approved | `approved` / `pending` / `rejected` |

**Response:**
```json
{
  "messages": [...],
  "total": 847317,
  "page": 1,
  "limit": 20,
  "totalPages": 42366
}
```

#### `POST /api/messages`
Submit a new message (enters as `pending`).

**Body:**
```json
{
  "name": "أحمد محمد",
  "text": "شكراً لكل جندي...",
  "nationality": "🇦🇪 الإمارات",
  "country_code": "AE",
  "country_name": "الإمارات",
  "category": "مواطن",
  "voice_url": "https://..." // optional
}
```

**Validation:**
- `name`: required, 1–100 chars
- `text`: required, 10–500 chars
- `category`: must be one of: مواطن / مقيم / طالب / جهة
- `country_code`: exactly 2 characters

**Response (201):**
```json
{
  "message": { "id": "...", "display_id": "UAE-847318", ... },
  "success": true
}
```

#### `GET /api/messages/count`
Live counter data.

**Response:**
```json
{
  "total": 847317,
  "pending": 12,
  "rejected": 0,
  "goal": 1000000
}
```

#### `GET /api/stats`
Full aggregated statistics.

**Response:**
```json
{
  "totalMessages": 847317,
  "pendingMessages": 0,
  "rejectedMessages": 0,
  "totalCountries": 12,
  "totalVideos": 3,
  "totalPoems": 3,
  "categoryBreakdown": [
    { "name": "مواطن", "count": 10, "value": 41.7 }
  ],
  "dailyStats": [
    { "date": "2026-04-15", "message_count": 24 }
  ]
}
```

#### `GET /api/countries`
All countries with message counts.

**Response:** Array of:
```json
{ "code": "AE", "name_ar": "الإمارات", "flag": "🇦🇪", "count": 10 }
```

#### `GET /api/poetry`
Approved poems.

#### `GET /api/videos`
Approved videos.

#### `GET /api/contributors`
Top contributors (leaderboard).

### Admin-Only Endpoints
> Require authenticated session cookie from Supabase Auth

#### `PATCH /api/messages/[id]`
Approve or reject a single message.

**Body:**
```json
{ "status": "approved" }
// or
{ "status": "rejected", "reason": "inappropriate content" }
```

#### `DELETE /api/messages/[id]`
Delete a message.

#### `PATCH /api/admin/bulk`
Bulk approve or reject.

**Body:**
```json
{ "ids": ["uuid1", "uuid2"], "status": "approved" }
```

#### `GET /api/admin/export`
Download full CSV for Guinness submission.

**Response:** CSV file with all approved messages.

#### `POST /api/upload`
Upload audio/media to Supabase Storage.

---

## 6. Pages & Features

| Route | Page | Description | Data Source |
|---|---|---|---|
| `/` | Home | Hero, live counter, stats, messages grid, daily chart | `/api/stats` + `/api/messages` |
| `/send` | Send Message | Submission form, country dropdown, voice recording | `/api/countries` → POST `/api/messages` |
| `/messages` | Messages Wall | Browse, search, filter approved messages | `/api/messages` |
| `/map` | World Map | Interactive SVG world map with country heat | `/api/countries` |
| `/poetry` | Poetry | Approved poems and poetry wall | `/api/poetry` |
| `/media` | Media | Videos and media content | `/api/videos` |
| `/ebook` | E-Book | Digital book with reader, stats | `/api/stats` + `/api/messages` |
| `/guinness` | Guinness | Progress toward world record | `useLiveCount()` hook |
| `/halloffame` | Hall of Fame | Top contributors leaderboard | `/api/contributors` |
| `/admin` | Admin Dashboard | KPIs, charts, export (requires login) | `/api/stats` |
| `/admin/messages` | Moderation | Message queue with approve/reject | `/api/messages?status=pending` |
| `/admin/login` | Admin Login | Supabase Auth login form | Supabase Auth |

### Message Lifecycle
```
User submits → status: pending (invisible to public)
                    ↓
            Admin reviews in /admin/messages
                    ↓
         Approve → status: approved (visible to public)
                    ↓
         DB trigger → counter_cache.count += 1
                    ↓
         Supabase Realtime → live counter updates on all clients
```

---

## 7. Architecture

```
┌──────────────────────────────────────────────────────┐
│                    VERCEL (Edge)                      │
│  Next.js 16 App Router                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │
│  │  Pages   │  │   API    │  │   Middleware      │   │
│  │ /send    │  │ /routes  │  │ (auth redirect)  │   │
│  │ /messages│  │ messages │  └──────────────────┘   │
│  │ /admin   │  │ stats    │                          │
│  │ /guinness│  │ countries│                          │
│  └──────────┘  └──────────┘                          │
└──────────────────────┬───────────────────────────────┘
                       │ HTTP / Realtime
┌──────────────────────▼───────────────────────────────┐
│              SUPABASE (yflpgnrrwnioiomdipik)          │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ PostgreSQL │  │  Supabase    │  │   Storage    │  │
│  │  messages  │  │    Auth      │  │ voice-msgs/  │  │
│  │  countries │  │ admin@... ✓  │  │ media/       │  │
│  │ daily_stats│  └──────────────┘  └──────────────┘  │
│  │  counter   │                                       │
│  │  poems     │  ┌──────────────┐                     │
│  │  videos    │  │   Realtime   │ ← counter_cache     │
│  └────────────┘  └──────────────┘                     │
└──────────────────────────────────────────────────────┘
```

### Key Libraries
| Library | Purpose |
|---|---|
| `@supabase/ssr` | Supabase client for Next.js App Router |
| `@supabase/supabase-js` | Supabase JS client |
| `framer-motion` | Animations |
| `recharts` | Charts (daily stats, category pie) |
| `canvas-confetti` | Success animation on message submit |
| `lucide-react` | Icons |
| `zod` | API input validation |
| `react-simple-maps` | World map SVG |

### Live Counter Flow
```
Supabase DB: counter_cache table
      ↓ Realtime subscription (PostgreSQL publication)
useLiveCount() hook (polling every 5s + realtime events)
      ↓
LiveCounter component (digit flip animation)
      ↓  dir="ltr" enforced for RTL page compatibility
Displayed as: 0,847,317
```

---

## 8. Deployment

### Auto-Deploy (Normal Workflow)
1. Make code changes locally in `/Users/mac/Desktop/Vibe-Code-System/shukran-next/`
2. Commit: `git add . && git commit -m "description"`
3. Push: `git push origin main`
4. Vercel auto-detects push → builds → deploys in ~2 minutes

### Manual Deploy
```bash
cd /Users/mac/Desktop/Vibe-Code-System/shukran-next
vercel --prod
```

### Local Development
```bash
cd /Users/mac/Desktop/Vibe-Code-System/shukran-next
npx next dev -p 3000
```

### Production Build Test
```bash
cd /Users/mac/Desktop/Vibe-Code-System/shukran-next
npx next build
npx next start -p 3001
```

---

## 9. Environment Variables

### Local (`.env.local`)
Location: `/Users/mac/Desktop/Vibe-Code-System/shukran-next/.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL="https://yflpgnrrwnioiomdipik.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmbHBnbnJyd25pb2lvbWRpcGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMjEyMDAsImV4cCI6MjA5MTY5NzIwMH0.gDKYjsmo3m0XSTRKrVyqCcIxrxYvD9pvOOmYgLMH-h8"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmbHBnbnJyd25pb2lvbWRpcGlrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjEyMTIwMCwiZXhwIjoyMDkxNjk3MjAwfQ.hknY1Uu48Rva4xLAcYb9vaa75XmktiNDivOJQDYW5-c"
```

### Vercel Production
Set in Vercel Dashboard → Project Settings → Environment Variables:

| Variable | Scope |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | Production, Preview, Development |

> **Security Note:** `SUPABASE_SERVICE_ROLE_KEY` is only used in server-side API routes (`/api/admin/*`, `/api/upload`). Never expose it to the browser.

### Key Constants (`src/lib/constants.ts`)
```typescript
COUNTER_GOAL = 1_000_000   // Guinness target
COUNTER_START = 847_293    // Seed value (fallback only)
```

---

## 10. Daily Operations

### Morning Checklist
1. Open `/admin/messages` — review pending messages
2. Approve genuine messages, reject spam/inappropriate
3. Check `/admin` dashboard for daily message count
4. Monitor the live counter progress toward 1,000,000

### Approving Messages (Admin Panel)
1. Go to `/admin/login` → sign in with `admin@shukran.ae`
2. Navigate to "إدارة الرسائل" in sidebar
3. Messages show newest first with status badge
4. Click ✅ to approve, ❌ to reject
5. For bulk actions: check multiple rows → choose action from top bar

### Approving via API (Emergency / Batch)
```bash
# Approve all pending
curl -X PATCH "https://yflpgnrrwnioiomdipik.supabase.co/rest/v1/messages?status=eq.pending" \
  -H "apikey: <SERVICE_ROLE_KEY>" \
  -H "Authorization: Bearer <SERVICE_ROLE_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"status":"approved","verified":true}'
```

### Exporting Data (Guinness Submission)
1. Go to `/admin` dashboard
2. Set date range (optional)
3. Click "تصدير CSV"
4. File downloads as `guinness-export-YYYY-MM-DD.csv`

### Adding Daily Stats (Manual)
```bash
curl -X POST "https://yflpgnrrwnioiomdipik.supabase.co/rest/v1/daily_stats" \
  -H "apikey: <SERVICE_ROLE_KEY>" \
  -H "Authorization: Bearer <SERVICE_ROLE_KEY>" \
  -H "Content-Type: application/json" \
  -d '[{"date":"2026-04-16","message_count":3500,"unique_countries":15}]'
```

---

## 11. Troubleshooting

### Counter shows wrong number
- **Cause**: `counter_cache` out of sync
- **Fix**: Run this SQL in Supabase SQL Editor:
```sql
UPDATE counter_cache SET count = (
  SELECT COUNT(*) FROM messages WHERE status = 'approved'
) WHERE id = 1;
```

### Messages not appearing after approval
- **Cause**: RLS policy or cache issue
- **Check**: Verify `status = 'approved'` and `verified = true` in Supabase Table Editor
- **Fix**: Hard-reload the page (Ctrl+Shift+R)

### Daily chart shows no data
- **Cause**: `daily_stats` table is empty
- **Fix**: Insert rows manually via API or Supabase Table Editor

### Admin login fails
- **Cause**: Wrong password or user doesn't exist
- **Fix**: Reset at https://supabase.com/dashboard/project/yflpgnrrwnioiomdipik/auth/users

### Build fails on Vercel
- **Cause**: TypeScript error or missing env var
- **Check**: Vercel Dashboard → Deployments → click failed build → view logs
- **Common fix**: Ensure all 3 env vars are set in Vercel project settings

### App is slow / Supabase errors
- **Cause**: Invalid Supabase keys or project paused
- **Check**: Verify project is active at https://supabase.com/dashboard/project/yflpgnrrwnioiomdipik
- **Check**: `.env.local` has correct keys (no placeholder values)

### Local dev can't connect to Supabase
- **Check**: `.env.local` exists in `shukran-next/` directory
- **Check**: Keys don't contain `YOUR_` or `<placeholder>`
- **Test**: `curl https://yflpgnrrwnioiomdipik.supabase.co/rest/v1/` should return JSON

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────┐
│           SHUKRAN HAMAAT AL-WATAN                   │
│              Quick Reference                         │
├─────────────────────────────────────────────────────┤
│ ADMIN PANEL    /admin/login                         │
│ Admin Email    admin@shukran.ae                     │
│ Admin ID       38c3e49f-e52b-46cf-9ae1-04230016ae91 │
├─────────────────────────────────────────────────────┤
│ SUPABASE       yflpgnrrwnioiomdipik                 │
│ Dashboard      supabase.com/dashboard/project/...   │
├─────────────────────────────────────────────────────┤
│ GITHUB         expertconsultygroup-creator/         │
│                shukran-next                         │
├─────────────────────────────────────────────────────┤
│ VERCEL         shukran-next.vercel.app              │
├─────────────────────────────────────────────────────┤
│ LOCAL DEV      npx next dev -p 3000                 │
│ LOCAL PATH     ~/Desktop/Vibe-Code-System/          │
│                shukran-next/                        │
├─────────────────────────────────────────────────────┤
│ GOAL           1,000,000 messages (Guinness)        │
│ CURRENT        ~847,317 approved                    │
└─────────────────────────────────────────────────────┘
```

---

*Document generated: 2026-04-15 | System: Shukran Hamaat Al-Watan v1.0*
