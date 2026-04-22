# Khuroson Cargo — Web App (Create React App)

Коротко: это фронтенд для логистического сервиса Khuroson Cargo (Китай ↔ Таджикистан). Проект — Create React App (CRA) + TypeScript, клиентская маршрутизация через react-router, backend-функции реализованы как Vercel serverless в каталоге `api/`.

## Ключевые факты

- Фреймворк: Create React App (react-scripts)
- Язык: TypeScript
- Маршрутизация: react-router-dom (client-side)
- UI: TailwindCSS v3 + shadcn/ui
- База данных: Supabase (Postgres)
- Деплой: Vercel (static build + serverless `api/` functions)
- PWA: манифест в `public/`

## Быстрый старт

1. Установить зависимости:

```bash
cd webapp-react
npm install
```

2. Создать `.env.local` в корне проекта и заполнить минимум:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. Запустить в режиме разработки:

```bash
npm start
```

4. Сборка для продакшна:

```bash
npm run build
npm run start  # serve production build via a static server, or deploy to Vercel
```

## Скрипты (package.json)

- start — dev server (react-scripts start)
- build — production build (react-scripts build)
- test — запуск тестов (react-scripts test)

## Структура (важное)

- src/index.tsx — точка входа, BrowserRouter
- src/App.tsx — определение маршрутов (/, /tracks, /profile, /admin, /ai-chat и др.)
- src/pages/* — страницы приложения
- src/components/* — переиспользуемые UI-компоненты
- src/lib/supabase/* — клиенты Supabase (публичный и admin)
- api/* — Vercel serverless функции (auth, telegram webhook, admin CSV import, ai chat и др.)
- database/schema.sql — схема базы данных
- public/ — статические файлы, manifest.json (PWA)

## API и интеграции

- Telegram: бот используется для верификации пользователей (4-значный код), webhook реализован в `api/telegram/*`.
- Admin CSV import: `api/admin/import-csv` — парсит китайские CSV и апдейтит таблицу `tracks`.
- AI: `api/ai/chat` — endpoint для AI-ответов (placeholder / интеграция).

## База данных (Supabase)

Основные таблицы: users, tracks, notifications, broadcast_logs — полная схема в `database/schema.sql`.

## CI / Deployment

- Создан GitHub Actions workflow: `.github/workflows/ci.yml` — сборка и тесты на push/PR (Node 18/20) с npm cache.
- Рекомендуемый деплой: подключить репозиторий к Vercel (автоматический deploy при пуше в main).

## Важные заметки

- Проект ранее мигрирован с Next.js на CRA — документация и некоторые старые файлы могут ссылаться на Next.js; источником правды остаются `package.json`, `QWEN.md` и текущая структура `src/`.
- На Android/Termux могут потребоваться флаги при npm install: `--no-bin-links --ignore-scripts`.
- Путь алиасов: `@/*` → `src/*` настроен в `tsconfig.json`.

## Тестирование

```bash
npm run test
```

## Развертывание на Vercel

1. Зарегистрируйтесь на vercel.com и подключите GitHub репозиторий.
2. Добавьте переменные окружения в Vercel (аналог `.env.local`).
3. Деплой произойдёт автоматически при пуше в main.

## Вклад и поддержка

- Для багов/фич: создавайте Issues
- Для изменений: откройте PR в ветке feature/...

## Лицензия

MIT

---

Если нужно, внесу дополнительные разделы: подробные API-ендпойнты, пример .env.local с объяснениями, или краткий гайд по локальной разработке Telegram webhook (ngrok + webhook).