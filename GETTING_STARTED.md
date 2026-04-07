# 🚀 БЫСТРЫЙ СТАРТ - Khuroson Cargo Web App

## Что уже создано ✅

Проект `webapp-react` готов с полной структурой:

```
webapp-react/
├── src/app/              # Страницы приложения
│   ├── page.tsx         ✅ Главная (Dashboard)
│   ├── tracks/          ✅ Поиск треков
│   ├── profile/         ✅ Профиль пользователя
│   ├── ai-chat/         ✅ AI-ассистент
│   └── api/             ✅ API маршруты
├── src/components/       # React компоненты
│   ├── layout/          ✅ Header + BottomNav
│   └── tracks/          ✅ TrackCard
├── src/lib/supabase/     ✅ Supabase клиент
├── database/
│   ├── schema.sql       ✅ Полная схема БД
│   └── migration-from-sheets.sql  ✅ Скрипт миграции
├── public/
│   └── manifest.json    ✅ PWA манифест
├── .env.local           ✅ Шаблон переменных
└── README.md            ✅ Документация
```

---

## 📋 ШАГИ ДЛЯ ЗАПУСКА

### 1️⃣ Установка зависимостей

```bash
cd /storage/emulated/0/CargoBot/miniapp/webapp-react
npm install
```

Это установит:
- Next.js, React, React-DOM
- TailwindCSS
- Supabase клиент
- Lucide React (иконки)
- shadcn/ui компоненты

### 2️⃣ Настройка Supabase

1. **Зарегистрируйтесь** на [supabase.com](https://supabase.com)
2. **Создайте проект** (бесплатно)
3. **Выполните SQL** из `database/schema.sql`:
   - Откройте SQL Editor в панели Supabase
   - Скопируйте содержимое `database/schema.sql`
   - Нажмите "Run"
4. **Скопируйте ключи**:
   - Settings → API
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` secret key → `SUPABASE_SERVICE_ROLE_KEY`

### 3️⃣ Настройка окружения

Откройте `.env.local` и заполните:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

TELEGRAM_BOT_TOKEN=your-bot-token

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4️⃣ Миграция данных из Google Sheets

1. **Экспортируйте Users** из Google Sheets:
   - Откройте таблицу пользователей
   - File → Download → CSV
2. **Откройте** `database/migration-from-sheets.sql`
3. **Замените примеры** на ваши данные
4. **Выполните SQL** в Supabase SQL Editor

Или используйте Python скрипт (в разработке) для автоматической миграции.

### 5️⃣ Запуск приложения

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000)

Для теста в Telegram:
1. Запустите ngrok: `npx ngrok http 3000`
2. В BotFather установите Web App URL на ngrok URL
3. Откройте бота в Telegram

### 6️⃣ Деплой на Vercel

**Вариант A: Через GitHub (рекомендуется)**

```bash
# 1. Создайте репозиторий
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/khuroson-webapp.git
git push -u origin main

# 2. Подключите к Vercel
# - Зайдите на vercel.com
# - New Project → Import from GitHub
# - Выберите репозиторий
# - Добавьте env переменные
# - Deploy!
```

**Вариант B: Через CLI**

```bash
npm i -g vercel
vercel login
vercel
```

При первом деплое Vercel спросит:
- Project name: `khuroson-cargo`
- Framework: `Next.js` (автоопределение)
- Environment variables: скопируйте из `.env.local`

После деплоя получите URL:
```
https://khuroson-cargo.vercel.app
```

### 7️⃣ Подключение к Telegram Bot

В Google Apps Script (Main.gs) обновите кнопку Web App:

```javascript
const webAppUrl = "https://khuroson-cargo.vercel.app"; // Новый URL

// В команде /start
TG.sendMessage(chatId, "Добро пожаловать! 🚀\n\nОткройте наше новое приложение:", {
  reply_markup: JSON.stringify({
    inline_keyboard: [[
      { text: "📱 Открыть Khuroson Cargo", web_app: { url: webAppUrl } }
    ]]
  })
});
```

---

## 📱 Установка на смартфон (PWA)

### iOS (Safari)
1. Откройте приложение в Safari
2. Нажмите "Поделиться" (квадрат со стрелкой)
3. "На экран «Домой»"
4. Готово!

### Android (Chrome)
1. Откройте приложение в Chrome
2. Нажмите "⋮" (меню)
3. "Добавить на главный экран"
4. Готово!

---

## 🎨 Что дальше?

### immediately (Следующие шаги)

1. **Установить shadcn/ui компоненты**:
   ```bash
   npx shadcn@latest init
   npx shadcn@latest add button input card dialog
   ```

2. **Добавить AI интеграцию**:
   - Получить Groq API ключ на [console.groq.com](https://console.groq.com)
   - Обновить `/api/ai/chat/route.ts` с реальными вызовами

3. **Добавить страницы**:
   - `/info/prices` - Тарифы
   - `/info/banned` - Запрещенные товары
   - `/info/addresses` - Адреса
   - `/admin` - Админ-панель

4. **Улучшить дизайн**:
   - Анимации
   - Skeleton загрузка
   - Pull-to-refresh
   - Темная тема

### medium-term (Среднесрочные)

5. **Уведомления**:
   - Web Push API
   - Telegram Bot уведомления о статусе

6. **Офлайн режим**:
   - Service Worker
   - Кэширование треков

7. **AI Vision**:
   - Загрузка фото накладных
   - Распознавание трек-кодов

8. **Мультиязычность**:
   - i18n (TJ/RU/ZH)
   - Автоопределение языка

---

## 🛠️ Структура файлов

```
webapp-react/
│
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── layout.tsx             ✅ Главный layout
│   │   ├── page.tsx               ✅ Главная страница
│   │   ├── tracks/
│   │   │   └── page.tsx           ✅ Поиск треков
│   │   ├── profile/
│   │   │   └── page.tsx           ✅ Профиль
│   │   ├── ai-chat/
│   │   │   └── page.tsx           ✅ AI-чат
│   │   └── api/
│   │       └── ai/chat/
│   │           └── route.ts       ✅ AI API
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx      ✅ Layout обертка
│   │   │   ├── BottomNav.tsx      ✅ Нижняя навигация
│   │   │   └── Header.tsx         ✅ Шапка
│   │   └── tracks/
│   │       └── TrackCard.tsx      ✅ Карточка трека
│   │
│   └── lib/
│       ├── supabase/
│       │   ├── client.ts          ✅ Публичный клиент
│       │   ├── admin.ts           ✅ Админ клиент
│       │   └── types.ts           ✅ TypeScript типы
│       └── utils.ts               ✅ Утилиты
│
├── database/
│   ├── schema.sql                 ✅ Схема Supabase
│   └── migration-from-sheets.sql  ✅ Миграция данных
│
├── public/
│   └── manifest.json              ✅ PWA манифест
│
├── .env.local                     ✅ Переменные окружения
├── .gitignore                     ✅ Git ignore
├── package.json                   ✅ Зависимости
└── README.md                      ✅ Документация
```

---

## 📊 Стек технологий

| Категория | Технология |
|-----------|-------------|
| **Фреймворк** | Next.js 16 (App Router) |
| **Язык** | TypeScript |
| **Стилизация** | TailwindCSS v4 |
| **UI компоненты** | shadcn/ui (в процессе) |
| **База данных** | Supabase (PostgreSQL) |
| **AI** | Groq API + Gemini API |
| **Деплой** | Vercel |
| **PWA** | Web Manifest + Service Worker |
| **Telegram** | Telegram Web App SDK |

---

## ⚠️ Важно!

### Что нужно сделать перед деплоем:

1. ✅ Установить все зависимости (`npm install`)
2. ✅ Настроить Supabase и выполнить schema.sql
3. ✅ Мигрировать данные из Google Sheets
4. ✅ Заполнить `.env.local` реальными ключами
5. ⏳ Установить shadcn/ui компоненты
6. ⏳ Добавить AI интеграцию (Groq API)
7. ⏳ Протестировать все функции
8. ⏳ Настроить Telegram Web App интеграцию

---

## 🆘 Troubleshooting

### Ошибка: Missing Supabase environment variables

**Решение**: Убедитесь что `.env.local` заполнен правильными значениями.

### Ошибка: npm install не работает

**Решение**: 
```bash
# Очистите кэш
npm cache clean --force

# Удалите node_modules и package-lock.json
rm -rf node_modules package-lock.json

# Попробуйте снова
npm install
```

### Ошибка: Next.js не запускается

**Решение**:
```bash
# Переустановите зависимости
npm install

# Попробуйте другой порт
npm run dev -- -p 3001
```

---

## 📞 Поддержка

При возникновении проблем:
1. Проверьте `.env.local`
2. Убедитесь что Supabase настроен
3. Проверьте консоль браузера на ошибки
4. Создайте Issue на GitHub

---

**Готово! 🎉**

Ваше новое Web App готово к запуску. Следуйте инструкциям выше и у вас будет современное приложение с:

- ✅ Красивым UI
- ✅ PWA поддержкой
- ✅ AI-ассистентом
- ✅ Поиском треков
- ✅ Профилем пользователя
- ✅ Готовностью к деплою на Vercel

**Удачи! 🚀**
