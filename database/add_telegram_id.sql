-- Add telegram_id column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS telegram_id BIGINT UNIQUE;

-- Add username column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);
