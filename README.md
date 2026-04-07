# Khuroson Cargo Web App

**Современное React-приложение для логистической компании Khuroson Cargo**

Китай 🇨🇳 ↔ Таджикистан 🇹🇯

## 🚀 Технологии

- **Frontend**: Next.js 16 (App Router)
- **Язык**: TypeScript
- **Стилизация**: TailwindCSS v4
- **Компоненты**: shadcn/ui (в процессе установки)
- **База данных**: Supabase (PostgreSQL)
- **AI**: Groq API + Gemini API (fallback)
- **Деплой**: Vercel
- **PWA**: Поддержка установки на смартфон

## 📁 Структура проекта

```
webapp-react/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # Главная (Dashboard)
│   │   ├── tracks/            # Поиск и история треков
│   │   ├── profile/           # Профиль пользователя
│   │   ├── ai-chat/           # AI-ассистент
│   │   ├── info/              # Тарифы, запрещенка, адреса
│   │   ├── admin/             # Админ-панель
│   │   ├── dashboard/         # Статистика
│   │   └── api/               # API маршруты
│   ├── components/            # React компоненты
│   │   ├── ui/                # UI компоненты (shadcn/ui)
│   │   ├── layout/            # Layout компоненты
│   │   ├── tracks/            # Компоненты треков
│   │   └── profile/           # Компоненты профиля
│   ├── lib/                   # Утилиты и библиотеки
│   │   ├── supabase/          # Supabase клиент
│   │   └── utils.ts           # Helper функции
│   ├── hooks/                 # Custom React hooks
│   └── contexts/              # React контексты
├── database/
│   └── schema.sql             # SQL схема Supabase
├── public/                    # Статические файлы
│   ├── manifest.json          # PWA манифест
│   └── *.png                  # Иконки
├── .env.local                 # Переменные окружения
└── package.json
```

## 🛠️ Установка и запуск

### 1. Установка зависимостей

```bash
cd webapp-react
npm install
```

### 2. Настройка окружения

Создайте файл `.env.local` и заполните:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

TELEGRAM_BOT_TOKEN=your_telegram_bot_token

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Создание базы данных

1. Зарегистрируйтесь на [Supabase](https://supabase.com)
2. Создайте новый проект
3. Выполните SQL из `database/schema.sql` в SQL Editor
4. Скопируйте ключи в `.env.local`

### 4. Запуск в режиме разработки

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000)

### 5. Сборка для продакшна

```bash
npm run build
npm start
```

## 📱 PWA - Установка на смартфон

Приложение поддерживает установку на главный экран:

1. Откройте приложение в браузере
2. Нажмите "Добавить на главный экран"
3. Приложение будет работать как нативное!

## 🎨 Дизайн

### Цветовая схема

- **Primary**: `#007AFF` (Синий)
- **Success**: `#34C759` (Зеленый)
- **Warning**: `#FF9500` (Оранжевый)
- **Danger**: `#FF3B30` (Красный)

### Темная тема

Автоматически синхронизируется с темой Telegram Web App.

## 🗂️ Основные функции

### 👤 Пользователь

- ✅ Профиль (имя, телефон, язык)
- ✅ Поиск треков
- ✅ История поиска
- ✅ AI-ассистент (чат)
- ✅ Просмотр тарифов
- ✅ Запрещенные товары
- ✅ Адреса (Китай, Хуросон)

### 👨‍💼 Администратор

- ✅ Статистика
- ✅ Массовое обновление треков
- ✅ Рассылка уведомлений
- ✅ Управление пользователями

## 🔄 Миграция с Google Sheets

Для переноса данных из Google Sheets:

1. Экспортируйте данные в CSV
2. Используйте скрипт миграции (в разработке)
3. Проверьте целостность данных

## 🚀 Деплой на Vercel

```bash
# Установите Vercel CLI
npm i -g vercel

# Войдите в аккаунт
vercel login

# Деплой
vercel

# Продакшн деплой
vercel --prod
```

Или подключите GitHub репозиторий к Vercel для автоматического деплоя.

## 📊 База данных (Supabase)

### Таблицы

- **users** - Пользователи
- **tracks** - Треки грузов
- **notifications** - Уведомления
- **broadcast_logs** - Логи рассылок

Полная схема в `database/schema.sql`

## 🤖 AI Интеграция

- **Primary**: Groq API (бесплатно, 30 req/min)
- **Fallback**: Gemini API

AI используется для:
- Ответов на вопросы о грузах
- Классификации грузов
- Анализа фото накладных (Vision)
- Голосовых сообщений

## 🔐 Безопасность

- Row Level Security (RLS) в Supabase
- Telegram Web App валидация
- Rate limiting на API маршрутах
- Санитизация пользовательского ввода

## 📝 API Маршруты

### POST `/api/ai/chat`
AI-чат с пользователем

```json
{
  "message": "Где мой груз?"
}
```

### POST `/api/tracks/search`
Поиск треков

```json
{
  "code": "TRACK001"
}
```

## 🧪 Тестирование

```bash
npm run test
```

## 📚 Документация

- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)

## 👥 Команда

Разработано для **Khuroson Cargo**

## 📄 Лицензия

MIT

## 🆘 Поддержка

При возникновении проблем создавайте Issue на GitHub.
