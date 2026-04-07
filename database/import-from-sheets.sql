-- =====================================================
-- ИМПОРТ ТРЕК-КОДОВ ИЗ GOOGLE SHEETS / CSV
-- =====================================================
-- Этот скрипт используется для массовой загрузки трек-кодов
-- из таблицы Google Sheets или CSV файла
-- =====================================================

-- ВАРИАНТ 1: Простой INSERT (для небольшого количества)
-- Замените данные ниже на ваши реальные данные из таблицы

INSERT INTO tracks (code, status, notes)
VALUES
  ('KH001', 'received', 'Получен на складе в Китае'),
  ('KH002', 'intransit', 'Груз в пути'),
  ('KH003', 'border', 'На границе'),
  ('KH004', 'warehouse', 'На складе в Душанбе'),
  ('KH005', 'delivered', 'Доставлен клиенту'),
  ('KH006', 'waiting', 'Ожидает отправки'),
  ('KH007', 'payment', 'Ожидает оплату'),
  -- Добавьте больше строк по аналогии
  ('KH008', 'received', '')
ON CONFLICT (code) DO UPDATE
SET 
  status = EXCLUDED.status,
  notes = EXCLUDED.notes,
  updated_at = NOW();

-- =====================================================
-- ВАРИАНТ 2: Импорт из CSV через Supabase Dashboard
-- =====================================================
-- 1. Экспортируйте данные из Google Sheets в CSV
-- 2. Откройте Supabase Dashboard > Table Editor > tracks
-- 3. Нажмите "Insert" > "Import CSV"
-- 4. Загрузите ваш CSV файл
--
-- Формат CSV:
-- code,status,notes,received_date,intransit_date,border_date,warehouse_date,delivered_date
-- KH001,received,Получен на складе,2024-01-15,,,,
-- KH002,intransit,В пути,2024-01-15,2024-01-20,,,
-- KH003,border,На границе,2024-01-15,2024-01-20,2024-01-25,,

-- =====================================================
-- ВАРИАНТ 3: Автоматический импорт через API
-- =====================================================
-- Если у вас много данных, используйте API:
--
-- POST https://YOUR_PROJECT.supabase.co/rest/v1/tracks
-- Headers:
--   apikey: YOUR_SERVICE_KEY
--   Authorization: Bearer YOUR_SERVICE_KEY
--   Content-Type: application/json
--   Prefer: resolution=merge-duplicates
--
-- Body:
-- [
--   {"code": "KH001", "status": "received", "notes": "Получен"},
--   {"code": "KH002", "status": "intransit", "notes": "В пути"}
-- ]

-- =====================================================
-- ДОПОЛНИТЕЛЬНЫЕ КОМАНДЫ
-- =====================================================

-- Проверить количество загруженных треков
SELECT COUNT(*) as total_tracks FROM tracks;

-- Посмотреть статистику по статусам
SELECT status, COUNT(*) as count 
FROM tracks 
GROUP BY status 
ORDER BY count DESC;

-- Найти дубликаты кодов
SELECT code, COUNT(*) as count
FROM tracks
GROUP BY code
HAVING COUNT(*) > 1;

-- Очистить все треки (ОСТОРОЖНО!)
-- DELETE FROM tracks;

-- =====================================================
-- ИМПОРТ ПОЛЬЗОВАТЕЛЕЙ ИЗ GOOGLE SHEETS
-- =====================================================

INSERT INTO users (telegram_id, client_id, name, phone, lang, history)
VALUES
  ('123456789', 'KH-001', 'Алиев Али', '+992901234567', 'ru', 'KH001,KH002'),
  ('987654321', 'KH-002', 'Валиев Вали', '+992907654321', 'ru', 'KH003'),
  -- Добавьте больше пользователей
  ('111222333', 'KH-003', 'Тестовый Пользователь', '+992900000000', 'ru', '')
ON CONFLICT (telegram_id) DO UPDATE
SET 
  client_id = EXCLUDED.client_id,
  name = EXCLUDED.name,
  phone = EXCLUDED.phone,
  history = EXCLUDED.history,
  updated_at = NOW();

-- =====================================================
-- ПРИМЕР: Массовое обновление статусов
-- =====================================================

-- Обновить все треки со статусом 'waiting' на 'received'
-- UPDATE tracks 
-- SET status = 'received', received_date = NOW()
-- WHERE status = 'waiting';

-- Обновить заметки для определённых треков
-- UPDATE tracks
-- SET notes = 'Груз получен клиентом'
-- WHERE code IN ('KH001', 'KH002', 'KH003');
