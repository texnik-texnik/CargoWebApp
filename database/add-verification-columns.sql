-- =====================================================
-- ДОБАВИТЬ КОЛОНКИ ВЕРИФИКАЦИИ В USERS TABLE
-- =====================================================
-- Выполните этот SQL в Supabase SQL Editor

-- Добавить колонки для верификации
ALTER TABLE users
ADD COLUMN IF NOT EXISTS verification_code VARCHAR(4),
ADD COLUMN IF NOT EXISTS verification_expires TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS telegram_chat_id VARCHAR(100);

-- Создать индекс для поиска по телефону
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- Комментарий к колонкам
COMMENT ON COLUMN users.verification_code IS 'Код подтверждения для верификации';
COMMENT ON COLUMN users.verification_expires IS 'Время истечения кода';
COMMENT ON COLUMN users.telegram_chat_id IS 'Telegram Chat ID для отправки сообщений';
