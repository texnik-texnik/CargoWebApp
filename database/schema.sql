-- =====================================================
-- KHUROSON CARGO - Supabase Database Schema
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS TABLE
-- =====================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  telegram_id VARCHAR(50) UNIQUE NOT NULL,
  client_id VARCHAR(50),
  username VARCHAR(100),
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  lang VARCHAR(10) DEFAULT 'ru',
  is_admin BOOLEAN DEFAULT FALSE,
  verification_code VARCHAR(4),
  verification_expires TIMESTAMP WITH TIME ZONE,
  telegram_chat_id VARCHAR(100),
  history TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indices for faster lookups
CREATE INDEX idx_users_telegram_id ON users(telegram_id);
CREATE INDEX idx_users_client_id ON users(client_id);
CREATE INDEX idx_users_phone ON users(phone);

-- =====================================================
-- TRACKS TABLE
-- =====================================================
CREATE TABLE tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(100) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'waiting',
  received_date TIMESTAMP WITH TIME ZONE,
  intransit_date TIMESTAMP WITH TIME ZONE,
  border_date TIMESTAMP WITH TIME ZONE,
  warehouse_date TIMESTAMP WITH TIME ZONE,
  delivered_date TIMESTAMP WITH TIME ZONE,
  notes TEXT DEFAULT '',
  archived BOOLEAN DEFAULT FALSE,
  archived_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indices for faster lookups
CREATE INDEX idx_tracks_code ON tracks(code);
CREATE INDEX idx_tracks_status ON tracks(status);
CREATE INDEX idx_tracks_archived_intransit ON tracks (archived, intransit_date DESC);
CREATE INDEX idx_tracks_archived_at ON tracks (archived_at DESC);

-- =====================================================
-- PRICES TABLE
-- =====================================================
CREATE TABLE prices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  weight_from DECIMAL(10,2) NOT NULL,
  weight_to DECIMAL(10,2),
  price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'сомони',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  track_code VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indices for faster lookups
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);

-- =====================================================
-- BROADCAST LOGS TABLE
-- =====================================================
CREATE TABLE broadcast_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  total_users INTEGER NOT NULL,
  sent_count INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Indices for faster lookups
CREATE INDEX idx_broadcast_logs_admin_id ON broadcast_logs(admin_id);
CREATE INDEX idx_broadcast_logs_status ON broadcast_logs(status);

-- =====================================================
-- AUTO-UPDATE UPDATED_AT TRIGGER
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tracks_updated_at
  BEFORE UPDATE ON tracks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prices_updated_at
  BEFORE UPDATE ON prices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE broadcast_logs ENABLE ROW LEVEL SECURITY;

-- Policies for Users
CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (telegram_id = current_setting('app.current_telegram_id', true));

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (telegram_id = current_setting('app.current_telegram_id', true));

-- Tracks are public (read-only)
CREATE POLICY "Tracks are public"
  ON tracks FOR SELECT
  USING (true);

-- Prices are public (read-only)
CREATE POLICY "Prices are public"
  ON prices FOR SELECT
  USING (true);

-- Notifications are user-specific
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (user_id IN (
    SELECT id FROM users WHERE telegram_id = current_setting('app.current_telegram_id', true)
  ));
