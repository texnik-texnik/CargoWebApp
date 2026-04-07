# 📦 Импорт трек-кодов из Google Sheets / CSV

## Способы импорта

### Способ 1: Через Supabase Dashboard (Рекомендуется)

1. **Экспорт из Google Sheets:**
   - Откройте вашу таблицу
   - `File` → `Download` → `Comma-separated values (.csv)`

2. **Подготовьте CSV:**
   - Формат: `code,status,notes,received_date,intransit_date,border_date,warehouse_date,delivered_date`
   - Пример:
     ```csv
     code,status,notes
     KH001,received,Получен на складе
     KH002,intransit,В пути
     KH003,waiting,Ожидает отправки
     ```

3. **Импорт в Supabase:**
   - Откройте [Supabase Dashboard](https://supabase.com/dashboard)
   - Выберите ваш проект
   - `Table Editor` → таблица `tracks`
   - Нажмите `Insert` → `Import CSV`
   - Загрузите файл

---

### Способ 2: Через SQL Editor

1. Откройте `database/import-from-sheets.sql`
2. Замените примеры данных на ваши реальные данные
3. Откройте Supabase SQL Editor
4. Вставьте и выполните SQL скрипт

---

### Способ 3: Через скрипт (для продвинутых)

```bash
# Установка зависимостей
npm install csv-parse

# Запуск импорта
node database/scripts/import-csv.mjs database/example-tracks.csv
```

---

## Доступные статусы

| Статус | Описание |
|--------|----------|
| `waiting` | Ожидает отправки |
| `received` | Получен на складе в Китае |
| `intransit` | В пути |
| `border` | На границе |
| `warehouse` | На складе в Душанбе |
| `payment` | Ожидает оплату |
| `delivered` | Доставлен клиенту |

---

## Пример CSV файла

Откройте `database/example-tracks.csv` для просмотра примера формата.

---

## Проверка импорта

После импорта выполните в SQL Editor:

```sql
-- Проверить количество треков
SELECT COUNT(*) FROM tracks;

-- Статистика по статусам
SELECT status, COUNT(*) as count 
FROM tracks 
GROUP BY status;

-- Проверить конкретный трек
SELECT * FROM tracks WHERE code = 'KH001';
```

---

## Массовое обновление статусов

Если нужно обновить статусы для множества треков:

```sql
-- Обновить все треки со статусом 'waiting' на 'received'
UPDATE tracks 
SET status = 'received', received_date = NOW()
WHERE status = 'waiting';

-- Обновить для определённых кодов
UPDATE tracks
SET status = 'intransit', intransit_date = NOW()
WHERE code IN ('KH001', 'KH002', 'KH003');
```
