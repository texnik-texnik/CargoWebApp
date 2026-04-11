# ИНСТРУКЦИЯ ПО ДОБАВЛЕНИЮ ENV ПЕРЕМЕННЫХ В VERCEL

## Вариант 1: Ручное добавление (через Vercel CLI)

Выполни эти 5 команд по очереди, заменив значения на реальные:

```bash
# 1. Supabase URL (найди в Supabase Dashboard → Settings → API)
npx vercel env add REACT_APP_SUPABASE_URL production --scope texnik-texniks-projects --name cargo-web-app

# 2. Supabase Anon Key (найди в Supabase Dashboard → Settings → API → anon public)
npx vercel env add REACT_APP_SUPABASE_ANON_KEY production --scope texnik-texniks-projects --name cargo-web-app

# 3. Supabase Service Role Key (найди в Supabase Dashboard → Settings → API → service_role)
npx vercel env add SUPABASE_SERVICE_ROLE_KEY production --scope texnik-texniks-projects --name cargo-web-app

# 4. Telegram Bot Token (от @BotFather)
npx vercel env add TELEGRAM_BOT_TOKEN production --scope texnik-texniks-projects --name cargo-web-app

# 5. Telegram Bot Username (без @)
npx vercel env add TELEGRAM_BOT_USERNAME production --scope texnik-texniks-projects --name cargo-web-app
```

## Вариант 2: Автоматическое добавление (через скрипт)

1. Открой файл `scripts/add-env.sh`
2. Замени значения переменных на реальные
3. Запусти: `bash scripts/add-env.sh`

## Вариант 3: Через Vercel Dashboard (в браузере)

1. Открой: https://vercel.com/texnik-texniks-projects/cargo-web-app/settings/environment-variables
2. Добавь эти переменные:
   - `REACT_APP_SUPABASE_URL` (production)
   - `REACT_APP_SUPABASE_ANON_KEY` (production)
   - `SUPABASE_SERVICE_ROLE_KEY` (production)
   - `TELEGRAM_BOT_TOKEN` (production)
   - `TELEGRAM_BOT_USERNAME` (production)

## Где найти значения

### Supabase
1. Зайди на https://supabase.com/dashboard
2. Выбери проект `qjqlfcaihgzbtjqrdmjy`
3. Settings → API
4. Скопируй:
   - Project URL → `REACT_APP_SUPABASE_URL`
   - anon public key → `REACT_APP_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`

### Telegram Bot
1. Открой @BotFather в Telegram
2. Найди своего бота @JinjakBot
3. Токен в формате: `1703743818:AAXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`
4. Username: `JinjakBot`

## После добавления ENV переменных

1. Vercel автоматически запустит новый деплой
2. Подожди 1-2 минуты
3. Проверь сайт: https://cargo-web-app-nine.vercel.app
4. Обнови webhook URL в Telegram боте:
   ```bash
   curl -X POST "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook?url=https://cargo-web-app-nine.vercel.app/api/telegram/webhook"
   ```

## Проверка что всё работает

```bash
# Проверить статус деплоя
npx vercel ls cargo-web-app --scope texnik-texniks-projects

# Проверить ENV переменные
npx vercel env ls cargo-web-app --scope texnik-texniks-projects

# Проверить сайт
curl https://cargo-web-app-nine.vercel.app/
```
