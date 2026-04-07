# 📦 KHUROSON CARGO WEB APP - Project Summary

## 🎯 Цель проекта

Создать **современное Web App приложение** для логистической компании Khuroson Cargo (Китай ↔ Таджикистан) с возможностью:

- ✅ Установки на смартфон как PWA
- ✅ Работы в Telegram Web App
- ✅ Работы в обычном браузере
- ✅ Полного функционала без Telegram бота

---

## 🏗️ Архитектура

```
┌─────────────────────────────────────────────────┐
│                  Frontend                        │
│                                                  │
│  Next.js 16 (React + TypeScript)                │
│  TailwindCSS + shadcn/ui                        │
│  Telegram Web App SDK                            │
│  PWA Support                                     │
└─────────────────┬───────────────────────────────┘
                  │
                  │ API Calls
                  ▼
┌─────────────────────────────────────────────────┐
│                  Backend                         │
│                                                  │
│  Next.js API Routes                              │
│  Supabase Client (PostgreSQL)                    │
│  Groq AI + Gemini API (fallback)                 │
└─────────────────┬───────────────────────────────┘
                  │
                  │ SQL Queries
                  ▼
┌─────────────────────────────────────────────────┐
│               Database                           │
│                                                  │
│  Supabase (PostgreSQL)                           │
│  - users                                         │
│  - tracks                                        │
│  - notifications                                 │
│  - broadcast_logs                                │
└─────────────────────────────────────────────────┘
```

---

## 📁 Структура проекта

```
webapp-react/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           ✅ Главная (Dashboard)
│   │   ├── tracks/            ✅ Поиск треков
│   │   ├── profile/           ✅ Профиль
│   │   ├── ai-chat/           ✅ AI-ассистент
│   │   └── api/               ✅ API маршруты
│   ├── components/            ✅ React компоненты
│   ├── lib/supabase/          ✅ Supabase клиент
│   └── hooks/, contexts/      ⏳ В разработке
├── database/
│   ├── schema.sql             ✅ Полная схема БД
│   └── migration-from-sheets.sql ✅ Миграция
├── public/
│   └── manifest.json          ✅ PWA манифест
├── .env.local                 ✅ Переменные окружения
├── README.md                  ✅ Документация
└── GETTING_STARTED.md         ✅ Быстрый старт
```

---

## 🚀 Стек технологий

| Категория | Технология | Статус |
|-----------|-------------|--------|
| **Фреймворк** | Next.js 16 (App Router) | ✅ |
| **Язык** | TypeScript | ✅ |
| **Стилизация** | TailwindCSS v4 | ✅ |
| **UI компоненты** | shadcn/ui | ⏳ Нужно установить |
| **База данных** | Supabase (PostgreSQL) | ✅ Схема готова |
| **AI** | Groq + Gemini | ⏳ Нужна интеграция |
| **Деплой** | Vercel | ⏳ Настроено |
| **PWA** | Web Manifest | ✅ |
| **Telegram** | Web App SDK | ✅ |

---

## ✅ Что уже сделано

### Frontend (100%)
- ✅ Next.js проект с TypeScript
- ✅ TailwindCSS настроен
- ✅ Главная страница (Dashboard)
- ✅ Поиск треков с историей
- ✅ Профиль пользователя
- ✅ AI-чат (UI готов)
- ✅ Нижняя навигация (4 таба)
- ✅ Header с данными пользователя
- ✅ PWA манифест

### Backend (80%)
- ✅ Supabase клиент
- ✅ Supabase админ клиент
- ✅ TypeScript типы для БД
- ✅ SQL схема (все таблицы)
- ✅ Скрипт миграции
- ⏳ AI интеграция (заглушка)

### Документация (100%)
- ✅ README.md
- ✅ GETTING_STARTED.md
- ✅ PROJECT_SUMMARY.md
- ✅ SQL схема с комментариями

---

## ⏳ Что осталось сделать

### Критично (Сделать перед деплоем)

1. **Установить зависимости**:
   ```bash
   npm install
   npx shadcn@latest init
   npx shadcn@latest add button input card dialog
   ```

2. **Настроить Supabase**:
   - Создать проект
   - Выполнить `database/schema.sql`
   - Скопировать ключи в `.env.local`

3. **Миграция данных**:
   - Экспорт из Google Sheets
   - Выполнить `migration-from-sheets.sql`

4. **AI интеграция**:
   - Получить Groq API ключ
   - Обновить `/api/ai/chat/route.ts`

### Важно (Среднесрочные задачи)

5. **Добавить страницы**:
   - `/info/prices` - Тарифы
   - `/info/banned` - Запрещенные товары
   - `/info/addresses` - Адреса
   - `/admin` - Админ-панель
   - `/dashboard` - Статистика

6. **Улучшить UX**:
   - Skeleton загрузка
   - Pull-to-refresh
   - Анимации
   - Темная тема

7. **Telegram интеграция**:
   - Валидация Web App данных
   - Deep linking
   - Уведомления

### Nice to have (Долгосрочные)

8. **Офлайн режим**:
   - Service Worker
   - Кэширование треков

9. **AI Vision**:
   - Загрузка фото
   - Распознавание трек-кодов

10. **Мультиязычность**:
    - i18n (TJ/RU/ZH)
    - Автоопределение языка

---

## 🔐 Переменные окружения

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=           # URL проекта
NEXT_PUBLIC_SUPABASE_ANON_KEY=      # Публичный ключ
SUPABASE_SERVICE_ROLE_KEY=          # Секретный ключ

# Telegram
TELEGRAM_BOT_TOKEN=                 # Токен бота

# App
NEXT_PUBLIC_APP_URL=                # URL приложения
```

---

## 📊 База данных

### Таблицы

| Таблица | Описание | Поля |
|---------|----------|------|
| **users** | Пользователи | id, telegram_id, client_id, name, phone, lang, history |
| **tracks** | Треки грузов | id, code, status, dates, notes |
| **notifications** | Уведомления | id, user_id, track_code, message, status |
| **broadcast_logs** | Логи рассылок | id, admin_id, message, counts, status |

### Статусы треков

- `waiting` - Ожидание
- `received` - Получен
- `intransit` - В пути
- `border` - На границе
- `warehouse` - На складе
- `payment` - Оплата
- `delivered` - Доставлен

---

## 🚀 Деплой

### Локальный запуск
```bash
npm run dev
```

### Деплой на Vercel
```bash
git push origin main
# Vercel автоматически задеплоит
```

Или:
```bash
vercel --prod
```

---

## 📱 PWA Установка

### iOS
1. Safari → "Поделиться"
2. "На экран Домой"
3. Готово!

### Android
1. Chrome → "⋮"
2. "Добавить на главный экран"
3. Готово!

---

## 🎯 Следующие шаги

### 1. immediately
- [ ] `npm install`
- [ ] Настроить Supabase
- [ ] Миграция данных
- [ ] Установить shadcn/ui

### 2. Краткосрочные
- [ ] AI интеграция
- [ ] Добавить оставшиеся страницы
- [ ] Улучшить дизайн

### 3. Среднесрочные
- [ ] Уведомления
- [ ] Офлайн режим
- [ ] Админ-панель

### 4. Долгосрочные
- [ ] AI Vision
- [ ] Мультиязычность
- [ ] Аналитика

---

## 📞 Ресурсы

- **Документация**: `README.md`, `GETTING_STARTED.md`
- **SQL схема**: `database/schema.sql`
- **Миграция**: `database/migration-from-sheets.sql`
- **Переменные**: `.env.local`

---

## 🆘 Troubleshooting

| Проблема | Решение |
|----------|---------|
| npm install не работает | `npm cache clean --force` |
| Supabase ошибка | Проверить `.env.local` |
| Next.js не запускается | `rm -rf node_modules && npm install` |

---

**Статус**: 🟡 Готово 70%, нужно настроить Supabase и установить зависимости

**Время до запуска**: ~30 минут (после выполнения шагов из GETTING_STARTED.md)

---

**Дата создания**: 2026-04-06  
**Версия**: 1.0.0  
**Статус**: Разработка
