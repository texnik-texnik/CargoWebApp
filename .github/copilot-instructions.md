# Copilot instructions — Khuroson Cargo webapp

Purpose: quick, actionable guidance for Copilot sessions in this repository.

---

1) Build / test / lint (how to run)

- Install deps:
  npm install

- Run dev server (CRA):
  npm start
  (react-scripts start — opens http://localhost:3000)

- Create production build:
  npm run build
  (output: build/)

- Run tests (interactive watch):
  npm test

- Run a single test (by name):
  npm test -- -t "Your test name"

- Run a single test file (by path):
  npm test -- src/components/YourComponent.test.tsx

- Linting: no dedicated lint script in package.json.  ESLint config extends react-app; to run explicit linting:
  npx eslint "src/**/*.{ts,tsx,js,jsx}"

- Vercel deploy (CLI):
  npm i -g vercel
  vercel
  vercel --prod

Notes: package.json uses react-scripts (Create React App). Many docs still reference Next.js; authoritative sources are package.json + QWEN.md.

---

2) High-level architecture (big picture)

- Frontend: Create React App (TypeScript) — entry at src/index.tsx and src/App.tsx; client-side routing with react-router-dom.
- UI: TailwindCSS + shadcn/ui (components may need to be installed via npx shadcn).
- Backend: Vercel serverless functions in /api (Node/TypeScript files). These are NOT Next.js API routes — they deploy as Vercel functions.
- Database: Supabase (Postgres). DB schema and migration SQL under database/*.sql.
- PWA: manifest.json in public/ and service-worker hooks in the app.
- AI: placeholder AI chat endpoint under api/ai (Groq primary, Gemini fallback). See QWEN.md and README for integration notes.

Files/locations to reference quickly:
- Frontend: src/, components under src/components, helpers under src/lib/supabase
- Serverless functions: api/
- DB schema/migrations: database/
- Env examples: .env.example, .env.local (local secrets)

---

3) Key repository conventions (non-obvious patterns)

- Environment variables
  - Public keys start with NEXT_PUBLIC_*; secret service key is SUPABASE_SERVICE_ROLE_KEY.
  - Store local dev vars in .env.local (do not commit secrets).

- Supabase clients
  - Two clients: public (lib/supabase/client.ts) for browser usage (anon key) and admin (lib/supabase/admin.ts) for server/service-role actions. Use admin only in serverless functions.

- API / serverless
  - All backend endpoints live in the top-level api/ folder and are deployed as Vercel functions. Keep secrets (service role key, telegram token) out of frontend code.

- CSV import pipeline
  - CSV import for Chinese tracking data is implemented in admin endpoints; pipeline auto-detects courier by prefix and maps Chinese statuses to internal enums. Follow CSV import code for column mapping and deduplication rules before making mass changes.

- Tests
  - Uses React Testing Library. Use the -t option to filter by test name when running single tests.

- Path aliases
  - tsconfig.json maps @/* to src/* — prefer those aliases when adding imports.

- Deployment
  - Vercel expects static build in build/ (CRA) and deploys api/*.ts as serverless functions. Update vercel.json and environment variables in the Vercel dashboard.

- Mixed docs / migration history
  - Some docs (README.md, PROJECT_SUMMARY.md) reference a prior Next.js App Router layout. Current codebase is CRA — prefer package.json and QWEN.md as source-of-truth for runtime behavior.

---

4) AI assistant / other assistant configs to include in context

- QWEN.md contains an accurate project overview and migration notes (CRA vs previous Next.js). Include it in context for architectural guidance.
- There are small folders (e.g. .claude, .qwen) with assistant artifacts. When running Copilot, load QWEN.md + README.md + GETTING_STARTED.md first for project intent.

---

5) Quick troubleshooting hints (short)

- Missing Supabase vars → check .env.local and Vercel dashboard.
- npm install failures on Android/Termux — use the flags shown in QWEN.md: --no-bin-links --ignore-scripts.
- If tests hang, run with CI=true to exit once complete: CI=true npm test -- -t "pattern"

---

Sources used to build these instructions: README.md, GETTING_STARTED.md, QWEN.md, package.json, PROJECT_SUMMARY.md

---

If you want this file extended with per-folder quick summaries (e.g., api/* endpoints list, key components list, or testing patterns), say which area to expand.

---

6) MCP servers (configured)

- Playwright (E2E)
  - Installed as a dev dependency: @playwright/test
  - Config: playwright.config.ts created at repo root (testDir: ./tests/e2e). Web server is configured to run `npm start` for local runs.
  - Local run (install browsers first):
    npm run playwright:install
    npm run test:e2e
  - Run headed:
    npm run test:e2e:headed
  - Single test file (Playwright):
    npx playwright test tests/e2e/home.spec.ts
  - CI: .github/workflows/e2e.yml added. It runs `npm ci`, installs Playwright browsers, executes `npx playwright test`, and uploads the HTML report artifact.

- Vercel Agent Browser (preview/remote checks)
  - Recommended for Vercel-specific checks and preview environments. No separate agent binary included — use Vercel Agent Browser integration in CI or the Vercel dashboard.
  - When invoking Vercel Agent Browser in automation, ensure the deployment URL is available as an environment variable (e.g., STAGING_URL or BASE_URL) and pass it to Playwright via BASE_URL.

Notes:
- Tests are expected at tests/e2e/ (testDir: ./tests/e2e). Create that directory locally or in CI before running tests: `mkdir -p tests/e2e`.
- To add flaky-test handling, use test.skip / retries in playwright.config.ts as needed.

