#!/bin/bash
# Скрипт для добавления ENV переменных в Vercel проект
# Использование: ./add-env.sh
# 
# Перед запуском замените значения ниже на реальные!

PROJECT="cargo-web-app"
SCOPE="texnik-texniks-projects"

# Замените эти значения на реальные из вашего проекта Supabase и Telegram бота
REACT_APP_SUPABASE_URL="https://XXXXXXXXXXXXX.supabase.co"
REACT_APP_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
TELEGRAM_BOT_TOKEN="1703743818:XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
TELEGRAM_BOT_USERNAME="JinjakBot"

echo "Добавление ENV переменных в Vercel проект..."

npx vercel env add REACT_APP_SUPABASE_URL production --scope $SCOPE --name $PROJECT <<< "$REACT_APP_SUPABASE_URL"
npx vercel env add REACT_APP_SUPABASE_ANON_KEY production --scope $SCOPE --name $PROJECT <<< "$REACT_APP_SUPABASE_ANON_KEY"
npx vercel env add SUPABASE_SERVICE_ROLE_KEY production --scope $SCOPE --name $PROJECT <<< "$SUPABASE_SERVICE_ROLE_KEY"
npx vercel env add TELEGRAM_BOT_TOKEN production --scope $SCOPE --name $PROJECT <<< "$TELEGRAM_BOT_TOKEN"
npx vercel env add TELEGRAM_BOT_USERNAME production --scope $SCOPE --name $PROJECT <<< "$TELEGRAM_BOT_USERNAME"

echo ""
echo "✅ ENV переменные добавлены!"
echo "🔄 Новый деплой начнётся автоматически..."
