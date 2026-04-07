# QWEN.md — Khuroson Cargo Web App

## Project Overview

**Khuroson Cargo** — a logistics tracking web application for a China 🇨🇳 ↔ Tajikistan 🇹🇯 cargo company. Users track their shipments, view pricing info, manage profiles, and admins can import tracking codes from Chinese spreadsheets and batch-update statuses.

**Production URL**: `https://cargo-web-app-three.vercel.app`
**GitHub**: `https://github.com/texnik-texnik/CargoWebApp`
**Telegram Bot**: `@JinjakBot`

### Tech Stack
- **Frontend**: Next.js 15.5 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS v3 + shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **Auth**: Telegram bot verification (4-digit codes)
- **Deployment**: Vercel (production)

---

## Key Architecture

### Pages (routes)
| Route | Purpose |
|---|---|
| `/` | Homepage — greeting, quick actions, recent tracks |
| `/tracks` | Track search with history |
| `/profile` | User profile with 3 tabs: Profile, China Address, My Tracks |
| `/auth` | 3-step login: phone → Telegram code → name (new users only) |
| `/dashboard` | Statistics overview |
| `/info` | Info hub — pricing, banned items, addresses |
| `/admin` | Admin panel — CSV import, batch status updates |
| `/admin/import` | Upload Chinese CSV and auto-convert + import to Supabase |
| `/admin/batch-update` | Batch update track statuses by date range |

### API Routes
| Endpoint | Purpose |
|---|---|
| `POST /api/telegram/webhook` | Telegram bot webhook — receives messages, sends verification codes |
| `POST /api/telegram/setup-webhook` | One-click webhook setup |
| `POST /api/auth/send-code` | *(deprecated — bot handles this)* |
| `POST /api/auth/verify-code` | Verify 4-digit code, login or register user |
| `POST /api/auth/save-name` | Save user name after registration |
| `POST /api/admin/import-csv` | Upload Chinese CSV, auto-convert and bulk-insert tracks |
| `POST /api/admin/batch-update` | Batch update track statuses by date range |
| `POST /api/ai/chat` | *(legacy AI chat — not actively used)* |

### shadcn/ui Components
`alert`, `avatar`, `badge`, `button`, `card`, `dialog`, `input`, `label`, `select`, `separator`, `skeleton`, `table`, `tabs`

### Key Files
- `src/lib/supabase/client.ts` — Supabase client (browser)
- `src/lib/supabase/admin.ts` — Supabase client (server, service role key)
- `src/components/layout/Header.tsx` — Top bar with login button
- `src/components/layout/BottomNav.tsx` — Bottom navigation (Home, Tracks, Profile, Admin)
- `src/components/layout/AppLayout.tsx` — Main layout wrapper
- `src/components/tracks/TrackCard.tsx` — Track display card

---

## Building and Running

### Install Dependencies
```bash
npm install --no-bin-links --ignore-scripts
```
> **Note on Android/Termux**: `--no-bin-links --ignore-scripts` is required due to symlink permission issues.

### Development
```bash
node node_modules/next/dist/bin/next dev
```

### Production Build
```bash
node node_modules/next/dist/bin/next build
node node_modules/next/dist/bin/next start
```

### Deploy
Changes are pushed to `main` on GitHub. Vercel auto-deploys on push.

**Environment Variables** (set in Vercel dashboard):
```
NEXT_PUBLIC_SUPABASE_URL=https://qjqlfcaihgzbtjqrdmjy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
TELEGRAM_BOT_TOKEN=1703743818:...
TELEGRAM_BOT_USERNAME=JinjakBot
```

---

## Authentication Flow

1. User visits `/auth` or clicks "Войти" in header
2. Opens `@JinjakBot` in Telegram, sends phone number (`+992XXXXXXXXX`)
3. Bot generates 4-digit code, saves user to Supabase, sends code back
4. User enters code in app → logged in
5. **New users** see an additional step: enter name in Latin script

User data stored in `users` table with:
- `phone` (unique identifier)
- `name` (Latin script, entered during registration or profile edit)
- `client_id` (auto-generated, format `KH-1001`, `KH-1002`, ...)
- `telegram_chat_id`, `telegram_id` (from Telegram bot)
- `history` (comma-separated track codes searched by user)

---

## CSV Import (Chinese Tracking Data)

Admins upload CSV files exported from Chinese Google Sheets. The format:
```
运单号,快递公司,操作人,入库时间,入库状态,入库重量,出库时间,出库状态,出库重量
SF3162112463178,,,,,,2025-05-05 10:56:25,拍照成功,14.47Kg
```

The import pipeline:
1. Parses CSV with Chinese columns
2. Auto-detects courier by tracking code prefix (YT=圆通, SF=顺丰, JT=极兔, etc.)
3. Maps Chinese statuses to English (`拍照成功` → `received`, `出库` → `intransit`, etc.)
4. Upserts into `tracks` table (duplicates handled by code)
5. Returns statistics by status

---

## Database Schema (Supabase)

### Tables
- **users** — `id, telegram_id, telegram_chat_id, client_id, name, phone, lang, history, verification_code, verification_expires, created_at, updated_at`
- **tracks** — `id, code, status, received_date, intransit_date, border_date, warehouse_date, delivered_date, notes, created_at, updated_at`
- **notifications** — `id, user_id, track_code, message, status, sent_at, created_at`
- **broadcast_logs** — `id, admin_id, message, total_users, sent_count, status, created_at, completed_at`

### Track Statuses
`waiting` → `received` → `intransit` → `border` → `warehouse` → `payment` → `delivered`

---

## Important Notes

- **`.vercelignore`** is critical — must NOT ignore root-level files
- **`eslint.ignoreDuringBuilds: true`** in `next.config.ts` — ESLint import issues on Vercel
- **`output: 'standalone'`** — Required for Vercel deployment
- **Node.js 22.x** on Vercel
- **No Turbopack on Android** — use `node node_modules/next/dist/bin/next build` directly
