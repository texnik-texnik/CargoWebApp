# QWEN.md — Khuroson Cargo Web App

## Project Overview

**Khuroson Cargo** — a logistics tracking web application for a China 🇨🇳 ↔ Tajikistan 🇹🇯 cargo company. Users track shipments, view pricing, manage profiles, and admins can import tracking codes from Chinese spreadsheets and batch-update statuses.

**Type**: Create React App (CRA) — migrated from Next.js for faster performance
**Production URL**: `https://cargo-web-app-three.vercel.app`
**GitHub**: `https://github.com/texnik-texnik/CargoWebApp`
**Telegram Bot**: `@JinjakBot`

### Tech Stack
- **Frontend**: React 19 + Create React App (react-scripts 5.0.1)
- **Routing**: react-router-dom v6 (client-side routing)
- **Language**: TypeScript 4.9
- **Styling**: TailwindCSS v3 + shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **Auth**: Telegram bot verification (4-digit codes)
- **API**: Vercel serverless functions (`api/` directory)
- **Deployment**: Vercel (static build + serverless functions)

---

## Key Architecture

### Pages (client-side routes via react-router-dom)
| Route | Component | Purpose |
|---|---|---|
| `/` | `HomePage` | Greeting, quick actions, recent tracks |
| `/tracks` | `TracksPage` | Track search with history |
| `/profile` | `ProfilePage` | 3 tabs: Profile, China Address, My Tracks |
| `/auth` | `AuthPage` | 3-step login: phone → Telegram code → name (new users) |
| `/dashboard` | `DashboardPage` | Statistics overview |
| `/info` | `InfoPage` | Info hub index |
| `/info/prices` | `PricesPage` | Pricing table |
| `/info/banned` | `BannedPage` | Prohibited items list |
| `/info/addresses` | `AddressesPage` | China and Tajikistan warehouse addresses |
| `/admin` | `AdminPage` | Admin panel index |
| `/admin/import` | `AdminImportPage` | CSV upload for Chinese tracking data |
| `/admin/batch-update` | `AdminBatchUpdatePage` | Batch update statuses by date range |
| `/ai-chat` | `AIChatPage` | AI assistant chat |

### Serverless API Routes (`api/` directory — deployed as Vercel functions)
| Endpoint | File | Purpose |
|---|---|---|
| `POST /api/telegram/webhook` | `api/telegram/webhook.ts` | Receives Telegram messages, sends verification codes |
| `POST /api/auth/verify-code` | `api/auth/verify-code.ts` | Verifies 4-digit code, logs in or registers user |
| `POST /api/auth/save-name` | `api/auth/save-name.ts` | Saves user name after registration |
| `POST /api/admin/import-csv` | `api/admin/import-csv.ts` | Upload Chinese CSV, auto-convert and bulk-insert tracks |
| `POST /api/admin/batch-update` | `api/admin/batch-update.ts` | Batch update track statuses by date range |
| `POST /api/ai/chat` | `api/ai/chat.ts` | AI chat (placeholder) |

### shadcn/ui Components
`alert`, `avatar`, `badge`, `button`, `card`, `dialog`, `input`, `label`, `select`, `separator`, `skeleton`, `table`, `tabs`

### Key Files
- `src/index.tsx` — Entry point, wraps App in BrowserRouter
- `src/App.tsx` — Routes definition
- `src/lib/supabase/client.ts` — Supabase client (browser, anon key)
- `vercel.json` — Vercel config: static build with SPA rewrites
- `tailwind.config.js` — TailwindCSS v3 config with shadcn theme
- `public/index.html` — HTML shell with meta tags and PWA manifest link

---

## Building and Running

### Install Dependencies (Android/Termux)
```bash
npm install --no-bin-links --ignore-scripts
```
> **Note**: `--no-bin-links --ignore-scripts` is required on Android due to symlink permission issues.

### Development
```bash
npm start
```
Opens on `http://localhost:3000`

### Production Build
```bash
npm run build
```
Output goes to `build/` directory.

### Deploy
Push to `main` on GitHub — Vercel auto-deploys.
- Static files served from `build/`
- `api/*.ts` deployed as Vercel serverless functions

**Environment Variables** (set in Vercel dashboard):
```
NEXT_PUBLIC_SUPABASE_URL=https://qjqlfcaihgzbtjqrdmjy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
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

User data stored in `users` table:
- `phone` — unique identifier
- `name` — Latin script, entered during registration or profile edit
- `client_id` — auto-generated, format `KH-1001`, `KH-1002`, ...
- `telegram_chat_id`, `telegram_id` — from Telegram bot
- `history` — comma-separated track codes searched by user

---

## CSV Import (Chinese Tracking Data)

Admins upload CSV files exported from Chinese Google Sheets:
```
运单号,快递公司,操作人,入库时间,入库状态,入库重量,出库时间,出库状态,出库重量
SF3162112463178,,,,,,2025-05-05 10:56:25,拍照成功,14.47Kg
```

Import pipeline:
1. Parses CSV with Chinese columns
2. Auto-detects courier by code prefix (YT=圆通, SF=顺丰, JT=极兔, etc.)
3. Maps Chinese statuses to English (`拍照成功` → `received`, `出库` → `intransit`, etc.)
4. Deduplicates by tracking code
5. Upserts into `tracks` table
6. Returns statistics by status

---

## Database Schema (Supabase)

### Tables
- **users** — `id, telegram_id, telegram_chat_id, client_id, name, phone, lang, history, verification_code, verification_expires, created_at, updated_at`
- **tracks** — `id, code, status, received_date, intransit_date, border_date, warehouse_date, delivered_date, notes, created_at, updated_at`
- **notifications** — `id, user_id, track_code, message, status, sent_at, created_at`
- **broadcast_logs** — `id, admin_id, message, total_users, sent_count, status, created_at, completed_at`

### Track Status Flow
`waiting` → `received` → `intransit` → `border` → `warehouse` → `payment` → `delivered`

---

## Important Notes

- **Migration from Next.js**: This project was migrated from Next.js App Router to Create React App for better performance on mobile/Android devices.
- **Serverless API**: All API endpoints live in the `api/` directory and are deployed as Vercel serverless functions (NOT Next.js API routes).
- **TailwindCSS v3**: Using v3 (not v4) for better Android compatibility — v4 requires native `lightningcss` binaries unavailable on Android.
- **Path aliases**: `@/*` maps to `src/*` (configured in `tsconfig.json`).
- **PWA**: Supports installation via `manifest.json`.
- **Webhook URL**: After each production deploy, update Telegram webhook:
  ```bash
  curl -X POST "https://api.telegram.org/bot<token>/setWebhook?url=<vercel-url>/api/telegram/webhook"
  ```
